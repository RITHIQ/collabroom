/**
 * CampaignCreate.tsx
 * Full campaign creation form that saves to Supabase.
 * Brand-only page.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Zap } from 'lucide-react';
import { campaignsAPI } from '../services/api';
import { useAppSelector } from '../store';
import toast from 'react-hot-toast';
import FakeRazorpay from '../components/ui/FakeRazorpay';

const contentFormats = ['reel', 'story', 'feed_post', 'youtube_video', 'shorts', 'podcast_mention'];
const platformOptions = ['instagram', 'youtube', 'tiktok', 'twitter', 'linkedin'];
const niches = ['Beauty', 'Tech', 'Fitness', 'Food', 'Travel', 'Gaming', 'Finance', 'Fashion', 'Education', 'Lifestyle', 'Photography', 'Health', 'Parenting', 'Sports'];
const campaignTypes = [
  { value: 'sponsored_post', label: 'Sponsored Post' },
  { value: 'product_review', label: 'Product Review' },
  { value: 'brand_ambassador', label: 'Brand Ambassador' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'giveaway', label: 'Giveaway' },
  { value: 'event_coverage', label: 'Event Coverage' },
];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);
  const [saving, setSaving] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedNiche, setSelectedNiche] = useState('');
  const [deliverable, setDeliverable] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'sponsored_post',
    budget: '', currency: 'INR',
    startDate: '', endDate: '',
    slotsTotal: '5',
    visibility: 'public',
    brandName: '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const togglePlatform = (p: string) => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleFormat = (f: string) => setSelectedFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  const addDeliverable = () => { if (!deliverable.trim()) return; setDeliverables(prev => [...prev, deliverable.trim()]); setDeliverable(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!form.title.trim()) { toast.error('Enter a campaign title'); return; }
    if (!form.budget || +form.budget <= 0) { toast.error('Enter a valid budget'); return; }
    if (!form.endDate) { toast.error('Set an end date'); return; }
    if (selectedPlatforms.length === 0) { toast.error('Select at least one platform'); return; }

    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setShowPayment(false);
    if (!user?.id) return;
    setSaving(true);
    try {
      const created = await campaignsAPI.create({
        brand_user_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        budget: +form.budget,
        currency: form.currency,
        start_date: form.startDate || new Date().toISOString().split('T')[0],
        end_date: form.endDate,
        slots_total: +form.slotsTotal,
        slots_filled: 0,
        platforms: selectedPlatforms,
        content_formats: selectedFormats,
        niche: selectedNiche,
        deliverables,
        brand_name: form.brandName.trim(),
        visibility: form.visibility,
        payment_reference: paymentId,
      });
      toast.success('Campaign funded and created successfully!');
      navigate(`/campaigns/${created.id}`);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: 820, margin: '0 auto' }}>
      <button onClick={() => navigate('/campaigns')} className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}>
        <ArrowLeft size={15} /> Back to Campaigns
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 6 }}>Create Campaign</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: '0.9rem' }}>
          Launch a new collaboration with creators on ColabRoom.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="card" style={{ padding: 24, marginBottom: 18 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={17} color="var(--color-primary)" /> Campaign Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Campaign Title *</label>
                <input className="input" required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Summer Collection Launch with Lifestyle Creators" />
              </div>
              <div>
                <label className="label">Brand Name</label>
                <input className="input" value={form.brandName} onChange={e => set('brandName', e.target.value)} placeholder="Your brand / company name" />
              </div>
              <div>
                <label className="label">Campaign Type</label>
                <select className="input" value={form.type} onChange={e => set('type', e.target.value)} style={{ cursor: 'pointer' }}>
                  {campaignTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Description *</label>
                <textarea className="input" rows={4} required value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the campaign, what you need from creators, your goals, and any specific requirements…" style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="label">Primary Niche</label>
                <select className="input" value={selectedNiche} onChange={e => setSelectedNiche(e.target.value)} style={{ cursor: 'pointer' }}>
                  <option value="">Select niche</option>
                  {niches.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Visibility</label>
                <select className="input" value={form.visibility} onChange={e => set('visibility', e.target.value)} style={{ cursor: 'pointer' }}>
                  <option value="public">🌐 Public — visible to all creators</option>
                  <option value="private">🔒 Private — invite only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="card" style={{ padding: 24, marginBottom: 18 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18 }}>Budget & Timeline</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="label">Total Budget (₹) *</label>
                <input className="input" type="number" required min="1000" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 200000" />
              </div>
              <div>
                <label className="label">Creator Slots</label>
                <input className="input" type="number" min="1" max="100" value={form.slotsTotal} onChange={e => set('slotsTotal', e.target.value)} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Max creators for this campaign</p>
              </div>
              <div>
                <label className="label">Start Date</label>
                <input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              </div>
              <div>
                <label className="label">End Date *</label>
                <input className="input" type="date" required value={form.endDate} onChange={e => set('endDate', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Platforms */}
          <div className="card" style={{ padding: 24, marginBottom: 18 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18 }}>Platforms & Content *</h3>
            <label className="label">Platforms</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18, marginTop: 6 }}>
              {platformOptions.map(p => (
                <button type="button" key={p} onClick={() => togglePlatform(p)}
                  className={`niche-chip ${selectedPlatforms.includes(p) ? 'active' : ''}`}>
                  {p}
                </button>
              ))}
            </div>
            <label className="label">Content Formats</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {contentFormats.map(f => (
                <button type="button" key={f} onClick={() => toggleFormat(f)}
                  className={`niche-chip ${selectedFormats.includes(f) ? 'active' : ''}`}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div className="card" style={{ padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18 }}>Deliverables</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input className="input" placeholder="e.g. 2 Instagram Reels, 3 Stories" value={deliverable} onChange={e => setDeliverable(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDeliverable(); } }} style={{ flex: 1 }} />
              <button type="button" className="btn btn-secondary" onClick={addDeliverable}><Plus size={15} /> Add</button>
            </div>
            {deliverables.length > 0 && (
              <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {deliverables.map((d, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'var(--color-bg-secondary)', fontSize: '0.82rem', border: '1px solid var(--color-border)' }}>
                    {d}
                    <button type="button" onClick={() => setDeliverables(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1, padding: 0 }}>×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '12px 32px', fontSize: '0.95rem' }}>
            {saving ? 'Creating campaign…' : <><Zap size={16} fill="currentColor" /> Launch Campaign</>}
          </button>
        </form>
      </motion.div>

      {showPayment && (
        <FakeRazorpay
          amount={Number(form.budget) || 0}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
