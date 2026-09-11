"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight, Lock, Mail, Shield, Eye, EyeOff } from 'lucide-react';
import '../globals.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [platformName, setPlatformName] = useState('Davora');
  const [termsUrl, setTermsUrl] = useState('/terms');
  const [privacyUrl, setPrivacyUrl] = useState('/privacy');
  const [showPassword, setShowPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [githubClientId, setGithubClientId] = useState('');
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const googleBtnRef = useRef(null);
  const router = useRouter();

  const handleGitHubLogin = () => {
    if (!githubClientId) {
      setError('GitHub sign-in is not configured yet on the server.');
      return;
    }
    setIsGitHubLoading(true);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setIsGitHubLoading(true);
      setError('');
      const redirectUri = window.location.origin + window.location.pathname;

      window.history.replaceState({}, document.title, window.location.pathname);

      fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/auth/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include',
        body: JSON.stringify({ code })
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'GitHub sign-in failed');

          localStorage.setItem('davora_token', data.access_token);
          localStorage.setItem('davora_email', data.email || '');

          if (window.Capacitor || window.location.hostname === 'localhost') {
            router.push('/');
          } else {
            const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, '');
            window.location.href = `${window.location.protocol}//chat.${baseDomain}?token=${data.access_token}&email=${encodeURIComponent(data.email || '')}`;
          }
        })
        .catch((err) => {
          console.error("GitHub sign-in error:", err);
          setError(err.message || 'GitHub sign-in failed');
        })
        .finally(() => {
          setIsGitHubLoading(false);
        });
    }
  }, [router]);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    setIsGoogleLoading(true);
    setError('');
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include',
        body: JSON.stringify({ credential: response.credential })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Google sign-in failed');
      }

      const data = await res.json();
      localStorage.setItem('davora_token', data.access_token);
      localStorage.setItem('davora_email', data.email || '');

      if (window.Capacitor || window.location.hostname === 'localhost') {
        router.push('/');
      } else {
        const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, '');
        window.location.href = `${window.location.protocol}//chat.${baseDomain}?token=${data.access_token}&email=${encodeURIComponent(data.email || '')}`;
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    const initializeGsi = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            const cardWidth = googleBtnRef.current.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth - 48 : 320);
            const btnWidth = Math.min(360, Math.max(220, Math.floor(cardWidth)));
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              width: btnWidth,
              logo_alignment: 'left'
            });
          }
        } catch (e) {
          console.error("Error initializing Google Identity Services:", e);
        }
      }
    };

    if (typeof window !== 'undefined') {
      if (window.google?.accounts?.id) {
        initializeGsi();
      } else {
        const existingScript = document.getElementById('google-gsi-script');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'google-gsi-script';
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = initializeGsi;
          document.body.appendChild(script);
        } else {
          existingScript.addEventListener('load', initializeGsi);
        }
      }
    }
  }, [googleClientId, requires2FA]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedLogo = localStorage.getItem('davora_logo_url');
      if (cachedLogo) setLogoUrl(cachedLogo);
      const cachedPlatform = localStorage.getItem('davora_platform_name');
      if (cachedPlatform) setPlatformName(cachedPlatform);
    }

    fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/config', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(cfg => {
        if (cfg.logo_url) {
          setLogoUrl(cfg.logo_url);
          localStorage.setItem('davora_logo_url', cfg.logo_url);
        }
        if (cfg.platform_name) {
          setPlatformName(cfg.platform_name);
          localStorage.setItem('davora_platform_name', cfg.platform_name);
        }
        if (cfg.terms_url && cfg.terms_url !== '#') setTermsUrl(cfg.terms_url);
        if (cfg.privacy_url && cfg.privacy_url !== '#') setPrivacyUrl(cfg.privacy_url);
        if (cfg.google_client_id) setGoogleClientId(cfg.google_client_id);
        if (cfg.github_client_id) setGithubClientId(cfg.github_client_id);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential && localStorage.getItem('davora_biometric_token')) {
      setHasBiometrics(true);
    }
  }, []);

  const handleBiometricLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const options = {
        publicKey: {
          challenge,
          rp: { name: "Davora Workspace" },
          allowCredentials: [],
          userVerification: "required",
          timeout: 60000
        }
      };
      const assertion = await navigator.credentials.get(options);
      if (assertion) {
        const token = localStorage.getItem('davora_biometric_token');
        if (token) {
          localStorage.setItem('davora_token', token);
          const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/sessions', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
            }
          });
          if (res.ok) {
            if (window.Capacitor || window.location.hostname === 'localhost') {
              router.push('/');
            } else {
              const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, '');
              window.location.href = `${window.location.protocol}//chat.${baseDomain}`;
            }
            return;
          }
        }
        setError("Biometric session expired. Please log in with password.");
      }
    } catch (err) {
      console.error("Biometric login failed:", err);
      setError("Biometric verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage('');
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to resend link');
      setResendMessage(data.message);
    } catch (err) {
      setResendMessage(err.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, code: requires2FA ? twoFactorCode : null })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Login failed');
      }

      const data = await res.json();

      if (data.requires_2fa) {
        setRequires2FA(true);
        setTwoFactorCode('');
        return;
      }

      localStorage.setItem('davora_token', data.access_token);
      localStorage.setItem('davora_email', email);
      if (window.Capacitor || window.location.hostname === 'localhost') {
        router.push('/');
      } else {
        const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, '');
        window.location.href = `${window.location.protocol}//chat.${baseDomain}?token=${data.access_token}&email=${encodeURIComponent(email)}`;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .auth-container { display: flex; width: 100vw; min-height: 100dvh; background: #000000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #ffffff; overflow-x: hidden; }
        .auth-form-side { flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top, 0px)) 24px calc(16px + env(safe-area-inset-bottom, 0px)) 24px; position: relative; z-index: 10; background: #111111; border-right: 1px solid rgba(255,255,255,0.05); min-height: 100dvh; box-sizing: border-box; }
        .auth-form-side-header { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 16px; position: relative; }
        .auth-pill { background: transparent; border: 1px solid rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 9999px; font-size: 0.85rem; color: #aaa; display: flex; align-items: center; gap: 8px; }
        
        .auth-form-wrapper { flex: 1; display: flex; justify-content: center; align-items: center; width: 100%; padding: 12px 0; }
        .auth-form-card { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 16px; margin: 0 auto; }
        
        .auth-brand-side { display: none; flex: 1; position: relative; overflow: hidden; background: #000000; min-height: 100dvh; }
        .brand-bg { position: absolute; inset: 0; background: radial-gradient(circle at 70% 50%, rgba(168, 85, 247, 0.15) 0%, #000000 60%); }
        .brand-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120%; height: 120%; display: flex; justify-content: center; align-items: center; opacity: 0.15; user-select: none; pointer-events: none; }
        
        .auth-input-group { display: flex; flex-direction: column; gap: 6px; }
        .auth-label { font-size: 0.85rem; font-weight: 600; color: #dddddd; }
        .auth-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #ffffff; outline: none; font-size: 0.95rem; box-sizing: border-box; transition: border-color 0.2s; }
        .auth-input:focus { border-color: #ffffff; }
        
        .auth-btn { width: 100%; background: #ffffff; color: #000000; padding: 12px; border-radius: 9999px; border: none; font-weight: 600; font-size: 0.95rem; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: opacity 0.2s; margin-top: 4px; }
        .auth-btn:hover:not(:disabled) { opacity: 0.9; }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .auth-btn-secondary { width: 100%; background: transparent; color: #ffffff; padding: 12px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2); font-weight: 600; font-size: 0.95rem; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: background 0.2s; margin-top: 4px; }
        .auth-btn-secondary:hover { background: rgba(255,255,255,0.05); }
 
        .auth-link { color: #ffffff; text-decoration: none; font-weight: 600; }
        .auth-link:hover { text-decoration: underline; }
        
        .terms-text { width: 100%; font-size: 0.75rem; color: #666; text-align: center; margin-top: auto; padding-top: 16px; box-sizing: border-box; }
        .terms-text a { color: #aaa; text-decoration: none; font-weight: 500; }
        .terms-text a:hover { text-decoration: underline; color: #ddd; }

        @media (min-width: 1024px) {
          .auth-brand-side { display: block; }
          .auth-form-side { height: 100dvh; overflow-y: auto; }
          .auth-container { height: 100dvh; overflow: hidden; }
        }
        @media (max-width: 1023px) {
          .auth-form-side { background: #000000; border: none; padding: calc(14px + env(safe-area-inset-top, 0px)) 18px calc(18px + env(safe-area-inset-bottom, 0px)) 18px; }
          .auth-pill { display: none; }
          .auth-container { overflow-y: auto; height: auto; min-height: 100dvh; }
        }
      `}} />
      <div className="auth-container">
        <div className="auth-form-side">

          <div className="auth-form-side-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {logoUrl ? <img src={logoUrl} alt="Davora Logo" style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: '50%' }} /> : <Bot size={24} color="#fff" />}
            </div>
            <div className="auth-pill">
              You are signing into {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: 14, height: 14, objectFit: 'contain', marginLeft: '4px', borderRadius: '50%' }} /> : <Bot size={14} color="#fff" style={{ marginLeft: '4px' }} />} <strong style={{ color: '#fff', fontWeight: 600 }}>{platformName}</strong>
            </div>
          </div>

          <div className="auth-form-wrapper">
            <div className="auth-form-card">

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                {!requires2FA ? (
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff', textAlign: 'center' }}>Log in with your email</h1>
                ) : (
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff', textAlign: 'center' }}>Two-Step Verification</h1>
                )}
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span>{error}</span>
                  {error.toLowerCase().includes('verify') && (
                    <div style={{ marginTop: '4px' }}>
                      <button 
                        onClick={handleResendVerification} 
                        disabled={isResending}
                        style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: isResending ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
                      >
                        {isResending ? 'Sending...' : 'Resend Verification Email'}
                      </button>
                      {resendMessage && <div style={{ marginTop: '8px', color: resendMessage.includes('sent') ? '#10b981' : '#ef4444' }}>{resendMessage}</div>}
                    </div>
                  )}
                </div>
              )}

              {hasBiometrics && !requires2FA && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <button 
                    type="button" 
                    onClick={handleBiometricLogin} 
                    disabled={isLoading}
                    style={{ 
                      width: '100%', 
                      background: 'rgba(168, 85, 247, 0.1)', 
                      color: '#a855f7', 
                      border: '1px solid rgba(168, 85, 247, 0.3)', 
                      padding: '14px', 
                      borderRadius: '9999px', 
                      fontWeight: '600', 
                      fontSize: '0.95rem', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '8px' 
                    }}
                  >
                    <Shield size={18} /> Sign in with Biometrics (TouchID / FaceID)
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                  </div>
                </div>
              )}

              {!requires2FA && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '8px' }}>
                  <div 
                    ref={googleBtnRef} 
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      minHeight: '44px' 
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.google?.accounts?.id) {
                          window.google.accounts.id.prompt();
                        }
                      }}
                      disabled={isGoogleLoading}
                      style={{
                        width: '100%',
                        background: '#1a1a1a',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '12px 16px',
                        borderRadius: '9999px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleGitHubLogin}
                    disabled={isGitHubLoading}
                    style={{
                      width: '100%',
                      background: '#161b22',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '12px 16px',
                      borderRadius: '9999px',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1f242c'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#161b22'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    {isGitHubLoading ? 'Connecting to GitHub...' : 'Continue with GitHub'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                  </div>
                </div>
              )}

              {!requires2FA ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="auth-input-group">
                    <label className="auth-label">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="auth-input"
                    />
                  </div>
                  <div className="auth-input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="auth-label">Password</label>
                      <a href="/forgot-password" style={{ fontSize: '0.75rem', color: '#aaaaaa', textDecoration: 'none', fontWeight: 500 }} onMouseEnter={(e) => e.target.style.textDecoration = 'underline'} onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>Forgot password?</a>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="auth-input"
                        style={{ paddingRight: '48px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="auth-btn">
                    {isLoading ? 'Authenticating...' : 'Next'}
                  </button>
                  <button type="button" onClick={() => router.push('/signup')} className="auth-btn-secondary">
                    Go back
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="auth-input-group">
                    <label className="auth-label">Authentication Code</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                      autoFocus
                      style={{ width: '100%', padding: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', color: '#ffffff', outline: 'none', letterSpacing: '0.75em', textAlign: 'center', fontSize: '1.5rem', fontWeight: '600', fontFamily: 'monospace' }}
                      onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                    />
                  </div>
                  <button type="submit" disabled={isLoading || twoFactorCode.length !== 6} className="auth-btn">
                    {isLoading ? 'Verifying...' : 'Next'}
                  </button>
                  <button type="button" onClick={() => { setRequires2FA(false); setTwoFactorCode(""); }} className="auth-btn-secondary">
                    Go back
                  </button>
                </form>
              )}

              {!requires2FA && (
                <p style={{ textAlign: 'center', color: '#aaaaaa', fontSize: '0.85rem', marginTop: '16px' }}>
                  Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//signup.${baseDomain}`; }} className="auth-link">Sign up</a>
                </p>
              )}
            </div>
          </div>

          <div className="terms-text">
            By continuing, you agree to {platformName}'s <a href={termsUrl} target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href={privacyUrl} target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </div>
        </div>

        <div className="auth-brand-side">
          <div className="brand-bg"></div>
          <div className="brand-content">
            {logoUrl ? <img src={logoUrl} alt={`${platformName} Logo`} style={{ width: '80%', height: '80%', objectFit: 'contain' }} /> : <Bot style={{ width: '80%', height: '80%' }} color="#fff" />}
          </div>
        </div>
      </div>
    </>
  );
}
