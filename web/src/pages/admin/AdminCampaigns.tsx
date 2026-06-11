/**
 * AdminCampaigns.tsx
 * View and moderate all campaigns from Supabase.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Search, CheckCircle, PauseCircle, XCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface CampaignRow {
  id: string;
  title: string;
  brand_name: string | null;
  niche: string | null;
  status: string;
  budget: number;
  currency: string;
  created_at: string;
}

const statusBadge: Record<string, string> = {
  active: 'badge-success', draft: 'badge-muted', in_progress: 'badge-info',
  completed: 'badge-primary', cancelled: 'badge-error', paused: 'badge-warning',
};

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.listCampaigns()
      .then(data => setCampaigns(data as CampaignRow[]))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateCampaignStatus(id, status);
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success(`Campaign ${status}`);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const filtered = campaigns.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.brand_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
            <Briefcase size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Campaigns</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{campaigns.length} total</p>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input" placeholder="Search campaigns…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 220 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{c.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {c.brand_name || 'Unknown Brand'} · {c.niche || '—'} · ₹{((c.budget || 0) / 100000).toFixed(1)}L
                </div>
              </div>
              <span className={`badge ${statusBadge[c.status] || 'badge-muted'}`} style={{ fontSize: '0.72rem' }}>{c.status}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {c.status !== 'active' && (
                  <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(c.id, 'active')} style={{ fontSize: '0.72rem', padding: '3px 10px' }}>
                    <CheckCircle size={12} /> Activate
                  </button>
                )}
                {c.status === 'active' && (
                  <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(c.id, 'paused')} style={{ fontSize: '0.72rem', padding: '3px 10px' }}>
                    <PauseCircle size={12} /> Pause
                  </button>
                )}
                {c.status !== 'cancelled' && (
                  <button className="btn btn-sm" onClick={() => updateStatus(c.id, 'cancelled')} style={{ fontSize: '0.72rem', padding: '3px 10px', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    <XCircle size={12} /> Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No campaigns found</div>
          )}
        </div>
      )}
    </div>
  );
}
