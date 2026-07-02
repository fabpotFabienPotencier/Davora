"use client";
import React, { useState } from 'react';
import { ArrowLeft, Loader, Mail } from 'lucide-react';
import '../globals.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to request reset');
      
      setStatus('success');
      setMessage(data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', background: '#000000', padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '48px 32px', width: '100%', maxWidth: '400px' }}>
        
        <button onClick={() => window.history.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaaaaa', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '32px', fontSize: '0.9rem', padding: 0 }}>
          <ArrowLeft size={16} /> Back to login
        </button>

        <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>Reset Password</h1>
        <p style={{ color: '#aaaaaa', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '32px' }}>
          Enter your email address and we'll send you a link to securely reset your password.
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%' }}>
                <Mail size={32} color="#10b981" />
              </div>
            </div>
            <h2 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '8px' }}>Check your email</h2>
            <p style={{ color: '#aaaaaa', fontSize: '0.95rem', lineHeight: '1.5' }}>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {status === 'error' && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                {message}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#dddddd' }}>Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                style={{ width: '100%', padding: '14px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: '#ffffff', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={status === 'loading'}
              style={{ width: '100%', background: '#ffffff', color: '#000000', padding: '14px', borderRadius: '9999px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8px', opacity: status === 'loading' ? 0.7 : 1 }}
            >
              {status === 'loading' ? <Loader size={20} className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
