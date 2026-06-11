import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Send, SlidersHorizontal, MapPin, BadgeCheck, Users } from 'lucide-react';
import { creatorsAPI } from '../services/api';
import type { CreatorProfile } from '../types';
import CreatorScoreBadge from '../components/ui/CreatorScoreBadge';
import SearchBar from '../components/ui/SearchBar';
import FilterChips from '../components/ui/FilterChips';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const nicheOptions = [
  { label: 'All', value: 'All' },
  { label: 'Beauty', value: 'Beauty' },
  { label: 'Tech', value: 'Tech' },
  { label: 'Fitness', value: 'Fitness' },
  { label: 'Food', value: 'Food' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Gaming', value: 'Gaming' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Fashion', value: 'Fashion' },
  { label: 'Music', value: 'Music' },
  { label: 'Education', value: 'Education' },
];

const platformShort: Record<string, string> = {
  instagram: 'IG', youtube: 'YT', tiktok: 'TT', twitter: 'X', linkedin: 'in',
};

function PlatformPill({ platform }: { platform: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 24, height: 24, borderRadius: 6,
      background: 'var(--color-bg-secondary)',
      fontSize: '0.62rem', fontWeight: 700,
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
    }}>
      {platformShort[platform] ?? platform.slice(0, 2).toUpperCase()}
    </span>
  );
}

function CreatorCard({ creator, onSelect, isSaved, onSave }: {
  creator: CreatorProfile & { id: string };
  onSelect: () => void;
  isSaved: boolean;
  onSave: () => void;
}) {
  const totalFollowers = creator.socialLinks.reduce((s, l) => s + l.followers, 0);
  const avgEngagement = creator.socialLinks.length
    ? (creator.socialLinks.reduce((s, l) => s + l.engagementRate, 0) / creator.socialLinks.length).toFixed(1)
    : '0';
  const minPrice = creator.pricingTiers.length > 0
    ? Math.min(...creator.pricingTiers.map(p => p.minPrice))
    : 0;

  const fmtNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? `${(n / 1_000).toFixed(0)}K`
    : String(n);

  const availColor =
    creator.availability === 'available' ? 'var(--color-success)' :
    creator.availability === 'busy'      ? 'var(--color-warning)' : 'var(--color-text-muted)';

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: 'var(--shadow-card-hover)' }}
      layout
      className="card"
      style={{ padding: 20, cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
      {/* Save / shortlist button */}
      <button
        onClick={(e) => { e.stopPropagation(); onSave(); }}
        style={{
          position: 'absolute', top: 14, right: 14, background: 'none', border: 'none',
          cursor: 'pointer', color: isSaved ? 'var(--color-danger)' : 'var(--color-text-muted)',
          transition: 'color var(--transition-fast)', padding: 4,
        }}
        title={isSaved ? 'Unsave' : 'Shortlist'}
      >
        <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
      </button>

      <div onClick={onSelect} style={{ flex: 1 }}>
        {/* Avatar + name + score */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.2rem' }}>
              {creator.displayName[0]}
            </div>
            {/* Verified badge */}
            {creator.creatorScore >= 70 && (
              <BadgeCheck
                size={16}
                style={{
                  position: 'absolute', bottom: 0, right: -2,
                  color: 'var(--color-primary)',
                  background: 'var(--color-bg-card)',
                  borderRadius: '50%',
                }}
              />
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {creator.displayName}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>
              @{creator.username}
              {creator.location && ` · ${creator.location}`}
            </div>
            <CreatorScoreBadge score={creator.creatorScore} tier={creator.creatorTier} />
          </div>
        </div>

        {/* Tagline */}
        {creator.tagline && (
          <p style={{
            fontSize: '0.79rem', color: 'var(--color-text-secondary)', marginBottom: 12,
            lineHeight: 1.5, display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {creator.tagline}
          </p>
        )}

        {/* Niche tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {creator.niches.slice(0, 3).map(n => (
            <span key={n} className="niche-chip" style={{ fontSize: '0.7rem', padding: '2px 8px', cursor: 'default' }}>{n}</span>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Followers',    value: fmtNum(totalFollowers) },
            { label: 'Engagement',   value: `${avgEngagement}%` },
            { label: 'From',         value: minPrice > 0 ? `₹${(minPrice / 1000).toFixed(0)}K` : '—' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '7px 6px', background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Platform pills + availability */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {creator.socialLinks.map(l => <PlatformPill key={l.platform} platform={l.platform} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.73rem', color: 'var(--color-text-secondary)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: availColor }} />
            <span style={{ textTransform: 'capitalize' }}>
              {creator.availability === 'not_available' ? 'Unavailable' : creator.availability}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={onSelect}
        >
          View Profile
        </button>
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={(e) => { e.stopPropagation(); toast.success(`Invite sent to ${creator.displayName}!`); }}
        >
          <Send size={12} /> Invite
        </button>
      </div>
    </motion.div>
  );
}

export default function DiscoverCreators() {
  const [creators, setCreators] = useState<(CreatorProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [niche, setNiche] = useState('All');
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<(CreatorProfile & { id: string }) | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minScore: 0, availableOnly: false });

  useEffect(() => {
    setLoading(true);
    creatorsAPI.search({}).then(r => { setCreators(r.data); setLoading(false); });
  }, []);

  const filtered = creators.filter(c => {
    if (search && !c.displayName.toLowerCase().includes(search.toLowerCase()) && !c.username.toLowerCase().includes(search.toLowerCase())) return false;
    if (niche !== 'All' && !c.niches.includes(niche)) return false;
    if (filters.availableOnly && c.availability !== 'available') return false;
    if (c.creatorScore < filters.minScore) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Search & Filters bar */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-card)' }}>
          {/* Page title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 2 }}>Discover Creators</h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                {loading ? 'Loading…' : `${filtered.length} creators found`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="input" style={{ width: 'auto', height: 36, padding: '0 12px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <option>Sort: Best Match</option>
                <option>Sort: Highest Score</option>
                <option>Sort: Most Followers</option>
                <option>Sort: Lowest Price</option>
              </select>
              <button
                className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowFilters(!showFilters)}
                style={{ gap: 6 }}
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
            </div>
          </div>

          {/* Search bar */}
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, niche, username…"
            style={{ marginBottom: 12 }}
          />

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', marginBottom: 10 }}>
                <div style={{
                  padding: '14px 16px', background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)', display: 'flex', gap: 20, flexWrap: 'wrap',
                  border: '1px solid var(--color-border)',
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={filters.availableOnly}
                      onChange={e => setFilters(f => ({ ...f, availableOnly: e.target.checked }))}
                      style={{ accentColor: 'var(--color-primary)' }} />
                    Available now only
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      Min CreatorScore:
                    </span>
                    <input type="range" min={0} max={100} step={10} value={filters.minScore}
                      onChange={e => setFilters(f => ({ ...f, minScore: +e.target.value }))}
                      style={{ accentColor: 'var(--color-primary)', width: 100 }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)', minWidth: 24 }}>
                      {filters.minScore}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Niche filter chips */}
          <FilterChips options={nicheOptions} value={niche} onChange={setNiche} />
        </div>

        {/* Creator Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 340, borderRadius: 12 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No creators found"
              description="Try adjusting your filters or search query."
              action={<button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setNiche('All'); setFilters({ minScore: 0, availableOnly: false }); }}>Clear Filters</button>}
            />
          ) : (
            <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
              {filtered.map(c => (
                <CreatorCard key={c.id} creator={c}
                  onSelect={() => setSelected(c)}
                  isSaved={saved.includes(c.id)}
                  onSave={() => {
                    setSaved(s => s.includes(c.id) ? s.filter(x => x !== c.id) : [...s, c.id]);
                    toast.success(saved.includes(c.id) ? 'Removed from shortlist' : '❤️ Added to shortlist');
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Side Panel ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              width: 380, borderLeft: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)', overflowY: 'auto', position: 'relative',
            }}
          >
            {/* Sticky header */}
            <div style={{
              position: 'sticky', top: 0, background: 'var(--color-bg-card)',
              borderBottom: '1px solid var(--color-border)', padding: '14px 18px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10,
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Creator Profile</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px 20px' }}>
              {/* Profile header */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div className="avatar" style={{ width: 72, height: 72, fontSize: '1.5rem', margin: '0 auto 12px' }}>
                  {selected.displayName[0]}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{selected.displayName}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: 10 }}>@{selected.username}</p>
                <CreatorScoreBadge score={selected.creatorScore} tier={selected.creatorTier} />
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                {selected.bio}
              </p>

              {selected.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                  <MapPin size={13} color="var(--color-text-muted)" />
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{selected.location}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {selected.niches.map(n => (
                  <span key={n} className="niche-chip active">{n}</span>
                ))}
              </div>

              {/* Social Platforms */}
              <h5 style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>Social Platforms</h5>
              {selected.socialLinks.map(l => (
                <div key={l.platform} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'var(--color-bg-secondary)', marginBottom: 8, border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlatformPill platform={l.platform} />
                    <span style={{ fontSize: '0.83rem', fontWeight: 500, textTransform: 'capitalize' }}>{l.platform}</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {l.followers >= 1000 ? `${(l.followers / 1000).toFixed(0)}K` : l.followers} followers
                    </div>
                    <div style={{ color: 'var(--color-text-muted)' }}>{l.engagementRate}% engagement</div>
                  </div>
                </div>
              ))}

              {/* Pricing */}
              <h5 style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, marginTop: 20 }}>Pricing</h5>
              {selected.pricingTiers.map(t => (
                <div key={t.type} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{t.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>₹{t.minPrice.toLocaleString()} – ₹{t.maxPrice.toLocaleString()}</span>
                </div>
              ))}

              {/* Performance */}
              <h5 style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, marginTop: 20 }}>Performance</h5>
              {[
                { label: 'Campaigns Completed', value: `${selected.campaignsCompleted}` },
                { label: 'On-time Delivery',    value: `${selected.onTimeDeliveryRate}%` },
                { label: 'Avg Response Time',   value: selected.avgResponseTime },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{s.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-success)' }}>{s.value}</span>
                </div>
              ))}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => { setSaved(s => [...s, selected.id]); toast.success('Shortlisted!'); }}
                >
                  <Heart size={13} /> Shortlist
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center' }}
                  onClick={() => toast.success(`Invite sent to ${selected.displayName}!`)}
                >
                  <Send size={14} /> Send Invite
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
