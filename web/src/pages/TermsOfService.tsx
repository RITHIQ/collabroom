import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: 32, display: 'inline-flex' }}>
        <ArrowLeft size={14} /> Back
      </Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>Last updated: May 27, 2026</p>
      {[
        { title: '1. Acceptance of Terms', body: 'By accessing ColabRoom, you agree to these Terms of Service. If you disagree, please do not use the platform.' },
        { title: '2. User Accounts', body: 'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account. Accounts are non-transferable.' },
        { title: '3. Creator & Brand Conduct', body: 'Creators must deliver the agreed deliverables on time. Brands must fund escrow before a campaign begins. Fraud, harassment, or misrepresentation will result in account termination.' },
        { title: '4. Payments & Escrow', body: 'ColabRoom holds campaign payments in escrow until content is approved. Withdrawals are processed within 3-5 business days. ColabRoom charges a platform fee on transactions.' },
        { title: '5. Content Rights', body: 'Creators retain ownership of their content. By posting on ColabRoom, you grant ColabRoom a license to display your content on the platform.' },
        { title: '6. Termination', body: 'ColabRoom may suspend or terminate accounts that violate these terms. Users may delete their accounts by contacting support@colabroom.app.' },
        { title: '7. Contact', body: 'For legal matters: legal@colabroom.app. For support: support@colabroom.app.' },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>{s.title}</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{s.body}</p>
        </div>
      ))}
    </div>
  );
}
