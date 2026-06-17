/**
 * ProfileView.tsx
 * Full profile page — cover banner, avatar, stats, tabs.
 * Reads from Supabase via userService. Works for both Creator and Brand roles.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BadgeCheck, MapPin, Globe, ExternalLink, Star, Users,
  BarChart2, CheckCircle, Edit3, Zap, ChevronLeft,
} from 'lucide-react';
import { useAppSelector } from '../store';
import { userService } from '../services/userService';
import CreatorScoreBadge from '../components/ui/CreatorScoreBadge';

interface CreatorData {
  display_name?: string;
  username?: string;
  bio?: string;
  tagline?: string;
  location?: string;
  niches?: string[];
  availability?: string;
  creator_score?: number;
  creator_tier?: string;
  on_time_delivery_rate?: number;
  campaigns_completed?: number;
  avg_response_time?: string;
  pricing_tiers?: { type: string; label: string; minPrice: number; maxPrice: number }[];
  social_links?: { platform: string; url: string; followers: number; engagementRate: number }[];
  profile_photo?: string;
}

interface BrandData {
  company_name?: string;
  handle?: string;
  description?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  brand_score?: number;
  campaigns_completed?: number;
  logo_url?: string;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <span style={{ fontSize: 13, lineHeight: 1 }}>📷</span>,
  youtube:   <span style={{ fontSize: 13, lineHeight: 1 }}>▶</span>,
  twitter:   <span style={{ fontSize: 13, lineHeight: 1 }}>𝕏</span>,
  linkedin:  <span style={{ fontSize: 13, lineHeight: 1 }}>in</span>,
};

const platformColors: Record<string, string> = {
  instagram: '#E1306C',
  youtube:   '#FF0000',
  twitter:   '#1DA1F2',
  linkedin:  '#0A66C2',
  tiktok:    '#010101',
};

function PlatformBadge({ platform, followers, engagement }: { platform: string; followers: number; engagement: number }) {
  const fmtNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? `${(n / 1_000).toFixed(0)}K`
    : String(n);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      flex: '1 1 160px',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: `${platformColors[platform] ?? '#666'}18`,
        color: platformColors[platform] ?? 'var(--color-text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {platformIcons[platform] ?? <ExternalLink size={15} />}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'capitalize' }}>{platform}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
          {fmtNum(followers)} · {engagement}% eng.
        </div>
      </div>
    </div>
  );
}

type Tab = 'overview' | 'social' | 'pricing' | 'reviews';

const availabilityConfig: Record<string, { label: string; color: string }> = {
  available:   { label: '● Available for Collabs', color: 'var(--color-success)' },
  selective:   { label: '◐ Selective',              color: 'var(--color-warning)' },
  unavailable: { label: '○ Not Available',          color: 'var(--color-text-muted)' },
};

export default function ProfileView() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAppSelector(s => s.auth);
  const isOwner = !username || username === user?.email?.split('@')[0];
  const isCreator = user?.role === 'creator';
  const isBrand   = user?.role === 'brand';

  const [creatorData, setCreatorData] = useState<CreatorData | null>(null);
  const [brandData,   setBrandData]   = useState<BrandData   | null>(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<Tab>('overview');

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        if (isCreator) {
          const c = await userService.getMyCreatorProfile(user.id);
          if (c) setCreatorData(c as CreatorData);
        } else if (isBrand) {
          const b = await userService.getMyBrandProfile(user.id);
          if (b) setBrandData(b as BrandData);
        }
      } catch { /* silent — show stub UI */ } finally { setLoading(false); }
    };
    void load();
  }, [user?.id, isCreator, isBrand]);

  /* Derived display values */
  const displayName   = isCreator ? (creatorData?.display_name || user?.email?.split('@')[0] || 'Creator') : (brandData?.company_name || user?.email?.split('@')[0] || 'Brand');
  const handle        = isCreator ? (creatorData?.username || user?.email?.split('@')[0] || 'creator') : (brandData?.handle || user?.email?.split('@')[0] || 'brand');
  const bio           = isCreator ? (creatorData?.bio || '') : (brandData?.description || '');
  const tagline       = isCreator ? (creatorData?.tagline || '') : (brandData?.industry || '');
  const location      = isCreator ? creatorData?.location : undefined;
  const website       = isBrand ? brandData?.website : undefined;
  const niches        = creatorData?.niches ?? [];
  const score         = isCreator ? (creatorData?.creator_score ?? null) : (brandData?.brand_score ?? null);
  const tier          = creatorData?.creator_tier ?? '';
  const availability  = isCreator ? (creatorData?.availability ?? 'available') : undefined;
  const socialLinks   = creatorData?.social_links ?? [];
  const pricingTiers  = creatorData?.pricing_tiers ?? [];
  const avatarBg      = `linear-gradient(135deg, var(--color-primary), var(--color-accent))`;

  /* Cover accent colors */
  const coverGradient = 'linear-gradient(135deg, #6C3EF4 0%, #A78BFA 60%, #EC4899 100%)';

  const tabs: { id: Tab; label: string }[] = isCreator
    ? [{ id: 'overview', label: 'Overview' }, { id: 'social', label: 'Social' }, { id: 'pricing', label: 'Pricing' }, { id: 'reviews', label: 'Reviews' }]
    : [{ id: 'overview', label: 'Overview' }, { id: 'reviews', label: 'Reviews' }];

  if (loading) return (
    <div style={{ padding: 28, maxWidth: 860, margin: '0 auto' }}>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 12 }} />)}
    </div>
  );

  return (
    <div data-testid="profile-page" style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 40 }}>

      {/* ── Back Button ── */}
      <div style={{ padding: '20px 28px 12px' }}>
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
      </div>

      {/* ── Cover Banner ── */}
      <div style={{
        height: 180, position: 'relative',
        background: coverGradient,
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        overflow: 'hidden',
      }}>
        {/* abstract patterns */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 80, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      </div>

      {/* ── Profile Card ── */}
      <div style={{ padding: '0 28px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ padding: '20px 24px', marginTop: -48, position: 'relative', zIndex: 10 }}
        >
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>

            {/* Avatar */}
            <div data-testid="avatar" style={{
              width: 80, height: 80, borderRadius: 20,
              background: avatarBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 800, color: '#fff',
              fontFamily: 'Sora, sans-serif',
              border: '3px solid var(--color-bg-card)',
              boxShadow: 'var(--shadow-md)',
              flexShrink: 0,
            }}>
              {displayName[0]?.toUpperCase()}
            </div>

            {/* Name + handles */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{displayName}</h1>
                {score && score >= 70 && (
                  <BadgeCheck size={18} color="var(--color-primary)" />
                )}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>@{handle}</div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                {/* Score badge */}
                {isCreator && score !== null && (
                  <CreatorScoreBadge score={score} tier={tier as any} />
                )}
                {isBrand && score !== null && (
                  <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={11} /> BrandScore {score}
                  </span>
                )}

                {/* Availability */}
                {isCreator && availability && (
                  <span style={{
                    fontSize: '0.76rem', fontWeight: 600,
                    color: availabilityConfig[availability]?.color ?? 'var(--color-text-muted)',
                  }}>
                    {availabilityConfig[availability]?.label ?? availability}
                  </span>
                )}

                {/* Location */}
                {location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <MapPin size={13} /> {location}
                  </span>
                )}

                {/* Website (brand) */}
                {website && (
                  <a href={website} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                    <Globe size={13} /> {website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>

            {/* Edit button (owner) */}
            {isOwner && (
              <Link to="/profile/edit" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                <Edit3 size={13} /> Edit Profile
              </Link>
            )}
          </div>

          {/* Tagline & bio */}
          {tagline && <p style={{ marginTop: 14, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{tagline}</p>}
          {bio && <p style={{ marginTop: 8, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{bio}</p>}

          {/* Niche chips */}
          {niches.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {niches.map(n => <span key={n} className="niche-chip active" style={{ cursor: 'default' }}>{n}</span>)}
            </div>
          )}

          {/* Completeness bar */}
          {isOwner && (
            <div data-testid="completeness-bar" style={{ marginTop: 20 }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>Profile Completeness</div>
               <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                 <div style={{ width: '100%', height: '100%', background: 'var(--color-success)' }} />
               </div>
            </div>
          )}
        </motion.div>

        {/* ── Stat Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
          style={{ padding: '16px 24px', marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 0 }}
        >
          {(() => {
            const statItems = isCreator ? [
              { icon: <Zap size={16} color="rgba(255,255,255,0.6)" />,      label: 'Score',       value: score ?? '—' },
              { icon: <Users size={16} color="#4ade80" />,                   label: 'Campaigns',   value: creatorData?.campaigns_completed ?? 0 },
              { icon: <CheckCircle size={16} color="#60a5fa" />,             label: 'On-Time',     value: `${creatorData?.on_time_delivery_rate ?? 0}%` },
              { icon: <BarChart2 size={16} color="#fbbf24" />,               label: 'Platforms',   value: socialLinks.length },
            ] : [
              { icon: <Zap size={16} color="rgba(255,255,255,0.6)" />,      label: 'BrandScore',  value: score ?? '—' },
              { icon: <Users size={16} color="#4ade80" />,                   label: 'Campaigns',   value: brandData?.campaigns_completed ?? 0 },
              { icon: <Globe size={16} color="#60a5fa" />,                   label: 'Industry',    value: brandData?.industry ?? '—' },
              { icon: <BarChart2 size={16} color="#fbbf24" />,               label: 'Team Size',   value: brandData?.company_size ?? '—' },
            ];
            return statItems.map((stat, i, arr) => (
              <div key={i} style={{
                textAlign: 'center', padding: '0 12px',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
                  {stat.icon}
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'Sora, sans-serif', color: '#ffffff' }}>
                    {stat.value}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ));
          })()}
        </motion.div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 2, marginTop: 20, marginBottom: 18, borderBottom: '1px solid var(--color-border)' }}>
          {tabs.map(tab => (
            <button key={tab.id} data-testid={tab.id === 'social' ? 'social-tab' : undefined} onClick={() => setActiveTab(tab.id)} style={{
              padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              transition: 'all var(--transition-fast)', marginBottom: -1,
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* About */}
              <div className="card" style={{ padding: 20, gridColumn: bio ? '1/-1' : '' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>About</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {bio || 'No bio added yet.'}
                </p>
                {isOwner && !bio && (
                  <Link to="/profile/edit" style={{ fontSize: '0.82rem', color: 'var(--color-primary)', marginTop: 10, display: 'inline-block' }}>
                    + Add bio
                  </Link>
                )}
              </div>

              {/* Niches (creator) */}
              {isCreator && niches.length > 0 && (
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>Content Niches</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {niches.map(n => <span key={n} className="niche-chip active" style={{ cursor: 'default' }}>{n}</span>)}
                  </div>
                </div>
              )}

              {/* Quick stats card */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>
                  {isCreator ? 'Performance' : 'Company Details'}
                </h3>
                {(() => {
                  const rows = isCreator ? [
                    { label: 'Campaigns Completed', value: `${creatorData?.campaigns_completed ?? 0}` },
                    { label: 'On-time Delivery',    value: `${creatorData?.on_time_delivery_rate ?? 0}%` },
                    { label: 'Avg Response Time',   value: creatorData?.avg_response_time ?? '< 24h' },
                  ] : [
                    { label: 'Industry',    value: brandData?.industry ?? '—' },
                    { label: 'Team Size',   value: brandData?.company_size ?? '—' },
                    { label: 'Campaigns',   value: `${brandData?.campaigns_completed ?? 0}` },
                  ];
                  return rows.map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{row.value}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* SOCIAL TAB (creator only) */}
          {activeTab === 'social' && isCreator && (
            <div data-testid="social-section">
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Connected Platforms</h3>
              {socialLinks.length === 0 ? (
                <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                  No social platforms connected yet.
                  {isOwner && <Link to="/profile/edit" style={{ display: 'block', marginTop: 8, color: 'var(--color-primary)', fontSize: '0.82rem' }}>Connect platforms</Link>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {socialLinks.map(l => (
                    <PlatformBadge key={l.platform} platform={l.platform} followers={l.followers} engagement={l.engagementRate} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PRICING TAB (creator only) */}
          {activeTab === 'pricing' && isCreator && (
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Collaboration Packages</h3>
              {pricingTiers.length === 0 ? (
                <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                  Pricing not added yet.
                  {isOwner && <Link to="/profile/edit" style={{ display: 'block', marginTop: 8, color: 'var(--color-primary)', fontSize: '0.82rem' }}>Add pricing tiers</Link>}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                  {pricingTiers.map((t, i) => (
                    <div key={i} className="card" style={{ padding: '18px 20px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'capitalize' }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--color-text-primary)', marginBottom: 2 }}>
                        ₹{t.minPrice.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        up to ₹{t.maxPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⭐</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Reviews Coming Soon</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
                After completing collaborations, brands and creators can leave verified reviews.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
