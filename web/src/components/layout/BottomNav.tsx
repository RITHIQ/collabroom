import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Briefcase, MessageSquare, User } from 'lucide-react';
import { useAppSelector } from '../../store';

export default function BottomNav() {
  const { user } = useAppSelector(s => s.auth);
  
  const discoverLink = user?.role === 'brand' ? '/discover/creators' : '/discover/brands';

  const navItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Home', to: '/dashboard' },
    { icon: <Search size={22} />, label: 'Discover', to: discoverLink },
    { icon: <Briefcase size={22} />, label: 'Campaigns', to: '/campaigns' },
    { icon: <MessageSquare size={22} />, label: 'Messages', to: '/messages' },
    { icon: <User size={22} />, label: 'Profile', to: '/profile/edit' },
  ];

  return (
    <div className="bottom-nav mobile-only">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', padding: '0 8px' }}>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none', flex: 1 }}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '8px 0',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: -2,
                  width: 32,
                  height: 3,
                  borderRadius: '0 0 4px 4px',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  transition: 'background var(--transition-fast)'
                }} />
                {item.icon}
                <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 600 : 500, marginTop: 2 }}>
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
