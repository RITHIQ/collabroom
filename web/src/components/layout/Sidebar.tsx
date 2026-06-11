import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Search, FileText, Wallet,
  User, MessageSquare, Bell, Settings,
  TrendingUp, Briefcase, CreditCard, Zap, LogOut, Sparkles
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: string;
}

const creatorNav: NavItem[] = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard', to: '/dashboard' },
  { icon: <Search size={16} />, label: 'Find Campaigns', to: '/discover/brands' },
  { icon: <Briefcase size={16} />, label: 'My Campaigns', to: '/campaigns' },
  { icon: <FileText size={16} />, label: 'Contracts', to: '/contracts' },
  { icon: <Wallet size={16} />, label: 'Wallet', to: '/wallet' },
  { icon: <MessageSquare size={16} />, label: 'Messages', to: '/messages' },
  { icon: <Sparkles size={16} />, label: 'Colab AI', to: '/ai-brief', badge: 'AI' },
];

const brandNav: NavItem[] = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard', to: '/dashboard' },
  { icon: <Search size={16} />, label: 'Find Creators', to: '/discover/creators' },
  { icon: <TrendingUp size={16} />, label: 'Campaigns', to: '/campaigns' },
  { icon: <FileText size={16} />, label: 'Contracts', to: '/contracts' },
  { icon: <CreditCard size={16} />, label: 'Payments', to: '/payments' },
  { icon: <MessageSquare size={16} />, label: 'Messages', to: '/messages' },
  { icon: <Sparkles size={16} />, label: 'Colab AI', to: '/ai-brief', badge: 'AI' },
];

const accountNav: NavItem[] = [
  { icon: <Bell size={16} />, label: 'Notifications', to: '/notifications' },
  { icon: <User size={16} />, label: 'Profile', to: '/profile/edit' },
  { icon: <Settings size={16} />, label: 'Settings', to: '/settings' },
];

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);
  const navItems = user?.role === 'brand' ? brandNav : creatorNav;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const roleLabel = user?.role === 'brand' ? 'Brand' : 'Creator';
  const initials = (user?.email ?? 'U').slice(0, 1).toUpperCase();
  const emailDisplay = user?.email ?? '';

  return (
    <aside className="sidebar desktop-only" style={{ width: 'var(--sidebar-width)' }}>
      <div style={{ padding: '20px 14px', display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── Logo ── */}
        <div style={{ padding: '0 6px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Zap size={13} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
            ColabRoom
          </span>
        </div>

        {/* ── Main Nav ── */}
        <nav style={{ flex: 1 }}>
          <p style={{
            fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            padding: '0 6px', marginBottom: 8,
          }}>
            Main
          </p>

          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`nav-item${isActive ? ' active' : ''}`}
                >
                  <span style={{
                    opacity: isActive ? 1 : 0.5,
                    display: 'flex', alignItems: 'center',
                    transition: 'opacity 0.15s',
                  }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 700, padding: '2px 6px',
                      borderRadius: 4, background: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.7)',
                      marginLeft: 'auto',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 6px' }} />

          <p style={{
            fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            padding: '0 6px', marginBottom: 8,
          }}>
            Account
          </p>

          {accountNav.map((item) => (
            <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div className={`nav-item${isActive ? ' active' : ''}`}>
                  <span style={{ opacity: isActive ? 1 : 0.5, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── User Card ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 16,
          marginTop: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 2px' }}>
            <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.75rem', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {emailDisplay.split('@')[0]}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                {roleLabel}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '7px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.35)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.2)';
              (e.currentTarget as HTMLElement).style.color = '#f87171';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)';
            }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
