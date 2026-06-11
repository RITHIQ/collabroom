import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: 32, display: 'inline-flex' }}>
        <ArrowLeft size={14} /> Back
      </Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>Last updated: May 27, 2026</p>
      {[
        { title: '1. Information We Collect', body: 'We collect information you provide directly to us, such as your email address, profile information, and content you submit. We also collect usage data to improve the platform.' },
        { title: '2. How We Use Your Information', body: 'We use your information to provide and improve the ColabRoom platform, to communicate with you, to process transactions, and to ensure platform security.' },
        { title: '3. Information Sharing', body: 'We share creator profile information with brands for campaign matching. We do not sell your personal data to third parties. All payments are processed securely through our escrow system.' },
        { title: '4. Data Security', body: 'We implement appropriate security measures to protect your personal information. Your authentication is handled via secure OTP — we do not store passwords.' },
        { title: '5. Contact Us', body: 'For privacy concerns, contact us at privacy@colabroom.app. For account deletion requests, email support@colabroom.app.' },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>{s.title}</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{s.body}</p>
        </div>
      ))}
    </div>
  );
}
