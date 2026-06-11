import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Download, Zap, ChevronLeft } from 'lucide-react';
import { aiAPI } from '../services/api';
import type { AIBriefInput, CampaignGoal } from '../types';
import toast from 'react-hot-toast';

const goals: { value: CampaignGoal; label: string; emoji: string }[] = [
  { value: 'awareness', label: 'Brand Awareness', emoji: '📢' },
  { value: 'sales', label: 'Drive Sales', emoji: '💰' },
  { value: 'app_downloads', label: 'App Downloads', emoji: '📱' },
  { value: 'event_promotion', label: 'Event Promotion', emoji: '🎉' },
  { value: 'product_launch', label: 'Product Launch', emoji: '🚀' },
  { value: 'brand_recall', label: 'Brand Recall', emoji: '🧠' },
];

export default function AIBrief() {
  const navigate = useNavigate();
  const [form, setForm] = useState<AIBriefInput>({ productDescription: '', campaignGoal: 'awareness', targetAudience: '' });
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [done, setDone] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productDescription || !form.targetAudience) { toast.error('Please fill all fields'); return; }
    setGenerating(true); setOutput(''); setDone(false);
    try {
      await aiAPI.generateBrief(
        { productDescription: form.productDescription, campaignGoal: form.campaignGoal, targetAudience: form.targetAudience },
        (chunk) => {
          setOutput(prev => {
            const next = prev + chunk;
            setTimeout(() => outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' }), 10);
            return next;
          });
        }
      );
      setDone(true);
    } catch {
      toast.error('Failed to generate brief. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const formatOutput = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={i} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginTop: 16, marginBottom: 6 }}>{line.replace(/\*\*/g, '')}</h4>;
      }
      if (line.startsWith('• ')) {
        return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>•</span>
          <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{line.slice(2)}</span>
        </div>;
      }
      if (line.trim()) return <p key={i} style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 4 }}>{line}</p>;
      return <div key={i} style={{ height: 6 }} />;
    });
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 10,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            color: 'var(--color-text-primary)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(108,62,244,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-secondary)';
          }}
          title="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6C3EF4, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: 1 }}>Colab AI Brief Generator</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: 2 }}>Powered by GPT-4 — Generate professional campaign briefs in seconds</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: output ? '380px 1fr' : '1fr', gap: 24, transition: 'all 0.4s' }}>
        {/* Input Form */}
        <div>
          <form onSubmit={handleGenerate}>
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Tell AI about your campaign</h3>

              <div style={{ marginBottom: 18 }}>
                <label className="label">Product or Service Description *</label>
                <textarea className="input" rows={4} placeholder="Describe your product in 3-5 sentences. What does it do? Who is it for? What makes it unique?"
                  value={form.productDescription} onChange={e => setForm(f => ({ ...f, productDescription: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: 100 }} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="label">Campaign Goal *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {goals.map(g => (
                    <button key={g.value} type="button" onClick={() => setForm(f => ({ ...f, campaignGoal: g.value }))}
                      style={{ padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${form.campaignGoal === g.value ? 'var(--color-primary)' : 'var(--color-border)'}`, background: form.campaignGoal === g.value ? 'rgba(108,62,244,0.08)' : 'var(--color-bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s', fontSize: '0.82rem', fontWeight: form.campaignGoal === g.value ? 700 : 500, color: form.campaignGoal === g.value ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                      <span>{g.emoji}</span> {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="label">Target Audience Description *</label>
                <textarea className="input" rows={3} placeholder="Describe your ideal customer. Age range, interests, location, pain points, behaviour..."
                  value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>

              <button type="submit" className="btn btn-primary" disabled={generating} style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '12px' }}>
                {generating ? (
                  <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RefreshCw size={16} /></motion.span> Colab AI is thinking...</>
                ) : (
                  <><Zap size={16} /> Generate Brief</>
                )}
              </button>
            </div>
          </form>

          {done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 20 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>✨ Additional AI Tools</h4>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }} onClick={() => toast.success('Pricing analysis coming soon!')}>
                💰 Get Pricing Advice
              </button>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => toast.success('Posting optimizer coming soon!')}>
                📅 Optimize Posting Times
              </button>
            </motion.div>
          )}
        </div>

        {/* Output */}
        <AnimatePresence>
          {(output || generating) && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 200px)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={15} color="var(--color-primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI-Generated Campaign Brief</span>
                  {generating && <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>Generating...</span>}
                  {done && <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Complete</span>}
                </div>
                {done && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setOutput(''); setDone(false); }}><RefreshCw size={13} /> Regenerate</button>
                    <button className="btn btn-primary btn-sm" onClick={() => toast.success('Brief exported!')}><Download size={13} /> Export</button>
                  </div>
                )}
              </div>
              <div ref={outputRef} style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                {generating && !output && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--color-text-muted)' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                        style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
                    ))}
                    <span style={{ fontSize: '0.85rem', marginLeft: 8 }}>Analyzing your inputs and crafting brief...</span>
                  </div>
                )}
                {formatOutput(output)}
                {generating && output && (
                  <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                    style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--color-primary)', marginLeft: 2 }} />
                )}
              </div>
              {done && (
                <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    💡 You can edit any section above and ask AI to rewrite just that part.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
