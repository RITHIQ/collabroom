// UI redesign deferred — complex 3-column layout, Phase 2.
// Do NOT restyle this file in the current redesign pass.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, Clock, Upload, FileText, DollarSign, Users, Send, Pin, ChevronLeft } from 'lucide-react';
import { campaignsAPI } from '../services/api';
import type { Campaign } from '../types';
import toast from 'react-hot-toast';

// Fallback campaign for room-001 (Monsoon Glow demo collab room)
const ROOM_001_CAMPAIGN: Campaign = {
  id: 'room-001',
  brandId: 'brand_glowco',
  brandName: 'GlowCo India',
  title: 'Monsoon Glow',
  description: 'Beauty and skincare campaign for the monsoon season featuring GlowCo\'s new hydration line.',
  type: 'sponsored_post',
  platforms: ['instagram', 'youtube'],
  contentFormats: ['reel', 'story'],
  startDate: new Date('2026-05-01').toISOString(),
  endDate: new Date('2026-07-15').toISOString(),
  budget: 350000,
  currency: 'INR',
  slotsTotal: 5,
  slotsFilled: 1,
  status: 'active',
  visibility: 'public',
  deliverables: ['2 Instagram Reels', '3 Stories', '1 YouTube Short'],
  niche: 'Beauty/Skincare',
  applicationsCount: 12,
  createdAt: new Date('2026-04-20').toISOString(),
};

const milestones = [
  { id: 'm1', title: 'Brief', dueDate: '2026-05-10', status: 'completed', paymentAmount: 0, assignedTo: 'Both' },
  { id: 'm2', title: 'Draft', dueDate: '2026-05-20', status: 'active', paymentAmount: 80000, assignedTo: 'Creator' },
  { id: 'm3', title: 'Final', dueDate: '2026-06-01', status: 'pending', paymentAmount: 120000, assignedTo: 'Creator' },
];

const comments = [
  { id: 1, author: 'Arjun Mehta', role: 'Creator', time: '2 hours ago', text: 'I\'ve submitted the first draft of the YouTube review. Please check the product demonstration section at 3:45 timestamp.', avatar: 'A' },
  { id: 2, author: 'Riya Shah', role: 'Brand (boAt)', time: '1 hour ago', text: 'Great work! The product demo looks fantastic. Could you add more emphasis on the noise cancellation feature in the next revision?', avatar: 'R' },
  { id: 3, author: 'Arjun Mehta', role: 'Creator', time: '30 mins ago', text: 'Sure! I\'ll update that section and resubmit by tomorrow morning.', avatar: 'A' },
];

export default function CampaignRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'milestones' | 'files'>('content');
  const [newComment, setNewComment] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'submitted' | 'in_review' | 'changes_requested' | 'approved'>('in_review');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // Try API first, fall back to built-in mock for room-001 / any missing id
    campaignsAPI
      .getById(id)
      .then((c) => { if (!cancelled && c) setCampaign(c); else if (!cancelled) setCampaign(ROOM_001_CAMPAIGN); })
      .catch(() => { if (!cancelled) setCampaign(id === 'room-001' ? ROOM_001_CAMPAIGN : ROOM_001_CAMPAIGN); });
    return () => { cancelled = true; };
  }, [id]);

  const statusConfig = {
    submitted: { label: 'Submitted', color: 'var(--color-info)', badge: 'badge-info' },
    in_review: { label: 'In Review', color: 'var(--color-warning)', badge: 'badge-warning' },
    changes_requested: { label: 'Changes Requested', color: 'var(--color-error)', badge: 'badge-error' },
    approved: { label: 'Approved ✓', color: 'var(--color-success)', badge: 'badge-success' },
  };

  if (!campaign) return (
    <div style={{ padding: 32 }}>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>Loading collab room…</p>
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10, marginBottom: 12 }} />)}
    </div>
  );

  return (
    <div className="campaign-room">
      {/* Left Panel */}
      <div className="campaign-room-panel" style={{ background: 'var(--color-bg-secondary)' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-card)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            color: 'var(--color-text-primary)',
            marginBottom: 16,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(108,62,244,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-card)';
          }}
          title="Go back"
        >
          <ChevronLeft size={18} />
        </button>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4, lineHeight: 1.3 }}>{campaign.title}</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{campaign.brandName}</p>
        </div>

        {/* Campaign Details */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Details</p>
          {[
            { label: 'Budget', value: `₹${(campaign.budget / 100000).toFixed(1)}L`, icon: <DollarSign size={13} /> },
            { label: 'Creators', value: `${campaign.slotsFilled}/${campaign.slotsTotal}`, icon: <Users size={13} /> },
            { label: 'End Date', value: new Date(campaign.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), icon: <Clock size={13} /> },
          ].map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{d.icon}{d.label}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{d.value}</span>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Milestones</p>
          <div data-testid="milestone-timeline" className="milestone-timeline">
            {milestones.map((m, i) => (
              <div key={m.id} style={{ position: 'relative', marginBottom: 20 }}>
                <div className={`milestone-dot ${m.status === 'completed' ? 'completed' : m.status === 'active' ? 'active' : ''}`}>
                  {m.status === 'completed' ? <CheckCircle size={12} color="#fff" /> : m.status === 'active' ? <Clock size={10} color="#fff" /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-border)', display: 'block' }} />}
                </div>
                <div style={{ paddingBottom: i < milestones.length - 1 ? 4 : 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 2, color: m.status === 'active' ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{m.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 3 }}>{new Date(m.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  {m.paymentAmount > 0 && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>₹{m.paymentAmount.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div style={{ marginTop: 24, padding: '14px', borderRadius: 12, background: 'rgba(108,62,244,0.08)', border: '1px solid rgba(108,62,244,0.2)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Escrow Status</p>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>₹80,000 Locked</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Releases on content approval</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="campaign-room-main">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
          {[
            { id: 'content', label: 'Content Review' },
            { id: 'milestones', label: 'Milestones' },
            { id: 'files', label: 'File Library' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{ padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent', transition: 'all 0.15s', marginBottom: -1 }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'content' && (
          <div>
            {/* Status Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${statusConfig[submissionStatus].badge}`}>{statusConfig[submissionStatus].label}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Version 2 · Submitted May 3, 2026</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setSubmissionStatus('changes_requested'); toast.error('Changes requested sent'); }}>Request Changes</button>
                <button className="btn btn-primary btn-sm" style={{ background: 'var(--color-success)' }} onClick={() => { setSubmissionStatus('approved'); toast.success('Content approved! Payment releasing...'); }}>
                  <CheckCircle size={13} /> Approve
                </button>
              </div>
            </div>

            {/* Content Preview */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: 24, background: 'var(--color-bg-secondary)' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <FileText size={16} color="var(--color-primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>boAt Airdopes 181 Review Draft</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>YouTube Video · 10 min 32 sec</p>
              </div>
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(108,62,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span style={{ fontSize: '2rem' }}>🎬</span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Video preview — click to review with annotation tools</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                  <Pin size={13} /> Review with Annotations
                </button>
              </div>
            </div>

            {/* Upload new */}
            <div style={{ border: '2px dashed var(--color-border)', borderRadius: 12, padding: '32px', textAlign: 'center', cursor: 'pointer', marginBottom: 24, transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
              <Upload size={24} color="var(--color-text-muted)" style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>Submit new version</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Images, videos, or documents up to 50MB</p>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div>
            {milestones.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card" style={{ padding: '20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.status === 'completed' ? 'var(--color-success)' : m.status === 'active' ? 'var(--color-primary)' : 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {m.status === 'completed' ? <CheckCircle size={16} color="#fff" /> : m.status === 'active' ? <Clock size={14} color="#fff" /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Due: {new Date(m.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · Assigned to: {m.assignedTo}</div>
                </div>
                {m.paymentAmount > 0 && <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{m.paymentAmount.toLocaleString()}</div><div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>on completion</div></div>}
                <span className={`badge ${m.status === 'completed' ? 'badge-success' : m.status === 'active' ? 'badge-primary' : 'badge-muted'}`} style={{ textTransform: 'capitalize' }}>{m.status}</span>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'files' && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📁</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>File Library</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>All shared files, assets, and contracts appear here.</p>
          </div>
        )}
      </div>

      {/* Right Panel — Activity */}
      <div className="campaign-room-panel" style={{ borderRight: 'none', borderLeft: '1px solid var(--color-border)' }}>
        <h4 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={16} /> Activity Feed
        </h4>
        <div data-testid="message-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {comments.map((c, i) => (
            <div key={c.id} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < comments.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.75rem', flexShrink: 0 }}>{c.avatar}</div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{c.author} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>· {c.role}</span></div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{c.time}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, paddingLeft: 40 }}>{c.text}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input data-testid="message-input" className="input" placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)}
            style={{ flex: 1, fontSize: '0.83rem', padding: '8px 12px' }}
            onKeyDown={e => { if (e.key === 'Enter' && newComment) { toast.success('Comment posted'); setNewComment(''); } }}
          />
          <button className="btn btn-primary btn-sm" onClick={() => { if (newComment) { toast.success('Comment posted'); setNewComment(''); } }}>
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
