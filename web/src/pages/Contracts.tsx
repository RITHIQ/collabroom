import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contractsAPI } from '../services/api';
import type { Contract } from '../types';
import { FileText, ArrowRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contractNeedsCreatorSignature } from '../lib/contractTemplates';
import { MOCK_CONTRACTS } from '../lib/mockSeedData';

export default function Contracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contractsAPI.list().then(r => { 
      if (r.data && r.data.length > 0) {
        setContracts(r.data);
      } else {
        // Use mock data as fallback
        setContracts(MOCK_CONTRACTS);
      }
      setLoading(false);
    }).catch(() => {
      // Use mock data on error
      setContracts(MOCK_CONTRACTS);
      setLoading(false);
    });
  }, []);

  const statusConfig = {
    draft: { badge: 'badge-muted', label: 'Draft' },
    sent: { badge: 'badge-info', label: 'Sent' },
    under_review: { badge: 'badge-warning', label: 'Under Review' },
    signed: { badge: 'badge-success', label: 'Signed' },
    executed: { badge: 'badge-success', label: 'Executed' },
    terminated: { badge: 'badge-error', label: 'Terminated' },
  };

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 10,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            color: 'var(--color-text-primary)',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(108,62,244,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-secondary)';
          }}
          title="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 4 }}>Contracts</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Manage all your campaign contracts and e-signatures</p>
        </div>
      </div>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12, marginBottom: 12 }} />)
      ) : contracts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <FileText size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No contracts yet</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Contracts appear here once a campaign is confirmed.</p>
        </div>
      ) : (
        contracts.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card" style={{ padding: '20px 24px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(108,62,244,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="var(--color-primary)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, marginBottom: 3 }}>{c.brandName || 'Brand'} × {c.creatorName || 'Creator'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                {c.signedByBrandAt && <> · Brand signed {new Date(c.signedByBrandAt).toLocaleDateString('en-IN')}</>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                ₹{(c.totalAmount ?? c.amount ?? c.content?.amount ?? 0).toLocaleString()}
              </div>
              <span className={`badge ${statusConfig[c.status]?.badge || 'badge-muted'}`}>
                {statusConfig[c.status]?.label || 'Unknown'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              <Link to={`/contracts/${c.id}`} className="btn btn-secondary btn-sm">
                View <ArrowRight size={13} />
              </Link>
              {contractNeedsCreatorSignature(c.status) && (
                <Link to={`/contracts/sign/${c.id}`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                  Sign
                </Link>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
