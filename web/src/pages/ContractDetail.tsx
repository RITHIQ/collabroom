import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, PenLine } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Contract } from '../types';
import { contractsAPI } from '../services/api';
import { buildContractPdfData, contractNeedsCreatorSignature, contractShowsSignedPdf } from '../lib/contractTemplates';
import { createContractPdfBlob, generateContractPdf } from '../services/generateContractPdf';

const statusConfig: Record<
  Contract['status'],
  { badge: string; label: string }
> = {
  draft: { badge: 'badge-muted', label: 'Draft' },
  sent: { badge: 'badge-info', label: 'Sent' },
  under_review: { badge: 'badge-warning', label: 'Under Review' },
  signed: { badge: 'badge-success', label: 'Signed' },
  executed: { badge: 'badge-success', label: 'Executed' },
  terminated: { badge: 'badge-error', label: 'Terminated' },
};

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setContract(null);
    contractsAPI
      .getById(id)
      .then((row) => {
        if (cancelled) return;
        setContract(row);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Contract not found');
          navigate('/contracts', { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  useEffect(() => {
    if (!contract || !contractShowsSignedPdf(contract.status)) {
      setPdfUrl(null);
      return;
    }
    const blob = createContractPdfBlob(buildContractPdfData(contract));
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [contract]);

  const handleDownload = () => {
    if (!contract) return;
    const t = toast.loading('Generating PDF…');
    try {
      generateContractPdf(buildContractPdfData(contract));
      toast.success('PDF downloaded!', { id: t });
    } catch {
      toast.error('Could not generate PDF.', { id: t });
    }
  };

  if (loading || !contract) {
    return (
      <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div className="skeleton" style={{ height: 36, width: 220, borderRadius: 8, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 420, borderRadius: 12 }} />
      </div>
    );
  }

  const pdfData = buildContractPdfData(contract);
  const showPdf = contractShowsSignedPdf(contract.status) && pdfUrl;
  const canSign = contractNeedsCreatorSignature(contract.status);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        @media (max-width: 900px) {
          .contract-detail-grid { grid-template-columns: 1fr !important; }
          .contract-detail-pdf { min-height: 55vh !important; }
        }
      `}</style>

      <div style={{ marginBottom: 20 }}>
        <Link
          to="/contracts"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={16} /> Back to contracts
        </Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 16, justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Contract detail</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              {contract.brandName} × {contract.creatorName}
            </p>
          </div>
          <span className={`badge ${statusConfig[contract.status].badge}`}>{statusConfig[contract.status].label}</span>
        </div>
      </div>

      <div
        className="contract-detail-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: showPdf ? 'minmax(0, 1fr) minmax(0, 1.2fr)' : '1fr',
          gap: 20,
          alignItems: 'stretch',
        }}
      >
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(108,62,244,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} color="var(--color-primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Summary</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>ID: {contract.id}</div>
            </div>
          </div>
          <dl style={{ margin: 0, display: 'grid', gap: 10, fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <dt style={{ color: 'var(--color-text-muted)' }}>Amount</dt>
              <dd style={{ margin: 0, fontWeight: 600 }}>
                ₹{contract.totalAmount.toLocaleString('en-IN')} {contract.currency}
              </dd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <dt style={{ color: 'var(--color-text-muted)' }}>Created</dt>
              <dd style={{ margin: 0 }}>
                {new Date(contract.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </dd>
            </div>
            {contract.signedByBrandAt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <dt style={{ color: 'var(--color-text-muted)' }}>Brand signed</dt>
                <dd style={{ margin: 0 }}>
                  {new Date(contract.signedByBrandAt).toLocaleDateString('en-IN')}
                </dd>
              </div>
            )}
            {contract.signedByCreatorAt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <dt style={{ color: 'var(--color-text-muted)' }}>Creator signed</dt>
                <dd style={{ margin: 0 }}>
                  {new Date(contract.signedByCreatorAt).toLocaleDateString('en-IN')}
                </dd>
              </div>
            )}
          </dl>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {showPdf && (
              <button type="button" className="btn btn-primary" style={{ justifyContent: 'center', gap: 8 }} onClick={handleDownload}>
                <Download size={16} /> Download PDF
              </button>
            )}
            {canSign && (
              <Link to={`/contracts/sign/${contract.id}`} className="btn btn-primary" style={{ justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
                <PenLine size={16} /> Review &amp; sign
              </Link>
            )}
            {canSign && (
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                Open the signing page to read the full agreement, draw your signature, and generate the executed PDF.
              </p>
            )}
          </div>
        </motion.div>

        {showPdf && pdfUrl && (
          <div
            className="contract-detail-pdf"
            style={{
              minHeight: 480,
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
            }}
          >
            <iframe title="Contract PDF" src={pdfUrl} style={{ width: '100%', height: '100%', minHeight: 480, border: 'none' }} />
          </div>
        )}

        {!showPdf && (
          <div
            className="card"
            style={{
              padding: 28,
              textAlign: 'center',
              borderStyle: 'dashed',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <FileText size={40} color="var(--color-text-muted)" />
            <div style={{ fontWeight: 700 }}>PDF preview after signing</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: 360, lineHeight: 1.6, margin: 0 }}>
              This contract is not fully executed yet. Use <strong>Review &amp; sign</strong> to open the signing flow; once you sign,
              the executed PDF will appear here and you can download it.
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Preview uses the same terms as in the signing page ({pdfData.clauses.length} sections).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
