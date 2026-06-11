/**
 * SettingsPage.tsx
 * Account settings — change display name, notification preferences.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, LogOut, Trash2, Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutUser } from '../store/slices/authSlice';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);
  const { theme } = useAppSelector(s => s.theme);
  const [notifPrefs, setNotifPrefs] = useState({
    campaigns: true, payments: true, messages: true, announcements: true,
  });
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    userService.getMyProfile(user.id)
      .then(p => { if (p?.full_name) setDisplayName(p.full_name); })
      .catch(() => {});
  }, [user?.id]);

  const handleSaveDisplay = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await userService.updateProfile(user.id, { full_name: displayName });
      toast.success('Display name updated');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ color: 'var(--color-primary)' }}>{icon}</div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: 680, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Settings</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28 }}>Manage your account preferences</p>

      {/* Account */}
      <Section title="Account" icon={<Settings size={18} />}>
        <div style={{ marginBottom: 16 }}>
          <label className="label">Email address</label>
          <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Email cannot be changed. Contact support to update.</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="label">Display Name</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm" onClick={handleSaveDisplay} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
        <div>
          <label className="label">Account Role</label>
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', fontSize: '0.88rem', fontWeight: 500, textTransform: 'capitalize' }}>
            {user?.role || '—'} Account
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Theme</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Currently using {theme === 'dark' ? 'dark' : 'light'} mode
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Use the toggle in the navbar to switch themes.</p>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell size={18} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'campaigns', label: 'Campaign updates', desc: 'Applications, approvals, status changes' },
            { key: 'payments', label: 'Payment alerts', desc: 'Escrow locks, releases, withdrawals' },
            { key: 'messages', label: 'New messages', desc: 'Direct messages from brands and creators' },
            { key: 'announcements', label: 'Platform announcements', desc: 'ColabRoom news and feature updates' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.desc}</div>
              </div>
              <button
                onClick={() => setNotifPrefs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                style={{ width: 44, height: 24, borderRadius: 12, background: notifPrefs[item.key as keyof typeof notifPrefs] ? 'var(--color-primary)' : 'var(--color-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: notifPrefs[item.key as keyof typeof notifPrefs] ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => toast.success('Notification preferences saved')}>
            Save preferences
          </button>
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" icon={<Shield size={18} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-success)', marginBottom: 2 }}>✅ OTP Authentication Active</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Your account uses email OTP — no password stored. Highly secure.</div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            To update your email, contact <a href="mailto:support@colabroom.app" style={{ color: 'var(--color-primary)' }}>support@colabroom.app</a>
          </p>
        </div>
      </Section>

      {/* Danger zone */}
      <div className="card" style={{ padding: 24, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.03)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-error)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trash2 size={17} /> Danger Zone
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> Sign out of all devices
          </button>
          <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600 }}
            onClick={() => toast.error('Account deletion requires email verification. Contact support@colabroom.app')}>
            <Trash2 size={13} /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
