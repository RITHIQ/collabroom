/**
 * AdminDisputes.tsx
 * View and resolve disputes from Supabase.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface DisputeRow {
  id: string;
  reason: string;
  status: string;
  resolution: string | null;
  created_at: string;
  campaigns: { title: string; brand_name: string } | null;
}

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    adminService.listDisputes()
      .then(data => setDisputes(data as DisputeRow[]))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id: string) => {
    if (!resolution.trim()) { toast.error('Enter resolution notes'); return; }
    try {
      await adminService.resolveDispute(id, resolution);
      setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'resolved', resolution } : d));
      toast.success('Dispute resolved');
      setResolving(null);
      setResolution('');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const statusBadge: Record<string, string> = {
    open: 'badge-error', under_review: 'badge-warning', resolved: 'badge-success', closed: 'badge-muted',
  };

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Disputes</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{disputes.filter(d => d.status === 'open').length} open</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : disputes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
          <CheckCircle size={48} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No disputes — all clear!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {disputes.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    {d.campaigns?.title || 'Unknown Campaign'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{d.reason}</div>
                  {d.resolution && <div style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 500 }}>Resolution: {d.resolution}</div>}
                </div>
                <span className={`badge ${statusBadge[d.status] || 'badge-muted'}`} style={{ fontSize: '0.72rem', marginLeft: 12, flexShrink: 0 }}>
                  {d.status.replace('_', ' ')}
                </span>
              </div>
              {d.status === 'open' && (
                resolving === d.id ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input className="input" placeholder="Resolution notes…" value={resolution} onChange={e => setResolution(e.target.value)} style={{ flex: 1, fontSize: '0.85rem' }} />
                    <button className="btn btn-primary btn-sm" onClick={() => handleResolve(d.id)}>Resolve</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setResolving(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn btn-sm btn-secondary" onClick={() => { setResolving(d.id); setResolution(''); }}>
                    <CheckCircle size={13} /> Resolve Dispute
                  </button>
                )
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
