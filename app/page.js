"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Copy, Check, PlusCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import TextareaAutosize from "react-textarea-autosize";

export default function Davora() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const ws = useRef(null);
  const inputRef = useRef(null);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Connect to WebSocket on mount
  useEffect(() => {
    // IMPORTANT: Make sure this URL matches your active ngrok tunnel!
    ws.current = new WebSocket("wss://blatancy-barrack-spelling.ngrok-free.dev/ws/chat");

    ws.current.onmessage = (event) => {
      const data = event.data;
      if (data === "[DONE]") {
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
        return;
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === "ai") {
          lastMsg.content += data;
        } else {
          newMessages.push({ id: Date.now(), role: "ai", content: data });
        }
        return newMessages;
      });
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || !ws.current || isTyping) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: userMessage }]);
    setInput("");
    setIsTyping(true);

    // Send to backend via WebSocket
    ws.current.send(userMessage);
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (isTyping) return;
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <Bot size={28} className="logo-icon" />
          <h1>Davora</h1>
        </div>
        <div className="header-actions">
           <button onClick={clearChat} className="new-chat-btn" disabled={isTyping} title="New Chat">
             <PlusCircle size={18} />
             <span>New Chat</span>
           </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="chat-box">
        {messages.length === 0 && (
          <div className="welcome-screen">
            <Bot size={48} className="welcome-icon" />
            <h2>Welcome to Davora</h2>
            <p>I am highly intelligent, fast, and ready to help. What is on your mind?</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={msg.id || index} className={`message-row ${msg.role === 'user' ? 'row-user' : 'row-ai'}`}>
            <div className={`avatar ${msg.role === 'user' ? 'avatar-user' : 'avatar-ai'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
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
                          <div className="code-block-wrapper">
                            <div className="code-header">
                              <span className="code-lang">{match[1]}</span>
                              <button 
                                onClick={() => copyToClipboard(String(children).replace(/\n$/, ''), `${msg.id}-${match[1]}`)}
                                className="copy-code-btn"
                              >
                                {copiedId === `${msg.id}-${match[1]}` ? <Check size={14} /> : <Copy size={14} />}
                                {copiedId === `${msg.id}-${match[1]}` ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <SyntaxHighlighter
                              {...props}
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              className="syntax-highlighter"
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code {...props} className="inline-code">
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
              
              {/* Copy Full Message Button (AI Only) */}
              {msg.role === 'ai' && !isTyping && index === messages.length - 1 && (
                <button 
                  onClick={() => copyToClipboard(msg.content, msg.id)} 
                  className="copy-msg-btn"
                  title="Copy message"
                >
                  {copiedId === msg.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message-row row-ai">
             <div className="avatar avatar-ai"><Bot size={20} /></div>
             <div className="message-bubble bubble-ai typing-indicator">
               <span className="dot-typing"></span>
               <span className="dot-typing"></span>
               <span className="dot-typing"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="input-wrapper">
        <form className="input-area" onSubmit={sendMessage}>
          <TextareaAutosize
            ref={inputRef}
            minRows={1}
            maxRows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Davora... (Shift+Enter for new line)"
            disabled={isTyping}
            className="auto-resize-textarea"
          />
          <button type="submit" disabled={!input.trim() || isTyping} className="send-btn">
            {isTyping ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
          </button>
        </form>
        <p className="footer-text">Davora AI can make mistakes. Consider verifying important information.</p>
      </div>
    </div>
  );
}
