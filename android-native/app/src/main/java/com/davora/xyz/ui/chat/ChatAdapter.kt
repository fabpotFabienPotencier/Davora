package com.davora.xyz.ui.chat

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import coil.load
import com.davora.xyz.data.ChatMessage
import com.davora.xyz.databinding.ItemMessageAiBinding
import com.davora.xyz.databinding.ItemMessageUserBinding
import io.noties.markwon.Markwon
import java.util.regex.Pattern

class ChatAdapter(
    private val markwon: Markwon,
    private val onLongPressAi: (ChatMessage) -> Unit
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private val messages = mutableListOf<ChatMessage>()

    companion object {
        private const val TYPE_USER = 0
        private const val TYPE_AI = 1
        private val IMAGE_URL: Pattern = Pattern.compile(
            "https?://\\S+?\\.(?:png|jpe?g|webp|gif)(?:\\?\\S*)?", Pattern.CASE_INSENSITIVE
        )
    }

    fun setMessages(list: List<ChatMessage>) {
        messages.clear()
        messages.addAll(list)
        notifyDataSetChanged()
    }

    fun addMessage(msg: ChatMessage) {
        messages.add(msg)
        notifyItemInserted(messages.size - 1)
    }

    /** Append a streamed chunk to the last AI message. */
    fun appendToLastAi(chunk: String) {
        val last = messages.lastOrNull()
        if (last != null && last.role == "ai" && last.isStreaming) {
            last.content += chunk
            notifyItemChanged(messages.size - 1, "stream")
        } else {
            addMessage(ChatMessage(role = "ai", content = chunk, isStreaming = true))
        }
    }

    fun finishStreaming() {
        val idx = messages.indexOfLast { it.role == "ai" && it.isStreaming }
        if (idx >= 0) {
            messages[idx].isStreaming = false
            notifyItemChanged(idx)
        }
    }

    fun getMessages(): List<ChatMessage> = messages

    override fun getItemViewType(position: Int): Int =
        if (messages[position].role == "user") TYPE_USER else TYPE_AI

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return if (viewType == TYPE_USER) {
            UserViewHolder(ItemMessageUserBinding.inflate(inflater, parent, false))
        } else {
            AiViewHolder(ItemMessageAiBinding.inflate(inflater, parent, false))
        }
    }

    override fun getItemCount(): Int = messages.size

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val msg = messages[position]
        when (holder) {
            is UserViewHolder -> holder.bind(msg)
            is AiViewHolder -> holder.bind(msg)
        }
    }

    class UserViewHolder(private val b: ItemMessageUserBinding) :
        RecyclerView.ViewHolder(b.root) {
        fun bind(msg: ChatMessage) {
            b.tvMessage.text = msg.content
        }
    }

    inner class AiViewHolder(private val b: ItemMessageAiBinding) :
        RecyclerView.ViewHolder(b.root) {
        fun bind(msg: ChatMessage) {
            b.typingIndicator.visibility =
                if (msg.isStreaming && msg.content.isEmpty()) View.VISIBLE else View.GONE

            // Render markdown (headers, code blocks, bold, lists) like the web app
            markwon.setMarkdown(b.tvMessage, msg.content.ifEmpty { "…" })

            // If the AI returned a generated image URL, show it natively
            val matcher = IMAGE_URL.matcher(msg.content)
            val imgUrl = msg.imageUrl ?: if (matcher.find()) matcher.group() else null
            if (!imgUrl.isNullOrBlank()) {
                b.ivGeneratedImage.visibility = View.VISIBLE
                b.ivGeneratedImage.load(imgUrl) { crossfade(true) }
            } else {
                b.ivGeneratedImage.visibility = View.GONE
            }

            b.root.setOnLongClickListener {
                onLongPressAi(msg)
                true
            }
        }
    }
}
