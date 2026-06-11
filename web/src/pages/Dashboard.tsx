import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Briefcase, DollarSign, Star, CheckCircle,
  ArrowRight, Plus, Zap, Users, BarChart2,
} from 'lucide-react';
import { useAppSelector } from '../store';
import { supabase } from '../services/supabaseClient';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  delay?: number;
}

function StatCard({ icon, label, value, change, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="visible" custom={delay}
      className="card"
      style={{ padding: '20px 22px', position: 'relative', overflow: 'hidden' }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.18)', y: -2 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.55)',
        }}>
          {icon}
        </div>
        {change && (
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 3 }}>
            <TrendingUp size={11} /> {change}
          </span>
        )}
      </div>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#ffffff', lineHeight: 1, marginBottom: 5 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{label}</div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAppSelector(s => s.auth);
  const isCreator = user?.role === 'creator';
  const [walletBalance, setWalletBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState<number | string>('—');
  const [creatorScore, setCreatorScore] = useState<number | string>('—');
  const [brandScore, setBrandScore] = useState<number | string>('—');
  const [completionRate, setCompletionRate] = useState<string>('—');
  const [campaigns, setCampaigns] = useState<Array<{
    id: string; title: string; status: string;
    end_date: string; budget: number; brand_name: string;
  }>>([]);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.email?.split('@')[0] ?? 'there';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    if (!user?.id) return;
    const loadData = async () => {
      const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle();
      if (wallet) { setWalletBalance(wallet.available_balance); setPendingBalance(wallet.pending_balance); }

      if (isCreator) {
        const { data: creator } = await supabase.from('creators').select('creator_score,on_time_delivery_rate,campaigns_completed').eq('user_id', user.id).maybeSingle();
        if (creator) { setCreatorScore(creator.creator_score || 50); setCompletionRate(`${creator.on_time_delivery_rate || 0}%`); }
        const { count } = await supabase.from('campaign_applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'approved');
        setActiveCampaigns(count ?? 0);
        const { data: apps } = await supabase.from('campaign_applications').select('campaigns(id,title,status,end_date,budget,brand_name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4);
        if (apps) setCampaigns(apps.map((a: Record<string, unknown>) => a.campaigns as { id: string; title: string; status: string; end_date: string; budget: number; brand_name: string }).filter(Boolean));
      } else {
        const { data: brand } = await supabase.from('brands').select('brand_score,campaigns_completed').eq('user_id', user.id).maybeSingle();
        if (brand) setBrandScore(brand.brand_score || 50);
        const { count } = await supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('brand_user_id', user.id).eq('status', 'active');
        setActiveCampaigns(count ?? 0);
        const { data: cams } = await supabase.from('campaigns').select('id,title,status,end_date,budget,brand_name').eq('brand_user_id', user.id).order('created_at', { ascending: false }).limit(4);
        if (cams) setCampaigns(cams);
      }
    };
    void loadData();
  }, [user?.id, isCreator]);

  const stats = isCreator ? [
    { icon: <DollarSign size={17} />, label: 'Available Balance',  value: fmt(walletBalance), accent: '#4ade80', delay: 0 },
    { icon: <Briefcase size={17} />, label: 'Active Campaigns',    value: String(activeCampaigns), accent: '#ffffff', delay: 1 },
    { icon: <Star size={17} />,      label: 'CreatorScore',        value: String(creatorScore), accent: '#fbbf24', delay: 2 },
    { icon: <CheckCircle size={17}/>, label: 'Delivery Rate',      value: completionRate, accent: '#60a5fa', delay: 3 },
  ] : [
    { icon: <Briefcase size={17} />, label: 'Active Campaigns',    value: String(activeCampaigns), accent: '#ffffff', delay: 0 },
    { icon: <DollarSign size={17} />, label: 'Wallet Balance',     value: fmt(walletBalance), accent: '#4ade80', delay: 1 },
    { icon: <TrendingUp size={17} />, label: 'Pending Payout',     value: fmt(pendingBalance), accent: '#fbbf24', delay: 2 },
    { icon: <Star size={17} />,       label: 'BrandScore',         value: String(brandScore), accent: '#60a5fa', delay: 3 },
  ];

  const quickActions = isCreator ? [
    { label: 'Find Campaigns', to: '/discover/brands', icon: <Briefcase size={18} />, accent: 'var(--color-primary)', desc: 'Browse active brand campaigns' },
    { label: 'My Wallet',      to: '/wallet',          icon: <DollarSign size={18}/>, accent: '#16A34A',             desc: `${fmt(pendingBalance)} pending` },
    { label: 'Contracts',      to: '/contracts',       icon: <CheckCircle size={18}/>,accent: '#2563EB',             desc: 'Review and sign contracts' },
    { label: 'Colab AI',       to: '/ai-brief',        icon: <Zap size={18} />,       accent: '#D97706',             desc: 'Generate briefs with AI' },
  ] : [
    { label: 'Find Creators',  to: '/discover/creators', icon: <Users size={18} />,     accent: 'var(--color-primary)', desc: 'Search from thousands of creators' },
    { label: 'New Campaign',   to: '/campaigns/new',     icon: <Plus size={18} />,       accent: '#16A34A',             desc: 'Launch your next campaign' },
    { label: 'Payments',       to: '/payments',          icon: <DollarSign size={18} />, accent: '#2563EB',             desc: 'Manage escrow & invoices' },
    { label: 'AI Brief Tool',  to: '/ai-brief',          icon: <Zap size={18} />,        accent: '#D97706',             desc: 'Create briefs in seconds' },
  ];

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>

      {/* ── Header ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>
          {greeting}, {name}! 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {today} · {isCreator ? 'Your live stats are ready' : 'Your campaign dashboard'}
        </p>
      </motion.div>

      {/* ── Work Mode Toggle (Creator only) ── */}
      {isCreator && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5} style={{ marginBottom: 28 }}>
          <div className="card" style={{
            padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--color-primary-light), transparent)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: 2 }}>
                Work Mode
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Toggle your availability to brands
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-success)' }}>
                ● Available for Collabs
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Left: Active Campaigns */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>
              {isCreator ? 'Active Campaigns' : 'Recent Campaigns'}
            </h3>
            <Link to="/campaigns" style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {campaigns.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={<Briefcase size={26} />}
                  title={isCreator ? 'No active campaigns yet' : 'No campaigns yet'}
                  description={isCreator ? 'Apply to campaigns to see them here.' : 'Create your first campaign to get started.'}
                  action={
                    isCreator
                      ? <Link to="/discover/brands" className="btn btn-primary btn-sm">Browse Campaigns</Link>
                      : <Link to="/campaigns/new" className="btn btn-primary btn-sm"><Plus size={13} /> Create Campaign</Link>
                  }
                />
              </div>
            ) : (
              campaigns.map((c) => (
                <Link key={c.id} to={`/campaigns/${c.id}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    className="card"
                    style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: 'var(--color-primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.95rem',
                      fontFamily: 'Sora, sans-serif',
                    }}>
                      {(c.brand_name || c.title || 'C')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-primary)' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                        {c.brand_name || 'Campaign'}
                        {c.end_date && ` · Due ${new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>
                        ₹{((c.budget || 0) / 100000).toFixed(1)}L
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
            {!isCreator && (
              <Link to="/campaigns/new" style={{ textDecoration: 'none' }}>
                <div
                  className="card"
                  style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1.5px dashed var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)', background: 'transparent', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-light)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <Plus size={15} /> New Campaign
                </div>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Right: Quick Actions + Wallet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="card" style={{ padding: '18px 20px' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--color-text-primary)' }}>
              <BarChart2 size={15} color="var(--color-primary)" />
              Quick Actions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {quickActions.map((a, i) => (
                <Link key={i} to={a.to} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 8px', borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: `${a.accent}14`,
                      color: a.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {a.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>{a.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{a.desc}</div>
                    </div>
                    <ArrowRight size={13} color="var(--color-text-muted)" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Wallet Snapshot (Creator) */}
          {isCreator && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="card" style={{ padding: '18px 20px' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <DollarSign size={15} color="#16A34A" /> Wallet Overview
              </h4>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                {fmt(walletBalance)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>Available to withdraw</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Pending', value: fmt(pendingBalance) },
                  { label: 'Total Earned', value: fmt(walletBalance + pendingBalance) },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <Link to="/wallet" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6 }}>
                Manage Wallet <ArrowRight size={13} />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
