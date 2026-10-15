package com.davora.xyz.ui.chat

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.davora.xyz.data.ChatSession
import com.davora.xyz.databinding.ItemSessionBinding

class SessionsAdapter(
    private val onClick: (ChatSession) -> Unit
) : RecyclerView.Adapter<SessionsAdapter.VH>() {

    private val sessions = mutableListOf<ChatSession>()

    fun setSessions(list: List<ChatSession>) {
        sessions.clear()
        sessions.addAll(list)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        return VH(ItemSessionBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    }

    override fun getItemCount(): Int = sessions.size

    override fun onBindViewHolder(holder: VH, position: Int) = holder.bind(sessions[position])

    inner class VH(private val b: ItemSessionBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(session: ChatSession) {
            b.tvTitle.text = session.title?.takeIf { it.isNotBlank() } ?: "New Chat"
            b.root.setOnClickListener { onClick(session) }
        }
    }
}
