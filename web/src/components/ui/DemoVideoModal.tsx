import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

interface DemoVideoModalProps {
  open: boolean;
  onClose: () => void;
}

// Demo "slides" — animated feature walkthrough since we have no actual video file
const demoSlides = [
  {
    title: 'AI-Powered Creator Discovery',
    subtitle: 'Find the perfect match in seconds',
    desc: 'Our cosine-similarity engine analyses 50,000+ creator profiles across niche, audience quality, engagement rate and past campaign ROI — surfacing the top 5 creators tailored to your brief.',
    color: '#6C3EF4',
    accent: '#A78BFA',
    icon: '🔍',
    mockup: 'discover',
  },
  {
    title: 'AI Brief Generator',
    subtitle: '3 sentences → full campaign brief',
    desc: 'Describe your product in plain English. ColabRoom AI fills in deliverables, timelines, hashtags, do\'s & don\'ts and tone of voice — ready to send to creators instantly.',
    color: '#8B5CF6',
    accent: '#C4B5FD',
    icon: '✨',
    mockup: 'brief',
  },
  {
    title: 'Smart Contract & E-Sign',
    subtitle: 'Legally sound. Signed in one click.',
    desc: 'Auto-generated contracts with milestones, payment schedules and IP clauses. Both parties sign digitally — PDF archived instantly. No lawyers needed.',
    color: '#EC4899',
    accent: '#F9A8D4',
    icon: '📄',
    mockup: 'contract',
  },
  {
    title: 'Campaign Room',
    subtitle: 'Your collaboration workspace',
    desc: 'Submit drafts, annotate frames, track milestones and chat in one unified room. Real-time updates via Socket.io keep everyone in sync.',
    color: '#F59E0B',
    accent: '#FCD34D',
    icon: '🚀',
    mockup: 'campaign',
  },
  {
    title: 'Escrow Payments & Wallet',
    subtitle: 'Creators paid in 24 hours',
    desc: 'Funds are held securely until content is approved. Creators withdraw via UPI or bank transfer. Full transaction history and tax-ready reports.',
    color: '#10B981',
    accent: '#6EE7B7',
    icon: '💰',
    mockup: 'wallet',
  },
];

const MockupDiscover = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {[
      { name: 'Priya Sharma', niche: 'Lifestyle', score: 97, followers: '285K' },
      { name: 'Aisha Bose', niche: 'Travel', score: 94, followers: '425K' },
      { name: 'Kabir Mehta', niche: 'Tech', score: 91, followers: '198K' },
    ].map((c, i) => (
      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
        style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, #6C3EF4, #EC4899)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{c.name[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{c.niche} · {c.followers}</div>
        </div>
        <div style={{ background: 'rgba(108,62,244,0.3)', color: '#A78BFA', padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>AI Score {c.score}</div>
      </motion.div>
    ))}
  </div>
);

const MockupBrief = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
      style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(139,92,246,0.4)' }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginBottom: 4 }}>YOUR INPUT</div>
      <div style={{ color: '#fff', fontSize: '0.8rem', lineHeight: 1.5 }}>"Launch a skincare serum for Gen Z women. Focus on glow & hydration. Festival season."</div>
    </motion.div>
    {['🎯 Target Audience', '📋 3 Deliverables', '📅 14-day Timeline', '💡 5 Content Angles', '#️⃣ 8 Hashtags'].map((item, i) => (
      <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }}
        style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '7px 12px', color: '#C4B5FD', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}>
        {item}
        <motion.span initial={{ width: 0 }} animate={{ width: `${60 + i * 8}%` }} transition={{ delay: 0.5 + i * 0.12, duration: 0.5 }}
          style={{ display: 'block', height: 3, background: 'rgba(167,139,250,0.3)', borderRadius: 99, marginLeft: 'auto' }} />
      </motion.div>
    ))}
  </div>
);

const MockupContract = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(236,72,153,0.3)' }}>
      <div style={{ color: '#F9A8D4', fontSize: '0.72rem', fontWeight: 600, marginBottom: 6 }}>CONTRACT · MAMAEARTH × PRIYA SHARMA</div>
      {['Campaign Deliverables', 'Payment Schedule: ₹65,000', 'Content Rights & IP Clause', 'Revision Policy'].map((row, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>
          <span style={{ color: '#EC4899' }}>✓</span> {row}
        </div>
      ))}
    </motion.div>
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
      style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(108,62,244,0.2))', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(236,72,153,0.4)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: '1.2rem' }}>✍️</span>
      <div>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem' }}>Signed by both parties</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>PDF saved · Legally binding</div>
      </div>
      <div style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.2)', color: '#6EE7B7', padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>EXECUTED</div>
    </motion.div>
  </div>
);

const MockupCampaign = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {[
      { label: 'Brief Approved', done: true },
      { label: 'Draft 1 Submitted', done: true },
      { label: 'Feedback Round', done: true },
      { label: 'Final Approved', done: false, active: true },
      { label: 'Payment Released', done: false },
    ].map((m, i) => (
      <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.done ? '#F59E0B' : m.active ? '#6C3EF4' : 'rgba(255,255,255,0.1)', border: `2px solid ${m.done ? '#F59E0B' : m.active ? '#A78BFA' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: m.active ? '0 0 12px rgba(108,62,244,0.6)' : 'none' }}>
          {m.done && <span style={{ fontSize: '0.6rem', color: '#fff' }}>✓</span>}
          {m.active && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
        </div>
        <span style={{ fontSize: '0.8rem', color: m.done || m.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)', fontWeight: m.active ? 600 : 400 }}>{m.label}</span>
        {m.done && <div style={{ marginLeft: 'auto', color: '#FCD34D', fontSize: '0.68rem' }}>✓ Done</div>}
        {m.active && <div style={{ marginLeft: 'auto', color: '#A78BFA', fontSize: '0.68rem', fontWeight: 600 }}>In Progress</div>}
      </motion.div>
    ))}
  </div>
);

const MockupWallet = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,78,59,0.3))', borderRadius: 12, padding: '14px', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', marginBottom: 4 }}>TOTAL BALANCE</div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
        style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#6EE7B7' }}>₹1,24,500</motion.div>
    </motion.div>
    {[
      { brand: 'Mamaearth', amount: '+₹65,000', time: '2h ago', positive: true },
      { brand: 'boAt Lifestyle', amount: '+₹45,000', time: 'Yesterday', positive: true },
      { brand: 'Withdrawal', amount: '-₹30,000', time: '3 days ago', positive: false },
    ].map((tx, i) => (
      <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{tx.positive ? '💸' : '🏦'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', fontWeight: 500 }}>{tx.brand}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }}>{tx.time}</div>
        </div>
        <div style={{ color: tx.positive ? '#6EE7B7' : '#F87171', fontWeight: 700, fontSize: '0.82rem' }}>{tx.amount}</div>
      </motion.div>
    ))}
  </div>
);

const mockupMap: Record<string, ReactNode> = {
  discover: <MockupDiscover />,
  brief: <MockupBrief />,
  contract: <MockupContract />,
  campaign: <MockupCampaign />,
  wallet: <MockupWallet />,
};

export default function DemoVideoModal({ open, onClose }: DemoVideoModalProps) {
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const SLIDE_DURATION = 5000; // ms per slide

  const current = demoSlides[slide];

  // Auto-advance slides
  useEffect(() => {
    if (!open || !playing) return;
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= SLIDE_DURATION) {
        setSlide(s => (s + 1) % demoSlides.length);
        setProgress(0);
        clearInterval(intervalRef.current!);
      }
    }, 50);
    return () => clearInterval(intervalRef.current!);
  }, [open, slide, playing]);

  // Reset on open
  useEffect(() => {
    if (open) { setSlide(0); setProgress(0); setPlaying(true); }
  }, [open]);

  const goTo = (idx: number) => { setSlide(idx); setProgress(0); };
  const prev = () => goTo((slide - 1 + demoSlides.length) % demoSlides.length);
  const next = () => goTo((slide + 1) % demoSlides.length);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)', zIndex: 1000, cursor: 'pointer' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'fixed', inset: 0, margin: 'auto',
              width: 'min(900px, 96vw)', height: 'min(560px, 90vh)',
              zIndex: 1001, display: 'flex', flexDirection: 'column',
              borderRadius: 20, overflow: 'hidden',
              background: '#0D0D18',
              boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 12, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57','#FFBD2E','#28C840'].map(c => (
                  <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.85 }} />
                ))}
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontFamily: 'Sora, sans-serif' }}>
                  ColabRoom · Platform Demo
                </span>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
              {/* Left — Text */}
              <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={slide}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{current.icon}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: current.accent, marginBottom: 10, textTransform: 'uppercase' }}>
                      {current.subtitle}
                    </div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 14, lineHeight: 1.25 }}>
                      {current.title}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                      {current.desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right — Mockup */}
              <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={slide}
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35 }}>
                    {/* Mock browser chrome */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 20, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem' }}>app.colabroom.io</span>
                        </div>
                      </div>
                      <div style={{ padding: '14px 12px' }}>
                        {mockupMap[current.mockup]}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Controls */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              {/* Playback */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPlaying(p => !p)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}>
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button onClick={() => setMuted(m => !m)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}>
                  {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>

              {/* Progress dots + bar */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Slide progress bar */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.05 }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${current.color}, ${current.accent})`, borderRadius: 99 }} />
                </div>
                {/* Dots */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  {demoSlides.map((s, i) => (
                    <button key={i} onClick={() => goTo(i)}
                      style={{ width: slide === i ? 20 : 6, height: 6, borderRadius: 99, background: slide === i ? s.color : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
                  ))}
                </div>
              </div>

              {/* Nav */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={prev} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}><ChevronLeft size={14} /></button>
                <button onClick={next} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}><ChevronRight size={14} /></button>
              </div>

              <button style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
                <Maximize2 size={13} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
