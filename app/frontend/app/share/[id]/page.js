"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bot, User, ArrowLeft, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import '../../globals.css';

export default function SharedChat() {
  const { id } = useParams();
  const router = useRouter();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSharedChat() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz'}/api/share/${id}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (!res.ok) {
          setError("Shared chat not found or has been deleted.");
        } else {
          const data = await res.json();
          setChat(data);
        }
      } catch (err) {
        setError("Network error fetching shared chat.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSharedChat();
  }, [id]);

  if (loading) return <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading shared conversation...</div>;
  if (error) return <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center', color: '#ef4444' }}>{error}</div>;

  let messages = [];
  try {
    messages = JSON.parse(chat.messages_json);
  } catch (e) {
    messages = [];
  }

  return (
    <div className="app-layout">
      <div style={{ padding: '16px 24px', background: 'var(--surface-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#a855f7', padding: '8px', borderRadius: '12px' }}>
            <Share2 size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>{chat.title}</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>Shared Conversation • Davora AI</p>
          </div>
        </div>
        <button onClick={() => router.push('/')} style={{ padding: '8px 16px', background: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '24px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Try Davora
        </button>
      </div>
      
      <main className="chat-box" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '24px', width: '100%', height: 'calc(100vh - 75px)', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.role === 'user' ? 'row-user' : 'row-ai'}`}>
            <div className={`avatar ${msg.role === 'user' ? 'avatar-user' : 'avatar-ai'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`message-bubble-wrapper ${msg.role === 'user' ? 'wrapper-user' : 'wrapper-ai'}`}>
              <div className={`message-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                {msg.role === 'user' ? (
                  <>
                    {msg.image_url && <img src={msg.image_url} alt="Attached" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', marginBottom: '12px' }} />}
                    <p className="user-text">{msg.content}</p>
                  </>
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>{children}</code>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              <span className="message-timestamp">{msg.timestamp || ""}</span>
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          End of shared conversation.
        </div>
      </main>
    </div>
  );
}
