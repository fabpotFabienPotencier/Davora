package com.davora.xyz.data

import android.os.Handler
import android.os.Looper
import com.google.gson.Gson
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.TimeUnit

/**
 * Streams chat responses from the Davora backend.
 *
 * Fixes the web app's socket issues:
 *  - single connection guard (no duplicate sockets)
 *  - automatic reconnect with exponential backoff
 *  - clean close + no leaks
 */
class ChatWebSocket(private val listener: Listener) {

    interface Listener {
        fun onChunk(text: String)
        fun onDone()
        fun onQuotaError(code: String, waitHours: Double?)
        fun onError(message: String)
        fun onConnected()
    }

    private val client = OkHttpClient.Builder()
        .pingInterval(20, TimeUnit.SECONDS)
        .readTimeout(0, TimeUnit.MILLISECONDS) // streaming: no read timeout
        .build()

    private val gson = Gson()
    private var ws: WebSocket? = null
    private var connecting = false
    private var manualClose = false
    private var retryCount = 0
    private val handler = Handler(Looper.getMainLooper())

    @Volatile
    var isOpen = false
        private set

    fun connect() {
        if (isOpen || connecting) return // guard: never open two sockets
        connecting = true
        manualClose = false
        val request = Request.Builder().url(WS_URL).build()
        ws = client.newWebSocket(request, socketListener)
    }

    fun send(payload: WsChatPayload): Boolean {
        val socket = ws
        if (socket == null || !isOpen) return false
        return socket.send(gson.toJson(payload))
    }

    fun close() {
        manualClose = true
        handler.removeCallbacksAndMessages(null)
        ws?.close(1000, "bye")
        ws = null
        isOpen = false
        connecting = false
    }

    private val socketListener = object : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) {
            connecting = false
            isOpen = true
            retryCount = 0
            handler.post { listener.onConnected() }
        }

        override fun onMessage(webSocket: WebSocket, text: String) {
            handler.post {
                when {
                    text == "[DONE]" -> listener.onDone()
                    text.contains("quota_error") -> {
                        try {
                            val q = gson.fromJson(text, QuotaError::class.java)
                            if (q?.quotaError != null) {
                                listener.onQuotaError(q.quotaError, q.waitHours)
                            } else {
                                listener.onChunk(text)
                            }
                        } catch (e: Exception) {
                            listener.onChunk(text)
                        }
                    }
                    else -> listener.onChunk(text)
                }
            }
        }

        override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
            webSocket.close(1000, null)
        }

        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            isOpen = false
            connecting = false
            reconnectIfNeeded()
        }

        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            isOpen = false
            connecting = false
            handler.post { listener.onError(t.message ?: "Connection error") }
            reconnectIfNeeded()
        }
    }

    private fun reconnectIfNeeded() {
        if (manualClose) return
        retryCount++
        val delayMs = (1000L * (1 shl retryCount.coerceAtMost(5))).coerceAtMost(30_000L)
        handler.postDelayed({ connect() }, delayMs)
    }

    companion object {
        private const val WS_URL = "wss://api.davora.xyz/ws/chat"
    }
}
