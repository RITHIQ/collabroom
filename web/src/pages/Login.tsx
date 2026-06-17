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
          <Link to="/" data-testid="logo" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 48 }}>
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
              {/* ── Google Sign-In ── */}
              <button
                type="button"
                id="google-signin-btn"
                data-testid="google-signin"
                onClick={async () => {
                  try {
                    const { authAPI } = await import('../services/api');
                    await authAPI.oauthSignIn('google');
                  } catch (err) {
                    toast.error('Google sign-in failed. Try email/password.');
                  }
                }}
                style={{
                  width: '100%', height: 46, borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: '#ffffff', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  marginBottom: 20, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>or continue with email</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* Email */}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    id="login-email"
                    data-testid="email-input"
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
