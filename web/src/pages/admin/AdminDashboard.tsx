/**
 * AdminDashboard.tsx
 * Real platform statistics from Supabase.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Briefcase, AlertTriangle, TrendingUp } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  activeCampaigns: number;
  openDisputes: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: <Users size={20} />, color: '#6C3EF4', change: 'All roles' },
    { label: 'Active Campaigns', value: stats?.activeCampaigns ?? '—', icon: <Briefcase size={20} />, color: '#10B981', change: 'Live now' },
    { label: 'Open Disputes', value: stats?.openDisputes ?? '—', icon: <AlertTriangle size={20} />, color: '#F59E0B', change: 'Needs review' },
    { label: 'Platform Revenue', value: stats ? `₹${(stats.totalRevenue / 100000).toFixed(1)}L` : '—', icon: <TrendingUp size={20} />, color: '#3B82F6', change: 'Total credited' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(108,62,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: 2 }}>
              Real-time platform overview
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {cards.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: `${c.color}15` }} />
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, marginBottom: 16 }}>
                  {c.icon}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Sora', color: 'var(--color-text-primary)' }}>{c.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>{c.label}</div>
                <div style={{ fontSize: '0.72rem', color: c.color, fontWeight: 600, marginTop: 4 }}>{c.change}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, padding: 24, borderRadius: 16, background: 'rgba(108,62,244,0.05)', border: '1px solid rgba(108,62,244,0.15)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.95rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: '👥 Manage Users', to: '/admin/users' },
              { label: '📋 Review Campaigns', to: '/admin/campaigns' },
              { label: '⚖️ Resolve Disputes', to: '/admin/disputes' },
              { label: '📢 Send Announcement', to: '/admin/announcements' },
            ].map(a => (
              <a key={a.to} href={a.to} style={{ textDecoration: 'none', padding: '8px 16px', borderRadius: 8, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)', transition: 'all 0.15s' }}>
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
