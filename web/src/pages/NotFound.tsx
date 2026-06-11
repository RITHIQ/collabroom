import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)', textAlign: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '6rem', marginBottom: 24, lineHeight: 1 }}>🌌</div>
        <h1 className="gradient-text" style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>404</h1>
        <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32, maxWidth: 380, margin: '0 auto 32px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary btn-lg">
          <Home size={18} /> Back to Dashboard <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}
