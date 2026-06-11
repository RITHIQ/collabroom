import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, setUser } from '../store/slices/authSlice';
import { ADMIN_DEMO_ACCESS_CODE } from '../admin/adminDemo';
import { setAdminDemoSession } from '../admin/adminSession';
import toast from 'react-hot-toast';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useAppSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter both email and password');
      return;
    }

    if (form.password === ADMIN_DEMO_ACCESS_CODE || form.email.trim() === ADMIN_DEMO_ACCESS_CODE) {
      setAdminDemoSession();
      dispatch(setUser({
        id: 'admin-demo-id',
        email: form.email.includes('@') ? form.email.trim() : 'admin@colabroom.app',
        role: 'admin',
        isVerified: true,
        createdAt: new Date().toISOString(),
      }));
      toast.success('Welcome back, Admin!');
      navigate('/admin', { replace: true });
      return;
    }

    const result = await dispatch(loginUser({ email: form.email, password: form.password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      const loggedInUser = result.payload.user;
      if (loggedInUser?.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    } else {
      toast.error((result.payload as string) || 'Invalid email or password');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 10,
    color: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem',
    outline: 'none',
    height: 46,
    transition: 'border-color 0.15s, background 0.15s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* ── Form Panel (Left) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 48 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              ColabRoom
            </span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8, color: '#ffffff' }}>
              Welcome back
            </h1>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 36 }}>
              Sign in to your ColabRoom account
            </p>

            <form onSubmit={handleSignIn}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    autoComplete="email"
                    style={{ ...inputStyle, paddingLeft: 42 }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Password
                  </label>
                  <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingLeft: 42, paddingRight: 44 }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <p style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: 16 }}>{error}</p>}

              <motion.button
                id="login-submit"
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                disabled={isLoading}
                style={{
                  width: '100%', height: 48, borderRadius: 10,
                  background: '#ffffff', color: '#0a0a0a',
                  border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: isLoading ? 0.6 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {isLoading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16} /></>}
              </motion.button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 28, fontSize: '0.85rem', color: '#888' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
                Sign up free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Visual Panel (Right) ── */}
      <div style={{
        background: '#0f0f0f',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 60, position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,255,255,0.04), transparent)',
        }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 420 }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            {/* Big editorial number */}
            <div style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '7rem', fontWeight: 800,
              color: 'rgba(255,255,255,0.06)',
              lineHeight: 1, letterSpacing: '-0.06em',
              marginBottom: 32,
              userSelect: 'none',
            }}>
              CR
            </div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16 }}>
              The Creator Economy<br />Operating System
            </h2>
            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 36 }}>
              Connect, collaborate, and grow your creator business with the most powerful platform in India.
            </p>

            {/* Stat pills */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['50K+', 'Creators'], ['8K+', 'Brands'], ['₹120Cr+', 'Paid Out']].map(([val, label]) => (
                <div key={label} style={{
                  padding: '8px 16px', borderRadius: 100,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{val}</span>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
