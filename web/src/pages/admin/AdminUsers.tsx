/**
 * AdminUsers.tsx
 * List, verify, block/unblock users from Supabase.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, ShieldOff, Shield, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface ProfileRow {
  id: string;
  user_id: string;
  role: string;
  full_name: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
}

const roleColors: Record<string, string> = {
  creator: 'badge-primary',
  brand: 'badge-info',
  admin: 'badge-warning',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.listUsers(1, 50);
      setUsers(res.data as ProfileRow[]);
      setTotal(res.total);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleBlock = async (userId: string, blocked: boolean) => {
    try {
      await adminService.setUserBlocked(userId, !blocked);
      toast.success(!blocked ? 'User blocked' : 'User unblocked');
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_blocked: !blocked } : u));
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleVerify = async (userId: string) => {
    try {
      await adminService.verifyUser(userId);
      toast.success('User verified');
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_verified: true } : u));
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.role.includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(108,62,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Users</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{total} total users</p>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 220 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
          <Users size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
          <p>No users found</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {filtered.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                opacity: u.is_blocked ? 0.6 : 1,
              }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.82rem', flexShrink: 0 }}>
                {(u.full_name || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {u.full_name || 'No name'}
                  {u.is_blocked && <span style={{ marginLeft: 8, fontSize: '0.7rem', color: 'var(--color-error)', fontWeight: 500 }}>BLOCKED</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${roleColors[u.role] || 'badge-muted'}`} style={{ fontSize: '0.72rem' }}>{u.role}</span>
                {u.is_verified
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 600 }}><CheckCircle size={13} /> Verified</span>
                  : <button className="btn btn-sm btn-secondary" onClick={() => handleVerify(u.user_id)} style={{ fontSize: '0.72rem', padding: '3px 10px' }}><Shield size={12} /> Verify</button>
                }
                <button
                  className={`btn btn-sm ${u.is_blocked ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleBlock(u.user_id, u.is_blocked)}
                  style={{ fontSize: '0.72rem', padding: '3px 10px' }}
                >
                  {u.is_blocked ? <><CheckCircle size={12} /> Unblock</> : <><ShieldOff size={12} /> Block</>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
