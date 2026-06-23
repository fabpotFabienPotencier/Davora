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
    <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', textAlign: 'center' }}>
          {!requires2FA ? (
            <>
              <div style={{ background: '#a855f7', padding: '12px', borderRadius: '16px', marginBottom: '16px' }}>
                <Bot size={32} color="white" />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Welcome back</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Log in to access Davora</p>
            </>
          ) : (
            <>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                <Shield size={32} color="#a855f7" />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Two-Step Verification</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px', lineHeight: '1.5' }}>
                Enter the authentication code provided by your authenticator app.
              </p>
            </>
          )}
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

        {!requires2FA ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            <button type="submit" disabled={isLoading} style={{ background: '#a855f7', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px', transition: 'background 0.2s' }}>
              {isLoading ? 'Logging in...' : <>Continue <ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <input
                type="text"
                placeholder="000000"
                maxLength="6"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                required
                autoFocus
                style={{ width: '100%', padding: '16px', background: 'var(--bg-primary)', border: '2px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', letterSpacing: '0.75em', textAlign: 'center', fontSize: '1.5rem', fontWeight: '600', fontFamily: 'monospace', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
            <button type="submit" disabled={isLoading || twoFactorCode.length !== 6} style={{ background: '#a855f7', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: (isLoading || twoFactorCode.length !== 6) ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: (isLoading || twoFactorCode.length !== 6) ? 0.7 : 1, transition: 'all 0.2s' }}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button type="button" onClick={() => { setRequires2FA(false); setTwoFactorCode(""); }} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              Back to login
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '24px' }}>
          Don't have an account? <a href="/signup" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: '500' }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}
