import React from 'react';
import '../globals.css';

export default function Privacy() {
  return (
    <div style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#000000', width: '100%' }}>
      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '24px', fontWeight: '700' }}>Privacy Policy</h1>
      <p style={{ color: '#aaaaaa', marginBottom: '32px' }}>Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div style={{ lineHeight: '1.6', fontSize: '1.05rem', color: '#dddddd', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <p>
          At Davora, we take your privacy and data security seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform and use our services. This policy has been designed to comply strictly with the General Data Protection Regulation (GDPR).
        </p>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>1. Data We Collect</h2>
          <p>
            <strong>Personal Data:</strong> When you register, we collect your email address and securely hashed password.
          </p>
          <p>
            <strong>Usage Data:</strong> We store chat history, AI interactions, uploaded media (such as images for vision analysis), and metadata required to personalize your experience. In "Incognito" or "Private Mode," your data is temporarily stored in-memory and permanently purged after the session ends.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>2. How We Use Your Data</h2>
          <p>
            We use the information we collect primarily to:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Provide, operate, and maintain our AI platform</li>
            <li>Improve, personalize, and expand our cognitive engine's responses</li>
            <li>Process transactions and send related administrative information</li>
            <li>Enforce our Terms of Service and prevent fraudulent activities</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>3. Your GDPR Rights</h2>
          <p>
            If you are a resident of the European Economic Area (EEA), you have specific data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li><strong>The right to access:</strong> You can request copies of your personal data.</li>
            <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure ("Right to be forgotten"):</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
            <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
            <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>4. Data Security</h2>
          <p>
            We implement advanced encryption and strict access controls to secure your data. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security over the internet.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>5. Third-Party AI Inference Providers</h2>
          <p>
            We may utilize external inference engines (such as Groq) to process AI tasks. When this happens, data is transmitted securely and is processed according to the strict privacy guidelines of those enterprise API providers, ensuring no data is used to train third-party public models.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '12px' }}>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or wish to exercise your GDPR data rights, please contact us at privacy@davora.com.
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
