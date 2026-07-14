"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bot, User, ArrowLeft, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import '../../globals.css';

export default function SharedChatClient() {
  const { id } = useParams();
  const router = useRouter();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedLogo = localStorage.getItem('davora_logo_url');
      if (cachedLogo) {
        setLogoUrl(cachedLogo);
      }
    }
    async function fetchConfig() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz'}/api/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.logo_url) {
            setLogoUrl(data.logo_url);
            localStorage.setItem('davora_logo_url', data.logo_url);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch system config:", e);
      }
    }
    fetchConfig();
  }, []);

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

  const messages = chat?.messages || [];

  return (
    <div className="app-layout" style={{ flexDirection: 'column' }}>
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
      
      <main className="chat-box" style={{ height: 'calc(100vh - 75px)' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.role === 'user' ? 'row-user' : 'row-ai'}`}>
            <div className={`avatar ${msg.role === 'user' ? 'avatar-user' : 'avatar-ai'}`}>
              {msg.role === 'user' ? (
                <User size={20} />
              ) : (
                logoUrl ? (
                  <img src={logoUrl} alt="AI" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }} />
                ) : (
                  <Bot size={20} />
                )
              )}
            </div>
            <div className={`message-bubble-wrapper ${msg.role === 'user' ? 'wrapper-user' : 'wrapper-ai'}`}>
              {msg.role === 'user' && msg.image_url && (
                <div className="user-image-attachments" style={{ marginBottom: msg.content ? '8px' : '0', display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '350px' }}>
                  {(() => {
                    try {
                      const parsed = JSON.parse(msg.image_url);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        const count = parsed.length;
                        let gridStyle = { display: 'grid', gap: '8px', width: '100%' };
                        let imgStyle = { width: '100%', borderRadius: '16px', objectFit: 'cover', display: 'block' };

                        if (count === 1) {
                          gridStyle.gridTemplateColumns = '1fr';
                          imgStyle.maxHeight = '280px';
                          imgStyle.objectFit = 'contain';
                          imgStyle.width = 'auto';
                          imgStyle.maxWidth = '100%';
                        } else if (count === 2) {
                          gridStyle.gridTemplateColumns = 'repeat(2, 1fr)';
                          imgStyle.aspectRatio = '16 / 10';
                          imgStyle.maxHeight = '200px';
                        } else {
                          gridStyle.gridTemplateColumns = 'repeat(3, 1fr)';
                          imgStyle.aspectRatio = '1 / 1';
                          imgStyle.maxHeight = '150px';
                        }

                        return (
                          <div style={gridStyle}>
                            {parsed.map((img, i) => (
                              <img 
                                key={i} 
                                src={img} 
                                alt="Attached image" 
                                className="chat-attached-image"
                                style={imgStyle} 
                              />
                            ))}
                          </div>
                        );
                      }
                    } catch (e) { }
                    return (
                      <img 
                        src={msg.image_url} 
                        alt="Attached image" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '280px', 
                          objectFit: 'contain',
                          borderRadius: '16px',
                          display: 'block'
                        }} 
                      />
                    );
                  })()}
                </div>
              )}

              {(msg.role !== 'user' || msg.content) && (
                <div className={`message-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                  {msg.role === 'user' ? (
                    <p className="user-text">{msg.content}</p>
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
              )}
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
