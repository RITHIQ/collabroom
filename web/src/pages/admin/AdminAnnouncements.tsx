/**
 * AdminAnnouncements.tsx
 * Create and publish platform announcements from Supabase.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Send } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAppSelector } from '../../store';
import toast from 'react-hot-toast';

interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  target_audience: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export default function AdminAnnouncements() {
  const { user } = useAppSelector(s => s.auth);
  const [list, setList] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', target: 'all' as 'all' | 'creators' | 'brands' });

  const load = async () => {
    setLoading(true);
    adminService.listAnnouncements()
      .then(data => setList(data as AnnouncementRow[]))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { void load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { toast.error('Fill in all fields'); return; }
    if (!user?.id) return;
    setSubmitting(true);
    try {
      await adminService.createAnnouncement(user.id, form.title, form.body, form.target, true);
      toast.success('Announcement published & notifications sent!');
      setCreating(false);
      setForm({ title: '', body: '', target: 'all' });
      void load();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const targetLabel: Record<string, string> = { all: '👥 All Users', creators: '✨ Creators Only', brands: '🏢 Brands Only' };

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
            <Megaphone size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Announcements</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{list.length} sent</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(!creating)}>
          <Plus size={15} /> New Announcement
        </button>
      </div>

      {creating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Create Announcement</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 14, marginBottom: 14 }}>
              <div>
                <label className="label">Title *</label>
                <input className="input" required placeholder="Announcement title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">Send To</label>
                <select className="input" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value as typeof form.target }))} style={{ cursor: 'pointer' }}>
                  <option value="all">All Users</option>
                  <option value="creators">Creators Only</option>
                  <option value="brands">Brands Only</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">Message *</label>
              <textarea className="input" rows={4} required placeholder="Announcement message…" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Send size={15} /> {submitting ? 'Publishing…' : 'Publish & Notify'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
          <Megaphone size={48} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p>No announcements yet. Create your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h4 style={{ fontWeight: 700, margin: 0 }}>{a.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                  <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>{targetLabel[a.target_audience]}</span>
                  {a.is_published && <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Published</span>}
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{a.body}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                {a.published_at ? new Date(a.published_at).toLocaleString('en-IN') : 'Draft'}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
