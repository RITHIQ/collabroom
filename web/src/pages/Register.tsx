import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, ArrowLeft, Camera, Briefcase, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { registerUser, setUser } from '../store/slices/authSlice';
import { isMockAuthEnabled } from '../lib/mockAuth';
import toast from 'react-hot-toast';

type Role = 'creator' | 'brand' | null;

const niches = ['Beauty', 'Fitness', 'Technology', 'Food & Cooking', 'Travel', 'Gaming', 'Finance', 'Education', 'Fashion', 'Music', 'Comedy', 'Parenting', 'Health & Wellness', 'Sports', 'Photography'];
const platforms = ['Instagram', 'YouTube', 'TikTok', 'Twitter/X', 'LinkedIn'];
const industries = ['Beauty & Personal Care', 'Consumer Electronics', 'Food & Beverage', 'Fashion & Apparel', 'Health & Fitness', 'Finance & Fintech', 'Education & EdTech', 'Travel & Hospitality', 'Gaming', 'Automotive'];
const companySizes = ['1-10', '11-50', '51-200', '201-500', '500-1000', '1000+'];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special character', pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['#f87171', '#fbbf24', '#fbbf24', '#4ade80', '#4ade80'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i <= score ? colors[score] : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
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

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading } = useAppSelector(s => s.auth);
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<Role>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
    niche: '', platform: '', country: 'India',
    companyName: '', handle: '', industry: '', companySize: '', website: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }
    if (!role) {
      toast.error('Select a role');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const metadata = role === 'creator'
      ? { fullName: form.fullName, username: form.username, niche: form.niche, platform: form.platform, country: form.country }
      : { companyName: form.companyName, handle: form.handle, industry: form.industry, companySize: form.companySize, website: form.website };

    if (isMockAuthEnabled()) {
      dispatch(setUser({
        id: 'mock-user-id',
        email: form.email,
        role,
        isVerified: true,
        createdAt: new Date().toISOString()
      }));
      toast.success('Registered successfully (Mock Mode)! 🎉');
      navigate('/onboarding');
      return;
    }

    const result = await dispatch(registerUser({ email: form.email, password: form.password, role, metadata }));
    if (registerUser.fulfilled.match(result)) {
      const payload = result.payload as any;
      if (payload?.session) {
        toast.success('Account created! Welcome to ColabRoom 🎉');
        navigate('/onboarding');
      } else {
        toast.success('Registration successful! Please check your email to confirm your account.');
        navigate('/login');
      }
    } else {
      toast.error((result.payload as string) || 'Registration failed. Please try again.');
    }
  };

  return (
    <>
      <div
        style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', justifyContent: step === 'form' ? 'flex-start' : 'center' }}
      >
        <div style={{ width: '100%', maxWidth: 520 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', marginBottom: 36 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              ColabRoom
            </span>
          </Link>

          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {step === 'role' && (
              <motion.div key="role" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 8, color: '#fff' }}>Join ColabRoom</h1>
                <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: 36 }}>I want to join as a...</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                  {[
                    { r: 'creator' as Role, icon: <Camera size={24} />, title: 'Creator', desc: 'I create content and want to partner with brands', perks: ['Get discovered by top brands', 'Secure escrow payments', 'Build your CreatorScore'] },
                    { r: 'brand' as Role, icon: <Briefcase size={24} />, title: 'Brand', desc: 'I want to find creators for my marketing campaigns', perks: ['Access 50K+ verified creators', 'AI-powered matching', 'Manage campaigns easily'] },
                  ].map(({ r, icon, title, desc, perks }) => (
                    <motion.div key={r!} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { setRole(r); setStep('form'); }}
                      style={{
                        padding: 24, borderRadius: 14,
                        border: `1px solid ${role === r ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        background: role === r ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>{icon}</div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6, color: '#fff' }}>{title}</h3>
                      <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: 14, lineHeight: 1.5 }}>{desc}</p>
                      <ul style={{ listStyle: 'none' }}>
                        {perks.map((p, i) => <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#888', marginBottom: 4 }}><CheckCircle size={11} color="rgba(74,222,128,0.6)" />{p}</li>)}
                      </ul>
                    </motion.div>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
                  Already have an account?{' '}<Link to="/login" style={{ color: '#fff', fontWeight: 600 }}>Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Registration Form */}
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={() => setStep('role')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  <ArrowLeft size={14} /> Back
                </button>
                
                {isMockAuthEnabled() && (
                  <div style={{ marginBottom: 20, borderRadius: 10, border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.06)', padding: '10px 14px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                    <strong style={{ color: '#fff' }}>Dev mock auth:</strong> Sign up will simulate a success.
                  </div>
                )}
                
                <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: 6 }}>
                  {role === 'creator' ? 'Creator Account' : 'Brand Account'}
                </h1>
                <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: 24 }}>Fill in your details to get started</p>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {role === 'creator' ? (
                      <>
                        <div style={{ gridColumn: '1 / -1' }}><label className="label">Full Name *</label><input className="input" required value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your full name" /></div>
                        <div><label className="label">Username *</label><input className="input" required value={form.username} onChange={e => set('username', e.target.value)} placeholder="@username" /></div>
                        <div><label className="label">Country</label>
                          <select className="input" value={form.country} onChange={e => set('country', e.target.value)}>
                            {['India', 'USA', 'UK', 'UAE', 'Singapore', 'Australia'].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div><label className="label">Primary Niche *</label>
                          <select className="input" required value={form.niche} onChange={e => set('niche', e.target.value)}>
                            <option value="">Select niche</option>
                            {niches.map(n => <option key={n}>{n}</option>)}
                          </select>
                        </div>
                        <div><label className="label">Primary Platform *</label>
                          <select className="input" required value={form.platform} onChange={e => set('platform', e.target.value)}>
                            <option value="">Select platform</option>
                            {platforms.map(p => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ gridColumn: '1 / -1' }}><label className="label">Company Name *</label><input className="input" required value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Your company name" /></div>
                        <div><label className="label">Brand Handle *</label><input className="input" required value={form.handle} onChange={e => set('handle', e.target.value)} placeholder="@brandhandle" /></div>
                        <div><label className="label">Company Size</label>
                          <select className="input" value={form.companySize} onChange={e => set('companySize', e.target.value)}>
                            <option value="">Select size</option>
                            {companySizes.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div><label className="label">Industry *</label>
                          <select className="input" required value={form.industry} onChange={e => set('industry', e.target.value)}>
                            <option value="">Select industry</option>
                            {industries.map(i => <option key={i}>{i}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}><label className="label">Website</label><input className="input" type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://example.com" /></div>
                      </>
                    )}
                    <div style={{ gridColumn: '1 / -1' }}><label className="label">Email Address *</label><input className="input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" inputMode="email" /></div>
                    
                    <div className="sm:col-span-2">
                      <label className="label">Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input className="input" type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => set('password', e.target.value)} placeholder="Create a strong password" style={{ paddingRight: 44 }} />
                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <PasswordStrength password={form.password} />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="label">Confirm Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input className="input" type={showConfirmPass ? 'text' : 'password'} required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Re-enter your password" style={{ paddingRight: 44 }} />
                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                          {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 16, marginBottom: 20 }}>
                    <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: 2, flexShrink: 0, accentColor: '#ffffff' }} />
                    <span style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.5 }}>
                      I agree to ColabRoom's <a href="#" style={{ color: '#fff' }}>Terms of Service</a> and <a href="#" style={{ color: '#fff' }}>Privacy Policy</a>
                    </span>
                  </label>

                  <motion.button
                    id="register-submit" type="submit" disabled={isLoading}
                    whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{ width: '100%', height: 48, borderRadius: 10, background: '#ffffff', color: '#0a0a0a', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isLoading ? 0.6 : 1 }}
                  >
                    {isLoading ? 'Creating account…' : <><span>Create Account</span><ArrowRight size={16} /></>}
                  </motion.button>
                </form>
                <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
                  Already have an account?{' '}<Link to="/login" style={{ color: '#fff', fontWeight: 600 }}>Sign in</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
