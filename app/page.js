"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";

export default function Davora() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  // Connect to WebSocket on mount
  useEffect(() => {
    // IMPORTANT: When deploying, replace 'localhost' with your actual Linux server domain/IP
    // e.g., "ws://your-linux-server-ip:8000/ws/chat"
    // For Vercel production, it must be wss:// (secure websocket)
    ws.current = new WebSocket("ws://blatancy-barrack-spelling.ngrok-free.dev/ws/chat");

    ws.current.onmessage = (event) => {
      const data = event.data;
      if (data === "[DONE]") {
        setIsTyping(false);
        return;
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === "ai") {
          lastMsg.content += data;
        } else {
          newMessages.push({ role: "ai", content: data });
        }
        return newMessages;
      });
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !ws.current) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsTyping(true);

    // Send to backend via WebSocket
    ws.current.send(userMessage);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <Bot size={28} className="logo-icon" />
          <h1>Davora</h1>
        </div>
        <div className="status-badge">
          <span className="dot"></span> Online
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
          <div key={index} className={`message-row ${msg.role === 'user' ? 'row-user' : 'row-ai'}`}>
            <div className={`avatar ${msg.role === 'user' ? 'avatar-user' : 'avatar-ai'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`message-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
              {msg.content}
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
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Davora..."
            disabled={isTyping}
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
