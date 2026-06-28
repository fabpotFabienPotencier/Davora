"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import '../globals.css';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided in the URL.');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz'}/api/verify-email?token=${token}`)
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          setStatus('success');
        } else {
          setStatus('error');
          // If already verified or bot pre-fetched it, make it friendly
          if (data.detail && data.detail.includes("Invalid or expired")) {
            setMessage("This link is invalid or has already been used. If you've already verified your email, you can simply log in.");
          } else {
            setMessage(data.detail || 'Verification failed.');
          }
        }
      })
      .catch(err => {
        setStatus('error');
        setMessage('A network error occurred while verifying your email.');
      });
  }, [token]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      width: '100vw',
      background: '#000000', 
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        background: '#161616',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '48px 32px',
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        
        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <Loader size={56} color="#10b981" className="animate-spin" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: '500', margin: 0 }}>Verifying Account</h1>
            <p style={{ color: '#aaaaaa', margin: 0, lineHeight: 1.5 }}>Please wait a moment while we verify your secure link.</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%' }}>
              <CheckCircle size={56} color="#10b981" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '500', margin: 0 }}>Email Verified!</h1>
            <p style={{ color: '#aaaaaa', margin: 0, lineHeight: 1.5 }}>Your email has been successfully verified. You now have full access to your account.</p>
            <button 
              onClick={() => { const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }}
              style={{ 
                marginTop: '12px',
                width: '100%',
                background: '#ffffff',
                color: '#000000',
                padding: '14px',
                borderRadius: '9999px',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Log in to your account
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '50%' }}>
              <XCircle size={56} color="#ef4444" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '500', margin: 0 }}>Verification Failed</h1>
            <p style={{ color: '#aaaaaa', margin: 0, lineHeight: 1.5 }}>{message}</p>
            <button 
              onClick={() => { const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }}
              style={{ 
                marginTop: '12px',
                width: '100%',
                background: 'transparent',
                color: '#ffffff',
                padding: '14px',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              Return to Login
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{background: '#000', width: '100vw', height: '100vh'}}></div>}>
      <VerifyContent />
    </Suspense>
  );
}
