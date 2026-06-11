import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, KeyRound, CheckCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { isMockAuthEnabled } from '../lib/mockAuth';
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [flow, setFlow] = useState<'link' | 'otp'>('link');
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    // Check if we are already authenticated (which happens when clicking the recovery email link)
    const checkSession = async () => {
      if (isMockAuthEnabled()) {
        setIsSessionActive(true);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsSessionActive(true);
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
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
      if (isMockAuthEnabled()) {
        toast.success('Password updated successfully (Mock Mode)!');
        navigate('/login');
        return;
      }

      if (flow === 'otp') {
        // First verify the recovery OTP
        const { error: otpError } = await supabase.auth.verifyOtp({
          email: form.email,
          token: form.otp,
          type: 'recovery',
        });
        if (otpError) throw otpError;
      }

      // Update the user's password using the active session
      const { error: updateError } = await supabase.auth.updateUser({
        password: form.password,
      });
      if (updateError) throw updateError;

      // Log out to force fresh login with new password
      await supabase.auth.signOut();

      toast.success('Password updated successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)', padding: 24 }}>
      <div style={{ position: 'fixed', top: 20, right: 20 }}><ThemeToggle /></div>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40, justifyContent: 'center' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6C3EF4, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'Sora', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Colab<span style={{ color: 'var(--color-primary)' }}>Room</span>
          </span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 32, borderRadius: 16, border: '1px solid var(--color-border)', background: 'var(--color-bg-card)' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Reset your password</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.5 }}>
            {isSessionActive
              ? 'Your email reset link is verified. Choose a new password below.'
              : 'Choose how you want to verify your identity and enter a new password.'}
          </p>

          {!isSessionActive && (
            <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.04)', padding: 4, borderRadius: 8, marginBottom: 24 }}>
              <button
                type="button"
                onClick={() => setFlow('link')}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none', background: flow === 'link' ? 'var(--color-bg-card)' : 'transparent', color: flow === 'link' ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', boxShadow: flow === 'link' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
              >
                Reset Link
              </button>
              <button
                type="button"
                onClick={() => setFlow('otp')}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none', background: flow === 'otp' ? 'var(--color-bg-card)' : 'transparent', color: flow === 'otp' ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', boxShadow: flow === 'otp' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
              >
                OTP Code
              </button>
            </div>
          )}

          {flow === 'link' && !isSessionActive ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                If you accessed this page directly without clicking a recovery link from your email, please use the <strong>OTP Code</strong> tab above or click the button below to request a reset email.
              </p>
              <Link to="/forgot-password" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Request Reset Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset}>
              {flow === 'otp' && !isSessionActive && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label className="label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input
                        className="input"
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@example.com"
                        style={{ paddingLeft: 38 }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="label">6-digit Recovery OTP</label>
                    <input
                      className="input text-center tracking-[0.25em]"
                      type="text"
                      required
                      value={form.otp}
                      onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\s/g, '') }))}
                      placeholder="------"
                      maxLength={6}
                    />
                  </div>
                </>
              )}

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
                {loading ? 'Resetting Password...' : 'Update Password'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/login" style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>← Back to Sign In</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
