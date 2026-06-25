import React from 'react';
import '../globals.css';

export default function Terms() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '24px', fontWeight: '700' }}>Terms of Service</h1>
      <p style={{ color: '#aaaaaa', marginBottom: '32px' }}>Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div style={{ lineHeight: '1.6', fontSize: '1.05rem', color: '#dddddd', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <p>
          Welcome to Davora ("Company", "we", "our", "us"). By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
        </p>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>1. Acceptance of Terms</h2>
          <p>
            By creating an account and checking the consent box during registration, you explicitly agree to these Terms of Service and our Privacy Policy. Our services are intended for users who are at least 18 years old or the age of legal majority in their jurisdiction.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>2. Use of Services & AI Capabilities</h2>
          <p>
            Davora provides an advanced cognitive engine and artificial intelligence tools. You agree not to use the services for any unlawful or unauthorized purpose. The AI-generated content is provided "as is" and we make no guarantees regarding its accuracy, reliability, or suitability for any specific purpose. You are solely responsible for reviewing and verifying any AI-generated output before relying on it.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>3. User Data and Privacy (GDPR Compliance)</h2>
          <p>
            We process your personal data in strict compliance with the General Data Protection Regulation (GDPR). By using our services, you acknowledge that you have read our Privacy Policy, which details how we collect, process, and protect your personal data, as well as your rights regarding data access, rectification, and erasure.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>4. Intellectual Property</h2>
          <p>
            The platform, including its original content, features, and functionality, are owned by Davora and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>5. Limitation of Liability</h2>
          <p>
            In no event shall Davora, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>6. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>
        </section>
      </div>
    </div>
  );
}
