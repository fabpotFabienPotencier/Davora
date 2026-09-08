"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import '../globals.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [platformName, setPlatformName] = useState('Davora');
  const [termsUrl, setTermsUrl] = useState('/terms');
  const [privacyUrl, setPrivacyUrl] = useState('/privacy');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleBtnRef = useRef(null);
  const router = useRouter();

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
        throw new Error(data.detail || 'Google sign-up failed');
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
      console.error("Google sign-up error:", err);
      setError(err.message || 'Google sign-up failed');
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
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text: 'signup_with',
              shape: 'pill',
              width: 360,
              logo_alignment: 'left'
            });
          }
        } catch (e) {
          console.error("Error initializing Google Identity Services on signup:", e);
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
  }, [googleClientId, isEmailSent]);

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
      })
      .catch(() => {});
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to proceed.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/signup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Signup failed');
      }

      const data = await res.json();
      
      if (data.access_token === "verify_email") {
        setIsEmailSent(true);
        return;
      }
      
      localStorage.setItem('davora_token', data.access_token);
      localStorage.setItem('davora_email', email);
      if (window.Capacitor || window.location.hostname === 'localhost') {
        router.push('/');
      } else {
        const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, '');
        window.location.href = `${window.location.protocol}//chat.${baseDomain}`;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .auth-container { display: flex; width: 100vw; height: 100dvh; background: #000000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #ffffff; }
        .auth-form-side { flex: 1; display: flex; flex-direction: column; padding: 24px; position: relative; z-index: 10; background: #161616; border-right: 1px solid rgba(255,255,255,0.05); }
        .auth-form-side-header { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: calc(12px + env(safe-area-inset-top, 0px)) 24px 12px 24px; position: absolute; top: 0; left: 0; }
        .auth-pill { background: transparent; border: 1px solid rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 9999px; font-size: 0.85rem; color: #aaa; display: flex; align-items: center; gap: 8px; }
        
        .auth-form-wrapper { flex: 1; display: flex; justify-content: center; align-items: center; }
        .auth-form-card { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 24px; }
        
        .auth-brand-side { display: none; flex: 1; position: relative; overflow: hidden; background: #000000; }
        .brand-bg { position: absolute; inset: 0; background: radial-gradient(circle at 70% 50%, rgba(16, 185, 129, 0.15) 0%, #000000 60%); }
        .brand-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120%; height: 120%; display: flex; justify-content: center; align-items: center; opacity: 0.15; user-select: none; pointer-events: none; }
        
        .auth-input-group { display: flex; flex-direction: column; gap: 6px; }
        .auth-label { font-size: 0.85rem; font-weight: 600; color: #dddddd; }
        .auth-input { width: 100%; padding: 14px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; color: #ffffff; outline: none; font-size: 1rem; transition: border-color 0.2s; }
        .auth-input:focus { border-color: #ffffff; }
        
        .auth-btn { width: 100%; background: #ffffff; color: #000000; padding: 14px; border-radius: 9999px; border: none; font-weight: 600; font-size: 0.95rem; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: opacity 0.2s; margin-top: 8px; }
        .auth-btn:hover:not(:disabled) { opacity: 0.9; }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .auth-btn-secondary { width: 100%; background: transparent; color: #ffffff; padding: 14px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2); font-weight: 600; font-size: 0.95rem; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: background 0.2s; margin-top: 8px; }
        .auth-btn-secondary:hover { background: rgba(255,255,255,0.05); }
 
        .auth-link { color: #ffffff; text-decoration: none; font-weight: 600; }
        .auth-link:hover { text-decoration: underline; }
        
        .terms-text { position: absolute; bottom: calc(24px + env(safe-area-inset-bottom, 0px)); left: 50%; transform: translateX(-50%); font-size: 0.75rem; color: #666; text-align: center; width: 100%; }
        .terms-text a { color: #aaa; text-decoration: none; font-weight: 500; }
        .terms-text a:hover { text-decoration: underline; color: #ddd; }

        @media (min-width: 1024px) {
          .auth-brand-side { display: block; }
        }
        @media (max-width: 1023px) {
          .auth-form-side { background: #000000; border: none; }
          .auth-pill { display: none; }
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
            {isEmailSent ? (
              <div className="auth-form-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <div style={{ marginBottom: '8px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff', textAlign: 'center' }}>Verify your email</h1>
                <p style={{ color: '#aaaaaa', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
                </p>
                <button 
                  className="auth-btn-secondary" 
                  onClick={() => { const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }}
                  style={{ marginTop: '12px' }}
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <div className="auth-form-card">
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff', textAlign: 'center' }}>Create your account</h1>
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

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
                    {isGoogleLoading ? 'Connecting to Google...' : 'Sign up with Google'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                  <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>
              </div>

              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  <label className="auth-label">Password (min 6 chars)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
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
                  {password.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', display: 'flex', gap: '2px' }}>
                        <div style={{ flex: 1, background: password.length > 0 ? (password.length < 6 ? '#ef4444' : (password.length > 7 && /[A-Z0-9]/.test(password) ? '#10b981' : '#eab308')) : 'transparent', transition: 'background 0.3s' }} />
                        <div style={{ flex: 1, background: password.length >= 6 ? (password.length > 7 && /[A-Z0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? '#10b981' : (password.length > 7 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? '#10b981' : '#eab308')) : 'transparent', transition: 'background 0.3s' }} />
                        <div style={{ flex: 1, background: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? '#10b981' : 'transparent', transition: 'background 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, width: '45px', textAlign: 'right', color: password.length < 6 ? '#ef4444' : (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? '#10b981' : '#eab308') }}>
                        {password.length < 6 ? 'Weak' : (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'Strong' : 'Good')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '4px' }}>
                  <input 
                    type="checkbox" 
                    id="terms-checkbox" 
                    checked={agreeToTerms} 
                    onChange={(e) => setAgreeToTerms(e.target.checked)} 
                    style={{ marginTop: '3px', cursor: 'pointer', accentColor: '#10b981' }} 
                  />
                  <label htmlFor="terms-checkbox" style={{ fontSize: '0.8rem', color: '#aaaaaa', cursor: 'pointer', userSelect: 'none', lineHeight: '1.4' }}>
                    I have read and agree to {platformName}'s <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="auth-link">Terms of Service</a> and <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="auth-link">Privacy Policy</a>, including the processing of my data as governed by the GDPR.
                  </label>
                </div>

                <button type="submit" disabled={isLoading} className="auth-btn">
                  {isLoading ? 'Creating account...' : 'Next'}
                </button>
                <button type="button" onClick={() => { const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }} className="auth-btn-secondary">
                  Go back
                </button>
              </form>

              <p style={{ textAlign: 'center', color: '#aaaaaa', fontSize: '0.85rem', marginTop: '16px' }}>
                Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }} className="auth-link">Log in</a>
              </p>
            </div>
            )}
          </div>
          
          <div className="terms-text">
            By continuing, you agree to {platformName}'s <a href={termsUrl}>Terms of Service</a> and <a href={privacyUrl}>Privacy Policy</a>.
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
