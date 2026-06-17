import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Bell, MessageSquare, Search, ChevronDown,
  LogOut, User, Settings, LayoutDashboard, Zap, CheckCheck
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { notificationService } from '../../services/notificationService';

interface NotifItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

const notifIcon: Record<string, string> = {
  announcement: '📢', payment: '💰', campaign: '📋', contract: '📄',
  content_approved: '✅', application: '📩', dispute: '⚖️', system: '🔔',
};

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(s => s.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;
    const load = async () => {
      const data = await notificationService.list(user.id, 8);
      setNotifs(data as NotifItem[]);
      setUnreadCount((data as NotifItem[]).filter(n => !n.is_read).length);
    };
    void load();
  }, [user?.id, isAuthenticated]);

  const handleMarkRead = async (id: string) => {
    await notificationService.markRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await notificationService.markAllRead(user.id);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await dispatch(logoutUser());
    navigate('/login');
  };

  const initials = (user?.email ?? 'U').slice(0, 1).toUpperCase();

  const navbarStyle: React.CSSProperties = {
    background: scrolled ? 'rgba(0,0,0,0.92)' : 'rgba(10,10,10,0.5)',
    backdropFilter: scrolled ? 'blur(20px)' : 'blur(8px)',
    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(8px)',
    borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    height: 56,
    transition: 'all 0.35s ease',
  };

  const iconBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: 8,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.45)',
    transition: 'all 0.15s ease',
    position: 'relative' as const,
    flexShrink: 0,
  };

  return (
    <header style={navbarStyle}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '100%', padding: '0 20px', gap: 16,
      }}>

        {/* Logo — mobile only */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="mobile-only"
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={13} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
            ColabRoom
          </span>
        </Link>

        {/* Search — authenticated desktop */}
        {isAuthenticated && (
          <div className="desktop-only search-bar" style={{ flex: 1, maxWidth: 340, margin: '0 8px' }}>
            <span className="search-icon"><Search size={14} /></span>
            <input
              className="search-input"
              placeholder="Search campaigns, creators…"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
            {searchVal && (
              <button className="search-clear" onClick={() => setSearchVal('')}>×</button>
            )}
          </div>
        )}

        {!isAuthenticated && <div className="desktop-only" style={{ flex: 1 }} />}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              {/* Messages */}
              <Link to="/messages" style={iconBtnStyle} title="Messages"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
              >
                <MessageSquare size={15} />
              </Link>

              {/* Notifications */}
              <div style={{ position: 'relative' }}>
                <button
                  style={{ ...iconBtnStyle }}
                  title="Notifications"
                  onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 2, right: 2,
                      minWidth: 14, height: 14, borderRadius: 8,
                      background: '#f87171',
                      border: '1.5px solid #0a0a0a',
                      fontSize: '0.55rem', fontWeight: 800, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 2px', lineHeight: 1,
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.14 }}
                      style={{
                        position: 'absolute', right: 0,
                        top: 'calc(100% + 10px)',
                        width: 340,
                        background: '#0f0f0f',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        zIndex: 200,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Header */}
                      <div style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>
                          Notifications
                          {unreadCount > 0 && (
                            <span style={{ marginLeft: 8, fontSize: '0.65rem', background: 'rgba(248,113,113,0.15)', color: '#f87171', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                              {unreadCount}
                            </span>
                          )}
                        </span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 500,
                            display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                            transition: 'color 0.15s',
                          }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                          >
                            <CheckCheck size={12} /> Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                        {notifs.length === 0 ? (
                          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>
                            No notifications yet
                          </div>
                        ) : (
                          notifs.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => { if (!n.is_read) handleMarkRead(n.id); }}
                              style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', gap: 10, cursor: 'pointer',
                                background: !n.is_read ? 'rgba(255,255,255,0.03)' : 'transparent',
                                borderLeft: !n.is_read ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                              onMouseLeave={e => (e.currentTarget.style.background = !n.is_read ? 'rgba(255,255,255,0.03)' : 'transparent')}
                            >
                              <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem', flexShrink: 0,
                              }}>
                                {notifIcon[n.type] || '🔔'}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: n.is_read ? 400 : 600, fontSize: '0.8rem', marginBottom: 2, color: '#ffffff' }}>
                                  {n.title}
                                </div>
                                {n.body && (
                                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {n.body}
                                  </div>
                                )}
                                <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                                  {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              {!n.is_read && (
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff', flexShrink: 0, marginTop: 6, opacity: 0.6 }} />
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <Link to="/notifications" style={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.45)' }} onClick={() => setNotifOpen(false)}
                          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="desktop-only" style={{ position: 'relative' }}>
                <button
                  data-testid="avatar"
                  onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 10px 5px 6px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 100,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  <div className="avatar" style={{ width: 24, height: 24, fontSize: '0.68rem' }}>
                    {initials}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={12} color="rgba(255,255,255,0.35)" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.14 }}
                      style={{
                        position: 'absolute', right: 0,
                        top: 'calc(100% + 10px)',
                        width: 200,
                        background: '#0f0f0f',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        zIndex: 200,
                        overflow: 'hidden',
                        padding: '6px',
                      }}
                    >
                      {[
                        { icon: <LayoutDashboard size={14} />, label: 'Dashboard', to: '/dashboard' },
                        { icon: <User size={14} />, label: 'My Profile', to: '/profile/edit' },
                        { icon: <Settings size={14} />, label: 'Settings', to: '/settings' },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 10px', borderRadius: 8,
                            color: 'rgba(255,255,255,0.5)',
                            textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500,
                            transition: 'all 0.12s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}

                      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '5px 0' }} />

                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 10px', borderRadius: 8,
                          color: 'rgba(248,113,113,0.6)',
                          background: 'transparent', border: 'none',
                          cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                          width: '100%', transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(248,113,113,0.6)'; }}
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
