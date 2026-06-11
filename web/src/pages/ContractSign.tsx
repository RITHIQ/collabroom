import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, CheckCircle, Download, ArrowLeft, Pen,
  Trash2, Shield, Lock, ZoomIn, ZoomOut, ChevronUp, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createContractPdfBlob, generateContractPdf } from '../services/generateContractPdf';
import type { ContractData } from '../services/generateContractPdf';
import { contractsAPI } from '../services/api';
import { buildContractPdfData } from '../lib/contractTemplates';

export default function ContractSign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>();
  const [zoom, setZoom] = useState(100);
  const [activeSection, setActiveSection] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [contract, setContract] = useState<ContractData | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const cid = id || 'demo-001';
    let cancelled = false;
    setContract(null);
    contractsAPI
      .getById(cid)
      .then((row) => {
        if (!cancelled) setContract(buildContractPdfData(row));
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Contract not found');
          navigate('/contracts', { replace: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  useEffect(() => {
    if (!signed || !signatureDataUrl || !contract) {
      setPdfPreviewUrl(null);
      return;
    }
    const blob = createContractPdfBlob({ ...contract, signatureDataUrl });
    const url = URL.createObjectURL(blob);
    setPdfPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [signed, signatureDataUrl, contract]);

  // Canvas drawing helpers
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#6C3EF4';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setHasSignature(true);
  };

  const stopDraw = () => { setDrawing(false); lastPos.current = null; };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const buildPdfPayload = (sigUrl?: string) => {
    if (!contract) throw new Error('Contract not loaded');
    return {
      ...contract,
      signatureDataUrl: sigUrl ?? signatureDataUrl,
    };
  };

  const handleSign = () => {
    if (!hasSignature) { toast.error('Please draw your signature first'); return; }
    if (!agreed) { toast.error('Please accept the terms to proceed'); return; }
    // Capture canvas image before state updates re-render
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
    setSigned(true);
    toast.success('Contract signed! Generating PDF…', { duration: 3000 });
    // Small delay so success screen renders first
    setTimeout(() => {
      try {
        generateContractPdf(buildPdfPayload(dataUrl));
      } catch {
        toast.error('PDF generation failed, try Download button.');
      }
    }, 600);
  };

  const handleDownload = () => {
    if (!contract) return;
    const t = toast.loading('Generating PDF…');
    try {
      generateContractPdf(buildPdfPayload());
      toast.success('PDF downloaded!', { id: t });
    } catch {
      toast.error('Could not generate PDF.', { id: t });
    }
  };

  if (!contract) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-primary)',
          padding: 24,
        }}
      >
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Loading contract…</div>
      </div>
    );
  }

  if (signed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--color-bg-primary)' }}>
        <style>{`
          @media (max-width: 900px) {
            .contract-success-wrap { flex-direction: column !important; max-width: 100% !important; }
            .contract-pdf-frame { min-height: 50vh !important; }
          }
        `}</style>
        <motion.div
          className="contract-success-wrap"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 250 }}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 24,
            maxWidth: 960,
            width: '100%',
          }}
        >
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 250 }}
          style={{ textAlign: 'center', maxWidth: 400, flex: '0 0 auto', alignSelf: 'center' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #6EE7B7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}>
            <CheckCircle size={44} color="#fff" />
          </motion.div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Contract Signed! 🎉</h1>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
            Your digital signature has been applied. The signed PDF has been sent to both parties and securely archived on ColabRoom.
          </p>
          <div className="card" style={{ padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(108,62,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="var(--color-primary)" />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{contract.brandName} × {contract.creatorName}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Executed · {contract.date}</div>
            </div>
            <span className="badge badge-success">Executed</span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleDownload} style={{ gap: 8 }}>
              <Download size={16} /> Download PDF
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/contracts')}>
              <ArrowLeft size={16} /> Back to Contracts
            </button>
          </div>
        </motion.div>
        {pdfPreviewUrl && (
          <div
            className="contract-pdf-frame"
            style={{
              flex: '1 1 360px',
              minWidth: 0,
              minHeight: 420,
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
            }}
          >
            <iframe title="Signed contract PDF" src={pdfPreviewUrl} style={{ width: '100%', height: '100%', minHeight: 420, border: 'none' }} />
          </div>
        )}
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 900px) {
          .contract-sign-grid { grid-template-columns: 1fr !important; }
          .contract-sign-preview {
            min-height: 38vh;
            max-height: 52vh;
            border-right: none !important;
            border-bottom: 1px solid var(--color-border);
          }
        }
      `}</style>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--color-bg-card)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/contracts')} style={{ gap: 6 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Contract — {contract.brandName} × {contract.creatorName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={11} /> Secured by ColabRoom · ₹{contract.totalAmount.toLocaleString()}
          </div>
        </div>
        <span className="badge badge-warning">Awaiting Your Signature</span>
      </div>

      <div
        className="contract-sign-grid"
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 380px)',
          maxWidth: 1300,
          margin: '0 auto',
          width: '100%',
          gap: 0,
        }}
      >
        {/* Contract preview (scrollable; mirrors final PDF) */}
        <div
          className="contract-sign-preview"
          style={{
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
          }}
        >
          {/* Toolbar */}
          <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-bg-secondary)' }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveSection(s => Math.max(0, s - 1))} style={{ padding: '5px 8px' }}><ChevronUp size={14} /></button>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', minWidth: 80, textAlign: 'center' }}>
                {activeSection + 1} / {contract.clauses.length}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveSection(s => Math.min(contract.clauses.length - 1, s + 1))} style={{ padding: '5px 8px' }}><ChevronDown size={14} /></button>
            </div>
            <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.max(70, z - 10))} style={{ padding: '5px 8px' }}><ZoomOut size={14} /></button>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.min(150, z + 10))} style={{ padding: '5px 8px' }}><ZoomIn size={14} /></button>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Shield size={11} color="var(--color-success)" /> E-sign compliant
            </div>
          </div>

          {/* PDF Content */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '28px 40px', background: '#F1F0F5' }}>
            <motion.div
              style={{
                background: '#fff',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                padding: '48px 52px',
                maxWidth: 720,
                margin: '0 auto',
                fontSize: `${Math.max(12, Math.round(15 * (zoom / 100)))}px`,
                transformOrigin: 'top center',
              }}
            >
              {/* Contract Header */}
              <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '2px solid #111' }}>
                <div style={{ fontSize: '1.3em', fontWeight: 800, letterSpacing: '0.05em', marginBottom: 4, color: '#111' }}>INFLUENCER COLLABORATION AGREEMENT</div>
                <div style={{ fontSize: '0.82em', color: '#555' }}>ColabRoom Platform · Secured Digital Contract</div>
                <div style={{ fontSize: '0.78em', color: '#888', marginTop: 4 }}>Contract ID: CR-{id || contract.id} · Dated: {contract.date}</div>
              </div>

              {/* Clauses */}
              {contract.clauses.map((clause, i) => (
                <motion.div key={i}
                  style={{
                    marginBottom: 22, padding: '14px 16px', borderRadius: 6,
                    background: activeSection === i ? 'rgba(108,62,244,0.06)' : 'transparent',
                    border: activeSection === i ? '1.5px solid rgba(108,62,244,0.2)' : '1.5px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onClick={() => setActiveSection(i)}>
                  <div style={{ fontWeight: 700, fontSize: '0.9em', color: '#111', marginBottom: 6 }}>{clause.section}</div>
                  <div style={{ fontSize: '0.85em', color: '#444', lineHeight: 1.75 }}>{clause.content}</div>
                </motion.div>
              ))}

              {/* Signature Block */}
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #ddd', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {[{ label: 'Brand Representative', name: contract.brandName, signed: true }, { label: 'Creator', name: contract.creatorName, signed: false }].map((party, i) => (
                  <div key={i} style={{ borderTop: '2px solid #111', paddingTop: 10 }}>
                    <div style={{ fontSize: '0.75em', color: '#888', marginBottom: 4 }}>{party.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9em', color: '#111', marginBottom: 6 }}>{party.name}</div>
                    <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
                      {party.signed ? (
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.4em', color: '#6C3EF4', fontStyle: 'italic' }}>
                          {party.name.split(' ')[0]}
                        </span>
                      ) : (
                        <span style={{ color: '#bbb', fontSize: '0.8em', fontStyle: 'italic' }}>Awaiting signature…</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Panel — Signature */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 24,
            gap: 20,
            overflow: 'auto',
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <div>
            <h3 style={{ fontWeight: 800, marginBottom: 4 }}>Sign the Contract</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Draw your signature below. Your digital signature is legally binding under the Information Technology Act, 2000.
            </p>
          </div>

          {/* Signature Canvas */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="label" style={{ margin: 0 }}>Your Signature</label>
              {hasSignature && (
                <button onClick={clearSignature} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>
            <div style={{
              border: `2px dashed ${hasSignature ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 12, overflow: 'hidden', background: 'var(--color-bg-card)',
              transition: 'border-color 0.2s', cursor: 'crosshair', position: 'relative',
            }}>
              <canvas
                ref={canvasRef}
                width={330} height={140}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                style={{ display: 'block', width: '100%', touchAction: 'none' }}
              />
              {!hasSignature && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: 6 }}>
                  <Pen size={20} color="var(--color-text-muted)" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Draw your signature here</span>
                </div>
              )}
            </div>
          </div>

          {/* Party info */}
          <div className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>SIGNING AS</div>
            {[
              { label: 'Name', val: contract.creatorName },
              { label: 'Role', val: 'Creator' },
              { label: 'Amount', val: `₹${contract.totalAmount.toLocaleString()}` },
              { label: 'Date', val: contract.date },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{r.label}</span>
                <span style={{ fontWeight: 600 }}>{r.val}</span>
              </div>
            ))}
          </div>

          {/* Agreement checkbox */}
          <label style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: 2, accentColor: 'var(--color-primary)', width: 15, height: 15, cursor: 'pointer', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              I have read and agree to all terms. I understand this digital signature is legally binding.
            </span>
          </label>

          {/* Sign CTA */}
          <motion.button
            className={`btn btn-primary ${(!hasSignature || !agreed) ? '' : ''}`}
            disabled={!hasSignature || !agreed}
            onClick={handleSign}
            whileHover={{ scale: hasSignature && agreed ? 1.02 : 1 }}
            whileTap={{ scale: 0.97 }}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.95rem', gap: 8 }}>
            <CheckCircle size={18} /> Sign & Execute Contract
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <Shield size={12} color="var(--color-text-muted)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>256-bit encrypted · IT Act 2000 compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
