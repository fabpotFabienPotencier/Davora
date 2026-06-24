"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight, Lock, Mail, Shield } from 'lucide-react';
import '../globals.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('https://blatancy-barrack-spelling.ngrok-free.dev/api/login', {
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
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .auth-container { display: flex; width: 100vw; height: 100vh; background: var(--bg-primary); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .auth-form-side { flex: 1; display: flex; justify-content: center; align-items: center; padding: 24px; position: relative; z-index: 10; background: var(--bg-primary); }
        .auth-form-card { width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 32px; }
        .auth-brand-side { display: none; flex: 1.2; position: relative; overflow: hidden; background: #000; border-left: 1px solid rgba(255,255,255,0.05); }
        .brand-bg { position: absolute; inset: 0; background: radial-gradient(circle at center, #1a1a2e 0%, #000000 100%); opacity: 0.8; }
        .brand-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50vw; height: 50vw; background: #a855f7; filter: blur(150px); opacity: 0.15; border-radius: 50%; animation: pulse 8s ease-in-out infinite alternate; pointer-events: none; }
        .brand-content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; user-select: none; }
        .auth-input-wrapper { position: relative; width: 100%; }
        .auth-input { width: 100%; padding: 16px 16px 16px 48px; background: transparent; border: 1px solid var(--border-color); border-radius: 12px; color: var(--text-primary); outline: none; font-size: 1rem; transition: border-color 0.2s, box-shadow 0.2s; }
        .auth-input:focus { border-color: #a855f7; box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1); }
        .auth-input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); pointer-events: none; }
        .auth-btn { width: 100%; background: var(--text-primary); color: var(--bg-primary); padding: 16px; border-radius: 12px; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: opacity 0.2s, transform 0.1s; }
        .auth-btn:hover:not(:disabled) { opacity: 0.9; }
        .auth-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-link { color: #a855f7; text-decoration: none; font-weight: 500; transition: opacity 0.2s; }
        .auth-link:hover { opacity: 0.8; }
        @keyframes pulse { 0% { opacity: 0.1; transform: translate(-50%, -50%) scale(0.9); } 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.1); } }
        @media (min-width: 1024px) {
          .auth-brand-side { display: block; }
        }
      `}} />
      <div className="auth-container">
        <div className="auth-form-side">
          <div className="auth-form-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
              {!requires2FA ? (
                <>
                  <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Sign in</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Enter your details to proceed to Davora.</p>
                </>
              ) : (
                <>
                  <div style={{ alignSelf: 'flex-start', background: 'rgba(168, 85, 247, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '8px' }}>
                    <Shield size={24} color="#a855f7" />
                  </div>
                  <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Verify</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.5' }}>
                    Enter the authentication code provided by your app.
                  </p>
                </>
              )}
            </div>

            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '14px', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

            {!requires2FA ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="auth-input-wrapper">
                    <Mail size={20} className="auth-input-icon" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="auth-input"
                    />
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={20} className="auth-input-icon" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="auth-input"
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="auth-btn">
                  {isLoading ? 'Authenticating...' : <>Continue <ArrowRight size={18} /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    autoFocus
                    style={{ width: '100%', padding: '20px', background: 'transparent', border: '2px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-primary)', outline: 'none', letterSpacing: '0.75em', textAlign: 'center', fontSize: '1.75rem', fontWeight: '600', fontFamily: 'monospace', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
                <button type="submit" disabled={isLoading || twoFactorCode.length !== 6} className="auth-btn" style={{ opacity: (isLoading || twoFactorCode.length !== 6) ? 0.5 : 1 }}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button type="button" onClick={() => { setRequires2FA(false); setTwoFactorCode(""); }} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s', padding: '8px 0' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                  Cancel and go back
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '16px' }}>
              Don't have an account? <a href="/signup" className="auth-link">Sign up</a>
            </p>
          </div>
        </div>
        
        <div className="auth-brand-side">
          <div className="brand-bg"></div>
          <div className="brand-glow"></div>
          <div className="brand-content">
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '24px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', marginBottom: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <Bot size={80} strokeWidth={1} color="#fff" />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '400', letterSpacing: '8px', margin: 0, paddingLeft: '8px' }}>DAVORA</h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginTop: '16px', textTransform: 'uppercase' }}>Advanced Cognitive Engine</p>
          </div>
        </div>
      </div>
    </>
  );
}
