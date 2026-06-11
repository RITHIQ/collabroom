import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, ArrowLeft, Zap } from 'lucide-react';
import { useAppSelector } from '../store';
import { supabase } from '../services/supabaseClient';
import toast from 'react-hot-toast';

const steps = ['Connect Socials', 'Set Pricing', 'Add Portfolio', 'Go Live'];
const brandSteps = ['Brand Voice', 'Campaign Budget', 'Creator Preferences', 'Add Team'];

const platforms = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', icon: '📸' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', icon: '🎬' },
  { id: 'tiktok', label: 'TikTok', color: '#000000', icon: '🎵' },
  { id: 'twitter', label: 'Twitter/X', color: '#1DA1F2', icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', icon: '💼' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);
  const isCreator = user?.role === 'creator';
  const allSteps = isCreator ? steps : brandSteps;
  const [step, setStep] = useState(0);
  const [connected, setConnected] = useState<string[]>([]);
  const [pricing, setPricing] = useState({ story: '', feedPost: '', reel: '', youtube: '' });
  const [niches, setNiches] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState({ min: '50000', max: '500000' });

  const nicheOptions = ['Beauty', 'Tech', 'Fitness', 'Food', 'Travel', 'Gaming', 'Finance', 'Fashion', 'Education', 'Lifestyle'];

  const progress = ((step + 1) / allSteps.length) * 100;

  useEffect(() => {
    const loadConnections = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('social_connections')
        .select('provider')
        .eq('user_id', user.id);
      if (error) return;
      setConnected((data ?? []).map(d => d.provider));
    };
    loadConnections();
  }, [user?.id]);

  const connectPlatform = async (provider: string) => {
    if (!user?.id) return;
    if (provider !== 'youtube' && provider !== 'instagram') {
      toast('This provider is not supported yet in the free tier demo.');
      return;
    }

    const handle = window.prompt(
      provider === 'youtube'
        ? 'Enter your YouTube channel ID (recommended) or channel handle (e.g. @mychannel)'
        : 'Enter your Instagram handle (e.g. myhandle)'
    )?.trim();

    if (!handle) return;

    const payload =
      provider === 'youtube'
        ? { user_id: user.id, provider, provider_user_id: handle, handle }
        : { user_id: user.id, provider, handle };

    const { error } = await supabase.from('social_connections').upsert(payload, { onConflict: 'user_id,provider' });
    if (error) {
      toast.error(error.message);
      return;
    }
    setConnected(prev => (prev.includes(provider) ? prev : [...prev, provider]));
    toast.success(`${provider === 'youtube' ? 'YouTube' : 'Instagram'} connected`);
  };

  const disconnectPlatform = async (provider: string) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider);
    if (error) {
      toast.error(error.message);
      return;
    }
    setConnected(prev => prev.filter(p => p !== provider));
    toast.success('Disconnected');
  };

  const handleSkip = () => navigate('/dashboard');
  const handleNext = () => {
    if (step < allSteps.length - 1) setStep(s => s + 1);
    else navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6C3EF4, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: 'Sora', fontWeight: 700, color: 'var(--color-text-primary)' }}>ColabRoom</span>
          </div>
          <button onClick={handleSkip} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.88rem' }}>
            Skip for now
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Step {step + 1} of {allSteps.length}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>{Math.round(progress)}% complete</span>
          </div>
          <div className="progress-bar">
            <motion.div className="progress-bar-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {allSteps.map((s, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                  background: i < step ? 'var(--color-success)' : i === step ? 'var(--color-primary)' : 'var(--color-border)',
                  color: i <= step ? '#fff' : 'var(--color-text-muted)',
                  transition: 'all 0.3s',
                }}>
                  {i < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: '0.65rem', color: i === step ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: i === step ? 600 : 400, textAlign: 'center' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <div className="card" style={{ padding: 36 }}>
              {/* Creator Steps */}
              {isCreator && step === 0 && (
                <>
                  <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Connect your social accounts</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: '0.92rem' }}>This helps brands see your real audience data and follower count.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {platforms.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${connected.includes(p.id) ? 'var(--color-success)' : 'var(--color-border)'}`, background: connected.includes(p.id) ? 'rgba(16,185,129,0.05)' : 'var(--color-bg-secondary)', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '1.4rem' }}>{p.icon}</span>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{p.label}</span>
                        </div>
                        <button
                          onClick={() => (connected.includes(p.id) ? disconnectPlatform(p.id) : connectPlatform(p.id))}
                          className={`btn btn-sm ${connected.includes(p.id) ? '' : 'btn-primary'}`}
                          style={connected.includes(p.id) ? { background: 'var(--color-success)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 } : {}}
                        >
                          {connected.includes(p.id) ? <><CheckCircle size={14} /> Connected</> : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {isCreator && step === 1 && (
                <>
                  <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Set your pricing tiers</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: '0.92rem' }}>Help brands understand your rates. You can always change these later.</p>
                  {[
                    { key: 'story', label: 'Story Post', emoji: '📱' },
                    { key: 'feedPost', label: 'Feed Post / Photo', emoji: '🖼️' },
                    { key: 'reel', label: 'Reel / Short Video', emoji: '🎬' },
                    { key: 'youtube', label: 'YouTube Integration', emoji: '▶️' },
                  ].map(({ key, label, emoji }) => (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <label className="label">{emoji} {label} (₹)</label>
                      <input className="input" type="number" placeholder="e.g. 15000" value={pricing[key as keyof typeof pricing]} onChange={e => setPricing(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  ))}
                </>
              )}

              {isCreator && step === 2 && (
                <>
                  <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Add portfolio samples</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: '0.92rem' }}>Upload your best work to attract the right brands.</p>
                  <div style={{ border: '2px dashed var(--color-border)', borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📁</div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Drop files here or click to browse</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Images, videos up to 50MB each</p>
                  </div>
                </>
              )}

              {isCreator && step === 3 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: 20 }}>🚀</div>
                  <h2 style={{ fontWeight: 800, marginBottom: 12 }}>You're all set!</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, lineHeight: 1.7 }}>
                    Your profile is live. Brands can now discover you through ColabRoom's AI matching engine.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 9999, background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.9rem' }}>
                    <CheckCircle size={18} /> Profile Published
                  </div>
                </div>
              )}

              {/* Brand Steps */}
              {!isCreator && step === 0 && (
                <>
                  <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Describe your brand voice</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: '0.92rem' }}>This helps our AI match you with creators who align with your identity.</p>
                  <div style={{ marginBottom: 16 }}><label className="label">Brand tone</label>
                    <select className="input" style={{ cursor: 'pointer' }}>
                      {['Professional & Authoritative', 'Friendly & Conversational', 'Bold & Energetic', 'Luxurious & Premium', 'Playful & Humorous', 'Educational & Informative'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Brand description (for creators)</label>
                    <textarea className="input" rows={4} placeholder="Tell creators what your brand stands for, your values, and what makes your products special..." style={{ resize: 'vertical' }} />
                  </div>
                </>
              )}

              {!isCreator && step === 1 && (
                <>
                  <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Set campaign budget ranges</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: '0.92rem' }}>This helps filter creators who fit your budget.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div><label className="label">Minimum budget per campaign (₹)</label><input className="input" type="number" value={budgetRange.min} onChange={e => setBudgetRange(b => ({ ...b, min: e.target.value }))} /></div>
                    <div><label className="label">Maximum budget per campaign (₹)</label><input className="input" type="number" value={budgetRange.max} onChange={e => setBudgetRange(b => ({ ...b, max: e.target.value }))} /></div>
                  </div>
                </>
              )}

              {!isCreator && step === 2 && (
                <>
                  <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Select preferred creator niches</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: '0.92rem' }}>Choose the content categories most relevant to your brand.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {nicheOptions.map(n => (
                      <button key={n} onClick={() => setNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])}
                        className={`niche-chip ${niches.includes(n) ? 'active' : ''}`}>
                        {niches.includes(n) && <CheckCircle size={11} />} {n}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {!isCreator && step === 3 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: 20 }}>🎉</div>
                  <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Brand profile ready!</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, lineHeight: 1.7 }}>Start discovering creators and launching your first campaign today.</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 9999, background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.9rem' }}>
                    <CheckCircle size={18} /> Brand Published
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <button onClick={() => step > 0 && setStep(s => s - 1)} className="btn btn-secondary" style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
            <ArrowLeft size={15} /> Back
          </button>
          <button onClick={handleNext} className="btn btn-primary">
            {step === allSteps.length - 1 ? 'Go to Dashboard' : 'Continue'} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
