import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { campaignsAPI } from '../services/api';
import type { Campaign } from '../types';
import { Search, Bookmark, ArrowRight, Calendar, DollarSign, Users, X, Info, Target, LayoutGrid } from 'lucide-react';
import { MOCK_CAMPAIGNS } from '../lib/mockSeedData';
import toast from 'react-hot-toast';

export default function DiscoverBrands() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    campaignsAPI.list().then(r => { 
      if (r.data && r.data.length > 0) {
        setCampaigns(r.data);
      } else {
        setCampaigns(MOCK_CAMPAIGNS);
      }
      setLoading(false);
    }).catch(() => {
      setCampaigns(MOCK_CAMPAIGNS);
      setLoading(false);
    });
  }, []);

  const filtered = campaigns.filter(c =>
    c.visibility === 'public' &&
    (!search || c.title.toLowerCase().includes(search.toLowerCase()) || c.brandName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 4 }}>Brand Campaigns</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Browse active campaigns and apply to collaborate</p>
      </div>

      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 480 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input className="input" placeholder="Search campaigns by brand or keyword..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card" style={{ padding: 22 }} whileHover={{ y: -4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: '1rem' }}>{(c.brandName || 'B')[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.brandName || 'Brand'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{c.niche || 'Various'}</div>
                  </div>
                </div>
                <button onClick={() => { setSaved(s => s.includes(c.id) ? s.filter(x => x !== c.id) : [...s, c.id]); toast.success(saved.includes(c.id) ? 'Removed' : 'Saved!'); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: saved.includes(c.id) ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  <Bookmark size={16} fill={saved.includes(c.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              <h4 style={{ fontWeight: 700, marginBottom: 8, lineHeight: 1.3, fontSize: '0.95rem' }}>{c.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                {c.description}
              </p>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {(c.platforms || []).map(p => <span key={p} className="niche-chip active" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{p}</span>)}
                {(c.contentFormats || []).map(f => <span key={f} className="niche-chip" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{f}</span>)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { icon: <DollarSign size={12} />, val: `₹${(c.budget / 100000).toFixed(1)}L`, sub: 'Budget' },
                  { icon: <Users size={12} />, val: `${c.slotsTotal - c.slotsFilled} left`, sub: 'Open slots' },
                  { icon: <Calendar size={12} />, val: new Date(c.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), sub: 'Deadline' },
                ].map((s, j) => (
                  <div key={j} style={{ textAlign: 'center', padding: '8px', background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontWeight: 700, fontSize: '0.82rem' }}>{s.icon}{s.val}</div>
                    <div style={{ fontSize: '0.67rem', color: 'var(--color-text-muted)', marginTop: 1 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedCampaign(c)}>View Details</button>
                <button className="btn btn-primary btn-sm" style={{ flex: 2, justifyContent: 'center' }} onClick={() => toast.success('Application submitted! Brand will review soon.')}>
                  Quick Apply <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Campaign Details Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedCampaign(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
            
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="card"
              style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 'min(700px, 94vw)', maxHeight: '90vh', overflowY: 'auto', zIndex: 201,
                display: 'flex', flexDirection: 'column'
              }}>
              
              {/* Modal Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, background: 'var(--color-bg-primary)', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 48, height: 48, fontSize: '1.2rem', background: 'var(--color-primary)', color: '#fff' }}>
                    {(selectedCampaign.brandName || 'B')[0]}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{selectedCampaign.brandName}</h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{selectedCampaign.niche}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedCampaign(null)} style={{ background: 'var(--color-bg-secondary)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>{selectedCampaign.title}</h3>
                
                <div style={{ background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: 12, marginBottom: 24, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {selectedCampaign.description}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                  <div style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', marginBottom: 8, fontSize: '0.85rem' }}>
                      <DollarSign size={16} /> Budget
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{selectedCampaign.budget.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', marginBottom: 8, fontSize: '0.85rem' }}>
                      <Calendar size={16} /> Deadline
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                      {new Date(selectedCampaign.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', marginBottom: 8, fontSize: '0.85rem' }}>
                      <Users size={16} /> Available Slots
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                      {selectedCampaign.slotsTotal - selectedCampaign.slotsFilled} of {selectedCampaign.slotsTotal}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
                    <Target size={18} color="var(--color-primary)" /> Required Deliverables
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedCampaign.deliverables.map((del, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                        <div style={{ marginTop: 4, width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                        {del}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
                    <LayoutGrid size={18} color="var(--color-primary)" /> Platforms & Formats
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {selectedCampaign.platforms.map(p => <span key={p} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.85rem', textTransform: 'capitalize' }}>{p}</span>)}
                    {selectedCampaign.contentFormats.map(f => <span key={f} className="badge badge-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', textTransform: 'capitalize' }}>{f}</span>)}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '24px 32px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button className="btn btn-secondary" onClick={() => setSelectedCampaign(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => { setSelectedCampaign(null); toast.success('Application submitted! Brand will review soon.'); }}>
                  Submit Application <ArrowRight size={16} style={{ marginLeft: 4 }} />
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
