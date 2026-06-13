"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, User, Bot, Loader2, Copy, Check, 
  PlusCircle, Download, Square, ArrowDown,
  Mic, RefreshCw, Edit2, Volume2, VolumeX, ChevronDown, Clock,
  ThumbsUp, ThumbsDown, Printer, Zap, Code, PenTool, Lightbulb,
  Settings, Sun, Moon, X, PanelLeftClose, PanelLeft, MessageSquare, Trash2, Paperclip
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import TextareaAutosize from "react-textarea-autosize";

export default function Davora() {
  // Session Management (Sidebar)
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const activeSessionIdRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Input & UI States
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Voice, Edit, TTS, and Rating states
  const [isListening, setIsListening] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [speakingId, setSpeakingId] = useState(null);
  const [ratings, setRatings] = useState({});

  // Settings & Preferences
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState({
    theme: 'dark',
    fontSize: 'medium',
    sendOnEnter: true
  });

  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const ws = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Derived messages for the active session
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  const quickPrompts = [
    { icon: <Zap size={18}/>, title: "Explain a complex topic", prompt: "Explain quantum computing in simple terms to a 10 year old." },
    { icon: <Code size={18}/>, title: "Write a React component", prompt: "Write a React component for a beautiful glassmorphic button using TailwindCSS." },
    { icon: <PenTool size={18}/>, title: "Draft an email", prompt: "Write a professional email to my boss asking for a deadline extension due to unforeseen technical blockers." },
    { icon: <Lightbulb size={18}/>, title: "Brainstorm ideas", prompt: "Give me 5 unique ideas for a SaaS startup in the AI and productivity space." }
  ];

  // Initialization & Migrations
  useEffect(() => {
    const savedSessions = localStorage.getItem("davora_sessions");
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      } catch (e) {}
    } else {
      // Migrate old single chat
      const oldChat = localStorage.getItem("davora_chat_history");
      if (oldChat) {
        try {
          const oldMessages = JSON.parse(oldChat);
          if (oldMessages.length > 0) {
            const newSession = { id: Date.now().toString(), title: "Legacy Chat", messages: oldMessages };
            setSessions([newSession]);
            setActiveSessionId(newSession.id);
          }
        } catch(e) {}
      }
    }

    const savedRatings = localStorage.getItem("davora_chat_ratings");
    if (savedRatings) {
      try { setRatings(JSON.parse(savedRatings)); } catch (e) {}
    }

    const savedPrefs = localStorage.getItem("davora_prefs");
    if (savedPrefs) {
      try { setPrefs(JSON.parse(savedPrefs)); } catch (e) {}
    }

    if (window.innerWidth < 768) setSidebarOpen(false); // auto-close on mobile
    if (inputRef.current) inputRef.current.focus();
    
    // Init APIs
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
          setInput(transcript);
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  // Sync refs and storage
  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);
  
  useEffect(() => {
    localStorage.setItem("davora_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("davora_prefs", JSON.stringify(prefs));
    if (prefs.theme === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem("davora_chat_ratings", JSON.stringify(ratings));
  }, [ratings]);

  const handleScroll = () => {
    if (!chatBoxRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const connectWebSocket = () => {
    ws.current = new WebSocket("wss://blatancy-barrack-spelling.ngrok-free.dev/ws/chat");
    ws.current.onmessage = (event) => {
      const data = event.data;
      if (data === "[DONE]") {
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
        return;
      }
      setSessions((prev) => prev.map(session => {
        if (session.id !== activeSessionIdRef.current) return session;
        const newMessages = [...session.messages];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === "ai" && lastMsg.isStreaming) {
          lastMsg.content += data;
        } else {
          newMessages.push({ 
            id: Date.now(), role: "ai", content: data, isStreaming: true,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          });
        }
        return { ...session, messages: newMessages };
      }));
    };
    ws.current.onclose = () => {
      setSessions(prev => prev.map(session => {
        if (session.id === activeSessionIdRef.current) {
          return { ...session, messages: session.messages.map(m => ({...m, isStreaming: false})) };
        }
        return session;
      }));
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) ws.current.close();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!showScrollButton) scrollToBottom();
  }, [messages, isTyping, showScrollButton, activeSessionId]);

  const createNewSession = (initialMsg) => {
    const title = initialMsg.length > 25 ? initialMsg.substring(0, 25) + "..." : initialMsg;
    const newId = Date.now().toString();
    const newSession = { id: newId, title, messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    return newId;
  };

  const triggerSend = (customText = null) => {
    const textToSend = customText !== null ? customText : input.trim();
    if (!textToSend || !ws.current || isTyping) return;

    if (synthRef.current) synthRef.current.cancel();
    setSpeakingId(null);

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      targetSessionId = createNewSession(textToSend);
    }

    const newMessage = { 
      id: Date.now(), role: "user", content: textToSend,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, newMessage] } : s));
    
    setInput("");
    setIsTyping(true);
    setEditingId(null);
    setIsListening(false);

    if (ws.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      setTimeout(() => ws.current.send(textToSend), 500);
    } else {
      ws.current.send(textToSend);
    }
  };

  const sendMessage = (e) => {
    if (e) e.preventDefault();
    triggerSend();
  };

  const regenerateResponse = () => {
    if (isTyping || messages.length < 2) return;
    const lastUserMsgIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserMsgIndex === -1) return;
    
    const lastUserMsg = messages[lastUserMsgIndex].content;
    
    setSessions(prev => prev.map(s => {
      if (s.id !== activeSessionId) return s;
      return { ...s, messages: s.messages.slice(0, lastUserMsgIndex + 1) };
    }));
    
    setIsTyping(true);
    if (synthRef.current) synthRef.current.cancel();
    setSpeakingId(null);

    if (ws.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      setTimeout(() => ws.current.send(lastUserMsg), 500);
    } else {
      ws.current.send(lastUserMsg);
    }
  };

  const submitEdit = (id) => {
    if (!editInput.trim() || isTyping) return;
    const msgIndex = messages.findIndex(m => m.id === id);
    if (msgIndex === -1) return;
    
    setSessions(prev => prev.map(s => {
      if (s.id !== activeSessionId) return s;
      return { ...s, messages: s.messages.slice(0, msgIndex) };
    }));
    triggerSend(editInput.trim());
  };

  const stopGenerating = () => {
    if (ws.current) {
      ws.current.close();
      setIsTyping(false);
      setSessions(prev => prev.map(session => {
        if (session.id === activeSessionId) {
          return { ...session, messages: session.messages.map(m => ({...m, isStreaming: false})) };
        }
        return session;
      }));
      setTimeout(() => connectWebSocket(), 500);
    }
  };

  const handleKeyDown = (e) => {
    if (prefs.sendOnEnter) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    } else {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return alert("Your browser does not support voice input.");
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleTextToSpeech = (text, id) => {
    if (!synthRef.current) return;
    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
    } else {
      synthRef.current.cancel();
      const cleanText = text.replace(/[*#`_~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      const voices = synthRef.current.getVoices();
      const goodVoice = voices.find(v => v.lang.includes('en-') && (v.name.includes('Google') || v.name.includes('Natural')));
      if (goodVoice) utterance.voice = goodVoice;
      setSpeakingId(id);
      synthRef.current.speak(utterance);
    }
  };

  const handleRate = (id, rating) => {
    setRatings(prev => ({ ...prev, [id]: prev[id] === rating ? null : rating }));
  };

  const startNewChat = () => {
    if (isTyping) return;
    setActiveSessionId(null);
    setTimeout(() => inputRef.current?.focus(), 100);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const deleteSession = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this chat?")) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) setActiveSessionId(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const printChat = () => window.print();

  return (
    <div className={`app-layout font-size-${prefs.fontSize}`}>
      
      {/* Sidebar for Chat History */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button onClick={startNewChat} className="new-chat-block-btn" disabled={isTyping}>
            <Bot size={20} />
            <span>New Chat</span>
            <PlusCircle size={16} className="ml-auto" />
          </button>
        </div>
        
        <div className="sidebar-history">
          <p className="sidebar-label">Recent Chats</p>
          {sessions.length === 0 && <p className="sidebar-empty">No previous chats.</p>}
          {sessions.map(session => (
            <div 
              key={session.id} 
              className={`history-item ${activeSessionId === session.id ? 'active' : ''}`}
              onClick={() => { setActiveSessionId(session.id); if(window.innerWidth < 768) setSidebarOpen(false); }}
            >
              <MessageSquare size={16} className="history-icon" />
              <span className="history-title">{session.title}</span>
              <button onClick={(e) => deleteSession(e, session.id)} className="delete-chat-btn" title="Delete Chat">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <button onClick={() => setShowSettings(true)} className="sidebar-footer-btn">
            <Settings size={18} /> Settings
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        
        {/* Header */}
        <header className="header">
          <div className="logo-section">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="icon-action-btn toggle-sidebar-btn" title="Toggle Sidebar">
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
            <div className="model-selector">
              <h1>Davora</h1>
              <div className="model-badge">Davora 3.2 <ChevronDown size={12} /></div>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={printChat} className="icon-action-btn hide-on-mobile" disabled={messages.length === 0} title="Print Chat">
              <Printer size={18} />
            </button>
          </div>
        </header>

        {/* Chat Box */}
        <main className="chat-box" ref={chatBoxRef} onScroll={handleScroll}>
          {messages.length === 0 && (
            <div className="welcome-screen">
              <Bot size={56} className="welcome-icon" />
              <h2>How can I help you today?</h2>
              <div className="quick-prompts-grid">
                {quickPrompts.map((item, idx) => (
                  <div key={idx} className="quick-prompt-card" onClick={() => triggerSend(item.prompt)}>
                    <div className="quick-prompt-icon">{item.icon}</div>
                    <div className="quick-prompt-text">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={msg.id || index} className={`message-row ${msg.role === 'user' ? 'row-user' : 'row-ai'}`}>
              <div className={`avatar ${msg.role === 'user' ? 'avatar-user' : 'avatar-ai'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={`message-bubble-wrapper ${msg.role === 'user' ? 'wrapper-user' : 'wrapper-ai'}`}>
                <div className={`message-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                  
                  {msg.role === 'user' ? (
                    editingId === msg.id ? (
                      <div className="edit-mode-box">
                        <TextareaAutosize 
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          className="edit-textarea"
                        />
                        <div className="edit-actions">
                          <button onClick={() => setEditingId(null)} className="edit-cancel">Cancel</button>
                          <button onClick={() => submitEdit(msg.id)} className="edit-save">Resubmit Prompt</button>
                        </div>
                      </div>
                    ) : (
                      <p className="user-text">{msg.content}</p>
                    )
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
                                  style={prefs.theme === 'light' ? vs : vscDarkPlus}
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
                </div>
                
                {!isTyping && (
                  <div className={`message-toolbar ${msg.role === 'user' ? 'toolbar-user' : 'toolbar-ai'}`}>
                    {msg.timestamp && (
                      <span className="msg-timestamp">
                         <Clock size={10} /> {msg.timestamp}
                      </span>
                    )}
                    
                    {msg.role === 'user' ? (
                      !editingId && (
                        <button onClick={() => { setEditingId(msg.id); setEditInput(msg.content); }} className="toolbar-btn" title="Edit Prompt">
                          <Edit2 size={12} /> Edit
                        </button>
                      )
                    ) : (
                      <>
                        <button onClick={() => toggleTextToSpeech(msg.content, msg.id)} className={`toolbar-btn ${speakingId === msg.id ? 'active-tts' : ''}`} title="Read Aloud">
                          {speakingId === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />} 
                        </button>
                        <button onClick={() => copyToClipboard(msg.content, msg.id)} className="toolbar-btn" title="Copy message">
                          {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} 
                        </button>
                        <div className="toolbar-divider"></div>
                        <button onClick={() => handleRate(msg.id, 'up')} className={`toolbar-btn ${ratings[msg.id] === 'up' ? 'text-green-500' : ''}`} title="Good response">
                          <ThumbsUp size={14} />
                        </button>
                        <button onClick={() => handleRate(msg.id, 'down')} className={`toolbar-btn ${ratings[msg.id] === 'down' ? 'text-red-500' : ''}`} title="Bad response">
                          <ThumbsDown size={14} />
                        </button>
                        <div className="toolbar-divider"></div>
                        {index === messages.length - 1 && (
                          <button onClick={regenerateResponse} className="toolbar-btn" title="Regenerate Response">
                            <RefreshCw size={12} /> Regenerate
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message-row row-ai">
               <div className="avatar avatar-ai"><Bot size={20} /></div>
               <div className="message-bubble-wrapper wrapper-ai">
                 <div className="message-bubble bubble-ai typing-indicator">
                   <span className="dot-typing"></span>
                   <span className="dot-typing"></span>
                   <span className="dot-typing"></span>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {showScrollButton && (
          <button className="scroll-bottom-btn" onClick={scrollToBottom}>
            <ArrowDown size={20} />
          </button>
        )}

        {isTyping && (
          <div className="stop-generating-wrapper">
            <button className="stop-generating-btn" onClick={stopGenerating}>
              <Square size={14} className="stop-icon" />
              Stop generating
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="input-wrapper">
          <form className="input-area" onSubmit={sendMessage}>
            <button type="button" className="mic-btn attach-btn" title="Attach file (Not supported by model yet)">
              <Paperclip size={20} />
            </button>
            <button 
              type="button" 
              onClick={toggleVoice} 
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              title="Voice Input (Dictate)"
            >
              <Mic size={20} />
            </button>
            
            <div className="textarea-container">
              <TextareaAutosize
                ref={inputRef}
                minRows={1}
                maxRows={6}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening... Speak now" : `Message Davora...`}
                disabled={isTyping}
                className="auto-resize-textarea"
              />
              {input.trim() && (
                <div className="word-counter">
                  {input.trim().split(/\s+/).length} words
                </div>
              )}
            </div>
            
            <button type="submit" disabled={!input.trim() || isTyping} className="send-btn">
              {isTyping ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
            </button>
          </form>
          <p className="footer-text">Davora 3.2 can make mistakes. Consider verifying important information.</p>
        </div>
      </div>

      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Settings</h2>
              <button className="icon-action-btn" onClick={() => setShowSettings(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="setting-group">
                <label>Theme</label>
                <div className="toggle-btns">
                  <button onClick={() => setPrefs({...prefs, theme: 'light'})} className={prefs.theme === 'light' ? 'active' : ''}><Sun size={16}/> Light</button>
                  <button onClick={() => setPrefs({...prefs, theme: 'dark'})} className={prefs.theme === 'dark' ? 'active' : ''}><Moon size={16}/> Dark</button>
                </div>
              </div>
              <div className="setting-group">
                <label>Font Size</label>
                <div className="toggle-btns">
                  <button onClick={() => setPrefs({...prefs, fontSize: 'small'})} className={prefs.fontSize === 'small' ? 'active' : ''}>Small</button>
                  <button onClick={() => setPrefs({...prefs, fontSize: 'medium'})} className={prefs.fontSize === 'medium' ? 'active' : ''}>Medium</button>
                  <button onClick={() => setPrefs({...prefs, fontSize: 'large'})} className={prefs.fontSize === 'large' ? 'active' : ''}>Large</button>
                </div>
              </div>
              <div className="setting-group">
                <label>Send Message Behavior</label>
                <div className="toggle-btns">
                  <button onClick={() => setPrefs({...prefs, sendOnEnter: true})} className={prefs.sendOnEnter ? 'active' : ''}>Enter</button>
                  <button onClick={() => setPrefs({...prefs, sendOnEnter: false})} className={!prefs.sendOnEnter ? 'active' : ''}>Shift + Enter</button>
                </div>
                <p className="setting-hint">Choose which key combination sends the message.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
