/**
 * AdminLogin.tsx
 * Real Supabase Email/Password login for admin users.
 * Role is verified from public.profiles table — only 'admin' role users are allowed.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearAuth, setUser } from '../../store/slices/authSlice';
import { ADMIN_DEMO_ACCESS_CODE } from '../../admin/adminDemo';
import { setAdminDemoSession } from '../../admin/adminSession';

export default function AdminLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, user, isAuthenticated } = useAppSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in as admin, go to dashboard
  if (isAuthenticated && user?.role === 'admin') {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter both email and password');
      return;
    }

    // Demo admin bypass code check
    if (form.password === ADMIN_DEMO_ACCESS_CODE || form.email.trim() === ADMIN_DEMO_ACCESS_CODE) {
      setAdminDemoSession();
      dispatch(setUser({
        id: 'admin-demo-id',
        email: form.email.includes('@') ? form.email.trim() : 'admin@colabroom.app',
        role: 'admin',
        isVerified: true,
        createdAt: new Date().toISOString(),
      }));
      toast.success('Welcome, Admin (Demo)!');
      navigate('/admin', { replace: true });
      return;
    }

    const result = await dispatch(loginUser({ email: form.email.trim(), password: form.password }));
    if (loginUser.fulfilled.match(result)) {
      const loggedInUser = result.payload.user;
      if (loggedInUser?.role !== 'admin') {
        toast.error('This account does not have admin access');
        dispatch(clearAuth());
        return;
      }
      toast.success('Welcome, Admin!');
      navigate('/admin', { replace: true });
    } else {
      toast.error((result.payload as string) || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
        <Link to="/" className="mb-8 flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6C3EF4,#A78BFA)]">
            <Shield size={18} color="#fff" />
          </div>
          <span className="font-[Sora] text-[1.1rem] font-bold text-[var(--color-text-primary)]">
            Admin <span className="text-[var(--color-primary)]">Panel</span>
          </span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="text-[1.65rem] font-extrabold text-[var(--color-text-primary)]">Admin sign in</h1>
          <p className="mt-2 text-[0.95rem] text-[var(--color-text-secondary)]">
            Sign in with your admin account credentials.
          </p>

          <div className="mt-5 flex gap-2 rounded-xl border border-[rgba(108,62,244,0.2)] bg-[rgba(108,62,244,0.06)] p-3.5">
            <Mail size={18} color="var(--color-primary)" className="mt-0.5 shrink-0" />
            <p className="text-[0.8rem] leading-6 text-[var(--color-text-secondary)]">
              Only accounts with <strong className="text-[var(--color-text-primary)]">admin role</strong> in the database can access this panel.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="mt-8">
            <div className="mb-4">
              <label className="label" htmlFor="admin-email">Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  id="admin-email"
                  className="input"
                  type="email"
                  placeholder="admin@colabroom.app"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="label" htmlFor="admin-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  id="admin-password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  style={{ paddingLeft: 42, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-6 w-full justify-center gap-2 px-4 py-3 text-[0.95rem]"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-[0.85rem] text-[var(--color-text-muted)]">
            <Link to="/login" className="font-medium text-[var(--color-primary)]">User login</Link>
            {' · '}
            <Link to="/" className="font-medium text-[var(--color-primary)]">Home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
