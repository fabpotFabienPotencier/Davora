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
      setMessage('No verification token provided.');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.davora.xyz'}/api/verify-email?token=${token}`)
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.detail || 'Verification failed.');
        }
      })
      .catch(err => {
        setStatus('error');
        setMessage('Network error occurred.');
      });
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-form-side" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-form-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          
          {status === 'loading' && (
            <>
              <Loader size={48} color="#10b981" className="animate-spin" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff' }}>Verifying...</h1>
              <p style={{ color: '#aaaaaa' }}>Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle size={48} color="#10b981" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff' }}>Email Verified!</h1>
              <p style={{ color: '#aaaaaa' }}>Your email has been successfully verified. You can now log in to your account.</p>
              <button 
                className="auth-btn" 
                onClick={() => { const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }}
                style={{ marginTop: '12px' }}
              >
                Go to Login
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle size={48} color="#ef4444" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff' }}>Verification Failed</h1>
              <p style={{ color: '#aaaaaa' }}>{message}</p>
              <button 
                className="auth-btn-secondary" 
                onClick={() => { const baseDomain = window.location.host.replace(/^(chat\.|login\.|signup\.|www\.)/, ''); window.location.href = `${window.location.protocol}//login.${baseDomain}`; }}
                style={{ marginTop: '12px' }}
              >
                Go to Login
              </button>
            </>
          )}
          
        </div>
      </div>
      <div className="auth-brand-side">
        <div className="brand-bg"></div>
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
