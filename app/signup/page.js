"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight, Lock, Mail } from 'lucide-react';
import '../globals.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('https://blatancy-barrack-spelling.ngrok-free.dev/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Signup failed');
      }

      const data = await res.json();
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ background: '#10b981', padding: '12px', borderRadius: '16px', marginBottom: '16px' }}>
            <Bot size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Create an account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Join Davora to start chatting</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
          <button type="submit" disabled={isLoading} style={{ background: '#10b981', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px', transition: 'background 0.2s' }}>
            {isLoading ? 'Creating account...' : <>Sign Up <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '24px' }}>
          Already have an account? <a href="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '500' }}>Log in</a>
        </p>
      </div>
    </div>
  );
}
