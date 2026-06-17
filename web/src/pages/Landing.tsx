import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Shield, TrendingUp,
  FileText, Wallet, Search, Play,
  CheckCircle, Sparkles, ChevronDown
} from 'lucide-react';
import DemoVideoModal from '../components/ui/DemoVideoModal';

/* ─── Animation Variants ───────────────────────────────── */
const scrollReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

const wordReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: 'easeOut' as const },
  }),
};

/* ─── Ticker Data ───────────────────────────────────────── */
const tickerCreators = [
  { name: 'Priya Sharma', platform: 'Instagram', followers: '285K', niche: 'Lifestyle' },
  { name: 'Rohan Gupta', platform: 'YouTube', followers: '1.2M', niche: 'Tech' },
  { name: 'Aisha Bose', platform: 'Instagram', followers: '425K', niche: 'Travel' },
  { name: 'Dev Nair', platform: 'YouTube', followers: '890K', niche: 'Finance' },
  { name: 'Meera Pillai', platform: 'Instagram', followers: '156K', niche: 'Beauty' },
  { name: 'Arjun Singh', platform: 'YouTube', followers: '2.1M', niche: 'Gaming' },
  { name: 'Kavya Reddy', platform: 'Instagram', followers: '340K', niche: 'Fitness' },
  { name: 'Nitin Ahuja', platform: 'YouTube', followers: '670K', niche: 'Comedy' },
];

const tickerCreators2 = [
  { name: 'Sneha Iyer', platform: 'Instagram', followers: '198K', niche: 'Food' },
  { name: 'Rahul Verma', platform: 'YouTube', followers: '3.4M', niche: 'Education' },
  { name: 'Tara Kapoor', platform: 'Instagram', followers: '512K', niche: 'Fashion' },
  { name: 'Vikram Das', platform: 'YouTube', followers: '445K', niche: 'Music' },
  { name: 'Anjali Menon', platform: 'Instagram', followers: '290K', niche: 'Wellness' },
  { name: 'Siddharth Rao', platform: 'YouTube', followers: '1.8M', niche: 'Sports' },
  { name: 'Pooja Chawla', platform: 'Instagram', followers: '723K', niche: 'Photography' },
  { name: 'Karan Shah', platform: 'YouTube', followers: '560K', niche: 'Finance' },
];

/* ─── Features ──────────────────────────────────────────── */
const features = [
  { icon: <Search size={20} />, title: 'AI-Powered Discovery', desc: 'Find the perfect creator using our cosine similarity engine trained on campaign data.' },
  { icon: <FileText size={20} />, title: 'Smart Contracts', desc: 'Auto-generate legally sound contracts. E-sign in one click. PDF saved instantly.' },
  { icon: <Shield size={20} />, title: 'Escrow Payments', desc: 'Funds held securely until milestones are approved. Creators paid on approval.' },
  { icon: <Sparkles size={20} />, title: 'Colab AI Brief', desc: 'Describe your product in 3 sentences. AI generates a full campaign brief in seconds.' },
  { icon: <TrendingUp size={20} />, title: 'Campaign Analytics', desc: 'Track clicks, conversions, and ROI across all active campaigns in one dashboard.' },
  { icon: <Wallet size={20} />, title: 'Creator Wallet', desc: 'Manage earnings, withdraw via UPI or bank transfer, track every transaction.' },
];

/* ─── Stats ─────────────────────────────────────────────── */
const stats = [
  { end: 50000, label: 'Verified Creators', prefix: '', suffix: '+' },
  { end: 8000, label: 'Active Brands', prefix: '', suffix: '+' },
  { end: 120, label: 'Paid Out (Cr)', prefix: '₹', suffix: 'Cr+' },
  { end: 99, label: 'Satisfaction Rate', prefix: '', suffix: '.2%' },
];

/* ─── Testimonials ───────────────────────────────────────── */
const testimonials = [
  { name: 'Priya Sharma', role: 'Lifestyle Creator • 285K followers', text: 'ColabRoom changed everything. I went from chasing brand payments for months to getting paid within 24 hours of approval.' },
  { name: 'Rohan Gupta', role: 'Head of Influencer Marketing, NykaaMan', text: 'We run 30+ creator campaigns per month. ColabRoom cut our management time by 70%. The AI brief generator is incredible.' },
  { name: 'Aisha Bose', role: 'Travel Creator • 425K followers', text: "I've tried every creator platform. None come close to ColabRoom's contract system. I finally feel legally protected." },
  { name: 'Dev Nair', role: 'Finance Creator • 890K followers', text: 'The campaign room is a game changer. Real-time feedback, version history, and instant payment on approval.' },
];

/* ─── FAQ ───────────────────────────────────────────────── */
const faqs = [
  { q: 'How does escrow payment work?', a: 'Brands deposit the full campaign amount into ColabRoom escrow at contract signing. Funds are released to creators automatically when content is approved — no chasing invoices.' },
  { q: 'Is ColabRoom free to use?', a: 'Yes. Our free plan supports up to 3 active campaigns. We charge an 8% platform fee from brands and 2% from creators per transaction.' },
  { q: 'How does AI creator matching work?', a: 'Our engine analyzes campaign niche, target audience demographics, budget range, and past performance using cosine similarity to rank the best-fit creators for your brief.' },
  { q: 'Can creators from outside India use ColabRoom?', a: 'Yes. ColabRoom supports international payments via Stripe Connect. Creators can withdraw via ACH (US), SEPA (Europe), or UPI/NEFT (India).' },
  { q: 'What happens if there is a dispute?', a: 'Either party can raise a dispute. The other party has 48 hours to respond. If unresolved in 72 hours, a ColabRoom mediator reviews evidence and makes a binding decision.' },
];

/* ─── Count Up Hook ─────────────────────────────────────── */
function useCountUp(end: number, duration = 2000, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, trigger]);
  return count;
}

/* ─── Ticker Card ───────────────────────────────────────── */
function TickerCard({ creator }: { creator: typeof tickerCreators[0] }) {
  const initials = creator.name.split(' ').map(n => n[0]).join('');
  return (
    <div className="hf-ticker-card">
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.72rem', fontWeight: 700, color: '#ffffff',
        fontFamily: 'Sora, sans-serif', flexShrink: 0,
      }}>
        {initials}
      </div>
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.2 }}>{creator.name}</div>
        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{creator.niche}</div>
      </div>
      <div style={{
        fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)',
        padding: '3px 8px', borderRadius: 100,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        whiteSpace: 'nowrap',
      }}>
        {creator.followers}
      </div>
    </div>
  );
}

/* ─── FAQ Item ──────────────────────────────────────────── */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={scrollReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      custom={index * 0.05}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer',
          color: '#ffffff', textAlign: 'left', gap: 16,
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'Sora, sans-serif', letterSpacing: '-0.01em' }}>
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ flexShrink: 0, color: 'rgba(255,255,255,0.4)' }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ paddingBottom: 22, color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', lineHeight: 1.7 }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Stats Section ─────────────────────────────────────── */
function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const counts = stats.map(s => useCountUp(s.end, 2000, inView));
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.08)' }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: '40px 32px', background: '#0a0a0a', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 8 }}>
            {s.prefix}{counts[i].toLocaleString()}{s.suffix}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const heroWords = 'The Operating System for the Creator Economy'.split(' ');

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#ffffff' }}>

      {/* ══ NAVBAR ══ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(0,0,0,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        transition: 'all 0.35s ease',
      }}>
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          {/* Logo */}
          <div data-testid="logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={14} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              ColabRoom
            </span>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
              <a key={label} href={href} style={{ fontSize: '0.88rem', fontWeight: 500, color: '#666', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666')}
              >{label}</a>
            ))}
          </nav>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'transparent' }}>Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started Free <ArrowRight size={13} /></Link>
          </div>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section style={{ paddingTop: 180, paddingBottom: 80, minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 24 }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 100,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.03em',
            }}>
              <Sparkles size={12} color="rgba(255,255,255,0.5)" />
              THE CREATOR ECONOMY OS
            </span>
          </motion.div>

          {/* Word-by-word Headline */}
          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 800,
            fontSize: 'clamp(3rem, 6vw, 5.5rem)',
            lineHeight: 1.05, letterSpacing: '-0.04em',
            maxWidth: 820, marginBottom: 28,
          }}>
            {heroWords.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordReveal}
                initial="hidden"
                animate="visible"
                style={{ display: 'inline-block', marginRight: '0.3em' }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.55 }}
            style={{ fontSize: '1.15rem', color: '#888', maxWidth: 540, lineHeight: 1.7, marginBottom: 40 }}
          >
            Discover creators, manage campaigns, sign contracts, and handle
            payments — all in one secure workspace built for India's creator economy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ spring: { stiffness: 300, damping: 20 } } as React.CSSProperties}>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: 10 }}>
                Start for Free <ArrowRight size={17} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <button className="btn btn-secondary btn-lg" onClick={() => setDemoOpen(true)} style={{ gap: 10 }}>
                <Play size={15} fill="currentColor" /> Watch Demo
              </button>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ marginTop: 20, fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}
          >
            No credit card required · Free forever plan available
          </motion.p>
        </div>
      </section>

      {/* ══ CREATOR TICKER ══ */}
      <section style={{ paddingBottom: 100, overflow: 'hidden' }}>
        <div style={{ marginBottom: 16 }}>
          <div className="hf-ticker-wrapper">
            <div className="hf-marquee">
              {[...tickerCreators, ...tickerCreators].map((c, i) => (
                <TickerCard key={i} creator={c} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="hf-ticker-wrapper">
            <div className="hf-marquee-reverse">
              {[...tickerCreators2, ...tickerCreators2].map((c, i) => (
                <TickerCard key={i} creator={c} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ padding: '80px 0', background: '#0f0f0f' }}>
        <div className="container">
          <StatsSection />
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ padding: '120px 0' }}>
        <div className="container">
          <motion.div
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            style={{ marginBottom: 16 }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              PLATFORM FEATURES
            </span>
          </motion.div>
          <motion.h2
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={0.1}
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', maxWidth: 600, marginBottom: 64 }}
          >
            Everything you need. Nothing you don't.
          </motion.h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.08)' }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={scrollReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                custom={i * 0.1}
                style={{
                  padding: '36px 32px',
                  background: '#0a0a0a',
                  transition: 'background 0.2s',
                }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.6)', marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h4>
                <p style={{ color: '#888', fontSize: '0.88rem', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" style={{ padding: '120px 0', background: '#0f0f0f' }}>
        <div className="container">
          <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} style={{ marginBottom: 16 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.12em' }}>HOW IT WORKS</span>
          </motion.div>
          <motion.h2
            variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={0.1}
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', maxWidth: 560, marginBottom: 72 }}
          >
            From signup to first payout in 48 hours.
          </motion.h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign up as a creator or brand. Complete your profile to unlock the full platform.' },
              { step: '02', title: 'Discover & Connect', desc: 'Brands find creators via AI matching. Creators browse campaigns and apply with one click.' },
              { step: '03', title: 'Collaborate', desc: 'Submit content, give feedback with annotations, track milestones in your Campaign Room.' },
              { step: '04', title: 'Get Paid', desc: 'Content approved → escrow releases → funds in your wallet. Simple, fast, secure.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={scrollReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                custom={i * 0.1}
              >
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '4rem', fontWeight: 800, color: 'rgba(255,255,255,0.06)', lineHeight: 1, marginBottom: 16 }}>{item.step}</div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10, letterSpacing: '-0.01em' }}>{item.title}</h4>
                <p style={{ color: '#888', fontSize: '0.88rem', lineHeight: 1.65 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding: '120px 0' }}>
        <div className="container">
          <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} style={{ marginBottom: 16 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.12em' }}>TESTIMONIALS</span>
          </motion.div>
          <motion.h2
            variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={0.1}
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', maxWidth: 560, marginBottom: 56 }}
          >
            Loved by creators & brands.
          </motion.h2>

          <div style={{ position: 'relative' }}>
            {/* Draggable testimonial track */}
            <motion.div
              drag="x"
              dragConstraints={{ right: 0, left: -(testimonials.length - 1) * 420 }}
              dragElastic={0.1}
              style={{ display: 'flex', gap: 20, cursor: 'grab' }}
              whileDrag={{ cursor: 'grabbing' }}
              animate={{ x: -testimonialIndex * 420 }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            >
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  style={{
                    minWidth: 400, padding: 36,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    opacity: i === testimonialIndex ? 1 : 0.5,
                    transition: 'opacity 0.3s ease',
                    flexShrink: 0,
                  }}
                >
                  <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#ffffff', marginBottom: 28, fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Sora, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#fff',
                    }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 1 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Arrows */}
            <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setTestimonialIndex(Math.max(0, testimonialIndex - 1))}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: testimonialIndex === 0 ? 'rgba(255,255,255,0.2)' : '#fff', fontSize: '1.1rem',
                  transition: 'all 0.15s',
                }}
              >←</motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setTestimonialIndex(Math.min(testimonials.length - 1, testimonialIndex + 1))}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: testimonialIndex === testimonials.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff', fontSize: '1.1rem',
                  transition: 'all 0.15s',
                }}
              >→</motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" style={{ padding: '120px 0', background: '#0f0f0f' }}>
        <div className="container">
          <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} style={{ marginBottom: 16 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.12em' }}>PRICING</span>
          </motion.div>
          <motion.h2
            variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={0.1}
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', maxWidth: 560, marginBottom: 16 }}
          >
            Simple, transparent pricing.
          </motion.h2>
          <motion.p variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={0.2}
            style={{ color: '#888', marginBottom: 64 }}>
            Plus 8% fee from brands and 2% from creators per transaction.
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 900, margin: '0 auto' }}>
            {[
              { name: 'Starter', price: '₹0', period: 'Free forever', popular: false, features: ['Up to 3 active campaigns', 'Basic creator discovery', 'Standard contracts', 'Email support'], cta: 'Get Started Free' },
              { name: 'Growth', price: '₹2,999', period: '/month', popular: true, features: ['Unlimited campaigns', 'AI creator matching', 'AI brief generator', 'Advanced analytics', 'Priority support', 'Team members (3)'], cta: 'Start Free Trial' },
              { name: 'Enterprise', price: 'Custom', period: 'billed annually', popular: false, features: ['Everything in Growth', 'Dedicated account manager', 'Custom contract templates', 'White-label option', 'API access', 'SLA guarantee'], cta: 'Contact Sales' },
            ].map((plan, i) => (
              <motion.div
                key={i}
                variants={scrollReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                custom={i * 0.1}
                style={{
                  padding: 32, borderRadius: 16,
                  background: plan.popular ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  border: plan.popular ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    background: '#ffffff', color: '#0a0a0a',
                    fontSize: '0.65rem', fontWeight: 700, padding: '4px 12px', borderRadius: '0 0 8px 8px',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    Most Popular
                  </div>
                )}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#888', marginBottom: 12 }}>{plan.name.toUpperCase()}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em' }}>{plan.price}</span>
                    <span style={{ fontSize: '0.82rem', color: '#666' }}>{plan.period}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '0.85rem', color: '#888' }}>
                      <CheckCircle size={13} color="rgba(255,255,255,0.4)" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center' }}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" style={{ padding: '120px 0' }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto' }}>
          <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} style={{ marginBottom: 16 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.12em' }}>FAQ</span>
          </motion.div>
          <motion.h2
            variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={0.1}
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', letterSpacing: '-0.03em', marginBottom: 56 }}
          >
            Questions answered.
          </motion.h2>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {faqs.map((faq, i) => <FAQItem key={i} {...faq} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══ CTA SECTION ══ */}
      <section style={{ padding: '120px 0', background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container" style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <motion.h2
            variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', marginBottom: 20 }}
          >
            Ready to grow your creator business?
          </motion.h2>
          <motion.p variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={0.1}
            style={{ color: '#888', fontSize: '1.05rem', marginBottom: 40 }}>
            Join 50,000+ creators and 8,000+ brands already using ColabRoom.
          </motion.p>
          <motion.div
            variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={0.2}
            style={{ display: 'flex', gap: 12, justifyContent: 'center' }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: '60px 0 32px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={12} color="#fff" fill="#fff" />
                </div>
                <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.9rem', fontWeight: 700 }}>ColabRoom</span>
              </div>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 240 }}>
                The all-in-one operating system for the creator economy. Built for India.
              </p>
            </div>

            {/* Links */}
            {[
              { title: 'General', links: [['About', '#'], ['Blog', '#'], ['Careers', '#'], ['Press', '#']] },
              { title: 'Services', links: [['For Creators', '/register'], ['For Brands', '/register'], ['Enterprise', '#'], ['API', '#']] },
              { title: 'Browse', links: [['Creators', '/discover/creators'], ['Campaigns', '/campaigns'], ['Contracts', '/contracts'], ['Pricing', '#pricing']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 16 }}>
                  {col.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(([label, href]) => (
                    <a key={label} href={href} style={{ fontSize: '0.85rem', color: '#666', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#666')}
                    >{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: '0.78rem', color: '#555' }}>© 2026 ColabRoom. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Contact', 'mailto:hello@colabroom.io']].map(([l, href]) => (
                <a key={l} href={href} style={{ fontSize: '0.78rem', color: '#555', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <DemoVideoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
