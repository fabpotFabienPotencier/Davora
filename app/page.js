"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, User, Bot, Loader2, Copy, Check,
  PlusCircle, Download, Square, ArrowDown,
  Mic, RefreshCw, Edit2, Volume2, VolumeX, ChevronDown, Clock,
  ThumbsUp, ThumbsDown, Printer, Zap, Code, PenTool, Lightbulb,
  Settings, Sun, Moon, X, PanelLeftClose, PanelLeft, MessageSquare, Trash2, Paperclip,
  Search, Pencil, Share, Bookmark, Compass, Folder, Activity, Database, Globe,
  Shield, FolderKanban, Sparkles, List, ChevronLeft, ChevronRight,
  VenetianMask, Pin, MoreHorizontal, CalendarClock, AtSign, TriangleAlert,
  Terminal, BrainCircuit, SearchCheck, FileClock, Link
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
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameInput, setRenameInput] = useState("");
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Davora 3.2 Pro");

  // Input & UI States
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [inputMode, setInputMode] = useState("instant");
  const [thinkingText, setThinkingText] = useState("Thinking...");
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const [openMoreMenuId, setOpenMoreMenuId] = useState(null);
  const [pinnedSessionIds, setPinnedSessionIds] = useState([]);

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
    sendOnEnter: true,
    customInstructions: ""
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
  const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const quickPrompts = [
    { icon: <Zap size={18} />, title: "Explain a complex topic", prompt: "Explain quantum computing in simple terms to a 10 year old." },
    { icon: <Code size={18} />, title: "Write a React component", prompt: "Write a React component for a beautiful glassmorphic button using TailwindCSS." },
    { icon: <PenTool size={18} />, title: "Draft an email", prompt: "Write a professional email to my boss asking for a deadline extension due to unforeseen technical blockers." },
    { icon: <Lightbulb size={18} />, title: "Brainstorm ideas", prompt: "Give me 5 unique ideas for a SaaS startup in the AI and productivity space." }
  ];

  const showNotification = (msg) => {
    setToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  // Initialization & Migrations
  useEffect(() => {
    const savedSessions = localStorage.getItem("davora_sessions");
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      } catch (e) { }
    }

    const savedRatings = localStorage.getItem("davora_chat_ratings");
    if (savedRatings) {
      try { setRatings(JSON.parse(savedRatings)); } catch (e) { }
    }

    const savedPrefs = localStorage.getItem("davora_prefs");
    if (savedPrefs) {
      try { setPrefs(prev => ({ ...prev, ...JSON.parse(savedPrefs) })); } catch (e) { }
    }
    
    const savedPins = localStorage.getItem("davora_pinned_sessions");
    if (savedPins) {
      try { setPinnedSessionIds(JSON.parse(savedPins)); } catch (e) { }
    }

    if (window.innerWidth < 768) setSidebarOpen(false);
    if (inputRef.current) inputRef.current.focus();

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

  // 2026 Dynamic Thinking States
  useEffect(() => {
    if (!isTyping) {
      setThinkingText("Thinking...");
      return;
    }
    const states = ["Analyzing context...", "Searching memory...", "Synthesizing response...", "Drafting..."];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % states.length;
      setThinkingText(states[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isTyping]);

  // 2026 Command Palette Keybind (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCmdPalette(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowCmdPalette(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);

  useEffect(() => {
    if (sessions.length > 0) localStorage.setItem("davora_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("davora_prefs", JSON.stringify(prefs));
    if (prefs.theme === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem("davora_chat_ratings", JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem("davora_pinned_sessions", JSON.stringify(pinnedSessionIds));
  }, [pinnedSessionIds]);

  const togglePin = (e, id) => {
    e.stopPropagation();
    setPinnedSessionIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

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
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
        return { ...session, messages: newMessages };
      }));
    };
    ws.current.onclose = () => {
      setSessions(prev => prev.map(session => {
        if (session.id === activeSessionIdRef.current) {
          return { ...session, messages: session.messages.map(m => ({ ...m, isStreaming: false })) };
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, newMessage] } : s));

    setInput("");
    setIsTyping(true);
    setEditingId(null);
    setIsListening(false);

    if (ws.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      setTimeout(() => ws.current.send(JSON.stringify({ message: textToSend, mode: inputMode, model: selectedModel, isTemporary: isTemporary })), 500);
    } else {
      ws.current.send(JSON.stringify({ message: textToSend, mode: inputMode, model: selectedModel, isTemporary: isTemporary }));
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
          return { ...session, messages: session.messages.map(m => ({ ...m, isStreaming: false })) };
        }
        return session;
      }));
      setTimeout(() => connectWebSocket(), 500);
    }
  };

  const handleKeyDown = (e) => {
    if (prefs.sendOnEnter) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    } else {
      if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); sendMessage(); }
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      showNotification("Voice input not supported in this browser.");
      return;
    }
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
      showNotification("Chat deleted");
    }
  };

  const saveRename = (e, id) => {
    e.stopPropagation();
    if (renameInput.trim()) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: renameInput.trim() } : s));
      showNotification("Chat renamed");
    }
    setRenamingId(null);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const mockAttach = () => {
    showNotification("Attachments coming in next model update.");
  };

  const clearAllChats = () => {
    if (window.confirm("Are you sure you want to delete ALL chats? This cannot be undone.")) {
      setSessions([]);
      setActiveSessionId(null);
      localStorage.removeItem("davora_sessions");
      showNotification("All chats cleared");
      setShowSettings(false);
    }
  };

  return (
    <div className={`app-layout font-size-${prefs.fontSize} ${isTyping ? 'ambient-focus' : ''}`}>

      {/* Toast Notification */}
      <div className={`toast-notification ${toast ? 'show' : ''}`}>
        {toast}
      </div>

      {/* Sidebar for Chat History */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button onClick={startNewChat} className="new-chat-block-btn" disabled={isTyping}>
            <Bot size={20} />
            <span>New Chat</span>
            <PlusCircle size={16} className="ml-auto" />
          </button>
        </div>

        <div className="sidebar-nav-group">
          <button className="sidebar-nav-btn" onClick={() => showNotification("Projects opening...")}>
            <FolderKanban size={16} /> My Projects
          </button>
          <button className="sidebar-nav-btn" onClick={() => showNotification("Canvas Notes workspace opening...")}>
            <Folder size={16} /> My Canvas Notes
          </button>
          <button className="sidebar-nav-btn" onClick={() => showNotification("Agent marketplace opening...")}>
            <Compass size={16} /> Explore Agents
          </button>
        </div>

        <div className="sidebar-search-container">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sidebar-search-input"
          />
        </div>

        <div className="sidebar-history">
          <p className="sidebar-label">Recent</p>
          {filteredSessions.length === 0 && <p className="sidebar-empty">No chats found.</p>}
          {filteredSessions.map(session => (
            <div
              key={session.id}
              className={`history-item ${activeSessionId === session.id ? 'active' : ''}`}
              onClick={() => { if (renamingId !== session.id) { setActiveSessionId(session.id); if (window.innerWidth < 768) setSidebarOpen(false); } }}
            >
              {renamingId === session.id ? (
                <input
                  autoFocus
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  onBlur={(e) => saveRename(e, session.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveRename(e, session.id); }}
                  className="rename-input"
                />
              ) : (
                <span className="history-title">{session.title}</span>
              )}

              {pinnedSessionIds.includes(session.id) && <Pin size={12} className="pinned-indicator text-purple-500 ml-1" />}

              {renamingId !== session.id && (
                <div className="history-actions">
                  <button onClick={(e) => togglePin(e, session.id)} className="action-icon-btn" title="Pin Chat">
                    <Pin size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setRenamingId(session.id); setRenameInput(session.title); }} className="action-icon-btn" title="Rename">
                    <Pencil size={14} />
                  </button>
                  <button onClick={(e) => deleteSession(e, session.id)} className="action-icon-btn delete" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button onClick={() => setShowSettings(true)} className="user-profile-btn">
            <div className="user-avatar-small"><User size={16} /></div>
            <div className="user-info">
              <span className="user-name">My Account</span>
              <span className="user-plan">Free Plan</span>
            </div>
            <Settings size={16} className="ml-auto text-secondary" />
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
            <div className="model-selector-wrapper" onClick={() => setShowModelPicker(!showModelPicker)}>
              <div className="model-selector">
                <h1>Davora</h1>
                <div className="model-badge">{selectedModel} <ChevronDown size={12} /></div>
              </div>
              
              {showModelPicker && (
                <div className="model-dropdown">
                  <div className="model-option" onClick={(e) => { e.stopPropagation(); setSelectedModel("Davora Instant"); setShowModelPicker(false); showNotification("Switched to Instant Model"); }}>
                    <Zap size={16} className="text-yellow-500" /> 
                    <div className="model-opt-text"><strong>Davora Instant</strong><br/><span>Fastest responses, everyday tasks</span></div>
                  </div>
                  <div className="model-option" onClick={(e) => { e.stopPropagation(); setSelectedModel("Davora Thinking"); setShowModelPicker(false); showNotification("Switched to Thinking Model"); }}>
                    <Activity size={16} className="text-purple-500" /> 
                    <div className="model-opt-text"><strong>Davora Thinking</strong><br/><span>Deep reasoning for math & code</span></div>
                  </div>
                  <div className="model-option" onClick={(e) => { e.stopPropagation(); setSelectedModel("Davora Pro"); setShowModelPicker(false); showNotification("Switched to Pro Model"); }}>
                    <Globe size={16} className="text-blue-500" /> 
                    <div className="model-opt-text"><strong>Davora Pro</strong><br/><span>Flagship model with web access</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button 
              className={`temporary-chat-toggle ${isTemporary ? 'active' : ''}`}
              onClick={() => { setIsTemporary(!isTemporary); showNotification(isTemporary ? "Temporary Chat Disabled" : "Temporary Chat Enabled. History won't be saved."); }}
              title="Temporary Chat (Incognito)"
            >
              <VenetianMask size={14} /> <span className="hide-on-mobile">{isTemporary ? 'Incognito' : 'Standard'}</span>
            </button>
            <div className="token-badge" title="Context Memory Usage">
              <Database size={12} /> 24k / 128k Tokens
            </div>
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
                      {inputMode === 'deep' && (
                        <details className="reasoning-path">
                          <summary><Activity size={14} className="inline-icon" /> Analyzed 14 context paths</summary>
                          <div className="reasoning-content">
                            <p className="reasoning-step">1. Parsed user intent from previous turns.</p>
                            <p className="reasoning-step">2. Retrieved semantic memory chunks.</p>
                            <p className="reasoning-step">3. Synthesized optimal reasoning chain.</p>
                          </div>
                        </details>
                      )}
                      {inputMode === 'research' && index % 2 === 1 && (
                        <details className="tool-execution-block">
                          <summary><Terminal size={14} className="inline-icon text-green-500" /> Analyzed data with Python</summary>
                          <div className="tool-execution-content">
                            <code>import pandas as pd</code><br/>
                            <code>df = pd.read_csv('dataset.csv')</code><br/>
                            <code>print(df.describe())</code>
                          </div>
                        </details>
                      )}
                      {inputMode === 'research' && index % 2 !== 1 && (
                        <details className="tool-execution-block web-search-block">
                          <summary><SearchCheck size={14} className="inline-icon text-blue-500" /> Searched 5 sites</summary>
                          <div className="tool-execution-content search-results">
                            <a href="#" className="search-citation"><Link size={12}/> github.com/davora</a>
                            <a href="#" className="search-citation"><Link size={12}/> stackoverflow.com/questions</a>
                            <a href="#" className="search-citation"><Link size={12}/> reactjs.org/docs</a>
                          </div>
                        </details>
                      )}
                      <div className="per-message-model-badge">
                        <Sparkles size={10} className="inline-icon text-purple-500"/> {selectedModel}
                      </div>
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
                      {index === 1 && (
                        <div className="memory-updated-badge animation-slide-up">
                          <BrainCircuit size={12} className="text-purple-500"/> Memory updated
                        </div>
                      )}
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
                        <>
                          <div className="branch-selector" title="Alternate Prompts">
                            <ChevronLeft size={14} className="branch-btn disabled" />
                            <span>1 / 1</span>
                            <ChevronRight size={14} className="branch-btn disabled" />
                          </div>
                          <div className="toolbar-divider"></div>
                          <button onClick={() => { setEditingId(msg.id); setEditInput(msg.content); }} className="toolbar-btn" title="Edit Prompt">
                            <Edit2 size={12} /> Edit
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <div className="branch-selector" title="Alternate Generations">
                          <ChevronLeft size={14} className="branch-btn disabled" />
                          <span>1 / 1</span>
                          <ChevronRight size={14} className="branch-btn disabled" />
                        </div>
                        <div className="toolbar-divider"></div>
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
                        <button onClick={() => setCanvasOpen(true)} className="toolbar-btn" title="Open in Canvas">
                          <Bookmark size={14} />
                        </button>
                        <button onClick={() => showNotification("Share link coming soon!")} className="toolbar-btn" title="Share message">
                          <Share size={14} />
                        </button>
                        <div className="toolbar-divider"></div>
                        {index === messages.length - 1 && (
                          <button onClick={regenerateResponse} className="toolbar-btn" title="Regenerate Response">
                            <RefreshCw size={12} /> Regenerate
                          </button>
                        )}
                        <div className="more-menu-wrapper">
                          <button onClick={() => setOpenMoreMenuId(openMoreMenuId === msg.id ? null : msg.id)} className="toolbar-btn" title="More Actions">
                            <MoreHorizontal size={14} />
                          </button>
                          {openMoreMenuId === msg.id && (
                            <div className="more-menu-dropdown">
                               <button onClick={() => { showNotification("Task Scheduled"); setOpenMoreMenuId(null); }} className="more-menu-item"><CalendarClock size={14}/> Schedule Task</button>
                               <button onClick={() => { showNotification("Report Sent"); setOpenMoreMenuId(null); }} className="more-menu-item"><TriangleAlert size={14} className="text-red-500"/> Report Issue</button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {msg.role === 'ai' && index === messages.length - 1 && !isTyping && (
                  <div className="predictive-actions animation-slide-up">
                    <p className="predictive-label"><Sparkles size={12}/> Suggested Next Steps</p>
                    <div className="predictive-btn-group">
                      <button className="predictive-btn" onClick={() => triggerSend("Convert this to a professional email")}><PenTool size={14} /> Draft Email</button>
                      <button className="predictive-btn" onClick={() => triggerSend("Summarize this into 3 bullet points")}><List size={14} /> Summarize</button>
                      <button className="predictive-btn" onClick={() => setCanvasOpen(true)}><Folder size={14} /> Save to Canvas</button>
                    </div>
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
                  {inputMode === 'deep' ? (
                    <span className="thinking-text-animated pulse-glow"><Activity size={14} className="inline-icon" /> {thinkingText}</span>
                  ) : (
                    <>
                      <span className="dot-typing"></span>
                      <span className="dot-typing"></span>
                      <span className="dot-typing"></span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* 2026 Scroll to bottom badge */}
        {showScrollButton && (
          <button 
            className={`scroll-bottom-btn ${isTyping ? 'has-unread' : ''}`}
            onClick={scrollToBottom}
          >
            <ArrowDown size={20} />
            {isTyping && <div className="unread-dot"></div>}
          </button>
        )}

        {/* App Connectors Strip */}
        <div className="app-connectors-strip">
           <button className="connector-badge" onClick={() => showNotification("Connected to Gmail")}><AtSign size={12}/> Gmail</button>
           <button className="connector-badge" onClick={() => showNotification("Connected to Drive")}><Database size={12}/> Drive</button>
        </div>

        {/* Input Area */}
        <div className={`input-wrapper mode-${inputMode}`}>

          <div className="input-mode-selector">
            <button onClick={() => setInputMode('instant')} className={`mode-btn ${inputMode === 'instant' ? 'active' : ''}`}><Zap size={14} /> Instant</button>
            <button onClick={() => setInputMode('deep')} className={`mode-btn ${inputMode === 'deep' ? 'active' : ''}`}><Activity size={14} /> Deep Think</button>
            <button onClick={() => { setInputMode('research'); showNotification("Web Search Agent coming soon"); }} className={`mode-btn ${inputMode === 'research' ? 'active' : ''}`}><Globe size={14} /> Web Research</button>
          </div>

          <form className="input-area" onSubmit={sendMessage}>
            <button type="button" onClick={mockAttach} className="attach-btn" title="Attach file">
              <Paperclip size={20} />
            </button>

            <div className={`textarea-container ${isListening ? 'hidden' : ''}`}>
              <TextareaAutosize
                ref={inputRef}
                minRows={1}
                maxRows={6}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Davora..."
                disabled={isTyping}
                className="auto-resize-textarea"
              />
            </div>

            {isListening && (
              <div className="voice-visualizer">
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
                <span className="voice-text">Listening...</span>
              </div>
            )}

            <div className="input-right-actions">
              <button
                type="button"
                onClick={toggleVoice}
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                title="Voice Input (Dictate)"
              >
                <Mic size={20} />
              </button>

              {isTyping ? (
                <button type="button" onClick={stopGenerating} className="send-btn stop-btn" title="Stop generating">
                  <Square size={16} fill="currentColor" />
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()} className="send-btn" title="Send message">
                  <Send size={18} />
                </button>
              )}
            </div>
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
              <button className="icon-action-btn" onClick={() => setShowSettings(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">

              {/* Custom Instructions */}
              <div className="setting-group">
                <label>Custom Instructions</label>
                <p className="setting-hint">What would you like Davora to know about you to provide better responses?</p>
                <textarea
                  className="custom-instructions-input"
                  rows={3}
                  value={prefs.customInstructions}
                  onChange={(e) => setPrefs({ ...prefs, customInstructions: e.target.value })}
                  placeholder="e.g. I am a software developer. Always give concise answers."
                />
              </div>

              <div className="setting-group-row">
                <button onClick={() => showNotification("Opening Memory settings...")} className="sidebar-nav-btn outline-btn">
                  <Database size={16} /> Manage Memory
                </button>
                <button onClick={() => showNotification("Checking active sessions...")} className="sidebar-nav-btn outline-btn">
                  <Activity size={16} /> Active Sessions
                </button>
              </div>

              <div className="setting-group">
                <label>Theme</label>
                <div className="toggle-btns">
                  <button onClick={() => setPrefs({ ...prefs, theme: 'light' })} className={prefs.theme === 'light' ? 'active' : ''}><Sun size={16} /> Light</button>
                  <button onClick={() => setPrefs({ ...prefs, theme: 'dark' })} className={prefs.theme === 'dark' ? 'active' : ''}><Moon size={16} /> Dark</button>
                </div>
              </div>
              <div className="setting-group">
                <label>Font Size</label>
                <div className="toggle-btns">
                  <button onClick={() => setPrefs({ ...prefs, fontSize: 'small' })} className={prefs.fontSize === 'small' ? 'active' : ''}>Small</button>
                  <button onClick={() => setPrefs({ ...prefs, fontSize: 'medium' })} className={prefs.fontSize === 'medium' ? 'active' : ''}>Medium</button>
                  <button onClick={() => setPrefs({ ...prefs, fontSize: 'large' })} className={prefs.fontSize === 'large' ? 'active' : ''}>Large</button>
                </div>
              </div>

              <div className="setting-group danger-zone">
                <button onClick={clearAllChats} className="danger-btn">Delete all chats</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2026 Right Canvas Panel */}
      <aside className={`canvas-panel ${canvasOpen ? 'open' : 'closed'}`}>
        <div className="canvas-header">
          <div className="canvas-title">
            <Folder size={16} /> Canvas Workspace 
            <span className="canvas-version-badge"><FileClock size={12}/> v1.0</span>
          </div>
          <button onClick={() => setCanvasOpen(false)} className="icon-action-btn"><X size={18} /></button>
        </div>
        <div className="canvas-body">
          <div className="canvas-empty-state">
            <Bookmark size={32} className="text-secondary mb-4" />
            <h3>No Artifacts Saved</h3>
            <p>Click the bookmark icon on any AI message to save it to your persistent Canvas workspace.</p>
          </div>
        </div>
      </aside>

      {/* 2026 Command Palette (Omnibar) */}
      {showCmdPalette && (
        <div className="cmd-palette-overlay" onClick={() => setShowCmdPalette(false)}>
          <div className="cmd-palette-content" onClick={e => e.stopPropagation()}>
            <div className="cmd-header">
              <Search size={18} className="text-secondary" />
              <input autoFocus type="text" placeholder="Search chats or type a command..." className="cmd-input" />
              <div className="cmd-badge">ESC</div>
            </div>
            <div className="cmd-body">
              <p className="cmd-label">Quick Actions</p>
              <button className="cmd-item" onClick={() => { startNewChat(); setShowCmdPalette(false); }}>
                <PlusCircle size={16} /> New Chat
              </button>
              <button className="cmd-item" onClick={() => { setInputMode('deep'); setShowCmdPalette(false); }}>
                <Activity size={16} /> Switch to Deep Think Mode
              </button>
              <button className="cmd-item" onClick={() => { setShowSettings(true); setShowCmdPalette(false); }}>
                <Settings size={16} /> Open Settings
              </button>
              <p className="cmd-label">Recent Chats</p>
              {filteredSessions.slice(0, 3).map(session => (
                <button key={session.id} className="cmd-item" onClick={() => { setActiveSessionId(session.id); setShowCmdPalette(false); }}>
                  <MessageSquare size={16} /> {session.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
