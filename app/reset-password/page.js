"use client";
import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import '../globals.css';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', background: '#000000', padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '48px 32px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '8px' }}>Invalid Link</h1>
          <p style={{ color: '#aaa', fontSize: '0.95rem' }}>No reset token was provided in the URL.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz') + '/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to reset password');
      
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
        
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%' }}>
                <CheckCircle size={48} color="#10b981" />
              </div>
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '8px' }}>Password Reset Complete</h2>
            <p style={{ color: '#aaaaaa', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '32px' }}>Your password has been successfully updated.</p>
            <button 
              onClick={() => { const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }}
              style={{ width: '100%', background: '#ffffff', color: '#000000', padding: '14px', borderRadius: '9999px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>Create New Password</h1>
            <p style={{ color: '#aaaaaa', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '32px' }}>
              Please enter your new password below.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {status === 'error' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {message}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#dddddd' }}>New Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '14px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: '#ffffff', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={status === 'loading'}
                style={{ width: '100%', background: '#ffffff', color: '#000000', padding: '14px', borderRadius: '9999px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8px', opacity: status === 'loading' ? 0.7 : 1 }}
              >
                {status === 'loading' ? <Loader size={20} className="animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{background: '#000', width: '100vw', height: '100vh'}}></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
