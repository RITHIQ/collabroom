import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, Send, Plus, History, X, CreditCard, Smartphone, ChevronLeft } from 'lucide-react';
import { walletAPI } from '../services/api';
import type { Wallet, Transaction } from '../types';
import toast from 'react-hot-toast';
import FakeRazorpay from '../components/ui/FakeRazorpay';

const typeIcons: Record<string, string> = {
  credit: '💰', debit: '💸', escrow_lock: '🔒', escrow_release: '🔓', withdrawal: '🏦', refund: '↩️',
};

export default function WalletPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showAddPayout, setShowAddPayout] = useState(false);
  const [payoutType, setPayoutType] = useState('upi');
  const [payoutDetail, setPayoutDetail] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [method, setMethod] = useState('upi');
  
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('5000');

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const w = await walletAPI.get();
        setWallet(w);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unable to load wallet';
        setLoadError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    void loadWallet();
  }, []);

  const f = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const handleWithdraw = async () => {
    if (!withdrawAmount || +withdrawAmount < 500) { toast.error('Minimum withdrawal is ₹500'); return; }
    if (+withdrawAmount > (wallet?.availableBalance || 0)) { toast.error('Insufficient balance'); return; }
    try {
      await walletAPI.withdraw({ amount: +withdrawAmount, method });
      const amount = Number(withdrawAmount);
      setWallet((prev) => prev ? { ...prev, availableBalance: prev.availableBalance - amount } : prev);
      toast.success(`₹${amount.toLocaleString()} withdrawal initiated!`);
      setShowWithdraw(false);
      setWithdrawAmount('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Withdrawal failed';
      toast.error(message);
    }
  };

  const handleAddFundsSuccess = (paymentId: string) => {
    setShowRazorpay(false);
    toast.success(`Funds added successfully! (Payment ID: ${paymentId})`);
    const amount = Number(addFundsAmount);
    setWallet(prev => prev ? { 
      ...prev, 
      availableBalance: prev.availableBalance + amount,
      transactions: [{
        id: paymentId,
        type: 'credit',
        amount,
        status: 'completed',
        createdAt: new Date().toISOString(),
        reference: `UPI-MOCK-${Date.now()}`,
        currency: 'INR',
        campaignId: undefined,
        campaignName: 'Added Funds via Razorpay'
      }, ...(prev.transactions || [])]
    } : prev);
  };

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div className="skeleton" style={{ height: 160, borderRadius: 16, marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
    </div>
  );

  if (!wallet) {
    return (
      <div style={{ padding: 32, maxWidth: 720, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Wallet unavailable</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 14 }}>
            {loadError || 'We could not load your wallet right now.'}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="wallet-page" style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 4 }}>My Wallet</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Manage your earnings and withdrawals</p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: 20, background: 'linear-gradient(135deg, #6C3EF4 0%, #8B5CF6 50%, #A78BFA 100%)', padding: '32px', color: '#fff', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: 8, fontWeight: 500 }}>Available Balance</div>
          <div data-testid="available-balance" style={{ fontFamily: 'Sora', fontSize: '3rem', fontWeight: 800, lineHeight: 1, marginBottom: 24 }}>{f(wallet!.availableBalance)}</div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
            {[
              { label: 'Pending', value: f(wallet!.pendingBalance), icon: '⏳' },
              { label: 'Locked in Escrow', value: f(wallet!.lockedBalance), icon: '🔒' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: '0.72rem', opacity: 0.75, marginBottom: 4 }}>{item.icon} {item.label}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowAddFunds(!showAddFunds)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', color: '#6C3EF4', border: 'none', padding: '10px 20px', borderRadius: 9999, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.15s' }}>
              <Plus size={15} /> Add Funds
            </button>
            <button onClick={() => setShowWithdraw(!showWithdraw)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 20px', borderRadius: 9999, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
              <Send size={15} /> Withdraw
            </button>
          </div>
        </div>
      </motion.div>

      {/* Add Funds Form */}
      {showAddFunds && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Funds to Wallet</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 20, maxWidth: 300 }}>
            <div>
              <label className="label">Amount to Add (₹)</label>
              <input className="input" type="number" placeholder="Enter amount" value={addFundsAmount} onChange={e => setAddFundsAmount(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => setShowRazorpay(true)}>Proceed to Pay</button>
            <button className="btn btn-secondary" onClick={() => setShowAddFunds(false)}>Cancel</button>
          </div>
        </motion.div>
      )}

      {showRazorpay && (
        <FakeRazorpay
          amount={Number(addFundsAmount) || 5000}
          onClose={() => setShowRazorpay(false)}
          onSuccess={(pid) => { handleAddFundsSuccess(pid); setShowAddFunds(false); }}
        />
      )}

      {/* Withdraw Form */}
      {showWithdraw && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Withdraw Funds</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label className="label">Amount (₹)</label>
              <input className="input" type="number" placeholder="Min ₹500" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Available: {f(wallet!.availableBalance)}</p>
            </div>
            <div>
              <label className="label">Payout Method</label>
              <select className="input" value={method} onChange={e => setMethod(e.target.value)} style={{ cursor: 'pointer' }}>
                <option value="upi">UPI (Instant)</option>
                <option value="neft">Bank Transfer NEFT (2-3 days)</option>
                <option value="imps">IMPS (Same day)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleWithdraw}>Confirm Withdrawal</button>
            <button className="btn btn-secondary" onClick={() => setShowWithdraw(false)}>Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Transaction History */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <History size={16} />
          <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Transaction History</h3>
        </div>
        { (wallet!.transactions || []).map((txn: Transaction, i: number) => (
          <motion.div key={txn.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
            data-testid="transaction-item" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: i < (wallet!.transactions || []).length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              {typeIcons[txn.type] || '💳'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>
                {txn.campaignName || txn.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {txn.reference} · {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: txn.type === 'credit' || txn.type === 'refund' ? 'var(--color-success)' : txn.type === 'escrow_lock' ? 'var(--color-warning)' : 'var(--color-error)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                {txn.type === 'credit' || txn.type === 'refund' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {txn.type === 'credit' ? '+' : '-'}{f(txn.amount)}
              </div>
              <span className={`badge ${txn.status === 'completed' ? 'badge-success' : txn.status === 'pending' ? 'badge-warning' : 'badge-error'}`} style={{ fontSize: '0.68rem' }}>
                {txn.status}
              </span>
            </div>
            <ArrowUpRight size={14} color="var(--color-text-muted)" />
          </motion.div>
        ))}
      </div>
      {/* Add Payout Method Modal */}
      <AnimatePresence>
        {showAddPayout && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddPayout(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="card" style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 'min(460px, 94vw)', padding: 28, zIndex: 201,
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, margin: 0 }}>Add Payout Method</h3>
                <button onClick={() => setShowAddPayout(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[{ id: 'upi', label: 'UPI', icon: <Smartphone size={16}/> }, { id: 'bank', label: 'Bank Account', icon: <CreditCard size={16}/> }].map(opt => (
                  <button key={opt.id} onClick={() => setPayoutType(opt.id)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', border: `2px solid ${payoutType === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`, background: payoutType === opt.id ? 'rgba(108,62,244,0.08)' : 'var(--color-bg-secondary)', color: payoutType === opt.id ? 'var(--color-primary)' : 'var(--color-text-secondary)', transition: 'all 0.15s' }}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
              {payoutType === 'upi' ? (
                <div style={{ marginBottom: 20 }}>
                  <label className="label">UPI ID</label>
                  <input className="input" placeholder="yourname@upi" value={payoutDetail} onChange={e => setPayoutDetail(e.target.value)} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Instant payouts — usually within seconds</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div><label className="label">Account Holder Name</label><input className="input" placeholder="Full name as on bank account" /></div>
                  <div><label className="label">Account Number</label><input className="input" placeholder="Enter account number" /></div>
                  <div><label className="label">IFSC Code</label><input className="input" placeholder="e.g. HDFC0001234" /></div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { if (!payoutDetail && payoutType === 'upi') { toast.error('Please enter your UPI ID'); return; } toast.success('Payout method added successfully!'); setShowAddPayout(false); setPayoutDetail(''); }}>
                  Save Method
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAddPayout(false)}>Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
