package com.davora.xyz.ui.chat

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.PopupMenu
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.GravityCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.davora.xyz.DavoraApp
import com.davora.xyz.R
import com.davora.xyz.data.ApiClient
import com.davora.xyz.data.ChatMessage
import com.davora.xyz.data.ChatSession
import com.davora.xyz.data.ChatWebSocket
import com.davora.xyz.data.SessionCreateRequest
import com.davora.xyz.data.WsChatPayload
import com.davora.xyz.databinding.ActivityMainBinding
import com.davora.xyz.ui.auth.LoginActivity
import com.davora.xyz.ui.settings.SettingsActivity
import com.davora.xyz.voice.SpeechHelper
import io.noties.markwon.Markwon
import io.noties.markwon.image.ImagesPlugin
import io.noties.markwon.linkify.LinkifyPlugin
import kotlinx.coroutines.launch
import java.util.UUID

class MainActivity : AppCompatActivity(), ChatWebSocket.Listener {

    private lateinit var binding: ActivityMainBinding
    private val session by lazy { (application as DavoraApp).sessionManager }

    private lateinit var chatAdapter: ChatAdapter
    private lateinit var sessionsAdapter: SessionsAdapter
    private lateinit var speechHelper: SpeechHelper
    private var socket: ChatWebSocket? = null
    private var mediaPlayer: MediaPlayer? = null

    private var currentSessionId: String = UUID.randomUUID().toString()
    private var isNewSession = true
    private var waitingToSend: WsChatPayload? = null

    private val micPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) startVoiceInput()
        else Toast.makeText(this, R.string.mic_permission_needed, Toast.LENGTH_SHORT).show()
    }

    private val notifPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { /* optional */ }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (!session.isLoggedIn) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val markwon = Markwon.builder(this)
            .usePlugin(ImagesPlugin.create())
            .usePlugin(LinkifyPlugin.create())
            .build()

        chatAdapter = ChatAdapter(markwon, ::onAiMessageLongPress)
        binding.recyclerChat.layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = true
        }
        binding.recyclerChat.adapter = chatAdapter

        sessionsAdapter = SessionsAdapter(::openSession)
        binding.recyclerSessions.layoutManager = LinearLayoutManager(this)
        binding.recyclerSessions.adapter = sessionsAdapter

        speechHelper = SpeechHelper(this) { text ->
            binding.etMessage.setText(text)
            binding.etMessage.setSelection(text.length)
        }

        binding.btnMenu.setOnClickListener { binding.drawerLayout.openDrawer(GravityCompat.START) }
        binding.btnSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }
        binding.btnNewChat.setOnClickListener { startNewChat() }
        binding.btnSend.setOnClickListener { sendCurrentMessage() }
        binding.btnMic.setOnClickListener { checkMicAndStart() }

        askNotificationPermission()
        loadSessions()
        connectSocket()
    }

    // ── Socket ──

    private fun connectSocket() {
        socket?.close()
        socket = ChatWebSocket(this).also { it.connect() }
    }

    override fun onConnected() {
        waitingToSend?.let { pending ->
            if (socket?.send(pending) == true) waitingToSend = null
        }
    }

    override fun onChunk(text: String) {
        chatAdapter.appendToLastAi(text)
        scrollToBottom()
    }

    override fun onDone() {
        chatAdapter.finishStreaming()
        saveSessionToBackend()
    }

    override fun onQuotaError(code: String, waitHours: Double?) {
        chatAdapter.finishStreaming()
        val msg = when (code) {
            "UNAUTHORIZED" -> "Session expired. Please log in again."
            "IMAGE_LIMIT" -> "Free image limit reached. Try again later or upgrade."
            "CHAT_LIMIT" -> "Free chat limit reached. Try again later or upgrade."
            else -> "Usage limit reached."
        }
        Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
        if (code == "UNAUTHORIZED") logout() else if (code.contains("LIMIT")) openUpgrade()
    }

    override fun onError(message: String) {
        chatAdapter.finishStreaming()
    }

    // ── Messaging ──

    private fun sendCurrentMessage() {
        val text = binding.etMessage.text.toString().trim()
        if (text.isEmpty()) return

        binding.etMessage.text.clear()
        chatAdapter.addMessage(ChatMessage(role = "user", content = text))
        chatAdapter.addMessage(ChatMessage(role = "ai", content = "", isStreaming = true))
        scrollToBottom()

        val history = chatAdapter.getMessages()
            .filter { !it.isStreaming && it.content.isNotBlank() }
            .takeLast(20)
            .map { mapOf("role" to it.role, "content" to it.content) }

        val payload = WsChatPayload(
            message = text,
            history = history,
            nickname = session.nickname,
            token = session.token.orEmpty()
        )

        if (socket?.send(payload) != true) {
            waitingToSend = payload
            connectSocket()
        }
    }

    private fun scrollToBottom() {
        binding.recyclerChat.scrollToPosition((chatAdapter.itemCount - 1).coerceAtLeast(0))
    }

    // ── Sessions ──

    private fun loadSessions() {
        lifecycleScope.launch {
            try {
                val res = ApiClient.api.sessions(ApiClient.bearer(session.token))
                if (res.isSuccessful) {
                    sessionsAdapter.setSessions(res.body().orEmpty().reversed())
                } else if (res.code() == 401) {
                    logout()
                }
            } catch (_: Exception) { /* offline: keep empty list */ }
        }
    }

    private fun openSession(chatSession: ChatSession) {
        currentSessionId = chatSession.id
        isNewSession = false
        chatAdapter.setMessages(chatSession.messages)
        binding.drawerLayout.closeDrawer(GravityCompat.START)
        scrollToBottom()
    }

    private fun startNewChat() {
        currentSessionId = UUID.randomUUID().toString()
        isNewSession = true
        chatAdapter.setMessages(emptyList())
        binding.drawerLayout.closeDrawer(GravityCompat.START)
        binding.etMessage.requestFocus()
    }

    private fun saveSessionToBackend() {
        if (!isNewSession) return // existing sessions are synced server-side
        val msgs = chatAdapter.getMessages()
        if (msgs.isEmpty()) return
        val firstUser = msgs.firstOrNull { it.role == "user" }?.content.orEmpty()
        val title = if (firstUser.length > 32) firstUser.take(32).trim() + "…" else firstUser
        lifecycleScope.launch {
            try {
                ApiClient.api.createSession(
                    ApiClient.bearer(session.token),
                    SessionCreateRequest(title, msgs)
                )
                isNewSession = false
                loadSessions()
            } catch (_: Exception) { }
        }
    }

    // ── Voice input + TTS ──

    private fun checkMicAndStart() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            == PackageManager.PERMISSION_GRANTED
        ) {
            startVoiceInput()
        } else {
            micPermission.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    private fun startVoiceInput() {
        if (!speechHelper.isAvailable) {
            Toast.makeText(this, "Voice input not available on this device", Toast.LENGTH_SHORT).show()
            return
        }
        speechHelper.startListening()
    }

    private fun onAiMessageLongPress(msg: ChatMessage) {
        val popup = PopupMenu(this, binding.recyclerChat)
        popup.menu.add("Listen")
        popup.menu.add("Copy")
        popup.setOnMenuItemClickListener { item ->
            when (item.title) {
                "Listen" -> speakText(msg.content)
                "Copy" -> {
                    val cm = getSystemService(CLIPBOARD_SERVICE) as android.content.ClipboardManager
                    cm.setPrimaryClip(
                        android.content.ClipData.newPlainText("Davora", msg.content)
                    )
                    Toast.makeText(this, "Copied", Toast.LENGTH_SHORT).show()
                }
            }
            true
        }
        popup.show()
    }

    private fun speakText(text: String) {
        mediaPlayer?.release()
        mediaPlayer = null
        val token = Uri.encode(session.token.orEmpty())
        val url = "https://api.davora.xyz/api/tts?text=" +
            Uri.encode(text.take(1000)) + "&token=" + token + "&voice=Alloy"
        try {
            mediaPlayer = MediaPlayer().apply {
                setDataSource(this@MainActivity, Uri.parse(url))
                setOnPreparedListener { start() }
                setOnCompletionListener { release() }
                setOnErrorListener { _, _, _ -> release(); true }
                prepareAsync()
            }
        } catch (_: Exception) {
            Toast.makeText(this, "Audio playback failed", Toast.LENGTH_SHORT).show()
        }
    }

    private fun openUpgrade() {
        startActivity(Intent(this, SettingsActivity::class.java).putExtra("open_upgrade", true))
    }

    private fun askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
            != PackageManager.PERMISSION_GRANTED
        ) {
            notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private fun logout() {
        session.clear()
        socket?.close()
        startActivity(Intent(this, LoginActivity::class.java))
        finishAffinity()
    }

    override fun onResume() {
        super.onResume()
        if (socket?.isOpen != true) connectSocket()
    }

    override fun onDestroy() {
        speechHelper.destroy()
        mediaPlayer?.release()
        socket?.close()
        super.onDestroy()
    }
}
