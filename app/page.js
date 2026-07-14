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
  Shield, FolderKanban, Sparkles, List, ChevronLeft, ChevronRight, ShieldCheck,
  VenetianMask, Pin, MoreHorizontal, CalendarClock, AtSign, TriangleAlert, Ghost,
  Terminal, BrainCircuit, SearchCheck, FileClock, Link, Plus, Telescope, Image, Fingerprint,
  Bell, Grid, CreditCard, HardDrive, Users, UserPlus, Key, FolderPlus, Link2, Link2Off, Type, LogOut
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
  const sessionsRef = useRef([]);
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
  const [attachments, setAttachments] = useState([]);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const [openMoreMenuId, setOpenMoreMenuId] = useState(null);
  const [longPressMessageId, setLongPressMessageId] = useState(null);
  const touchTimerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [pinnedSessionIds, setPinnedSessionIds] = useState([]);

  // Voice, Edit, TTS, and Rating states
  const [isListening, setIsListening] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [speakingId, setSpeakingId] = useState(null);
  const [ratings, setRatings] = useState({});

  // Settings & Preferences
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('Personalization');
  const [mobileSettingsView, setMobileSettingsView] = useState('menu');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [changeOldPassword, setChangeOldPassword] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");
  const [changePasswordStatus, setChangePasswordStatus] = useState("idle");
  const [changePasswordMessage, setChangePasswordMessage] = useState("");
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [prefs, setPrefs] = useState({
    theme: 'dark',
    fontSize: 'medium',
    sendOnEnter: true,
    customInstructions: "",
    baseStyle: "Default",
    characteristicsWarm: "Default",
    characteristicsEnthusiastic: "Default",
    characteristicsHeaders: "Default",
    characteristicsEmoji: "Default",
    fastAnswers: true,
    nickname: "",
    occupation: "",
    aboutYou: "",
    referenceMemories: true,
    referenceHistory: true,
    strictMarkdown: false,
    pushNotifications: true,
    emailNotifications: false,
    voiceProfile: "Alloy",
    autoReadAloud: false,
    nsfwFilter: true,
    safeSearch: true,
    requirePin: false,
    strictTimeLimits: false,
    recoveryEmail: ""
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [canvasArtifacts, setCanvasArtifacts] = useState([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState(null);
  const [editCanvasText, setEditCanvasText] = useState("");
  const [artifactVersions, setArtifactVersions] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [basicPrice, setBasicPrice] = useState("3");
  const [proPrice, setProPrice] = useState("7");
  const [premiumPrice, setPremiumPrice] = useState("15");
  const [subscriptionPlan, setSubscriptionPlan] = useState("Davora Free");
  const [logoUrl, setLogoUrl] = useState(null);

  // Modals inputs
  const [projectName, setProjectName] = useState("");
  const [projectsList, setProjectsList] = useState([]);
  const [schedulePrompt, setSchedulePrompt] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [reportText, setReportText] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [codexSnippets, setCodexSnippets] = useState([]);

  // Security States
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorUri, setTwoFactorUri] = useState("");
  const [twoFactorQrCode, setTwoFactorQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const ws = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const audioRef = useRef(null);
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
  const [greeting, setGreeting] = useState("How can I help you today?");
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [issueReports, setIssueReports] = useState([]);
  const [developerKeys, setDeveloperKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const handleTouchStart = (msgId, e) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };

    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);

    touchTimerRef.current = setTimeout(() => {
      setLongPressMessageId(msgId);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(40); } catch (err) { }
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (touchTimerRef.current && e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const diffX = Math.abs(touch.clientX - touchStartRef.current.x);
      const diffY = Math.abs(touch.clientY - touchStartRef.current.y);
      if (diffX > 10 || diffY > 10) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    }
  };

  useEffect(() => {
    const handleDismissLongPress = () => {
      setLongPressMessageId(null);
    };
    window.addEventListener('click', handleDismissLongPress);
    window.addEventListener('touchstart', handleDismissLongPress);
    return () => {
      window.removeEventListener('click', handleDismissLongPress);
      window.removeEventListener('touchstart', handleDismissLongPress);
    };
  }, []);

  useEffect(() => {
    if (settingsTab === 'Tasks') {
      fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/schedule', {
        headers: { 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`, 'ngrok-skip-browser-warning': 'true' }
      }).then(r => r.json()).then(data => setScheduledTasks(data || []));
    }
    if (settingsTab === 'Reports') {
      fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/report', {
        headers: { 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`, 'ngrok-skip-browser-warning': 'true' }
      }).then(r => r.json()).then(data => setIssueReports(data || []));
    }
    if (settingsTab === 'Developer') {
      fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/developer/keys', {
        headers: { 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`, 'ngrok-skip-browser-warning': 'true' }
      }).then(r => r.json()).then(data => setDeveloperKeys(data || []));
    }
  }, [settingsTab]);

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

    // Set dynamic greeting
    const hour = new Date().getHours();
    let timeOfDay = "day";
    if (hour < 12) timeOfDay = "morning";
    else if (hour < 17) timeOfDay = "afternoon";
    else timeOfDay = "evening";

    const greetings = [
      `Hey there, good ${timeOfDay}`,
      `Hey, good ${timeOfDay}`,
      `Good ${timeOfDay}!`,
    ];
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordStatus('loading');
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`
        },
        body: JSON.stringify({ old_password: changeOldPassword, new_password: changeNewPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to change password');
      setChangePasswordStatus('success');
      setChangePasswordMessage('Password changed successfully.');
      setChangeOldPassword('');
      setChangeNewPassword('');
    } catch (err) {
      setChangePasswordStatus('error');
      setChangePasswordMessage(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteMessage('');
    try {
      // First verify password
      const verifyRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`
        },
        // We use the change-password endpoint just to verify the current password, by setting it to the same or checking error
        body: JSON.stringify({ old_password: deleteAccountPassword, new_password: deleteAccountPassword + '123' })
      });
      if (!verifyRes.ok) {
        throw new Error('Incorrect password');
      }

      // If correct, proceed to delete
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete account');

      // Logout
      localStorage.removeItem('davora_token');
      localStorage.removeItem('davora_email');
      const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, '');
      window.location.href = `${window.location.protocol}//login.${baseDomain}`;
    } catch (err) {
      setIsDeleting(false);
      setDeleteMessage(err.message);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + `/api/developer/keys?name=${encodeURIComponent(newKeyName)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGeneratedKey(data.api_key);
        setNewKeyName('');
        // Refresh list
        const resList = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/developer/keys', {
          headers: { 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`, 'ngrok-skip-browser-warning': 'true' }
        });
        const listData = await resList.json();
        setDeveloperKeys(listData || []);
        showNotification("API Key generated successfully!");
      } else {
        showNotification("Failed to generate API Key");
      }
    } catch (err) {
      showNotification("Failed to generate API Key");
    }
  };

  const handleRevokeApiKey = async (keyId) => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + `/api/developer/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        setDeveloperKeys(developerKeys.filter(k => k.id !== keyId));
        showNotification("API Key revoked");
      } else {
        showNotification("Failed to revoke API Key");
      }
    } catch (err) {
      showNotification("Failed to revoke API Key");
    }
  };

  const handleUpgrade = async (tier) => {
    if (typeof window === "undefined") return;

    const isMobile = window.Capacitor || window.location.hostname === 'localhost';

    const runWebCheckout = async () => {
      showNotification(`Initiating secure checkout for Davora ${tier.charAt(0).toUpperCase() + tier.slice(1)}...`);
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/checkout/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`,
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ tier: tier })
        });

        const data = await res.json();

        if (data.status === "success" && data.payment_link) {
          if (window.Capacitor) {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({ url: data.payment_link });
          } else {
            window.location.href = data.payment_link;
          }
        } else if (data.status === "fallback") {
          const makePayment = () => {
            window.FlutterwaveCheckout({
              public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
              tx_ref: data.tx_ref,
              amount: parseFloat(data.amount),
              currency: data.currency,
              payment_options: "card, mobilemoneyghana, ussd",
              customer: { email: userEmail, name: "Davora User" },
              customizations: { title: `Davora ${tier.charAt(0).toUpperCase() + tier.slice(1)}`, description: "Premium AI Access" },
              callback: async function (cbData) {
                try {
                  await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}` },
                    body: JSON.stringify({ tx_ref: cbData.tx_ref, transaction_id: String(cbData.transaction_id) })
                  });
                  setSubscriptionPlan(`Davora ${tier.charAt(0).toUpperCase() + tier.slice(1)} Active`);
                  showNotification(`Upgraded to Davora ${tier.charAt(0).toUpperCase() + tier.slice(1)} successfully!`);
                } catch (e) { showNotification("Payment verification failed."); }
              },
              onclose: function () { }
            });
          };

          if (!window.FlutterwaveCheckout) {
            const script = document.createElement("script");
            script.src = "https://checkout.flutterwave.com/v3.js";
            script.onload = makePayment;
            document.body.appendChild(script);
          } else {
            makePayment();
          }
        } else {
          showNotification("Failed to initiate checkout.");
        }
      } catch (e) {
        showNotification("Server error during checkout initiation.");
      }
    };

    if (isMobile) {
      showNotification(`Connecting to Google Play Store...`);
      try {
        const productMap = {
          basic: "davora_sub_basic",
          pro: "davora_sub_pro",
          premium: "davora_sub_premium"
        };
        const productId = productMap[tier];

        const { NativePurchases } = await import('@capgo/native-purchases');

        // Gracefully query billing support to avoid native app crashes on unpublished devices
        let isBillingSupported = false;
        try {
          const support = await NativePurchases.isBillingSupported();
          isBillingSupported = support?.isBillingSupported;
        } catch (e) {
          console.warn("Billing support check caught native exception:", e);
        }

        if (!isBillingSupported) {
          showNotification("Google Play Billing not active on this device. Using web checkout...");
          await runWebCheckout();
          return;
        }

        const billingResult = await NativePurchases.purchaseProduct({
          productIdentifier: productId,
          productType: 'SUBS',
          quantity: 1
        });

        const token = billingResult.purchaseToken || billingResult.transactionId;

        if (token) {
          showNotification("Purchase successful! Verifying subscription...");

          const verifyRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/subscription/verify-google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`,
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
              productId: productId,
              purchaseToken: token,
              packageName: "xyz.davora.chatdave"
            })
          });

          if (verifyRes.ok) {
            showNotification("Subscription active! Enjoy your benefits.");
            window.location.reload();
          } else {
            showNotification("Verification failed. Please contact support.");
          }
        }
      } catch (err) {
        console.warn("Google Play Billing error occurred, fallback to web:", err);
        await runWebCheckout();
      }
      return;
    }

    await runWebCheckout();
  };

  // Global Fetch Interceptor to catch 401 Unauthorized, handle server errors, and catch network drops
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [resource, config] = args;
      if (resource && (resource.includes('api.davora.xyz') || resource.includes('localhost') || resource.includes('ngrok'))) {
        config = config || {};
        config.credentials = 'include';

        // Strip stale user tokens on production web to force fallback to the secure HTTPOnly cookie
        const isMobile = window.Capacitor || window.location.hostname === 'localhost';
        if (!isMobile && config.headers) {
          let authVal = '';
          if (typeof config.headers.get === 'function') {
            authVal = config.headers.get('Authorization') || config.headers.get('authorization') || '';
          } else {
            authVal = config.headers['Authorization'] || config.headers['authorization'] || '';
          }
          if (authVal && !authVal.includes('dev_sk_davora_')) {
            if (typeof config.headers.delete === 'function') {
              config.headers.delete('Authorization');
              config.headers.delete('authorization');
            } else {
              delete config.headers['Authorization'];
              delete config.headers['authorization'];
            }
          }
        }

        args = [resource, config];
      }

      try {
        const response = await originalFetch(...args);

        if (response.status >= 500) {
          console.warn(`Interventions: Infrastructure Error ${response.status} on ${resource}`);
          return new Response(JSON.stringify({ detail: "An unexpected server error occurred. Please try again later." }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (response.status === 401) {
          document.cookie = "davora_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.davora.xyz;";
          setToast("Session expired. Please log in again.");
          setTimeout(() => {
            const isMobile = window.Capacitor || window.location.hostname === 'localhost';
            if (isMobile) {
              router.push('/login');
            } else {
              const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, '');
              window.location.href = `${window.location.protocol}//login.${baseDomain}`;
            }
          }, 1500);
        }
        return response;
      } catch (err) {
        console.error("Network Fetch Failure intercepted:", err);
        showNotification("Connection lost. Please check your internet connection.");
        return new Response(JSON.stringify({ detail: "Connection lost. Please try again." }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Initialization & DB Fetching
  useEffect(() => {
    const cachedLogo = localStorage.getItem('davora_logo_url');
    if (cachedLogo) setLogoUrl(cachedLogo);
    const isMobile = window.Capacitor || window.location.hostname === 'localhost';
    const emailCookie = document.cookie.split('; ').find(c => c.startsWith('davora_email='));
    let email = emailCookie ? decodeURIComponent(emailCookie.split('=')[1]) : null;
    if (!email && isMobile) {
      email = localStorage.getItem('davora_email');
    }
    const cleanEmail = email ? email.replace(/^"+|"+$/g, '') : "User";

    if (!isMobile) {
      localStorage.removeItem('davora_token'); // Clear stale localStorage token on production web
    }
    const token = isMobile ? (localStorage.getItem('davora_token') || '') : '';

    // Fallback client-side auth check (middleware handles this server-side,
    // but this catches mid-session cookie expiry)
    if (isMobile) {
      if (!localStorage.getItem('davora_token')) {
        router.push('/login');
        return;
      }
    } else {
      if (!document.cookie.includes('davora_auth=1')) {
        const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, '');
        window.location.href = `${window.location.protocol}//login.${baseDomain}`;
        return;
      }
    }
    setUserEmail(cleanEmail);

    const fetchSessions = async () => {
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/sessions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          },
          cache: 'no-store'
        });
        if (res.status === 401) {
          localStorage.removeItem("davora_token");
          router.push("/login");
          return;
        }
        if (res.ok) {
          const dbSessions = await res.json();
          setSessions(dbSessions);
          const metaRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/metadata', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
            },
            cache: 'no-store'
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

          const projRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/projects', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
            },
            cache: 'no-store'
          });
          if (projRes.ok) {
            setProjectsList(await projRes.json());
          }

          const codexRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/codex', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
            },
            cache: 'no-store'
          });
          if (codexRes.ok) {
            setCodexSnippets(await codexRes.json());
          }

          try {
            const configRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/config', { headers: { 'ngrok-skip-browser-warning': 'true' }, cache: 'no-store' });
            if (configRes.ok) {
              const cfg = await configRes.json();
              setBasicPrice(cfg.basic_price || "3");
              setProPrice(cfg.pro_price || "7");
              setPremiumPrice(cfg.premium_price || "15");
              if (cfg.logo_url) {
                setLogoUrl(cfg.logo_url);
                localStorage.setItem('davora_logo_url', cfg.logo_url);
              }
            }

            const subRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/subscription', { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }, cache: 'no-store' });
            if (subRes.ok) { const sub = await subRes.json(); setSubscriptionPlan(sub.plan_name); }
          } catch (e) { }
        }
      } catch (err) {
        console.error("Failed to fetch from DB", err);
        const isMobile = window.Capacitor || window.location.hostname === 'localhost';
        if (isMobile && !localStorage.getItem('davora_token')) {
          router.push('/login');
        }
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
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
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
    const token = (localStorage.getItem('davora_token') || '');
    if (!token) return;
    fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/metadata', {
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

  // Keep sessionsRef in sync for beforeunload handler
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    // Persist to DB when typing stops
    if (isTyping || !activeSessionId) return;
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (!currentSession || currentSession.isTemporary) return;

    // Clean isStreaming flags before syncing
    const cleanSession = {
      ...currentSession,
      messages: currentSession.messages.map(m => ({ ...m, isStreaming: undefined }))
    };

    const isAuthenticated = document.cookie.includes('davora_auth=1');
    if (isAuthenticated) {
      const token = localStorage.getItem('davora_token') || '';
      fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(cleanSession)
      }).catch(err => console.error("DB Sync error", err));
    }
  }, [sessions, isTyping, activeSessionId]);

  // Force-sync active session before page unload (prevents data loss on refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = activeSessionIdRef.current;
      if (!sessionId) return;
      const isAuthenticated = document.cookie.includes('davora_auth=1');
      if (!isAuthenticated) return;

      // Use sessionsRef to get latest state
      const allSessions = sessionsRef.current || [];
      const currentSession = allSessions.find(s => s.id === sessionId);
      if (!currentSession || currentSession.isTemporary) return;

      const cleanSession = {
        ...currentSession,
        messages: currentSession.messages.map(m => ({ ...m, isStreaming: undefined }))
      };

      // fetch with keepalive: true and text/plain to bypass CORS preflight during page unload
      const token = localStorage.getItem('davora_token') || '';
      fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + `/api/sessions/unload?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain' // Must be text/plain to prevent CORS preflight from being aborted
        },
        body: JSON.stringify(cleanSession),
        keepalive: true
      }).catch(err => console.error("Unload Sync error", err));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    syncMetadata({ prefs: JSON.stringify(prefs) });
    document.body.classList.remove('light-theme', 'amoled-theme');
    if (prefs.theme === 'light') {
      document.body.classList.add('light-theme');
    } else if (prefs.theme === 'amoled') {
      document.body.classList.add('amoled-theme');
    }
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

  const saveToCanvas = (content) => {
    const artifactId = Date.now().toString();
    const newArtifact = {
      id: artifactId,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: content
    };

    setArtifactVersions(prev => ({
      ...prev,
      [artifactId]: [{
        versionId: Date.now().toString(),
        content: content,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]
    }));

    setCanvasArtifacts(prev => [newArtifact, ...prev]);
    setCanvasOpen(true);
    showNotification("Saved to Canvas!");
  };

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
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://api.davora.xyz/ws/chat";
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (event) => {
      const data = event.data;
      if (data.includes("quota_error")) {
        try {
          const quotaData = JSON.parse(data);
          if (quotaData.quota_error) {
            setIsTyping(false);
            let msg = "Usage limit reached.";
            if (quotaData.quota_error === "UNAUTHORIZED") msg = "Authentication failed. Please log in.";
            else if (quotaData.quota_error === "IMAGE_LIMIT") msg = `Free image limit reached. Wait ${quotaData.wait_hours} hours or upgrade.`;
            else if (quotaData.quota_error === "CHAT_LIMIT") msg = `Free chat limit reached. Wait ${quotaData.wait_hours} hours or upgrade.`;

            showNotification(msg);
            if (quotaData.quota_error.includes("LIMIT")) {
              setActiveModal("upgrade");
            }
            return;
          }
        } catch (e) { }
      }
      if (data === "[DONE]") {
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
        // Auto-read aloud if enabled
        if (prefs.autoReadAloud) {
          const allSessions = sessionsRef.current || [];
          const session = allSessions.find(s => s.id === activeSessionIdRef.current);
          if (session) {
            const lastMsg = session.messages[session.messages.length - 1];
            if (lastMsg && lastMsg.role === "ai") {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
              }
              setSpeakingId(lastMsg.id);
              const token = localStorage.getItem('davora_token') || '';
              const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz'}/api/tts?text=${encodeURIComponent(lastMsg.content)}&token=${encodeURIComponent(token)}`;
              const audio = new Audio(url);
              audioRef.current = audio;
              audio.onended = () => {
                setSpeakingId(null);
              };
              audio.onerror = () => {
                setSpeakingId(null);
              };
              audio.play().catch(err => {
                console.warn("Auto-read audio playback failed:", err);
                setSpeakingId(null);
              });
            }
          }
        }
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
      setIsTyping(false); // CRITICAL: Reset typing state so the chat can be saved to the database!
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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const [isOnline, setIsOnline] = useState(true);
  const offlineQueueRef = useRef([]);

  const processOfflineQueue = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    const savedQueue = localStorage.getItem('davora_offline_queue');
    if (!savedQueue) return;

    let queue = [];
    try {
      queue = JSON.parse(savedQueue);
    } catch (e) {
      queue = [];
    }

    if (queue.length === 0) return;

    showNotification(`Syncing ${queue.length} offline message(s)...`);

    for (const item of queue) {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(item.payload));
      } else {
        connectWebSocket();
        await new Promise(r => setTimeout(r, 1000));
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(item.payload));
        } else {
          break;
        }
      }

      setSessions(prev => prev.map(s => {
        if (s.id === item.sessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === item.messageId ? { ...m, isPending: false } : m)
          };
        }
        return s;
      }));
    }

    localStorage.removeItem('davora_offline_queue');
    offlineQueueRef.current = [];
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const savedQueue = localStorage.getItem('davora_offline_queue');
      if (savedQueue) {
        try {
          offlineQueueRef.current = JSON.parse(savedQueue);
        } catch (e) {
          offlineQueueRef.current = [];
        }
      }

      const handleOnline = () => {
        setIsOnline(true);
        showNotification("Connection restored. Syncing offline messages...");
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        }
        setTimeout(() => {
          processOfflineQueue();
        }, 1000);
      };

      const handleOffline = () => {
        setIsOnline(false);
        showNotification("You are offline. Messages will be queued and sent when connection returns.");
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && prefs.pushNotifications) {
      Notification.requestPermission().then(async (permission) => {
        if (permission === 'granted') {
          try {
            let fcmToken = localStorage.getItem('davora_fcm_token');
            if (!fcmToken && window.PushNotifications) {
              window.PushNotifications.addListener('registration', (token) => {
                fcmToken = token.value;
                localStorage.setItem('davora_fcm_token', fcmToken);
              });
              window.PushNotifications.register();
            }
            if (!fcmToken) {
              fcmToken = 'web_push_' + Math.random().toString(36).substring(2, 15);
              localStorage.setItem('davora_fcm_token', fcmToken);
            }
            const token = localStorage.getItem('davora_token');
            if (token && fcmToken) {
              await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                  'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ token: fcmToken })
              });
            }
          } catch (e) {
            console.warn("FCM Subscription error:", e);
          }
        }
      });
    }
  }, [prefs.pushNotifications]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVersions = localStorage.getItem('davora_canvas_versions');
      if (savedVersions) {
        try {
          setArtifactVersions(JSON.parse(savedVersions));
        } catch (e) { }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(artifactVersions).length > 0) {
      localStorage.setItem('davora_canvas_versions', JSON.stringify(artifactVersions));
    }
  }, [artifactVersions]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!showScrollButton) scrollToBottom();
  }, [messages, isTyping, showScrollButton, activeSessionId]);

  const createNewSession = (initialMsg) => {
    const title = initialMsg.length > 25 ? initialMsg.substring(0, 25) + "..." : initialMsg;
    const newId = Date.now().toString();
    const newSession = { id: newId, title, messages: [], isTemporary };

    // Synchronously update refs so beforeunload works immediately even before React re-renders
    activeSessionIdRef.current = newId;
    sessionsRef.current = [newSession, ...(sessionsRef.current || [])];

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    return newId;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (attachments.length + files.length > 3) {
      showNotification("You can only upload up to 3 images at once.");
      return;
    }

    const newAttachments = [];
    const filesToUpload = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showNotification("Only images are supported right now");
        return;
      }

      // Create a temporary local URL for immediate rendering
      const localUrl = URL.createObjectURL(file);
      const attItem = {
        file,
        url: localUrl,
        base64: null,
        uploading: true,
        error: null,
        publicUrl: null
      };
      newAttachments.push(attItem);
      filesToUpload.push(attItem);
    });

    if (newAttachments.length === 0) return;

    setAttachments(prev => [...prev, ...newAttachments]);
    setShowPlusMenu(false);
    inputRef.current?.focus();

    // Trigger upload in background for each new image
    filesToUpload.forEach(async (att) => {
      let base64Data = null;
      try {
        // Read file as base64 first for legacy/fallback support
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result.split(',')[1]);
          reader.readAsDataURL(att.file);
        });

        // Update local state with base64 for fallback
        setAttachments(prev => prev.map(item => item.url === att.url ? { ...item, base64: base64Data } : item));

        const token = localStorage.getItem('davora_token') || '';
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/images/presigned-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            filename: att.file.name,
            content_type: att.file.type
          })
        });

        if (!res.ok) {
          throw new Error("Presigned URL generation failed");
        }

        const data = await res.json();
        const { upload_url, public_url } = data;

        // Perform PUT request to Cloudflare R2
        const uploadRes = await fetch(upload_url, {
          method: 'PUT',
          headers: {
            'Content-Type': att.file.type
          },
          body: att.file
        });

        if (!uploadRes.ok) {
          throw new Error("R2 upload request failed");
        }

        // Update state with the public R2 URL
        setAttachments(prev => prev.map(item => item.url === att.url ? {
          ...item,
          url: public_url,
          publicUrl: public_url,
          uploading: false
        } : item));

      } catch (err) {
        console.error("R2 upload error, falling back to legacy base64 mode:", err);
        setAttachments(prev => prev.map(item => item.url === att.url ? {
          ...item,
          url: `data:${att.file.type};base64,${base64Data}`,
          uploading: false,
          error: "R2 upload failed, using legacy mode"
        } : item));
      }
    });
  };

  const triggerSend = (customText = null) => {
    console.log("Davora v3.3 - TriggerSend executing! Fast Save Enabled.");
    const textToSend = customText !== null ? customText : input.trim();
    if ((!textToSend && attachments.length === 0) || !ws.current || isTyping) return;

    const isUploading = attachments.some(a => a.uploading);
    if (isUploading) {
      showNotification("Please wait for images to finish uploading.");
      return;
    }

    if (synthRef.current) synthRef.current.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeakingId(null);

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      targetSessionId = createNewSession(textToSend || "Image Upload");
    }

    // Convert attachments array into a single JSON string if there are any
    const imageUrls = attachments.length > 0 ? JSON.stringify(attachments.map(a => a.url)) : null;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const newMessage = {
        id: Date.now(), role: "user", content: textToSend, image_url: imageUrls,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isPending: true
      };
      setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, newMessage] } : s));

      const currentSession = sessions.find(s => s.id === targetSessionId) || (sessionsRef.current || []).find(s => s.id === targetSessionId);
      const activeMessages = currentSession ? [...currentSession.messages, newMessage] : [newMessage];

      const payloadObj = {
        message: textToSend,
        history: activeMessages,
        mode: inputMode,
        model: selectedModel,
        isTemporary: isTemporary,
        customInstructions: prefs.customInstructions,
        baseStyle: prefs.baseStyle,
        characteristicsWarm: prefs.characteristicsWarm,
        characteristicsEnthusiastic: prefs.characteristicsEnthusiastic,
        characteristicsHeaders: prefs.characteristicsHeaders,
        characteristicsEmoji: prefs.characteristicsEmoji,
        fastAnswers: prefs.fastAnswers,
        nickname: prefs.nickname,
        occupation: prefs.occupation,
        aboutYou: prefs.aboutYou,
        referenceMemories: prefs.referenceMemories,
        referenceHistory: prefs.referenceHistory,
        strictMarkdown: prefs.strictMarkdown,
        token: (localStorage.getItem('davora_token') || '')
      };

      if (attachments.length > 0) {
        payloadObj.image_urls = attachments.map(a => a.publicUrl).filter(Boolean);
        payloadObj.image_data_array = attachments.map(a => a.base64).filter(Boolean);
      }

      const queueItem = {
        sessionId: targetSessionId,
        messageId: newMessage.id,
        payload: payloadObj
      };

      const currentQueue = JSON.parse(localStorage.getItem('davora_offline_queue') || '[]');
      currentQueue.push(queueItem);
      localStorage.setItem('davora_offline_queue', JSON.stringify(currentQueue));
      offlineQueueRef.current = currentQueue;

      setInput("");
      setAttachments([]);
      showNotification("You are offline. Message queued for automatic sync.");
      return;
    }

    const newMessage = {
      id: Date.now(), role: "user", content: textToSend, image_url: imageUrls,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, newMessage] } : s));

    // Fix: activeMessages needs to include the message we just added
    // because `setSessions` is async and hasn't updated the state yet
    const currentSession = sessions.find(s => s.id === targetSessionId) || (sessionsRef.current || []).find(s => s.id === targetSessionId);
    let activeMessages = currentSession ? [...currentSession.messages, newMessage] : [newMessage];

    // Synchronously update sessionsRef for beforeunload
    if (sessionsRef.current) {
      const sIdx = sessionsRef.current.findIndex(s => s.id === targetSessionId);
      if (sIdx !== -1) {
        sessionsRef.current[sIdx] = { ...sessionsRef.current[sIdx], messages: activeMessages };
      }
    }

    // IMMEDIATE SAVE: Securely save the user's message to the cloud instantly
    // This ensures that even if they refresh the page before the AI starts typing, 
    // the chat session is safely preserved in the database.
    if (!isTemporary) {
      const isAuthenticated = document.cookie.includes('davora_auth=1');
      if (isAuthenticated) {
        const token = localStorage.getItem('davora_token') || '';
        fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: targetSessionId,
            title: currentSession ? currentSession.title : (textToSend.length > 25 ? textToSend.substring(0, 25) + "..." : (textToSend || "Image Upload")),
            isTemporary: false,
            messages: activeMessages
          })
        }).catch(err => console.error("Fast save failed", err));
      }
    }

    const payloadObj = {
      message: textToSend,
      history: activeMessages,
      mode: inputMode,
      model: selectedModel,
      isTemporary: isTemporary,
      customInstructions: prefs.customInstructions,
      baseStyle: prefs.baseStyle,
      characteristicsWarm: prefs.characteristicsWarm,
      characteristicsEnthusiastic: prefs.characteristicsEnthusiastic,
      characteristicsHeaders: prefs.characteristicsHeaders,
      characteristicsEmoji: prefs.characteristicsEmoji,
      fastAnswers: prefs.fastAnswers,
      nickname: prefs.nickname,
      occupation: prefs.occupation,
      aboutYou: prefs.aboutYou,
      referenceMemories: prefs.referenceMemories,
      referenceHistory: prefs.referenceHistory,
      strictMarkdown: prefs.strictMarkdown,
      token: (localStorage.getItem('davora_token') || '')
    };
    if (attachments.length > 0) {
      payloadObj.image_urls = attachments.map(a => a.publicUrl).filter(Boolean);
      payloadObj.image_data_array = attachments.map(a => a.base64).filter(Boolean);
    }

    setInput("");
    setAttachments([]);
    setIsTyping(true);
    setEditingId(null);
    setIsListening(false);

    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      let attempts = 0;
      const checkAndSend = setInterval(() => {
        attempts++;
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(payloadObj));
          clearInterval(checkAndSend);
        } else if (attempts > 50) { // Timeout after 5 seconds
          clearInterval(checkAndSend);
          showNotification("Connection timeout. Please try sending again.");
          setIsTyping(false);
        }
      }, 100);
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeakingId(null);

    const jsonPayload = JSON.stringify({
      message: lastUserMsg,
      history: historyUntilNow,
      mode: inputMode,
      model: selectedModel,
      isTemporary: isTemporary,
      customInstructions: prefs.customInstructions,
      baseStyle: prefs.baseStyle,
      characteristicsWarm: prefs.characteristicsWarm,
      characteristicsEnthusiastic: prefs.characteristicsEnthusiastic,
      characteristicsHeaders: prefs.characteristicsHeaders,
      characteristicsEmoji: prefs.characteristicsEmoji,
      fastAnswers: prefs.fastAnswers,
      nickname: prefs.nickname,
      occupation: prefs.occupation,
      aboutYou: prefs.aboutYou,
      referenceMemories: prefs.referenceMemories,
      referenceHistory: prefs.referenceHistory,
      strictMarkdown: prefs.strictMarkdown
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
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
      setIsListening(false);
    } else {
      setInput("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        if (err.name === 'InvalidStateError') {
          setIsListening(true);
        } else {
          showNotification("Failed to start voice input. Please try again.");
        }
      }
    }
  };

  const toggleTextToSpeech = (text, id) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (speakingId === id) {
      setSpeakingId(null);
    } else {
      setSpeakingId(id);
      const token = localStorage.getItem('davora_token') || '';
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz'}/api/tts?text=${encodeURIComponent(text)}&token=${encodeURIComponent(token)}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeakingId(null);
      };
      audio.onerror = () => {
        setSpeakingId(null);
      };
      audio.play().catch(err => {
        console.warn("Audio playback failed:", err);
        setSpeakingId(null);
      });
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
          const token = (localStorage.getItem('davora_token') || '');
          if (token) {
            fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/sessions', {
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

      // Update refs synchronously to prevent race conditions during beforeunload or auto-sync
      if (activeSessionIdRef.current === id) {
        activeSessionIdRef.current = null;
      }
      if (sessionsRef.current) {
        sessionsRef.current = sessionsRef.current.filter(s => s.id !== id);
      }

      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) setActiveSessionId(null);
      showNotification("Chat deleted");
      const token = (localStorage.getItem('davora_token') || '');
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz'}/api/sessions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        keepalive: true
      }).catch(err => console.error("Delete sync error", err));
    } else if (deleteConfirm.type === 'all') {
      // Update refs synchronously to prevent race conditions during beforeunload or auto-sync
      activeSessionIdRef.current = null;
      sessionsRef.current = [];

      setSessions([]);
      setActiveSessionId(null);
      showNotification("All chats cleared");
      setShowSettings(false);
      const token = (localStorage.getItem('davora_token') || '');
      fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/sessions/all', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        keepalive: true
      }).catch(err => console.error("Clear all sync error", err));
    }
    setDeleteConfirm(null);
  };



  return (
    <div className={`app-layout font-size-${prefs.fontSize} ${isTyping ? 'ambient-focus' : ''} ${isTemporary ? 'incognito-theme' : ''}`}>

      {/* Toast Notification */}
      <div className={`toast-notification ${toast ? 'show' : ''}`}>
        {toast}
      </div>

      {/* Sidebar for Chat History */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center" style={{ color: 'var(--text-primary)', display: 'flex', gap: '8px' }}>
            {logoUrl ? <img src={logoUrl} alt="Davora Logo" style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: '50%' }} /> : <Bot size={22} />}
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
          <button className="sidebar-nav-btn" onClick={() => showNotification('Coming soon...')}>
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

        <div className="sidebar-footer" style={{ position: 'relative' }}>
          {showProfileMenu && (
            <div className="profile-popover">
              <div className="popover-header">
                <div className="user-avatar-small" style={{ background: '#f87171' }}>
                  {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="popover-user-info">
                  <span className="user-name">{userEmail.split('@')[0] || "User"}</span>
                  <span className="user-plan">Free</span>
                </div>
              </div>
              <div className="popover-menu">
                <button className="popover-item" onClick={() => { setShowProfileMenu(false); setActiveModal('upgrade'); }}><Sparkles size={16} /> Upgrade plan</button>
                <button className="popover-item" onClick={() => { setShowProfileMenu(false); setShowSettings(true); setSettingsTab('Personalization'); setMobileSettingsView('pane'); }}><Fingerprint size={16} /> Personalization</button>
                <button className="popover-item" onClick={() => { setShowProfileMenu(false); setShowSettings(true); setSettingsTab('Account'); setMobileSettingsView('pane'); }}><User size={16} /> Profile</button>
                <button className="popover-item" onClick={() => { setShowProfileMenu(false); setShowSettings(true); setSettingsTab('General'); setMobileSettingsView('menu'); }}><Settings size={16} /> Settings</button>
                <div className="popover-divider"></div>
                <button className="popover-item"><TriangleAlert size={16} /> Help</button>
                <button className="popover-item" onClick={() => { document.cookie = "davora_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.davora.xyz;"; const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }}><LogOut size={16} /> Log out</button>
              </div>
            </div>
          )}
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="user-profile-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
            <div className="user-avatar-small" style={{ width: '32px', height: '32px', background: '#f87171', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '600' }}>
              {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, overflow: 'hidden' }}>
              <span className="user-name" style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.85rem', width: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{userEmail.split('@')[0] || "User"}</span>
              <span className="user-plan" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Free</span>
            </div>
            <div className="upgrade-pill" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '500' }}>
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
            {messages.length === 0 && (
              <button
                className={`temporary-chat-toggle ${isTemporary ? 'active' : ''}`}
                onClick={() => { setIsTemporary(!isTemporary); showNotification(isTemporary ? "Temporary Chat Disabled" : "Temporary Chat Enabled. History won't be saved."); }}
                title="Temporary Chat (Incognito)"
              >
                <Ghost size={14} /> <span className="hide-on-mobile">{isTemporary ? 'Incognito' : 'Standard'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Chat Box */}
        <main className="chat-box" ref={chatBoxRef} onScroll={handleScroll}>
          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-icon" style={{ marginBottom: '16px' }}>
                {isTemporary ? <Ghost size={64} strokeWidth={1.5} color="#10b981" /> : (logoUrl ? <img src={logoUrl} alt="Davora" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: '50%' }} /> : <Bot size={64} strokeWidth={1.5} />)}
              </div>
              <h2 style={{ textAlign: 'center', transition: 'opacity 0.3s ease-in', marginBottom: isTemporary ? '12px' : '32px' }}>{isTemporary ? "Private Chat Mode" : greeting}</h2>
              {isTemporary && (
                <div style={{ color: '#10b981', textAlign: 'center', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto 24px', lineHeight: '1.5', opacity: 0.8 }}>
                  <Shield size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', marginBottom: '2px' }} />
                  Private Chat Mode Enabled. This conversation will only be stored securely for 30 days and then permanently deleted. We do not use private chats for model training.
                </div>
              )}
              {!isTemporary && (
                <div className="suggestion-chips">
                  {visibleSuggestions.map((s, idx) => (
                    <button key={idx} className="suggestion-chip" onClick={() => triggerSend(s.text)}>
                      {s.icon} {s.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`message-row ${msg.role === 'user' ? 'row-user' : 'row-ai'} ${longPressMessageId === msg.id ? 'long-pressed' : ''}`}
              onTouchStart={(e) => handleTouchStart(msg.id, e)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
            >


              <div className={`message-bubble-wrapper ${msg.role === 'user' ? 'wrapper-user' : 'wrapper-ai'}`}>
                {msg.role === 'user' && msg.image_url && (
                  <div className="user-image-attachments" style={{ marginBottom: msg.content ? '8px' : '0', display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '350px' }}>
                    {(() => {
                      try {
                        const parsed = JSON.parse(msg.image_url);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          const count = parsed.length;
                          let gridStyle = { display: 'grid', gap: '8px', width: '100%' };
                          let imgStyle = { width: '100%', borderRadius: '16px', objectFit: 'cover', cursor: 'zoom-in', transition: 'transform 0.15s ease', display: 'block' };

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
                                  onClick={() => setActiveLightboxImg(img)}
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
                          onClick={() => setActiveLightboxImg(msg.image_url)}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '280px',
                            objectFit: 'contain',
                            borderRadius: '16px',
                            cursor: 'zoom-in',
                            display: 'block'
                          }}
                        />
                      );
                    })()}
                  </div>
                )}

                {(msg.role !== 'user' || msg.content || editingId === msg.id) && (
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
                        <p className="user-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {msg.content}
                          {msg.isPending && (
                            <span title="Pending connection sync" style={{ opacity: 0.5, display: 'inline-flex', alignItems: 'center' }}>
                              <Clock size={14} style={{ animation: 'spin 2s linear infinite' }} />
                            </span>
                          )}
                        </p>
                      )
                    ) : (
                      <div className="markdown-body">

                        {(() => {
                          let contentToRender = msg.content || '';
                          let thinkContent = '';
                          const thinkMatch = contentToRender.match(/<think>([\s\S]*?)(<\/think>|$)/);
                          if (thinkMatch) {
                            thinkContent = thinkMatch[1].trim();
                            contentToRender = contentToRender.replace(/<think>[\s\S]*?(<\/think>|$)/, '');
                          }

                          return (
                            <>
                              {thinkContent && (
                                <details className="reasoning-path" open={!contentToRender.trim()}>
                                  <summary><BrainCircuit size={14} className="text-purple-400" /> Deep Think Process</summary>
                                  <div className="reasoning-content">{thinkContent}</div>
                                </details>
                              )}
                              {contentToRender.trim() && (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    code({ node, inline, className, children, ...props }) {
                                      const match = /language-(\w+)/.exec(className || '');
                                      return !inline && match ? (
                                        <div className="code-block-wrapper">
                                          <div className="code-header">
                                            <span className="code-lang">{match[1]}</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                              <button
                                                onClick={async () => {
                                                  try {
                                                    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/codex', {
                                                      method: 'POST',
                                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}` },
                                                      body: JSON.stringify({ title: `Snippet from ${new Date().toLocaleDateString()}`, language: match[1], code: String(children).replace(/\n$/, '') })
                                                    });
                                                    if (res.ok) {
                                                      const data = await res.json();
                                                      if (data.status === 'flagged') {
                                                        showNotification('Saved to Codex (Warning: Flagged as unsafe)');
                                                      } else {
                                                        showNotification('Saved to Codex!');
                                                      }
                                                      // Refresh codex
                                                      const codexRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/codex', { headers: { 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`, 'ngrok-skip-browser-warning': 'true' } });
                                                      if (codexRes.ok) setCodexSnippets(await codexRes.json());
                                                    }
                                                  } catch (e) { showNotification('Failed to save to Codex'); }
                                                }}
                                                className="copy-code-btn"
                                              >
                                                <Bookmark size={14} /> Save
                                              </button>
                                              <button
                                                onClick={() => copyToClipboard(String(children).replace(/\n$/, ''), `${msg.id}-${match[1]}`)}
                                                className="copy-code-btn"
                                              >
                                                {copiedId === `${msg.id}-${match[1]}` ? <Check size={14} /> : <Copy size={14} />}
                                                {copiedId === `${msg.id}-${match[1]}` ? 'Copied!' : 'Copy'}
                                              </button>
                                            </div>
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
                                  {contentToRender}
                                </ReactMarkdown>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {!isTyping && (
                  <div
                    className={`message-toolbar ${msg.role === 'user' ? 'toolbar-user' : 'toolbar-ai'}`}
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    {msg.role === 'user' ? (
                      !editingId && (
                        <>
                          <button onClick={() => copyToClipboard(msg.content, msg.id)} className="toolbar-btn" title="Copy message">
                            {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                          <button onClick={() => { setEditingId(msg.id); setEditInput(msg.content); }} className="toolbar-btn" title="Edit Prompt">
                            <Edit2 size={14} />
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
                            <RefreshCw size={12} />
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
        <div className={`input-wrapper mode-${inputMode} ${isTemporary ? 'mode-incognito' : ''}`}>
          <form className="input-area" onSubmit={sendMessage} style={isTemporary ? { borderColor: 'rgba(16, 185, 129, 0.4)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)' } : {}}>

            <div ref={plusMenuRef} className="plus-menu-wrapper" style={{ position: 'relative' }}>
              <button type="button" onClick={() => setShowPlusMenu(!showPlusMenu)} className={`attach-btn ${showPlusMenu ? 'active' : ''}`} title="Options">
                <Plus size={24} />
              </button>

              {showPlusMenu && (
                <div className="plus-menu-dropdown">
                  <button type="button" className="plus-menu-item" onClick={() => fileInputRef.current?.click()}>
                    <Image size={18} /> Add photo
                  </button>
                  <input type="file" accept="image/*" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
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
              {attachments.length > 0 && (
                <div className="attachment-preview" style={{ padding: '8px 16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                  {attachments.map((att, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                      <img
                        src={att.url}
                        alt="Attachment"
                        style={{
                          height: '60px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          opacity: att.uploading ? 0.5 : 1,
                          transition: 'opacity 0.2s'
                        }}
                      />
                      {att.uploading && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '8px'
                        }}>
                          <Loader2 size={16} className="animate-spin" style={{ color: '#ffffff' }} />
                        </div>
                      )}
                      <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--bg-secondary)', borderRadius: '50%', padding: '2px', cursor: 'pointer', border: '1px solid var(--border-color)' }}><X size={14} style={{ color: 'var(--text-primary)' }} /></button>
                    </div>
                  ))}
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
                  placeholder={
                    isTemporary ? "Message Davora (Incognito)..." :
                      inputMode === 'deep' ? "Message Davora (Deep Think)..." :
                        inputMode === 'deep-search' ? "Message Davora (Deep Web Search)..." :
                          inputMode === 'research' ? "Message Davora (Web Search)..." :
                            "Message Davora..."
                  }
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
        <div className="modal-overlay" onClick={() => { setShowSettings(false); setMobileSettingsView('menu'); }}>
          <div className={`settings-modal-content mobile-view-${mobileSettingsView}`} onClick={e => e.stopPropagation()}>
            <div className="settings-sidebar">
              <div className="settings-sidebar-header hide-on-desktop">
                <h2>Settings</h2>
                <button className="icon-action-btn" onClick={() => { setShowSettings(false); setMobileSettingsView('menu'); }}><X size={20} /></button>
              </div>
              <div className="settings-nav">
                <button className={`settings-nav-btn ${settingsTab === 'General' ? 'active' : ''}`} onClick={() => { setSettingsTab('General'); setMobileSettingsView('pane'); }}><Settings size={18} /> General</button>
                <button className={`settings-nav-btn ${settingsTab === 'Notifications' ? 'active' : ''}`} onClick={() => { setSettingsTab('Notifications'); setMobileSettingsView('pane'); }}><Bell size={18} /> Notifications</button>
                <button className={`settings-nav-btn ${settingsTab === 'Personalization' ? 'active' : ''}`} onClick={() => { setSettingsTab('Personalization'); setMobileSettingsView('pane'); }}><Fingerprint size={18} /> Personalization</button>
                <button className={`settings-nav-btn ${settingsTab === 'Apps' ? 'active' : ''}`} onClick={() => { setSettingsTab('Apps'); setMobileSettingsView('pane'); }}><Grid size={18} /> Apps</button>
                <button className={`settings-nav-btn ${settingsTab === 'Voice' ? 'active' : ''}`} onClick={() => { setSettingsTab('Voice'); setMobileSettingsView('pane'); }}><Mic size={18} /> Voice</button>
                <button className={`settings-nav-btn ${settingsTab === 'Billing' ? 'active' : ''}`} onClick={() => { setSettingsTab('Billing'); setMobileSettingsView('pane'); }}><CreditCard size={18} /> Billing</button>
                <button className={`settings-nav-btn ${settingsTab === 'Data controls' ? 'active' : ''}`} onClick={() => { setSettingsTab('Data controls'); setMobileSettingsView('pane'); }}><Database size={18} /> Data controls</button>
                <button className={`settings-nav-btn ${settingsTab === 'Storage' ? 'active' : ''}`} onClick={() => { setSettingsTab('Storage'); setMobileSettingsView('pane'); }}><HardDrive size={18} /> Storage</button>
                <button className={`settings-nav-btn ${settingsTab === 'Safety' ? 'active' : ''}`} onClick={() => { setSettingsTab('Safety'); setMobileSettingsView('pane'); }}><Shield size={18} /> Safety</button>
                <button className={`settings-nav-btn ${settingsTab === 'Security' ? 'active' : ''}`} onClick={() => { setSettingsTab('Security'); setMobileSettingsView('pane'); }}><Settings size={18} /> Security and login</button>
                <button className={`settings-nav-btn ${settingsTab === 'Parental controls' ? 'active' : ''}`} onClick={() => { setSettingsTab('Parental controls'); setMobileSettingsView('pane'); }}><Users size={18} /> Parental controls</button>
                <button className={`settings-nav-btn ${settingsTab === 'Trusted contact' ? 'active' : ''}`} onClick={() => { setSettingsTab('Trusted contact'); setMobileSettingsView('pane'); }}><UserPlus size={18} /> Trusted contact</button>
                <button className={`settings-nav-btn ${settingsTab === 'Account' ? 'active' : ''}`} onClick={() => { setSettingsTab('Account'); setMobileSettingsView('pane'); }}><User size={18} /> Account</button>
                <button className={`settings-nav-btn ${settingsTab === 'Tasks' ? 'active' : ''}`} onClick={() => { setSettingsTab('Tasks'); setMobileSettingsView('pane'); }}><Activity size={18} /> Scheduled Tasks</button>
                <button className={`settings-nav-btn ${settingsTab === 'Reports' ? 'active' : ''}`} onClick={() => { setSettingsTab('Reports'); setMobileSettingsView('pane'); }}><Shield size={18} /> Bug Reports</button>
                <button className={`settings-nav-btn ${settingsTab === 'Developer' ? 'active' : ''}`} onClick={() => { setSettingsTab('Developer'); setMobileSettingsView('pane'); }}><Key size={18} /> Developer keys</button>
              </div>
            </div>

            <div className="settings-body">
              <div className="settings-header-desktop hide-on-mobile">
                <h2>{settingsTab}</h2>
                <button className="icon-action-btn" onClick={() => { setShowSettings(false); setMobileSettingsView('menu'); }}><X size={20} /></button>
              </div>
              <div className="settings-header-mobile hide-on-desktop" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="icon-action-btn" onClick={() => setMobileSettingsView('menu')}><ChevronLeft size={24} /></button>
                <h2 style={{ flex: 1 }}>{settingsTab}</h2>
              </div>

              {settingsTab === 'Personalization' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Base style and tone</label>
                      <p>Set the style and tone of how Davora responds to you. This doesn't impact capabilities.</p>
                    </div>
                    <div className="toggle-btns compact" style={{ flexWrap: 'wrap', flex: '1 1 auto', maxWidth: '300px' }}>
                      {['Default', 'Professional', 'Friendly', 'Candid', 'Quirky', 'Efficient', 'Cynical'].map(style => (
                        <button key={style} onClick={() => setPrefs({ ...prefs, baseStyle: style })} className={prefs.baseStyle === style ? 'active' : ''} style={{ flex: '1 1 30%', fontSize: '0.8rem', padding: '6px' }}>{style}</button>
                      ))}
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3>Characteristics</h3>
                    <p className="setting-hint">Choose additional customizations on top of your base style and tone.</p>

                    <div className="settings-row nested">
                      <label>Warm</label>
                      <div className="toggle-btns compact">
                        {['Less', 'Default', 'More'].map(val => (
                          <button key={val} onClick={() => setPrefs({ ...prefs, characteristicsWarm: val })} className={prefs.characteristicsWarm === val ? 'active' : ''} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{val}</button>
                        ))}
                      </div>
                    </div>

                    <div className="settings-row nested">
                      <label>Enthusiastic</label>
                      <div className="toggle-btns compact">
                        {['Less', 'Default', 'More'].map(val => (
                          <button key={val} onClick={() => setPrefs({ ...prefs, characteristicsEnthusiastic: val })} className={prefs.characteristicsEnthusiastic === val ? 'active' : ''} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{val}</button>
                        ))}
                      </div>
                    </div>

                    <div className="settings-row nested">
                      <label>Headers & Lists</label>
                      <div className="toggle-btns compact">
                        {['Less', 'Default', 'More'].map(val => (
                          <button key={val} onClick={() => setPrefs({ ...prefs, characteristicsHeaders: val })} className={prefs.characteristicsHeaders === val ? 'active' : ''} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{val}</button>
                        ))}
                      </div>
                    </div>

                    <div className="settings-row nested">
                      <label>Emoji</label>
                      <div className="toggle-btns compact">
                        {['Less', 'Default', 'More'].map(val => (
                          <button key={val} onClick={() => setPrefs({ ...prefs, characteristicsEmoji: val })} className={prefs.characteristicsEmoji === val ? 'active' : ''} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{val}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Fast answers</label>
                      <p>Davora can sometimes use its general knowledge to give fast, in-depth answers.</p>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" id="fast-answers-toggle" checked={prefs.fastAnswers} onChange={e => setPrefs({ ...prefs, fastAnswers: e.target.checked })} />
                      <label htmlFor="fast-answers-toggle"></label>
                    </div>
                  </div>

                  <div className="settings-section">
                    <label>Custom instructions</label>
                    <textarea
                      className="custom-instructions-input premium"
                      rows={3}
                      value={prefs.customInstructions}
                      onChange={(e) => setPrefs({ ...prefs, customInstructions: e.target.value })}
                      placeholder="Additional behavior, style, and tone preferences"
                    />
                  </div>

                  <div className="settings-section border-top" style={{ paddingTop: '24px' }}>
                    <h3>About you</h3>

                    <div className="settings-input-group">
                      <label>Nickname</label>
                      <input
                        className="premium-input-field"
                        type="text"
                        value={prefs.nickname}
                        onChange={(e) => setPrefs({ ...prefs, nickname: e.target.value })}
                        placeholder="What should Davora call you?"
                      />
                    </div>

                    <div className="settings-input-group">
                      <label>Occupation</label>
                      <input
                        className="premium-input-field"
                        type="text"
                        value={prefs.occupation}
                        onChange={(e) => setPrefs({ ...prefs, occupation: e.target.value })}
                        placeholder=""
                      />
                    </div>

                    <div className="settings-input-group">
                      <label>More about you</label>
                      <input
                        className="premium-input-field"
                        type="text"
                        value={prefs.aboutYou}
                        onChange={(e) => setPrefs({ ...prefs, aboutYou: e.target.value })}
                        placeholder="Interests, values, or preferences to keep in mind"
                      />
                    </div>
                  </div>

                  <div className="settings-section border-top" style={{ paddingTop: '24px' }}>
                    <div className="settings-row" style={{ alignItems: 'center' }}>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Memory <span className="help-icon" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--text-secondary)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>?</span></h3>
                      <button className="manage-btn" onClick={() => { setShowSettings(false); setActiveModal('memory'); }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}>Manage</button>
                    </div>

                    <div className="settings-row border-top" style={{ paddingTop: '16px', marginTop: '16px' }}>
                      <div className="settings-info">
                        <label>Reference saved memories</label>
                        <p>Let Davora save and use memories when responding.</p>
                      </div>
                      <div className="toggle-switch">
                        <input type="checkbox" id="ref-mem-toggle" checked={prefs.referenceMemories} onChange={e => setPrefs({ ...prefs, referenceMemories: e.target.checked })} />
                        <label htmlFor="ref-mem-toggle"></label>
                      </div>
                    </div>

                    <div className="settings-row border-top" style={{ paddingTop: '16px' }}>
                      <div className="settings-info">
                        <label>Reference chat history</label>
                        <p>Let Davora reference recent conversations when responding.</p>
                      </div>
                      <div className="toggle-switch">
                        <input type="checkbox" id="ref-hist-toggle" checked={prefs.referenceHistory} onChange={e => setPrefs({ ...prefs, referenceHistory: e.target.checked })} />
                        <label htmlFor="ref-hist-toggle"></label>
                      </div>
                    </div>

                    <p className="setting-hint" style={{ marginTop: '12px' }}>
                      Davora may use Memory to personalize queries to search providers, such as Bing. <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Learn more</a>
                    </p>
                  </div>

                  <div className="settings-row border-top" style={{ paddingTop: '24px', flexDirection: 'column', gap: '16px' }}>
                    <button className="settings-nav-btn" onClick={() => setShowAdvancedSettings(!showAdvancedSettings)} style={{ padding: 0, width: '100%', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                      Advanced <ChevronDown size={16} style={{ transform: showAdvancedSettings ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {showAdvancedSettings && (
                      <div className="settings-row" style={{ width: '100%' }}>
                        <div className="settings-info">
                          <label>Strict Markdown Compliance</label>
                          <p>Force Davora to adhere strictly to raw markdown spacing and block rendering.</p>
                        </div>
                        <div className="toggle-switch">
                          <input type="checkbox" id="strict-md-toggle" checked={prefs.strictMarkdown} onChange={e => setPrefs({ ...prefs, strictMarkdown: e.target.checked })} />
                          <label htmlFor="strict-md-toggle"></label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {settingsTab === 'General' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Theme</label>
                      <p>Customize the UI color mode.</p>
                    </div>
                    <div className="toggle-btns compact">
                      <button onClick={() => setPrefs({ ...prefs, theme: 'light' })} className={prefs.theme === 'light' ? 'active' : ''} style={{ padding: '6px 12px' }}><Sun size={14} /> Light</button>
                      <button onClick={() => setPrefs({ ...prefs, theme: 'dark' })} className={prefs.theme === 'dark' ? 'active' : ''} style={{ padding: '6px 12px' }}><Moon size={14} /> Dark</button>
                      <button onClick={() => setPrefs({ ...prefs, theme: 'amoled' })} className={prefs.theme === 'amoled' ? 'active' : ''} style={{ padding: '6px 12px' }}><Zap size={14} /> OLED</button>
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Font Size</label>
                      <p>Adjust text size for better readability.</p>
                    </div>
                    <div className="toggle-btns compact" style={{ flexWrap: 'wrap', gap: '4px' }}>
                      <button onClick={() => setPrefs({ ...prefs, fontSize: 'small' })} className={prefs.fontSize === 'small' ? 'active' : ''} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Small</button>
                      <button onClick={() => setPrefs({ ...prefs, fontSize: 'medium' })} className={prefs.fontSize === 'medium' ? 'active' : ''} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Medium</button>
                      <button onClick={() => setPrefs({ ...prefs, fontSize: 'large' })} className={prefs.fontSize === 'large' ? 'active' : ''} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Large</button>
                      <button onClick={() => setPrefs({ ...prefs, fontSize: 'extra-large' })} className={prefs.fontSize === 'extra-large' ? 'active' : ''} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Extra Large</button>
                    </div>
                  </div>
                  <div className="settings-row border-top">
                    <button onClick={clearAllChats} className="danger-btn">Delete all chats</button>
                  </div>
                </div>
              )}

              {settingsTab === 'Account' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Email address</label>
                      <p>{userEmail}</p>
                    </div>
                  </div>
                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Plan</label>
                      <p>{subscriptionPlan}</p>
                    </div>
                    <button className="settings-nav-btn" style={{ padding: '8px 16px', background: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '24px' }} onClick={() => setSettingsTab('Billing')}>Upgrade</button>
                  </div>
                  <div className="settings-row border-top" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
                    <div className="settings-info" style={{ width: '100%' }}>
                      <label>Change Password</label>
                      <p>Update your password to keep your account secure.</p>
                    </div>
                    <form onSubmit={handleChangePassword} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <input
                        type="password"
                        placeholder="Current password"
                        required
                        value={changeOldPassword}
                        onChange={e => setChangeOldPassword(e.target.value)}
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.9rem' }}
                      />
                      <input
                        type="password"
                        placeholder="New password (min 6 chars)"
                        required
                        value={changeNewPassword}
                        onChange={e => setChangeNewPassword(e.target.value)}
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.9rem' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: changePasswordStatus === 'error' ? '#ef4444' : changePasswordStatus === 'success' ? '#10b981' : 'transparent' }}>
                          {changePasswordMessage || 'Placeholder'}
                        </span>
                        <button type="submit" disabled={changePasswordStatus === 'loading'} style={{ padding: '8px 16px', background: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '24px', border: 'none', cursor: 'pointer', fontWeight: '600', opacity: changePasswordStatus === 'loading' ? 0.7 : 1 }}>
                          {changePasswordStatus === 'loading' ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="settings-row border-top" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
                    <div className="settings-info" style={{ width: '100%' }}>
                      <label style={{ color: '#ef4444' }}>Danger Zone</label>
                      <p>Permanently delete your account and all associated data.</p>
                    </div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <input
                        type="password"
                        placeholder="Enter password to confirm deletion"
                        value={deleteAccountPassword}
                        onChange={e => setDeleteAccountPassword(e.target.value)}
                        style={{ background: 'var(--bg-primary)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--text-primary)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.9rem' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>{deleteMessage}</span>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isDeleting || !deleteAccountPassword}
                          className="danger-btn"
                          style={{ opacity: (isDeleting || !deleteAccountPassword) ? 0.5 : 1 }}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="settings-row border-top" style={{ paddingTop: '24px' }}>
                    <button onClick={() => { document.cookie = "davora_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.davora.xyz;"; const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }} className="danger-btn" style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', width: '100%' }}>Log out</button>
                  </div>
                </div>
              )}

              {settingsTab === 'Data controls' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Export data</label>
                      <p>Request an export of your data.</p>
                    </div>
                    <button className="outline-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>Export</button>
                  </div>
                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Delete account</label>
                      <p>Permanently delete your account and data.</p>
                    </div>
                    <button className="danger-btn" onClick={() => showNotification("Please contact support to delete your account.")}>Delete</button>
                  </div>
                </div>
              )}

              {settingsTab === 'Notifications' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Push Notifications</label>
                      <p>Receive desktop alerts when tasks complete.</p>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" id="push-notif-toggle" checked={prefs.pushNotifications} onChange={e => setPrefs({ ...prefs, pushNotifications: e.target.checked })} />
                      <label htmlFor="push-notif-toggle"></label>
                    </div>
                  </div>
                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Product Updates</label>
                      <p>Receive emails about new features and models.</p>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" id="email-notif-toggle" checked={prefs.emailNotifications} onChange={e => setPrefs({ ...prefs, emailNotifications: e.target.checked })} />
                      <label htmlFor="email-notif-toggle"></label>
                    </div>
                  </div>
                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Test Push Notifications</label>
                      <p>Trigger a test notification to verify delivery.</p>
                    </div>
                    <button
                      className="outline-btn"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('davora_token');
                          const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/notifications/test', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'ngrok-skip-browser-warning': 'true'
                            }
                          });
                          const data = await res.json();
                          if (data.status === "success" || data.status === "info") {
                            showNotification(data.message || "Test notification sent successfully!");
                          } else {
                            showNotification(data.message || "Failed to send test notification.");
                          }
                        } catch (e) {
                          showNotification("Failed to send test notification.");
                        }
                      }}
                    >
                      Send Test
                    </button>
                  </div>
                </div>
              )}

              {settingsTab === 'Apps' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Google Drive</label>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Import and export documents directly. <span style={{ color: '#f59e0b', fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '12px' }}>Coming soon</span></p>
                    </div>
                    <button className="outline-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>Connect</button>
                  </div>
                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>GitHub</label>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Access repositories for code generation. <span style={{ color: '#f59e0b', fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '12px' }}>Coming soon</span></p>
                    </div>
                    <button className="outline-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>Connect</button>
                  </div>
                </div>
              )}

              {settingsTab === 'Voice' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Voice Profile</label>
                      <p>Select Davora's spoken voice.</p>
                    </div>
                    <div className="toggle-btns compact" style={{ flexWrap: 'wrap', maxWidth: '250px' }}>
                      {['Alloy', 'Echo', 'Nova', 'Onyx'].map(voice => (
                        <button key={voice} onClick={() => setPrefs({ ...prefs, voiceProfile: voice })} className={prefs.voiceProfile === voice ? 'active' : ''} style={{ flex: '1 1 40%', padding: '8px' }}>{voice}</button>
                      ))}
                    </div>
                  </div>
                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Auto-Read Aloud</label>
                      <p>Automatically read Davora's responses via speech synthesis.</p>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" id="auto-read-toggle" checked={prefs.autoReadAloud} onChange={e => setPrefs({ ...prefs, autoReadAloud: e.target.checked })} />
                      <label htmlFor="auto-read-toggle"></label>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'Billing' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Current Plan</label>
                      <p style={{ fontWeight: '600', fontSize: '1.1rem', color: '#10b981' }}>{subscriptionPlan}</p>
                    </div>
                  </div>
                  <div className="settings-row border-top" style={{ flexDirection: 'column', gap: '16px', alignItems: 'flex-start', width: '100%' }}>
                    <div className="settings-info" style={{ width: '100%' }}>
                      <label>Upgrade your Plan</label>
                      <p>Unlock advanced capabilities and higher limits.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%', marginTop: '8px' }}>

                      {/* Free Plan Card */}
                      <div style={{ flex: '1', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Compass size={20} style={{ color: 'var(--text-secondary)' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Free</h3>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Basic features for everyday tasks.</p>
                          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>20-30 messages / day</li>
                            <li>4 photo uploads / day</li>
                            <li>Basic response speed</li>
                          </ul>
                        </div>
                        <button className="settings-nav-btn" style={{ padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: '600', cursor: 'not-allowed', width: '100%', textAlign: 'center', justifyContent: 'center' }} disabled>
                          {!subscriptionPlan || subscriptionPlan.includes("Free") ? "Active Plan" : "Included"}
                        </button>
                      </div>

                      {/* Basic Plan Card */}
                      <div style={{ flex: '1', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Zap size={20} style={{ color: '#10b981' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Basic</h3>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>More messages and faster responses.</p>
                          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>100 messages / day</li>
                            <li>10 photo uploads / day</li>
                            <li>Slightly faster responses</li>
                          </ul>
                        </div>
                        <button className="settings-nav-btn" style={{ padding: '10px', background: subscriptionPlan?.includes("Basic") ? 'transparent' : 'var(--text-primary)', color: subscriptionPlan?.includes("Basic") ? 'var(--text-secondary)' : 'var(--bg-primary)', border: subscriptionPlan?.includes("Basic") ? '1px solid var(--border-color)' : 'none', borderRadius: '8px', fontWeight: '600', cursor: subscriptionPlan?.includes("Basic") ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'center', justifyContent: 'center' }} onClick={() => { if (!subscriptionPlan?.includes("Basic")) handleUpgrade("basic"); }} disabled={subscriptionPlan?.includes("Basic")}>
                          {subscriptionPlan?.includes("Basic") ? "Active Plan" : `Upgrade — $${basicPrice}/mo`}
                        </button>
                      </div>

                      {/* Pro Plan Card */}
                      <div style={{ flex: '1', background: 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>POPULAR</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Sparkles size={20} style={{ color: '#8b5cf6' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Pro</h3>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>For advanced users needing maximum power.</p>
                          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Unlimited messages</li>
                            <li>Priority response speed</li>
                            <li>Advanced models & reasoning</li>
                            <li>Unlimited uploads & canvas</li>
                          </ul>
                        </div>
                        <button className="settings-nav-btn" style={{ padding: '10px', background: subscriptionPlan?.includes("Pro") ? 'transparent' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: subscriptionPlan?.includes("Pro") ? '1px solid var(--border-color)' : 'none', borderRadius: '8px', fontWeight: '600', cursor: subscriptionPlan?.includes("Pro") ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'center', justifyContent: 'center' }} onClick={() => { if (!subscriptionPlan?.includes("Pro")) handleUpgrade("pro"); }} disabled={subscriptionPlan?.includes("Pro")}>
                          {subscriptionPlan?.includes("Pro") ? "Active Plan" : `Upgrade — $${proPrice}/mo`}
                        </button>
                      </div>

                      {/* Premium Plan Card */}
                      <div style={{ flex: '1', background: 'linear-gradient(to bottom right, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>ELITE</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <ShieldCheck size={20} style={{ color: '#f59e0b' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Premium</h3>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Complete access to all elite features.</p>
                          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Everything unlocked</li>
                            <li>Maximum response speeds</li>
                            <li>Early access to new features</li>
                            <li>Premium 24/7 support</li>
                          </ul>
                        </div>
                        <button className="settings-nav-btn" style={{ padding: '10px', background: subscriptionPlan?.includes("Premium") ? 'transparent' : 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: subscriptionPlan?.includes("Premium") ? '1px solid var(--border-color)' : 'none', borderRadius: '8px', fontWeight: '600', cursor: subscriptionPlan?.includes("Premium") ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'center', justifyContent: 'center' }} onClick={() => { if (!subscriptionPlan?.includes("Premium")) handleUpgrade("premium"); }} disabled={subscriptionPlan?.includes("Premium")}>
                          {subscriptionPlan?.includes("Premium") ? "Active Plan" : `Upgrade — $${premiumPrice}/mo`}
                        </button>
                      </div>

                    </div>
                  </div>
                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Payment method</label>
                      <p>No payment method on file.</p>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'Developer' && (
                <div className="settings-pane">
                  <div className="settings-row" style={{ flexDirection: 'column', gap: '16px', alignItems: 'flex-start', width: '100%' }}>
                    <div className="settings-info" style={{ width: '100%' }}>
                      <label>Developer API Keys</label>
                      <p>Generate server-side API keys to securely authenticate external systems or mobile apps using the Davora platform.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px' }}>
                      <input
                        type="text"
                        placeholder="Key name (e.g. My Mobile App)"
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                        style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.9rem' }}
                      />
                      <button
                        onClick={handleGenerateApiKey}
                        style={{ padding: '10px 16px', background: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Generate
                      </button>
                    </div>

                    {generatedKey && (
                      <div style={{ width: '100%', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600', display: 'block', marginBottom: '8px' }}>KEY GENERATED SUCCESSFULLY</span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Please copy this API key now. For security reasons, it will not be shown again.</p>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <code style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.9rem', wordBreak: 'break-all' }}>{generatedKey}</code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedKey);
                              setKeyCopied(true);
                              showNotification("API Key copied to clipboard!");
                              setTimeout(() => setKeyCopied(false), 2000);
                            }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                          >
                            {keyCopied ? <Check size={18} style={{ color: '#10b981' }} /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ width: '100%', marginTop: '24px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>Your Active API Keys</h4>
                      {developerKeys.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You don't have any active API Keys yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                          {developerKeys.map(k => (
                            <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                              <div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{k.name}</strong>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                  <code>{k.masked_key}</code> • Created: {new Date(k.created_at).toLocaleDateString()}
                                </div>
                                {k.last_used && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    Last used: {new Date(k.last_used).toLocaleString()}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleRevokeApiKey(k.id)}
                                style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500' }}
                              >
                                Revoke
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'Storage' && (
                <div className="settings-pane">
                  <div className="settings-row" style={{ flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                    <div className="settings-info" style={{ width: '100%' }}>
                      <label style={{ display: 'flex', justifyContent: 'space-between' }}>Chat Storage <span>{sessions.length} conversation{sessions.length !== 1 ? 's' : ''} • {(() => { const bytes = JSON.stringify(sessions).length; return bytes > 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : (bytes / 1024).toFixed(1) + ' KB'; })()}</span></label>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(Math.max((JSON.stringify(sessions).length / 1048576) * 100, 1), 100)}%`, height: '100%', background: '#10b981', borderRadius: '4px', transition: 'width 0.3s' }}></div>
                      </div>
                      <p style={{ marginTop: '4px' }}>Based on {sessions.reduce((acc, s) => acc + s.messages.length, 0)} total messages across all conversations.</p>
                    </div>
                  </div>
                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Clear browser cache</label>
                      <p>Removes temporary UI data. Your chats and settings remain safe in the cloud.</p>
                    </div>
                    <button className="danger-btn" onClick={() => { if (typeof caches !== 'undefined') { caches.keys().then(names => names.forEach(name => caches.delete(name))); } showNotification("Browser cache cleared successfully."); }}>Clear Cache</button>
                  </div>
                </div>
              )}

              {settingsTab === 'Safety' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Explicit Content Filter</label>
                      <p>Block responses containing highly explicit material.</p>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" id="nsfw-filter-toggle" checked={prefs.nsfwFilter} onChange={e => setPrefs({ ...prefs, nsfwFilter: e.target.checked })} />
                      <label htmlFor="nsfw-filter-toggle"></label>
                    </div>
                  </div>
                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Safe Web Search</label>
                      <p>Force SafeSearch on live data queries.</p>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" id="safesearch-toggle" checked={prefs.safeSearch} onChange={e => setPrefs({ ...prefs, safeSearch: e.target.checked })} />
                      <label htmlFor="safesearch-toggle"></label>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'Security' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Two-Factor Authentication (2FA)</label>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Require an authenticator app for login.</p>
                    </div>
                    <button className="settings-nav-btn" style={{ padding: '8px 16px', background: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '24px' }} onClick={async () => {
                      try {
                        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/auth/2fa/generate', {
                          headers: {
                            'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`,
                            'ngrok-skip-browser-warning': 'true'
                          }
                        });
                        const data = await res.json();
                        if (data.status === "already_enabled") { showNotification("2FA is already enabled."); return; }
                        setTwoFactorSecret(data.secret);
                        setTwoFactorUri(data.totp_uri);
                        setTwoFactorQrCode(data.qr_code);
                        setShow2FA(true);
                      } catch (e) { showNotification("Failed to generate 2FA"); }
                    }}>Enable</button>
                  </div>

                  {show2FA && (
                    <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', background: 'var(--surface-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '8px', borderRadius: '50%' }}>
                          <ShieldCheck size={24} color="#a855f7" />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Setup Authenticator</h4>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', width: '100%' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', textAlign: 'center', maxWidth: '400px' }}>
                          Scan the QR code below with your authenticator app (e.g. Google Authenticator, Authy, 1Password).
                        </p>
                        {twoFactorQrCode && (
                          <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'inline-block', marginBottom: '16px' }}>
                            <img src={twoFactorQrCode} alt="2FA QR Code" style={{ width: '150px', height: '150px', display: 'block' }} />
                          </div>
                        )}
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Or enter the setup key manually:</p>
                      </div>

                      <div style={{ width: '100%', marginBottom: '24px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secure Setup Key</label>
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                          <input type="text" readOnly value={twoFactorSecret} style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.1em' }} />
                          <button className="send-btn" onClick={() => { navigator.clipboard.writeText(twoFactorSecret); showNotification('Setup key copied!'); }} style={{ padding: '0 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Copy size={16} /> Copy
                          </button>
                        </div>
                      </div>

                      <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verify Code</label>
                        <p style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Enter the 6-digit code generated by your app to verify setup.</p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <input
                            type="text"
                            placeholder="000000"
                            maxLength="6"
                            value={twoFactorCode}
                            onChange={e => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                            style={{ flex: 1, padding: '14px', background: 'var(--bg-primary)', border: '2px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem', fontWeight: '600', fontFamily: 'monospace', transition: 'border-color 0.2s' }}
                            onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                          />
                          <button
                            className="send-btn"
                            disabled={twoFactorCode.length !== 6}
                            onClick={async () => {
                              try {
                                const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/auth/2fa/verify', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`,
                                    'ngrok-skip-browser-warning': 'true'
                                  },
                                  body: JSON.stringify({ code: twoFactorCode })
                                });
                                if (res.ok) { showNotification("2FA Successfully Enabled!"); setShow2FA(false); }
                                else { showNotification("Invalid code."); }
                              } catch (e) { showNotification("Error verifying code."); }
                            }}
                            style={{ padding: '0 24px', borderRadius: '8px', opacity: twoFactorCode.length !== 6 ? 0.6 : 1, cursor: twoFactorCode.length !== 6 ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                          >
                            Verify & Enable
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Change Password</label>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Update your Davora account password.</p>
                    </div>
                    <button className="outline-btn" onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}>Update</button>
                  </div>

                  {showPasswordUpdate && (
                    <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <input type="password" placeholder="Current Password" className="premium-input-field" style={{ marginBottom: '8px', width: '100%' }} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                      <input type="password" placeholder="New Password" className="premium-input-field" style={{ marginBottom: '16px', width: '100%' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      <button className="send-btn" onClick={async () => {
                        try {
                          const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/auth/password/update', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`,
                              'ngrok-skip-browser-warning': 'true'
                            },
                            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
                          });
                          if (res.ok) { showNotification("Password updated!"); setShowPasswordUpdate(false); setCurrentPassword(""); setNewPassword(""); }
                          else { showNotification("Failed to update password."); }
                        } catch (e) { showNotification("Error updating password."); }
                      }}>Save Password</button>
                    </div>
                  )}

                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Biometric Unlock (FaceID / TouchID)</label>
                      <p>Securely unlock your workspace using your device's biometrics.</p>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="biometric-login-toggle"
                        checked={prefs.biometricLogin || false}
                        onChange={async (e) => {
                          const active = e.target.checked;
                          if (active) {
                            try {
                              if (!window.PublicKeyCredential) {
                                showNotification("Biometrics not supported on this device/browser.");
                                return;
                              }
                              const challenge = new Uint8Array(32);
                              window.crypto.getRandomValues(challenge);
                              const options = {
                                publicKey: {
                                  challenge,
                                  rp: { name: "Davora Workspace" },
                                  user: {
                                    id: new Uint8Array(16),
                                    name: userEmail || "user@davora.xyz",
                                    displayName: userEmail || "User"
                                  },
                                  pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                                  authenticatorSelection: { userVerification: "required" },
                                  timeout: 60000
                                }
                              };
                              const credential = await navigator.credentials.create(options);
                              if (credential) {
                                const currentToken = localStorage.getItem('davora_token') || '';
                                localStorage.setItem('davora_biometric_token', currentToken);
                                setPrefs({ ...prefs, biometricLogin: true });
                                showNotification("Biometrics enabled successfully!");
                              }
                            } catch (err) {
                              console.error("Biometric registration failed:", err);
                              showNotification("Biometric verification canceled or failed.");
                            }
                          } else {
                            localStorage.removeItem('davora_biometric_token');
                            setPrefs({ ...prefs, biometricLogin: false });
                            showNotification("Biometrics disabled.");
                          }
                        }}
                      />
                      <label htmlFor="biometric-login-toggle"></label>
                    </div>
                  </div>

                  <div className="settings-row border-top">
                    <button className="danger-btn" onClick={async () => {
                      try {
                        await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/auth/logout', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`, 'ngrok-skip-browser-warning': 'true' }
                        });
                      } catch (e) { }
                      localStorage.clear();
                      document.cookie = "davora_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.davora.xyz;";
                      const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`;
                    }}>Sign out of all devices</button>
                  </div>
                </div>
              )}

              {settingsTab === 'Parental controls' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Require PIN</label>
                      <p>Require a 4-digit PIN to access Davora.</p>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" id="pin-toggle" checked={prefs.requirePin} onChange={e => setPrefs({ ...prefs, requirePin: e.target.checked })} />
                      <label htmlFor="pin-toggle"></label>
                    </div>
                  </div>
                  <div className="settings-row border-top">
                    <div className="settings-info">
                      <label>Strict Time Limits</label>
                      <p>Disable access outside of configured hours.</p>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" id="time-limit-toggle" checked={prefs.strictTimeLimits} onChange={e => setPrefs({ ...prefs, strictTimeLimits: e.target.checked })} />
                      <label htmlFor="time-limit-toggle"></label>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'Trusted contact' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Recovery Email</label>
                      <p>Add a secondary email for account recovery.</p>
                    </div>
                  </div>
                  <div className="settings-row" style={{ paddingTop: 0 }}>
                    <input className="premium-input-field" type="email" placeholder="trusted@example.com" style={{ width: '100%' }} value={prefs.recoveryEmail} onChange={e => setPrefs({ ...prefs, recoveryEmail: e.target.value })} />
                  </div>
                  <div className="settings-row border-top">
                    <button className="settings-nav-btn" style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} onClick={() => showNotification("Recovery contact saved.")}>Save Contact</button>
                  </div>
                </div>
              )}

              {settingsTab === 'Tasks' && (
                <div className="settings-pane">
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Scheduled Tasks</label>
                      <p>View or cancel tasks you've scheduled.</p>
                    </div>
                  </div>
                  {scheduledTasks.length === 0 ? (
                    <div className="settings-row"><p style={{ color: 'var(--text-secondary)' }}>No scheduled tasks.</p></div>
                  ) : (
                    scheduledTasks.map(t => (
                      <div className="settings-row" key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: '500', marginBottom: '4px' }}>{t.prompt}</p>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scheduled for: {t.scheduled_for}</span>
                        </div>
                        <button className="danger-btn" style={{ padding: '6px 12px', width: 'auto' }} onClick={async () => {
                          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz'}/api/schedule/${t.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}`, 'ngrok-skip-browser-warning': 'true' } });
                          setScheduledTasks(scheduledTasks.filter(st => st.id !== t.id));
                          showNotification('Task canceled successfully.');
                        }}>Cancel</button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {settingsTab === 'Reports' && (
                <div className="settings-pane" style={{ gap: '20px' }}>
                  <div className="settings-row">
                    <div className="settings-info">
                      <label>Feedback & Bug Reports</label>
                      <p>Share your ideas, suggestions, or report any issues directly to the team.</p>
                    </div>
                  </div>

                  <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                    <textarea
                      placeholder="Got suggestions, feedback or found a bug? Tell us here..."
                      className="custom-instructions-input"
                      style={{ width: '100%', minHeight: '80px', borderRadius: '8px', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', resize: 'vertical' }}
                      value={reportText}
                      onChange={e => setReportText(e.target.value)}
                      disabled={isSubmittingReport}
                    />
                    <button
                      className="settings-nav-btn"
                      style={{ padding: '8px 16px', background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '8px', cursor: isSubmittingReport ? 'not-allowed' : 'pointer', fontWeight: '600', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSubmittingReport ? 0.6 : 1 }}
                      disabled={isSubmittingReport}
                      onClick={async () => {
                        if (!reportText.trim()) return;
                        setIsSubmittingReport(true);
                        try {
                          const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/report', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}` },
                            body: JSON.stringify({ description: reportText })
                          });

                          if (res.status === 429) {
                            showNotification("Too many submissions. Please try again in an hour.");
                          } else if (res.ok) {
                            const newReport = await res.json();
                            setIssueReports(prev => [{ id: newReport.id, ticket_code: newReport.ticket_code, description: reportText }, ...prev]);
                            setReportText("");
                            showNotification('Feedback submitted! Thank you.');
                          } else {
                            showNotification('Failed to submit feedback.');
                          }
                        } catch (e) {
                          showNotification('Failed to submit feedback.');
                        } finally {
                          setIsSubmittingReport(false);
                        }
                      }}
                    >
                      {isSubmittingReport ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Submitting...
                        </>
                      ) : (
                        "Submit Feedback"
                      )}
                    </button>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '10px 0' }}></div>

                  <div className="settings-info">
                    <label style={{ fontSize: '0.95rem' }}>Your past submissions</label>
                  </div>

                  {issueReports.length === 0 ? (
                    <div className="settings-row"><p style={{ color: 'var(--text-secondary)' }}>No reports submitted.</p></div>
                  ) : (
                    issueReports.map(r => (
                      <div className="settings-row" key={r.id}>
                        <p>{r.description}</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ticket: {r.ticket_code || `TICK-${r.id}`}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Dynamic Feature Modals */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: activeModal === 'upgrade' ? '800px' : '600px', width: '90%' }}>
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
                {activeModal === 'upgrade' && 'Upgrade Your Workspace'}
              </h2>
              <button className="icon-action-btn" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {activeModal === 'library' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select a predefined AI persona to start chatting.</p>
                  {['Software Engineer', 'Creative Writer', 'Data Analyst', 'Financial Advisor', 'Therapist'].map(role => (
                    <button key={role} className="sidebar-nav-btn outline-btn" onClick={() => { setPrefs({ ...prefs, customInstructions: `Act as a senior ${role}.` }); setActiveModal(null); showNotification(`${role} persona activated!`); }}>
                      <Bot size={16} /> {role}
                    </button>
                  ))}
                </div>
              )}
              {activeModal === 'projects' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {projectsList.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select a project to link the current chat.</p>
                      {projectsList.map(proj => {
                        const activeSession = sessions.find(s => s.id === activeSessionId);
                        const isLinked = activeSession && activeSession.project_id === proj.id;
                        return (
                          <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: isLinked ? '1px solid #10b981' : '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Folder size={18} /> {proj.name}</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {activeSessionId && (
                                <button
                                  className="outline-btn"
                                  style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  onClick={async () => {
                                    try {
                                      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz'}/api/sessions/${activeSessionId}/project`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}` },
                                        body: JSON.stringify({ project_id: isLinked ? null : proj.id })
                                      });
                                      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, project_id: isLinked ? null : proj.id } : s));
                                      showNotification(isLinked ? 'Chat unlinked.' : 'Chat linked to project!');
                                    } catch (e) { showNotification('Failed to link chat.'); }
                                  }}
                                >
                                  {isLinked ? (
                                    <>
                                      <Link2Off size={14} /> Unlink
                                    </>
                                  ) : (
                                    <>
                                      <Link2 size={14} /> Link Chat
                                    </>
                                  )}
                                </button>
                              )}
                              <button
                                className="icon-action-btn delete"
                                style={{ padding: '6px', color: '#ef4444', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={async () => {
                                  if (!confirm("Are you sure you want to delete this project? Any linked chats will be unlinked.")) return;
                                  try {
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz'}/api/projects/${proj.id}`, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}` }
                                    });
                                    if (res.ok) {
                                      setProjectsList(prev => prev.filter(p => p.id !== proj.id));
                                      setSessions(prev => prev.map(s => s.project_id === proj.id ? { ...s, project_id: null } : s));
                                      showNotification('Project deleted!');
                                    } else {
                                      showNotification('Failed to delete project.');
                                    }
                                  } catch (e) { showNotification('Failed to delete project.'); }
                                }}
                                title="Delete Project"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="canvas-empty-state">
                      <FolderKanban size={32} className="text-secondary mb-4" />
                      <h3>No Projects Yet</h3>
                      <p>Group your chats into projects for better organization.</p>
                    </div>
                  )}
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <input type="text" className="sidebar-search-input" style={{ flex: 1, minWidth: 0, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} placeholder="New Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                    <button
                      style={{
                        padding: '10px 20px',
                        background: 'var(--text-primary)',
                        color: 'var(--bg-primary)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      onClick={async () => {
                        if (!projectName) return;
                        try {
                          const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/projects', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}` },
                            body: JSON.stringify({ name: projectName })
                          });
                          if (res.ok) {
                            const newProj = await res.json();
                            setProjectsList(prev => [...prev, newProj]);
                            setProjectName("");
                            showNotification('Project created!');
                          }
                        } catch (e) { showNotification('Failed to create project'); }
                      }}
                    >
                      <FolderPlus size={16} /> Create
                    </button>
                  </div>
                </div>
              )}
              {activeModal === 'apps' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Connect third-party services to Davora.</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Link size={18} /> Google Drive <span style={{ color: '#f59e0b', fontSize: '0.7rem', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '12px' }}>Soon</span></div>
                    <button className="outline-btn" style={{ fontSize: '0.8rem', padding: '4px 12px', opacity: 0.5, cursor: 'not-allowed' }} disabled>Connect</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Code size={18} /> GitHub Repo <span style={{ color: '#f59e0b', fontSize: '0.7rem', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '12px' }}>Soon</span></div>
                    <button className="outline-btn" style={{ fontSize: '0.8rem', padding: '4px 12px', opacity: 0.5, cursor: 'not-allowed' }} disabled>Connect</button>
                  </div>
                </div>
              )}
              {activeModal === 'codex' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {codexSnippets.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your securely saved code snippets.</p>
                      {codexSnippets.map(snippet => (
                        <div key={snippet.id} style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{snippet.language.toUpperCase()}</strong>
                            {snippet.is_safe === 0 && <span style={{ color: '#ef4444', fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>Flagged: Unsafe</span>}
                          </div>
                          <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)', maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {snippet.code}
                          </div>
                          <button className="outline-btn" style={{ fontSize: '0.8rem', padding: '4px', alignSelf: 'flex-start' }} onClick={() => { navigator.clipboard.writeText(snippet.code); showNotification('Snippet copied!'); }}>
                            <Copy size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Copy Code
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="canvas-empty-state">
                      <Code size={32} className="text-secondary mb-4" />
                      <h3>Code Snippet Vault</h3>
                      <p>Code blocks you save from chats will appear here.</p>
                    </div>
                  )}
                </div>
              )}
              {activeModal === 'memory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Facts and preferences Davora has learned about you.</p>
                  {(prefs.customInstructions || prefs.nickname || prefs.occupation || prefs.aboutYou) ? (
                    <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {prefs.nickname && <div><strong>Nickname:</strong> {prefs.nickname}</div>}
                      {prefs.occupation && <div><strong>Occupation:</strong> {prefs.occupation}</div>}
                      {prefs.aboutYou && <div><strong>About:</strong> {prefs.aboutYou}</div>}
                      {prefs.customInstructions && <div><strong>Instructions:</strong> {prefs.customInstructions}</div>}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Davora hasn't learned any custom memory yet.</p>
                  )}
                  <button onClick={() => { setPrefs({ ...prefs, customInstructions: '', nickname: '', occupation: '', aboutYou: '' }); showNotification('Memory cleared.'); setActiveModal(null); }} className="danger-btn" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>Clear Memory</button>
                </div>
              )}
              {activeModal === 'sessions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid #10b981' }}>
                    <p style={{ fontWeight: '600', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>Current Device <span style={{ color: '#10b981', fontSize: '0.8rem' }}>Active</span></p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{userEmail || 'User'} • {new Date().toLocaleDateString()}</p>
                  </div>
                  <button className="danger-btn" onClick={() => { document.cookie = "davora_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.davora.xyz;"; const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }}>Sign Out Everywhere</button>
                </div>
              )}
              {activeModal === 'schedule' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Schedule this task to run automatically later.</p>
                  <input type="text" className="sidebar-search-input" style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} placeholder="Task prompt" value={schedulePrompt} onChange={e => setSchedulePrompt(e.target.value)} />
                  <input type="datetime-local" className="sidebar-search-input" style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                  <button className="send-btn" onClick={async () => {
                    if (!schedulePrompt || !scheduleTime) return;
                    try {
                      await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/schedule', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}` },
                        body: JSON.stringify({ prompt: schedulePrompt, scheduled_for: scheduleTime })
                      });
                      setActiveModal(null);
                      setSchedulePrompt("");
                      setScheduleTime("");
                      showNotification('Task scheduled!');
                    } catch (e) { showNotification('Scheduling failed'); }
                  }} style={{ padding: '12px' }}>Confirm Schedule</button>
                </div>
              )}
              {activeModal === 'report' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <textarea
                    rows={4}
                    placeholder="Describe the issue..."
                    className="custom-instructions-input"
                    value={reportText}
                    onChange={e => setReportText(e.target.value)}
                    disabled={isSubmittingReport}
                  />
                  <button
                    className="danger-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSubmittingReport ? 0.6 : 1, cursor: isSubmittingReport ? 'not-allowed' : 'pointer' }}
                    disabled={isSubmittingReport}
                    onClick={async () => {
                      if (!reportText) return;
                      setIsSubmittingReport(true);
                      try {
                        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/report', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}` },
                          body: JSON.stringify({ description: reportText })
                        });

                        if (res.status === 429) {
                          showNotification("Too many submissions. Please try again in an hour.");
                        } else if (res.ok) {
                          const newReport = await res.json();
                          setIssueReports(prev => [{ id: newReport.id, ticket_code: newReport.ticket_code, description: reportText }, ...prev]);
                          setActiveModal(null);
                          setReportText("");
                          showNotification('Issue reported to engineering.');
                        } else {
                          showNotification('Failed to submit report.');
                        }
                      } catch (e) {
                        showNotification('Report failed');
                      } finally {
                        setIsSubmittingReport(false);
                      }
                    }}
                  >
                    {isSubmittingReport ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Reporting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </div>
              )}
              {activeModal === 'share' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                  <Globe size={48} className="text-secondary mb-2" />
                  <p>Generate a public link to share this conversation.</p>
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    {shareLink ? (
                      <>
                        <input type="text" readOnly value={shareLink} style={{ flex: 1, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                        <button className="send-btn" onClick={() => { navigator.clipboard.writeText(shareLink); showNotification('Link copied!'); setActiveModal(null); setShareLink(''); }}>Copy</button>
                      </>
                    ) : (
                      <button className="send-btn" style={{ width: '100%', padding: '12px' }} onClick={async () => {
                        if (!activeSessionId) {
                          showNotification('No active chat to share.');
                          return;
                        }
                        try {
                          const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/share', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(localStorage.getItem('davora_token') || '')}` },
                            body: JSON.stringify({ session_id: activeSessionId })
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setShareLink(`https://davora-b5rw.vercel.app/share/${data.share_id}`);
                            showNotification('Share link generated!');
                          } else {
                            showNotification('Failed to generate share link.');
                          }
                        } catch (e) { showNotification('Error sharing chat.'); }
                      }}>Generate Link</button>
                    )}
                  </div>
                </div>
              )}
              {activeModal === 'upgrade' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', color: '#fff' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '8px' }}>
                    Choose the subscription tier that matches your intelligence requirements.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', width: '100%' }}>

                    {/* Free Card */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '280px', transition: 'all 0.3s' }} className="pricing-card">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Compass size={18} style={{ color: '#9ca3af' }} />
                          </div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Free</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '14px' }}>Explore core capabilities.</p>
                        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', listStyleType: 'none', paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 0 16px 0' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#9ca3af' }}>✓</span> 20-30 chats / day</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#9ca3af' }}>✓</span> 4 images / day</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#9ca3af' }}>✓</span> Standard API speed</li>
                        </ul>
                      </div>
                      <button className="settings-nav-btn" style={{ padding: '10px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.3)', borderRadius: '10px', fontWeight: '600', cursor: 'not-allowed', width: '100%', textAlign: 'center', justifyContent: 'center', fontSize: '0.8rem' }} disabled>
                        {!subscriptionPlan || subscriptionPlan.includes("Free") ? "Active Plan" : "Included"}
                      </button>
                    </div>

                    {/* Basic Card */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '280px', transition: 'all 0.3s' }} className="pricing-card">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={18} style={{ color: '#10b981' }} />
                          </div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Basic</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '14px' }}>More limits, faster responses.</p>
                        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', listStyleType: 'none', paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 0 16px 0' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> 100 messages / day</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> 10 photos / day</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Priority API speed</li>
                        </ul>
                      </div>
                      <button className="settings-nav-btn" style={{ padding: '10px', background: subscriptionPlan?.includes("Basic") ? 'transparent' : 'var(--text-primary)', color: subscriptionPlan?.includes("Basic") ? 'var(--text-secondary)' : 'var(--bg-primary)', border: subscriptionPlan?.includes("Basic") ? '1px solid rgba(255, 255, 255, 0.08)' : 'none', borderRadius: '10px', fontWeight: '600', cursor: subscriptionPlan?.includes("Basic") ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'center', justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => { if (!subscriptionPlan?.includes("Basic")) { handleUpgrade("basic"); setActiveModal(null); } }} disabled={subscriptionPlan?.includes("Basic")}>
                        {subscriptionPlan?.includes("Basic") ? "Active Plan" : `Upgrade — $${basicPrice}/mo`}
                      </button>
                    </div>

                    {/* Pro Card */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '280px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }} className="pricing-card popular">
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold' }}>POPULAR</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={18} style={{ color: '#8b5cf6' }} />
                          </div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Pro</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '14px' }}>Maximum power & reasoning.</p>
                        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', listStyleType: 'none', paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 0 16px 0' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#8b5cf6' }}>✓</span> Unlimited messages</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#8b5cf6' }}>✓</span> Priority model access</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#8b5cf6' }}>✓</span> Unlimited photos</li>
                        </ul>
                      </div>
                      <button className="settings-nav-btn" style={{ padding: '10px', background: subscriptionPlan?.includes("Pro") ? 'transparent' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: subscriptionPlan?.includes("Pro") ? '1px solid rgba(255, 255, 255, 0.08)' : 'none', borderRadius: '10px', fontWeight: '600', cursor: subscriptionPlan?.includes("Pro") ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'center', justifyContent: 'center', fontSize: '0.8rem', boxShadow: subscriptionPlan?.includes("Pro") ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.2)' }} onClick={() => { if (!subscriptionPlan?.includes("Pro")) { handleUpgrade("pro"); setActiveModal(null); } }} disabled={subscriptionPlan?.includes("Pro")}>
                        {subscriptionPlan?.includes("Pro") ? "Active Plan" : `Upgrade — $${proPrice}/mo`}
                      </button>
                    </div>

                    {/* Premium Card */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '280px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }} className="pricing-card elite">
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold' }}>ELITE</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={18} style={{ color: '#f59e0b' }} />
                          </div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Premium</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '14px' }}>Complete ultimate features.</p>
                        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', listStyleType: 'none', paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 0 16px 0' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#f59e0b' }}>✓</span> Everything unlocked</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#f59e0b' }}>✓</span> Max priority speeds</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#f59e0b' }}>✓</span> Early support & access</li>
                        </ul>
                      </div>
                      <button className="settings-nav-btn" style={{ padding: '10px', background: subscriptionPlan?.includes("Premium") ? 'transparent' : 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: subscriptionPlan?.includes("Premium") ? '1px solid rgba(255, 255, 255, 0.08)' : 'none', borderRadius: '10px', fontWeight: '600', cursor: subscriptionPlan?.includes("Premium") ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'center', justifyContent: 'center', fontSize: '0.8rem', boxShadow: subscriptionPlan?.includes("Premium") ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.2)' }} onClick={() => { if (!subscriptionPlan?.includes("Premium")) { handleUpgrade("premium"); setActiveModal(null); } }} disabled={subscriptionPlan?.includes("Premium")}>
                        {subscriptionPlan?.includes("Premium") ? "Active Plan" : `Upgrade — $${premiumPrice}/mo`}
                      </button>
                    </div>

                  </div>

                  {/* Footer Disclaimer */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', fontSize: '0.75rem', color: '#6b7280', marginTop: '8px' }}>
                    <span>🔒 Secure checkout via Flutterwave</span>
                    <span>⚡ Cancel subscription anytime</span>
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
          {selectedArtifactId ? (
            (() => {
              const artifact = canvasArtifacts.find(a => a.id === selectedArtifactId);
              if (!artifact) {
                setSelectedArtifactId(null);
                return null;
              }
              const versions = artifactVersions[selectedArtifactId] || [];

              return (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', padding: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => setSelectedArtifactId(null)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      ← Back
                    </button>
                    <span className="canvas-version-badge" style={{ fontSize: '0.75rem', background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileClock size={12} /> v{versions.length}.0
                    </span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Content Editor</label>
                    <textarea
                      value={editCanvasText}
                      onChange={(e) => setEditCanvasText(e.target.value)}
                      style={{
                        width: '100%',
                        flex: 1,
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '12px',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        minHeight: '260px',
                        resize: 'none',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => {
                        const newVersion = {
                          versionId: Date.now().toString(),
                          content: editCanvasText,
                          date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setArtifactVersions(prev => ({
                          ...prev,
                          [selectedArtifactId]: [newVersion, ...(prev[selectedArtifactId] || [])]
                        }));
                        setCanvasArtifacts(prev => prev.map(a => a.id === selectedArtifactId ? { ...a, content: editCanvasText } : a));
                        showNotification("New version saved!");
                      }}
                      style={{
                        alignSelf: 'flex-end',
                        background: '#ffffff',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Save Version
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileClock size={14} /> History Timeline
                    </label>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                      {versions.map((ver, idx) => (
                        <button
                          key={ver.versionId}
                          onClick={() => {
                            setEditCanvasText(ver.content);
                            showNotification(`Loaded version from ${ver.date}`);
                          }}
                          style={{
                            flexShrink: 0,
                            background: editCanvasText === ver.content ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: editCanvasText === ver.content ? '1px solid #a855f7' : '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            color: editCanvasText === ver.content ? '#a855f7' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                          }}
                        >
                          <strong>v{versions.length - idx}.0</strong>
                          <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{ver.date.split(' ')[1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            canvasArtifacts.length === 0 ? (
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
                    <div
                      onClick={() => {
                        setSelectedArtifactId(artifact.id);
                        setEditCanvasText(artifact.content);
                        if (!artifactVersions[artifact.id]) {
                          setArtifactVersions(prev => ({
                            ...prev,
                            [artifact.id]: [{
                              versionId: artifact.id,
                              content: artifact.content,
                              date: artifact.date
                            }]
                          }));
                        }
                      }}
                      style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto', cursor: 'pointer' }}
                    >
                      {artifact.content.substring(0, 300)}{artifact.content.length > 300 ? '...' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )
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
              <button className="cmd-item" onClick={() => { setShowSettings(true); setMobileSettingsView('menu'); setShowCmdPalette(false); }}>
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

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'zoom-out'
          }}
        >
          <img
            src={activeLightboxImg}
            alt="Enlarged view"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              objectFit: 'contain'
            }}
          />
        </div>
      )}

    </div>
  );
}
