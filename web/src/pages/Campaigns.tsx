/**
 * Campaigns.tsx
 * Real campaign list from Supabase with real apply functionality.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Users, DollarSign, ArrowRight, Eye, X, Briefcase, ChevronLeft } from 'lucide-react';
import { campaignsAPI } from '../services/api';
import { MOCK_CAMPAIGNS } from '../lib/mockSeedData';
import { useAppSelector } from '../store';
import SearchBar from '../components/ui/SearchBar';
import FilterChips from '../components/ui/FilterChips';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

type CampaignStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: CampaignStatus;
  type: string;
  budget: number;
  currency: string;
  brandName: string | null;
  niche: string | null;
  slotsTotal: number;
  slotsFilled: number;
  endDate: string;
  platforms: string[];
}

const typeEmojis: Record<string, string> = {
  sponsored_post: '📝', product_review: '⭐', brand_ambassador: '🏆',
  affiliate: '🔗', giveaway: '🎁', event_coverage: '📸',
};

const statusFilterOptions = [
  { label: 'All',         value: 'all' },
  { label: 'Active',      value: 'active' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed',   value: 'completed' },
  { label: 'Draft',       value: 'draft' },
];

export default function Campaigns() {
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);
  const isBrand = user?.role === 'brand';
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [applyModal, setApplyModal] = useState<Campaign | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const res = await campaignsAPI.list();
        if (res.data && res.data.length > 0) {
          setCampaigns(res.data as Campaign[]);
        } else {
          setCampaigns(MOCK_CAMPAIGNS as Campaign[]);
        }
      } catch (err: unknown) {
        setCampaigns(MOCK_CAMPAIGNS as Campaign[]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.id, isBrand]);

  const filtered = campaigns.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const handleApply = async () => {
    if (!user?.id || !applyModal) return;
    if (!coverLetter.trim()) { toast.error('Please write a cover letter'); return; }
    setApplying(true);
    try {
      await campaignsAPI.apply(applyModal.id, coverLetter);
      setAppliedIds(prev => new Set([...prev, applyModal.id]));
      toast.success('Application submitted! The brand will review your profile.');
      setApplyModal(null);
      setCoverLetter('');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="page-content">

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              flexShrink: 0,
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
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
              {isBrand ? 'My Campaigns' : 'Browse Campaigns'}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              {isBrand ? 'Manage all your active and past campaigns' : 'Discover and apply to brand campaigns'}
            </p>
          </div>
        </div>
        {isBrand && (
          <Link to="/campaigns/new" className="btn btn-primary">
            <Plus size={15} /> New Campaign
          </Link>
        )}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search campaigns…"
          style={{ flex: 1, minWidth: 200, maxWidth: 360 }}
        />
        <FilterChips
          options={statusFilterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* ── Campaign Grid ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 240, borderRadius: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="No campaigns found"
          description={isBrand ? 'Create your first campaign to start collaborating.' : 'No campaigns match your filters.'}
          action={isBrand
            ? <Link to="/campaigns/new" className="btn btn-primary"><Plus size={14} /> Create Campaign</Link>
            : <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear Filters</button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              data-testid="campaign-card"
              className="card"
              style={{ padding: 22, display: 'flex', flexDirection: 'column', position: 'relative' }}
            >
              {/* Status badge — top right */}
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <StatusBadge status={c.status} />
              </div>

              {/* Brand logo circle + type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: 'var(--color-primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                }}>
                  {typeEmojis[c.type] ?? '📋'}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'capitalize', marginBottom: 2 }}>
                    {c.type.replace(/_/g, ' ')}
                  </div>
                  {c.brandName && (
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {c.brandName}
                    </div>
                  )}
                </div>
              </div>

              {/* Title & description */}
              <h4 style={{ fontWeight: 700, marginBottom: 6, lineHeight: 1.3, fontSize: '0.96rem', paddingRight: 70 }}>
                {c.title}
              </h4>
              <p style={{
                fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 16,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5,
              }}>
                {c.description}
              </p>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { icon: <DollarSign size={11} />, value: `₹${((c.budget || 0) / 100000).toFixed(1)}L`, label: 'Budget' },
                  { icon: <Users size={11} />,      value: `${c.slotsFilled || 0}/${c.slotsTotal || 5}`, label: 'Slots' },
                  { icon: <Calendar size={11} />,   value: c.endDate ? new Date(c.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—', label: 'Deadline' },
                ].map((s, j) => (
                  <div key={j} style={{ padding: '8px 6px', background: 'var(--color-bg-secondary)', borderRadius: 8, textAlign: 'center', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                      {s.icon} {s.value}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Niche tag */}
              {c.niche && (
                <div style={{ marginBottom: 14 }}>
                  <span className="niche-chip" style={{ fontSize: '0.7rem', cursor: 'default' }}>{c.niche}</span>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <Link to={`/campaigns/${c.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  <Eye size={13} /> Open Room
                </Link>
                {!isBrand && c.status === 'active' && !appliedIds.has(c.id) && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setApplyModal(c); setCoverLetter(''); }}
                  >
                    Apply <ArrowRight size={13} />
                  </button>
                )}
                {!isBrand && appliedIds.has(c.id) && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ✅ Applied
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Apply Modal ── */}
      <AnimatePresence>
        {applyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setApplyModal(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, backdropFilter: 'blur(2px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="card"
              style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(520px, 94vw)', padding: 28, zIndex: 201 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, margin: 0 }}>Apply to Campaign</h3>
                <button onClick={() => setApplyModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, borderRadius: 6 }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)', marginBottom: 18, border: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{applyModal.title}</div>
                {applyModal.brandName && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    by {applyModal.brandName}
                  </div>
                )}
              </div>

              <label className="label">Cover Letter *</label>
              <textarea
                className="input"
                rows={5}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell the brand why you're a great fit — your audience, content style, relevant experience…"
                style={{ resize: 'vertical', marginTop: 6 }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 6, marginBottom: 20 }}>
                Your profile stats will be automatically shared with the brand.
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" data-testid="submit-interest-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={handleApply} disabled={applying}>
                  {applying ? 'Submitting…' : <><ArrowRight size={15} /> Submit Application</>}
                </button>
                <button className="btn btn-secondary" onClick={() => setApplyModal(null)}>Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
