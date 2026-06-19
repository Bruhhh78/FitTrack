import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiUsers, FiCheckCircle, FiDownload, FiKey, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const getYouTubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BatchDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [token, setToken] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api.get(`/batches/${id}`).then(r => { setBatch(r.data.batch); setLoading(false); }).catch(() => { toast.error('Failed to load'); setLoading(false); });
  }, [id]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setValidating(true);
    try {
      await api.post('/batches/validate-token', { batchId: id, token });
      toast.success('Access granted! Welcome to the program.');
      setShowTokenModal(false);
      const r = await api.get(`/batches/${id}`);
      setBatch(r.data.batch);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid token');
    } finally { setValidating(false); }
  };

  const handlePayment = async () => {
    if (!user) return navigate('/login');
    
    setPaying(true);
    const res = await loadRazorpayScript();
    
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setPaying(false);
      return;
    }

    try {
      // Create order
      const orderRes = await api.post('/payments/create-order', { batchId: id });
      const { orderId, amount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T3QfYUcweeyZEL',
        amount: amount.toString(),
        currency: currency,
        name: 'FitTrack',
        description: `Enrollment for ${batch.title}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              batchId: id,
              amount: amount / 100,
            });
            
            if (verifyRes.data.success) {
              toast.success('Payment successful! Welcome to the program.');
              const r = await api.get(`/batches/${id}`);
              setBatch(r.data.batch);
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#8b5cf6'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        toast.error(response.error.description || 'Payment failed');
      });
      paymentObject.open();

    } catch (error) {
      toast.error('Failed to initiate payment');
      console.error(error);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;
  if (!batch) return <div className="page-wrapper"><div className="empty-state"><h3>Program not found</h3></div></div>;

  return (
    <div className="page-wrapper">
      <style>{`
        .batch-detail-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 40px;
          align-items: start;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .sticky-sidebar {
          position: sticky;
          top: calc(var(--navbar-height) + 24px);
        }

        @media (max-width: 1024px) {
          .batch-detail-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .sticky-sidebar {
            position: relative;
            top: 0;
            order: -1;
          }
          .batch-title {
            font-size: 1.8rem !important;
          }
        }

        @media (max-width: 480px) {
          .pricing-footer {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 20px !important;
          }
          .pricing-footer button {
            width: 100%;
            padding: 16px !important;
          }
          .batch-detail-grid {
            padding: 0 4px;
          }
        }
      `}</style>

      <section className="section">
        <div className="container">
          <div className="batch-detail-grid">
            {/* Main Content */}
            <div className="fade-in">
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <span className="badge badge-teal" style={{ padding: '8px 16px' }}><FiClock style={{marginRight: 6}} /> {batch.duration} {batch.durationType}</span>
                <span className="badge badge-success" style={{ padding: '8px 16px' }}><FiUsers style={{marginRight: 6}} /> {batch.enrollmentCount} enrolled</span>
              </div>

              <h1 className="batch-title" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
                {batch.title}
              </h1>

              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: 32 }}>
                {batch.description}
              </p>

              {batch.features?.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>What's Included</h3>
                  <div className="features-grid">
                    {batch.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <FiCheckCircle style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.95rem' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {batch.isEnrolled && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Program Resources</h3>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {batch.dietPlanPdf && <a href={batch.dietPlanPdf} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><FiDownload /> Diet Plan</a>}
                    {batch.exercisePlanPdf && <a href={batch.exercisePlanPdf} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><FiDownload /> Exercise Plan</a>}
                    {batch.mealPlanPdf && <a href={batch.mealPlanPdf} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><FiDownload /> Meal Plan</a>}
                  </div>
                </div>
              )}

              {batch.guideLink && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Program Guide Video</h3>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', background: '#000' }}>
                    <iframe
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                      src={`https://www.youtube.com/embed/${getYouTubeID(batch.guideLink)}`}
                      title="YouTube video player"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {batch.challenges?.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Challenges ({batch.challenges.length})</h3>
                  {batch.challenges.map((c, i) => (
                    <div key={c._id} className="card" style={{ marginBottom: 12, padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                          <h4 style={{ fontWeight: 600, margin: 0 }}>Challenge {i + 1}: {c.title}</h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>Day {c.startDay} - Day {c.endDay} • {c.duration} days</p>
                        </div>
                        <span className="badge badge-teal" style={{ flexShrink: 0 }}>{c.duration} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar pricing card */}
            <div className="sticky-sidebar">
              <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 220, position: 'relative', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {batch.thumbnailUrl ? (
                    <img src={batch.thumbnailUrl} alt={batch.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '4rem' }}>🏋️</span>
                  )}
                </div>

                <div style={{ padding: 24 }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {['Expert guidance', 'Daily tracking', 'Streak challenges', 'Diet plans'].map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          <FiCheckCircle style={{ color: 'var(--accent)', flexShrink: 0 }} size={14} /> <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pricing-footer" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{batch.originalPrice}</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)' }}>₹{batch.offerPrice}</div>
                    </div>

                    <div style={{ flex: 1 }}>
                      {user?.role === 'admin' ? (
                        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate(`/admin/batch/${batch._id}`)}>Admin View</button>
                      ) : batch.isEnrolled ? (
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/dashboard/${batch._id}`)}>Dashboard</button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePayment} disabled={paying}>
                            {paying ? 'Processing...' : 'Buy Now'}
                          </button>
                          <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }} onClick={() => setShowTokenModal(true)}>
                            <FiKey /> Use Access Token
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Modal */}
      {showTokenModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTokenModal(false)}>
          <div className="modal" style={{ width: '90%', maxWidth: 400, padding: 32 }}>
            <div className="modal-header">
              <h3>Authorize Access</h3>
              <button className="modal-close" onClick={() => setShowTokenModal(false)}>×</button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FiLock style={{ color: 'var(--primary)', fontSize: '1.5rem' }} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter the 7-character Batch Token.</p>
            </div>
            <form onSubmit={handleUnlock}>
              <input
                className="form-input"
                type="text"
                value={token}
                onChange={e => setToken(e.target.value.toUpperCase())}
                maxLength={7}
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: 4, fontWeight: 700, marginBottom: 16 }}
                required
              />
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={validating}>
                {validating ? 'Verifying...' : 'Unlock Program'}
              </button>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default BatchDetail;