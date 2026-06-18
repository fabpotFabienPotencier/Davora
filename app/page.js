"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send, User, Bot, Loader2, Copy, Check,
  PlusCircle, Download, Square, ArrowDown,
  Mic, RefreshCw, Edit2, Volume2, VolumeX, ChevronDown, Clock,
  ThumbsUp, ThumbsDown, Printer, Zap, Code, PenTool, Lightbulb,
  Settings, Sun, Moon, X, PanelLeftClose, PanelLeft, MessageSquare, Trash2, Paperclip,
  Search, Pencil, Share, Bookmark, Compass, Folder, Activity, Database, Globe,
  Shield, FolderKanban, Sparkles, List, ChevronLeft, ChevronRight,
  VenetianMask, Pin, MoreHorizontal, CalendarClock, AtSign, TriangleAlert,
  Terminal, BrainCircuit, SearchCheck, FileClock, Link, Plus, Telescope, Image
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import TextareaAutosize from "react-textarea-autosize";

export default function Davora() {
  const router = useRouter();

  // Session Management (Sidebar)
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const activeSessionIdRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile to prevent blocking
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameInput, setRenameInput] = useState("");
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Davora 3.2 Pro");
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // Input & UI States
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [inputMode, setInputMode] = useState("instant");
  const [thinkingText, setThinkingText] = useState("Thinking...");
  const [copiedId, setCopiedId] = useState(null);
  const [attachment, setAttachment] = useState(null);
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
  const [userEmail, setUserEmail] = useState("");

  const [activeModal, setActiveModal] = useState(null);
  const [canvasArtifacts, setCanvasArtifacts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const ws = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const plusMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Derived messages for the active session
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];
  const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Rotating suggestion pool — shows 2 random chips at a time
  const allSuggestions = [
    { icon: <Zap size={14} />, text: "Explain quantum computing simply" },
    { icon: <Code size={14} />, text: "Write a Python sorting algorithm" },
    { icon: <PenTool size={14} />, text: "Draft a professional email" },
    { icon: <Lightbulb size={14} />, text: "Brainstorm startup ideas" },
    { icon: <Globe size={14} />, text: "What's happening in the world today?" },
    { icon: <Code size={14} />, text: "Build a REST API with Node.js" },
    { icon: <PenTool size={14} />, text: "Write a cover letter for a tech job" },
    { icon: <Lightbulb size={14} />, text: "Explain how blockchain works" },
    { icon: <Zap size={14} />, text: "Compare React vs Vue in 2026" },
    { icon: <Globe size={14} />, text: "Latest news in AI" },
    { icon: <Code size={14} />, text: "Create a landing page in HTML/CSS" },
    { icon: <Lightbulb size={14} />, text: "Give me 5 productivity tips" },
  ];

  const [visibleSuggestions, setVisibleSuggestions] = useState([]);
  const [autoSuggestion, setAutoSuggestion] = useState("");

  // Rotate suggestions every 5 seconds
  useEffect(() => {
    // Open sidebar automatically on desktop
    if (window.innerWidth > 768) {
      setSidebarOpen(true);
    }
    const pickRandom = () => {
      const shuffled = [...allSuggestions].sort(() => 0.5 - Math.random());
      setVisibleSuggestions(shuffled.slice(0, 2));
    };
    pickRandom();
    const interval = setInterval(pickRandom, 5000);
    return () => clearInterval(interval);
  }, []);

  // Autocomplete dictionary — prefix-matched suggestions as user types
  const suggestionBank = [
    "What is the weather in ", "Tell me about ", "How do I ",
    "Write a Python script that ", "Explain how ", "What are the latest news in ",
    "Give me 5 tips for ", "Compare ", "Summarize ",
    "Help me write ", "Create a ", "What is ",
    "How does ", "Why is ", "Can you help me with ",
    "Draft an email to ", "Write code for ", "Translate this to ",
    "What happened today in ", "Tell me a joke about ",
    "Plan a trip to ", "Recommend a book about ", "How to fix ",
  ];

  useEffect(() => {
    if (input.length < 3) { setAutoSuggestion(""); return; }
    const lower = input.toLowerCase();
    const match = suggestionBank.find(s => s.toLowerCase().startsWith(lower) && s.toLowerCase() !== lower);
    setAutoSuggestion(match || "");
  }, [input]);

  const showNotification = (msg) => {
    setToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  // Initialization & DB Fetching
  useEffect(() => {
    const token = localStorage.getItem("davora_token");
    const email = localStorage.getItem("davora_email");
    if (!token) {
      router.push("/login");
      return;
    }
    setUserEmail(email || "User");

    const fetchSessions = async () => {
      try {
        const res = await fetch('https://blatancy-barrack-spelling.ngrok-free.dev/api/sessions', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (res.status === 401) {
          localStorage.removeItem("davora_token");
          router.push("/login");
          return;
        }
        if (res.ok) {
          const dbSessions = await res.json();
          setSessions(dbSessions);
          const metaRes = await fetch('https://blatancy-barrack-spelling.ngrok-free.dev/api/metadata', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
            }
          });
          if (metaRes.ok) {
            const meta = await metaRes.json();
            try { setPrefs(prev => ({ ...prev, ...JSON.parse(meta.prefs) })); } catch (e) { }
            try { setCanvasArtifacts(JSON.parse(meta.canvas)); } catch (e) { }
            try { setPinnedSessionIds(JSON.parse(meta.pins)); } catch (e) { }
            try { setRatings(JSON.parse(meta.ratings)); } catch (e) { }

            const savedActive = meta.active_session_id;
            if (savedActive === "new") {
              setActiveSessionId(null);
            } else if (savedActive && dbSessions.some(s => s.id === savedActive)) {
              setActiveSessionId(savedActive);
            } else if (dbSessions.length > 0) {
              setActiveSessionId(dbSessions[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch from DB", err);
      }
    };
    fetchSessions();

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
    const states = ["Thinking...", "Generating response...", "Writing..."];
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

  // Close plus menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false);
      }
      if (!event.target.closest('.more-menu-wrapper')) {
        setOpenMoreMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const syncMetadata = (updates) => {
    const token = localStorage.getItem("davora_token");
    if (!token) return;
    fetch('https://blatancy-barrack-spelling.ngrok-free.dev/api/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(updates)
    }).catch(err => console.error("Meta Sync error", err));
  };

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
    syncMetadata({ active_session_id: activeSessionId || "new" });
  }, [activeSessionId]);

  useEffect(() => {
    // Persist to DB when typing stops
    if (isTyping || !activeSessionId) return;
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (!currentSession || currentSession.isTemporary) return;

    const token = localStorage.getItem("davora_token");
    if (token) {
      fetch('https://blatancy-barrack-spelling.ngrok-free.dev/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(currentSession)
      }).catch(err => console.error("DB Sync error", err));
    }
  }, [sessions, isTyping, activeSessionId]);

  useEffect(() => {
    syncMetadata({ prefs: JSON.stringify(prefs) });
    if (prefs.theme === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
  }, [prefs]);

  useEffect(() => {
    syncMetadata({ ratings: JSON.stringify(ratings) });
  }, [ratings]);

  useEffect(() => {
    syncMetadata({ pins: JSON.stringify(pinnedSessionIds) });
  }, [pinnedSessionIds]);

  useEffect(() => {
    syncMetadata({ canvas: JSON.stringify(canvasArtifacts) });
  }, [canvasArtifacts]);

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
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://blatancy-barrack-spelling.ngrok-free.dev/ws/chat";
    ws.current = new WebSocket(wsUrl);
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
            model: selectedModel,
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
    const newSession = { id: newId, title, messages: [], isTemporary };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    return newId;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showNotification("Only images are supported right now");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        file,
        base64: event.target.result.split(',')[1],
        url: URL.createObjectURL(file)
      });
      setShowPlusMenu(false);
      inputRef.current?.focus();
    };
    reader.readAsDataURL(file);
  };

  const triggerSend = (customText = null) => {
    const textToSend = customText !== null ? customText : input.trim();
    if ((!textToSend && !attachment) || !ws.current || isTyping) return;

    if (synthRef.current) synthRef.current.cancel();
    setSpeakingId(null);

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      targetSessionId = createNewSession(textToSend || "Image Upload");
    }

    const newMessage = {
      id: Date.now(), role: "user", content: textToSend, image_url: attachment?.url,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, newMessage] } : s));

    const activeMessages = sessions.find(s => s.id === targetSessionId)?.messages || [];
    
    const payloadObj = { 
      message: textToSend, 
      history: activeMessages, // Send previous messages for context
      mode: inputMode, 
      model: selectedModel, 
      isTemporary: isTemporary, 
      customInstructions: prefs.customInstructions 
    };
    if (attachment) {
      payloadObj.image = attachment.base64;
    }

    setInput("");
    setAttachment(null);
    setIsTyping(true);
    setEditingId(null);
    setIsListening(false);

    if (ws.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      setTimeout(() => ws.current.send(JSON.stringify(payloadObj)), 500);
    } else {
      ws.current.send(JSON.stringify(payloadObj));
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
    const historyUntilNow = messages.slice(0, lastUserMsgIndex);

    setSessions(prev => prev.map(s => {
      if (s.id !== activeSessionId) return s;
      return { ...s, messages: s.messages.slice(0, lastUserMsgIndex + 1) };
    }));

    setIsTyping(true);
    if (synthRef.current) synthRef.current.cancel();
    setSpeakingId(null);

    const jsonPayload = JSON.stringify({ 
      message: lastUserMsg, 
      history: historyUntilNow,
      mode: inputMode, 
      model: selectedModel, 
      isTemporary: isTemporary, 
      customInstructions: prefs.customInstructions 
    });
    
    if (ws.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      setTimeout(() => ws.current.send(jsonPayload), 500);
    } else {
      ws.current.send(jsonPayload);
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
    // Tab to accept autocomplete suggestion
    if (e.key === "Tab" && autoSuggestion) {
      e.preventDefault();
      setInput(autoSuggestion);
      setAutoSuggestion("");
      return;
    }
    if (e.key === "Escape" && autoSuggestion) {
      setAutoSuggestion("");
      return;
    }
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
    setDeleteConfirm({ type: 'single', id });
  };

  const saveRename = (e, id) => {
    e.stopPropagation();
    if (renameInput.trim()) {
      const newTitle = renameInput.trim();
      setSessions(prev => {
        const newSessions = prev.map(s => s.id === id ? { ...s, title: newTitle } : s);
        
        // Sync the renamed session directly to the DB
        const renamedSession = newSessions.find(s => s.id === id);
        if (renamedSession && !renamedSession.isTemporary) {
          const token = localStorage.getItem("davora_token");
          if (token) {
            fetch('https://blatancy-barrack-spelling.ngrok-free.dev/api/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
              body: JSON.stringify(renamedSession)
            }).catch(err => console.error("Rename sync error", err));
          }
        }
        return newSessions;
      });
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
    setDeleteConfirm({ type: 'all' });
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'single') {
      const id = deleteConfirm.id;
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) setActiveSessionId(null);
      showNotification("Chat deleted");
      const token = localStorage.getItem("davora_token");
      if (token) {
        fetch(`https://blatancy-barrack-spelling.ngrok-free.dev/api/sessions/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
        }).catch(err => console.error("Delete sync error", err));
      }
    } else if (deleteConfirm.type === 'all') {
      setSessions([]);
      setActiveSessionId(null);
      showNotification("All chats cleared");
      setShowSettings(false);
      const token = localStorage.getItem("davora_token");
      if (token) {
        fetch('https://blatancy-barrack-spelling.ngrok-free.dev/api/sessions/all', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
        }).catch(err => console.error("Clear all sync error", err));
      }
    }
    setDeleteConfirm(null);
  };

  return (
    <div className={`app-layout font-size-${prefs.fontSize} ${isTyping ? 'ambient-focus' : ''}`}>

      {/* Toast Notification */}
      <div className={`toast-notification ${toast ? 'show' : ''}`}>
        {toast}
      </div>

      {/* Sidebar for Chat History */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header" style={{ padding: '16px 12px 12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center text-white" style={{ display: 'flex', gap: '8px' }}>
            <Bot size={22} />
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Search size={18} className="hover-white" onClick={() => {
              const el = document.querySelector('.sidebar-search-wrapper');
              if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
            }} />
            <PanelLeftClose size={18} className="hover-white" onClick={() => setSidebarOpen(false)} />
          </div>
        </div>

        <div className="sidebar-search-wrapper" style={{ padding: '0 12px', marginBottom: '8px', display: 'none' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid transparent', color: 'var(--text-primary)', padding: '6px 12px 6px 32px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
        </div>

        <div className="sidebar-nav-group">
          <button className="sidebar-nav-btn new-chat-btn" onClick={startNewChat} disabled={isTyping}>
            <Edit2 size={16} /> New chat
          </button>
          <button className="sidebar-nav-btn" onClick={() => setActiveModal('library')}>
            <FolderKanban size={16} /> Library
          </button>
          <button className="sidebar-nav-btn" onClick={() => setActiveModal('projects')}>
            <Folder size={16} /> Projects
          </button>
          <button className="sidebar-nav-btn" onClick={() => setActiveModal('apps')}>
            <Compass size={16} /> Apps
          </button>
          <button className="sidebar-nav-btn" onClick={() => setActiveModal('codex')}>
            <Code size={16} /> Codex
          </button>
          <button className="sidebar-nav-btn" onClick={() => setActiveModal('more')}>
            <MoreHorizontal size={16} /> More
          </button>
        </div>

        <div className="sidebar-history">
          <p className="sidebar-label">Recents</p>
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
          <button onClick={() => setShowSettings(true)} className="user-profile-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
            <div className="user-avatar-small" style={{ width: '32px', height: '32px', background: '#f87171', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '600' }}>
              {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, overflow: 'hidden' }}>
              <span className="user-name" style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.85rem', width: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{userEmail.split('@')[0] || "User"}</span>
              <span className="user-plan" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); localStorage.clear(); router.push('/login'); }}>Log out</span>
            </div>
            <div className="upgrade-pill" style={{ background: '#2f2f2f', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '500' }}>
              Upgrade
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay — tap anywhere to close */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        {/* Header */}
        <header className="header">
          <div className="logo-section">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="icon-action-btn toggle-sidebar-btn" title="Open Sidebar">
                <PanelLeft size={20} />
              </button>
            )}
            <div className="model-selector-wrapper" onClick={() => setShowModelPicker(!showModelPicker)}>
              <div className="model-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <h1 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{selectedModel}</h1>
                <ChevronDown size={14} className="text-secondary opacity-70" />
              </div>

              {showModelPicker && (
                <div className="model-dropdown">
                  <div className="model-option" onClick={(e) => { e.stopPropagation(); setSelectedModel("Davora 3.2 Pro"); setShowModelPicker(false); showNotification("Using Davora 3.2 Pro (llama3.2 1B)"); }}>
                    <Sparkles size={16} className="text-purple-500" />
                    <div className="model-opt-text"><strong>Davora 3.2 Pro</strong><br /><span>Default model — fast & capable</span></div>
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

          </div>
        </header>

        {/* Chat Box */}
        {isTemporary && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '500', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', width: '100%', zIndex: 10 }}>
            <Shield size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', marginBottom: '2px' }} />
            Private Chat Mode Enabled. This conversation will only be stored securely for 30 days and then permanently deleted.
          </div>
        )}
        <main className="chat-box" ref={chatBoxRef} onScroll={handleScroll}>
          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <Bot size={32} strokeWidth={1.5} />
              </div>
              <h2>How can I help you today?</h2>
              <div className="suggestion-chips">
                {visibleSuggestions.map((s, idx) => (
                  <button key={idx} className="suggestion-chip" onClick={() => triggerSend(s.text)}>
                    {s.icon} {s.text}
                  </button>
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
                      <>
                        {msg.image_url && <img src={msg.image_url} alt="Attached image" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', marginBottom: '12px' }} />}
                        {msg.content && <p className="user-text">{msg.content}</p>}
                      </>
                    )
                  ) : (
                    <div className="markdown-body">
                      {msg.model && (
                        <div className="per-message-model-badge">
                          <Sparkles size={10} className="inline-icon text-purple-500" /> {msg.model}
                        </div>
                      )}
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
                        <>
                          <button onClick={() => copyToClipboard(msg.content, msg.id)} className="toolbar-btn" title="Copy message">
                            {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} Copy
                          </button>
                          <button onClick={() => { setEditingId(msg.id); setEditInput(msg.content); }} className="toolbar-btn" title="Edit Prompt">
                            <Edit2 size={14} /> Edit
                          </button>
                        </>
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
                        <button onClick={() => saveToCanvas(msg.content)} className="toolbar-btn" title="Save to Canvas">
                          <Bookmark size={14} />
                        </button>
                        <button onClick={() => setActiveModal('share')} className="toolbar-btn" title="Share message">
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
                              <button onClick={() => { setActiveModal('schedule'); setOpenMoreMenuId(null); }} className="more-menu-item"><CalendarClock size={14} /> Schedule Task</button>
                              <button onClick={() => { setActiveModal('report'); setOpenMoreMenuId(null); }} className="more-menu-item"><TriangleAlert size={14} className="text-red-500" /> Report Issue</button>
                            </div>
                          )}
                        </div>
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

        {/* Input Area */}
        <div className={`input-wrapper mode-${inputMode}`}>
          <form className="input-area" onSubmit={sendMessage}>

            <div ref={plusMenuRef} className="plus-menu-wrapper" style={{ position: 'relative' }}>
              <button type="button" onClick={() => setShowPlusMenu(!showPlusMenu)} className={`attach-btn ${showPlusMenu ? 'active' : ''}`} title="Options">
                <Plus size={24} />
              </button>

              {showPlusMenu && (
                <div className="plus-menu-dropdown">
                  <button type="button" className="plus-menu-item" onClick={() => fileInputRef.current?.click()}>
                    <Image size={18} /> Add photo
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
                  <div className="plus-menu-divider"></div>
                  <button type="button" className={`plus-menu-item ${inputMode === 'instant' ? 'active' : ''}`} onClick={() => { setInputMode("instant"); setShowPlusMenu(false); }}>
                    <Zap size={18} className="text-yellow-500" /> Instant
                  </button>
                  <button type="button" className={`plus-menu-item ${inputMode === 'deep' ? 'active' : ''}`} onClick={() => { setInputMode("deep"); setShowPlusMenu(false); }}>
                    <Lightbulb size={18} className="text-purple-500" /> Thinking
                  </button>
                  <button type="button" className={`plus-menu-item ${inputMode === 'deep-search' ? 'active' : ''}`} onClick={() => { setInputMode("deep-search"); setShowPlusMenu(false); }}>
                    <Telescope size={18} className="text-blue-500" /> Deep search
                  </button>
                  <button type="button" className={`plus-menu-item ${inputMode === 'research' ? 'active' : ''}`} onClick={() => { setInputMode("research"); setShowPlusMenu(false); }}>
                    <Globe size={18} className="text-green-500" /> Web search
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {attachment && (
                <div className="attachment-preview" style={{ padding: '8px 16px', display: 'flex' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={attachment.url} alt="Attachment" style={{ height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setAttachment(null)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--bg-secondary)', borderRadius: '50%', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-color)' }}><X size={14} className="text-white" /></button>
                  </div>
                </div>
              )}
              <div className={`textarea-container ${isListening ? 'hidden' : ''}`} style={{ position: 'relative' }}>
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
                {autoSuggestion && (
                  <div className="autocomplete-ghost" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', pointerEvents: 'none', padding: 'inherit', overflow: 'hidden' }}>
                    <span style={{ visibility: 'hidden', whiteSpace: 'pre' }}>{input}</span>
                    <span style={{ color: 'var(--text-secondary)', opacity: 0.4, whiteSpace: 'pre' }}>{autoSuggestion.slice(input.length)}</span>
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.5, background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: '4px' }}>Tab</span>
                  </div>
                )}
              </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 style={{ color: 'var(--error-color)' }}>
                {deleteConfirm.type === 'all' ? 'Delete all chats?' : 'Delete this chat?'}
              </h2>
            </div>
            <div className="modal-body" style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
              {deleteConfirm.type === 'all' 
                ? "Are you sure you want to permanently delete every single conversation? This action cannot be undone and will wipe your database."
                : "Are you sure you want to delete this conversation? This will permanently remove it from the cloud database."}
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="outline-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="danger-btn" onClick={executeDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

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
                <button onClick={() => { setShowSettings(false); setActiveModal('memory'); }} className="sidebar-nav-btn outline-btn">
                  <Database size={16} /> Manage Memory
                </button>
                <button onClick={() => { setShowSettings(false); setActiveModal('sessions'); }} className="sidebar-nav-btn outline-btn">
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

      {/* Dynamic Feature Modals */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h2>
                {activeModal === 'library' && 'Prompt Library'}
                {activeModal === 'projects' && 'Your Projects'}
                {activeModal === 'apps' && 'Connected Apps'}
                {activeModal === 'codex' && 'Code Snippets'}
                {activeModal === 'memory' && 'Davora Memory'}
                {activeModal === 'sessions' && 'Active Sessions'}
                {activeModal === 'schedule' && 'Schedule Task'}
                {activeModal === 'report' && 'Report Issue'}
                {activeModal === 'share' && 'Share Chat'}
              </h2>
              <button className="icon-action-btn" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {activeModal === 'library' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select a predefined AI persona to start chatting.</p>
                  {['Software Engineer', 'Creative Writer', 'Data Analyst', 'Financial Advisor', 'Therapist'].map(role => (
                    <button key={role} className="sidebar-nav-btn outline-btn" onClick={() => { setPrefs({...prefs, customInstructions: `Act as a senior ${role}.`}); setActiveModal(null); showNotification(`${role} persona activated!`); }}>
                      <Bot size={16} /> {role}
                    </button>
                  ))}
                </div>
              )}
              {activeModal === 'projects' && (
                <div className="canvas-empty-state">
                  <FolderKanban size={32} className="text-secondary mb-4" />
                  <h3>No Projects Yet</h3>
                  <p>Group your chats into projects for better organization.</p>
                  <button className="send-btn" style={{ marginTop: '16px', padding: '8px 16px' }} onClick={() => { setActiveModal(null); showNotification('Project created!'); }}>Create Project</button>
                </div>
              )}
              {activeModal === 'apps' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Connect third-party services to Davora.</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Link size={18} /> Google Drive</div>
                    <button className="outline-btn" style={{ fontSize: '0.8rem', padding: '4px 12px' }} onClick={() => showNotification("Redirecting to OAuth...")}>Connect</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Code size={18} /> GitHub Repo</div>
                    <button className="outline-btn" style={{ fontSize: '0.8rem', padding: '4px 12px' }} onClick={() => showNotification("Redirecting to OAuth...")}>Connect</button>
                  </div>
                </div>
              )}
              {activeModal === 'codex' && (
                <div className="canvas-empty-state">
                  <Code size={32} className="text-secondary mb-4" />
                  <h3>Code Snippet Vault</h3>
                  <p>Code blocks you save from chats will appear here.</p>
                </div>
              )}
              {activeModal === 'memory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Facts and preferences Davora has learned about you.</p>
                  {prefs.customInstructions ? (
                    <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '0.9rem' }}>{prefs.customInstructions}</div>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Davora hasn't learned any custom instructions yet.</p>
                  )}
                  <button onClick={() => { setPrefs({...prefs, customInstructions: ''}); showNotification('Memory cleared.'); setActiveModal(null); }} className="danger-btn" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>Clear Memory</button>
                </div>
              )}
              {activeModal === 'sessions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid #10b981' }}>
                    <p style={{ fontWeight: '600', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>Current Device <span style={{ color: '#10b981', fontSize: '0.8rem' }}>Active</span></p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{userEmail || 'User'} • {new Date().toLocaleDateString()}</p>
                  </div>
                  <button className="danger-btn" onClick={() => { localStorage.clear(); router.push('/login'); }}>Sign Out Everywhere</button>
                </div>
              )}
              {activeModal === 'schedule' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Schedule this task to run automatically later.</p>
                  <input type="datetime-local" className="sidebar-search-input" style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                  <button className="send-btn" onClick={() => { setActiveModal(null); showNotification('Task scheduled!'); }} style={{ padding: '12px' }}>Confirm Schedule</button>
                </div>
              )}
              {activeModal === 'report' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <textarea rows={4} placeholder="Describe the issue..." className="custom-instructions-input" />
                  <button className="danger-btn" onClick={() => { setActiveModal(null); showNotification('Issue reported to engineering.'); }}>Submit Report</button>
                </div>
              )}
              {activeModal === 'share' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                  <Globe size={48} className="text-secondary mb-2" />
                  <p>Generate a public link to share this conversation.</p>
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <input type="text" readOnly value={`https://davora.com/share/${activeSessionId || 'new'}`} style={{ flex: 1, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    <button className="send-btn" onClick={() => { navigator.clipboard.writeText(`https://davora.com/share/${activeSessionId || 'new'}`); showNotification('Link copied!'); setActiveModal(null); }}>Copy</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2026 Right Canvas Panel */}
      <aside className={`canvas-panel ${canvasOpen ? 'open' : 'closed'}`}>
        <div className="canvas-header">
          <div className="canvas-title">
            <Folder size={16} /> Canvas Workspace
            <span className="canvas-version-badge"><FileClock size={12} /> v1.0</span>
          </div>
          <button onClick={() => setCanvasOpen(false)} className="icon-action-btn"><X size={18} /></button>
        </div>
        <div className="canvas-body">
          {canvasArtifacts.length === 0 ? (
            <div className="canvas-empty-state">
              <Bookmark size={32} className="text-secondary mb-4" />
              <h3>No Artifacts Saved</h3>
              <p>Click the bookmark icon on any AI message to save it to your persistent Canvas workspace.</p>
            </div>
          ) : (
            <div className="canvas-artifacts-list">
              {canvasArtifacts.map(artifact => (
                <div key={artifact.id} className="canvas-artifact-card" style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{artifact.date}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => copyToClipboard(artifact.content, `canvas-${artifact.id}`)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        {copiedId === `canvas-${artifact.id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                      <button onClick={() => setCanvasArtifacts(prev => prev.filter(a => a.id !== artifact.id))} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                    {artifact.content.substring(0, 300)}{artifact.content.length > 300 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 2026 Command Palette (Omnibar) */}
      {showCmdPalette && (
        <div className="cmd-palette-overlay" onClick={() => setShowCmdPalette(false)}>
          <div className="cmd-palette-content" onClick={e => e.stopPropagation()}>
            <div className="cmd-header">
              <Search size={18} className="text-secondary" />
              <input autoFocus type="text" placeholder="Search chats or type a command..." className="cmd-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
