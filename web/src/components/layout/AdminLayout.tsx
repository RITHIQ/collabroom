import { Link, Outlet, useNavigate, NavLink } from 'react-router-dom';
import { Shield, LogOut, LayoutDashboard, Users, Briefcase, AlertTriangle, Megaphone } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

const adminNav = [
  { to: '/admin', icon: <LayoutDashboard size={17} />, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: <Users size={17} />, label: 'Users' },
  { to: '/admin/campaigns', icon: <Briefcase size={17} />, label: 'Campaigns' },
  { to: '/admin/disputes', icon: <AlertTriangle size={17} />, label: 'Disputes' },
  { to: '/admin/announcements', icon: <Megaphone size={17} />, label: 'Announcements' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);

  const signOut = async () => {
    await dispatch(logoutUser());
    navigate('/admin/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>

      {/* ── Admin Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-bg-card)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        <div style={{ padding: '20px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Logo */}
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(108,62,244,0.30)',
            }}>
              <Shield size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              Admin<span style={{ color: 'var(--color-primary)' }}>Panel</span>
            </span>
          </Link>

          {/* Nav label */}
          <p style={{
            fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.09em',
            padding: '0 6px', marginBottom: 6,
          }}>
            Management
          </p>

          <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {adminNav.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <div className={`nav-item${isActive ? ' active' : ''}`} style={{ paddingLeft: isActive ? 15 : 12 }}>
                    <span style={{ opacity: isActive ? 1 : 0.65, display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom: User + Sign out */}
        <div style={{ padding: '14px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>Signed in as</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || 'Admin'}
            </div>
            <span className="badge badge-warning" style={{ fontSize: '0.6rem', marginTop: 4 }}>🛡️ Admin</span>
          </div>
          <button
            onClick={signOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '7px 10px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-bg)', border: 'none',
              color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.82rem',
              cursor: 'pointer', transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.15)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-danger-bg)')}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 24px', height: 56,
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-card)',
        }}>
          <ThemeToggle />
        </header>
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
