import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import ThemeToggle from '../components/ui/ThemeToggle';
import toast from 'react-hot-toast';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special character', pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score] : 'var(--color-border)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {checks.map((c, i) => (
            <span key={i} style={{ fontSize: '0.7rem', color: c.pass ? 'var(--color-success)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <CheckCircle size={10} /> {c.label}
            </span>
          ))}
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: colors[score] }}>{labels[score]}</span>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Phase 1: Request Reset OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        // Handle specific error codes
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a minute before requesting another code.');
        }
        throw error;
      }

      toast.success('Password reset code sent to your email!');
      setPhase('otp');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Phase 2: Verify Recovery OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length < 6) {
      toast.error('Please enter the 6-digit reset code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'recovery',
      });

      if (error) {
        if (error.message.includes('expired')) {
          throw new Error('Code has expired. Please request a new reset code.');
        }
        if (error.status === 422 || error.message.toLowerCase().includes('invalid')) {
          throw new Error('Invalid code. Please check and try again.');
        }
        throw error;
      }

      toast.success('Code verified! You can now choose a new password.');
      setPhase('reset');
    } catch (err: any) {
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Phase 3: Set New Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('weak')) {
          throw new Error('Your password is too weak. Make sure it satisfies security checks.');
        }
        throw error;
      }

      // Log out to clear recovery session and force fresh login
      await supabase.auth.signOut();

      toast.success('Password updated successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      toast.success('A new reset code has been sent!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)', padding: 24 }}>
      <div style={{ position: 'fixed', top: 20, right: 20 }}><ThemeToggle /></div>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40, justifyContent: 'center' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6C3EF4, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'Sora', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Colab<span style={{ color: 'var(--color-primary)' }}>Room</span>
          </span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 32, borderRadius: 16, border: '1px solid var(--color-border)', background: 'var(--color-bg-card)' }}>
          <AnimatePresence mode="wait">
            {phase === 'email' && (
              <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Forgot password?</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.5 }}>
                  Enter your email address and we'll send you a 6-digit OTP code to reset your password.
                </p>
                <form onSubmit={handleRequestOtp}>
                  <div style={{ marginBottom: 20 }}>
                    <label className="label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input
                        className="input"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{ paddingLeft: 38 }}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
              </motion.div>
            )}

            {phase === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Enter Code</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.5 }}>
                  We sent a 6-digit recovery OTP to <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>.
                </p>
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ marginBottom: 20 }}>
                    <label className="label">6-digit recovery OTP</label>
                    <input
                      className="input text-center tracking-[0.25em]"
                      type="text"
                      required
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\s/g, ''))}
                      placeholder="------"
                      maxLength={6}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Didn't receive the code?{' '}
                    <button onClick={handleResendOtp} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                      Resend code
                    </button>
                  </span>
                </div>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button onClick={() => setPhase('email')} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Change Email
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Choose new password</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.5 }}>
                  Identity verified! Set your new account password below.
                </p>
                <form onSubmit={handleUpdatePassword}>
                  <div style={{ marginBottom: 16 }}>
                    <label className="label">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input
                        className="input"
                        type={showPass ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Min. 8 characters"
                        style={{ paddingLeft: 38, paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <PasswordStrength password={form.password} />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label className="label">Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input
                        className="input"
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        value={form.confirmPassword}
                        onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        placeholder="Re-enter password"
                        style={{ paddingLeft: 38, paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/login" style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>← Back to Sign In</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
