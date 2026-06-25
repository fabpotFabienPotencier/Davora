"use client";
import React, { useState, useEffect } from 'react';
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
  const router = useRouter();

  useEffect(() => {
    fetch('https://blatancy-barrack-spelling.ngrok-free.dev/api/config', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(cfg => { 
        if (cfg.logo_url) setLogoUrl(cfg.logo_url); 
        if (cfg.platform_name) setPlatformName(cfg.platform_name);
        if (cfg.terms_url) setTermsUrl(cfg.terms_url);
        if (cfg.privacy_url) setPrivacyUrl(cfg.privacy_url);
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
      const res = await fetch('https://blatancy-barrack-spelling.ngrok-free.dev/api/signup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .auth-container { display: flex; width: 100vw; height: 100vh; background: #000000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #ffffff; }
        .auth-form-side { flex: 1; display: flex; flex-direction: column; padding: 24px; position: relative; z-index: 10; background: #161616; border-right: 1px solid rgba(255,255,255,0.05); }
        .auth-form-side-header { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 12px 24px; position: absolute; top: 0; left: 0; }
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
                <h1 style={{ fontSize: '1.75rem', fontWeight: '500', color: '#ffffff', textAlign: 'center' }}>Create your account</h1>
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

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
                <button type="button" onClick={() => router.push('/login')} className="auth-btn-secondary">
                  Go back
                </button>
              </form>

              <p style={{ textAlign: 'center', color: '#aaaaaa', fontSize: '0.85rem', marginTop: '16px' }}>
                Already have an account? <a href="/login" className="auth-link">Log in</a>
              </p>
            </div>
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
