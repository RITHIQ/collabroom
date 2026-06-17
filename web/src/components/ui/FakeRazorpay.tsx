import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, CreditCard, Smartphone, CheckCircle, Loader } from 'lucide-react';

interface FakeRazorpayProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export default function FakeRazorpay({ amount, onSuccess, onClose }: FakeRazorpayProps) {
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);



  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card"
        style={{ width: 'min(400px, 92vw)', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      >
        {success ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginBottom: 20 }}>
              <CheckCircle size={60} color="#10B981" style={{ margin: '0 auto' }} />
            </motion.div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: 8 }}>Payment Successful</h2>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>Redirecting to ColabRoom...</p>
          </div>
        ) : (
          <>
            <div style={{ background: '#2B86E8', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2B86E8', fontWeight: 800 }}>
                  CR
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>ColabRoom Pvt Ltd</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Amount to pay</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>₹{amount.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ padding: '24px 20px', background: '#F8F9FA' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444', marginBottom: 12 }}>SELECT PAYMENT METHOD</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                <button 
                  onClick={() => setMethod('upi')}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 6, border: `1px solid ${method === 'upi' ? '#2B86E8' : '#ddd'}`, background: method === 'upi' ? '#F0F7FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                  <Smartphone size={20} color={method === 'upi' ? '#2B86E8' : '#666'} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#222', fontSize: '0.9rem' }}>UPI</div>
                    <div style={{ fontSize: '0.75rem', color: '#777' }}>Google Pay, PhonePe, Paytm</div>
                  </div>
                </button>
                <button 
                  onClick={() => setMethod('card')}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 6, border: `1px solid ${method === 'card' ? '#2B86E8' : '#ddd'}`, background: method === 'card' ? '#F0F7FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                  <CreditCard size={20} color={method === 'card' ? '#2B86E8' : '#666'} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#222', fontSize: '0.9rem' }}>Card</div>
                    <div style={{ fontSize: '0.75rem', color: '#777' }}>Visa, MasterCard, RuPay</div>
                  </div>
                </button>
              </div>

              {method === 'upi' && (
                <div style={{ marginBottom: 24 }}>
                  <input placeholder="Enter UPI ID (e.g. user@okhdfc)" style={{ width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: 4, outline: 'none', fontSize: '0.9rem' }} />
                </div>
              )}
              {method === 'card' && (
                <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input placeholder="Card Number" style={{ width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: 4, outline: 'none', fontSize: '0.9rem' }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input placeholder="MM/YY" style={{ flex: 1, padding: '12px 14px', border: '1px solid #ddd', borderRadius: 4, outline: 'none', fontSize: '0.9rem' }} />
                    <input placeholder="CVV" style={{ flex: 1, padding: '12px 14px', border: '1px solid #ddd', borderRadius: 4, outline: 'none', fontSize: '0.9rem' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                <p style={{ fontSize: '0.75rem', color: '#666', textAlign: 'center', marginBottom: 4 }}>
                  This is a mock payment gateway. No real money will be deducted.
                </p>
                {loading ? (
                  <button disabled style={{ width: '100%', padding: 14, background: '#2B86E8', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Loader className="spin" size={18} /> Processing...
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                          setSuccess(true);
                          setTimeout(() => {
                            onSuccess(`pay_mock_${Date.now()}`);
                          }, 1500);
                        }, 1000);
                      }}
                      style={{ width: '100%', padding: 14, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Simulate Success
                    </button>
                    <button 
                      onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                          alert('Payment Failed!');
                        }, 1000);
                      }}
                      style={{ width: '100%', padding: 14, background: 'transparent', color: '#E11D48', border: '1px solid #E11D48', borderRadius: 4, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Simulate Failure
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ padding: 12, background: '#F8F9FA', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#888', fontSize: '0.7rem' }}>
                <Shield size={12} /> Secured by MockPay
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                <X size={12} /> Cancel
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
