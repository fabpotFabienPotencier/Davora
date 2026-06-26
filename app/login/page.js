"use client";
import React, { useState, useEffect } from 'react';
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
  const router = useRouter();

  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/config', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(cfg => {
        if (cfg.logo_url) setLogoUrl(cfg.logo_url);
        if (cfg.platform_name && cfg.platform_name !== 'Davora') setPlatformName(cfg.platform_name);
        if (cfg.terms_url && cfg.terms_url !== '#') setTermsUrl(cfg.terms_url);
        if (cfg.privacy_url && cfg.privacy_url !== '#') setPrivacyUrl(cfg.privacy_url);
      })
      .catch(() => { });
  }, []);

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
      const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, '');
      window.location.href = `${window.location.protocol}//chat.${baseDomain}`;
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
        .auth-container { display: flex; width: 100vw; height: 100vh; background: #000000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #ffffff; }
        .auth-form-side { flex: 1; display: flex; flex-direction: column; padding: 24px; position: relative; z-index: 10; background: #161616; border-right: 1px solid rgba(255,255,255,0.05); }
        .auth-form-side-header { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 12px 24px; position: absolute; top: 0; left: 0; }
        .auth-pill { background: transparent; border: 1px solid rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 9999px; font-size: 0.85rem; color: #aaa; display: flex; align-items: center; gap: 8px; }
        
        .auth-form-wrapper { flex: 1; display: flex; justify-content: center; align-items: center; }
        .auth-form-card { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 24px; }
        
        .auth-brand-side { display: none; flex: 1; position: relative; overflow: hidden; background: #000000; }
        .brand-bg { position: absolute; inset: 0; background: radial-gradient(circle at 70% 50%, rgba(168, 85, 247, 0.15) 0%, #000000 60%); }
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
        
        .terms-text { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); font-size: 0.75rem; color: #666; text-align: center; width: 100%; }
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
            <div className="auth-form-card">

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                {!requires2FA ? (
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff', textAlign: 'center' }}>Log in with your email</h1>
                ) : (
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff', textAlign: 'center' }}>Two-Step Verification</h1>
                )}
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

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
