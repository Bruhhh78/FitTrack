import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiShield, FiLock, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.get(`/batches/${id}`)
      .then(r => {
        setBatch(r.data.batch);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load program details');
        navigate('/batches');
      });
  }, [id, user, navigate]);

  const handlePayment = async () => {
    setPaying(true);
    try {
      const { data } = await api.post('/payments/create-order', { batchId: id });
      
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'FitTrack',
        description: `Enrollment for ${batch.title}`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              batchId: id,
            });
            toast.success('Payment successful! Welcome to the program.');
            navigate('/dashboard');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '',
        },
        theme: {
          color: '#0d9488',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800, paddingTop: 40, paddingBottom: 60 }}>
        <button className="btn-back" onClick={() => navigate(-1)} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <FiArrowLeft /> Back to Program
        </button>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32 }}>Secure <span style={{ color: 'var(--accent)' }}>Checkout</span></h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* Order Summary */}
          <div className="fade-in">
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', background: 'var(--gradient-hero)', overflow: 'hidden', flexShrink: 0 }}>
                  {batch.thumbnailUrl && <img src={batch.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{batch.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{batch.duration} {batch.durationType} Program</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Price</span>
                  <span style={{ textDecoration: 'line-through' }}>₹{batch.originalPrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent)' }}>
                  <span>Offer Price</span>
                  <span>₹{batch.offerPrice}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '0 12px' }}>
              <FiShield style={{ color: '#10b981' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>100% Secure Transaction via Razorpay</p>
            </div>
          </div>

          {/* Payment & Confirmation */}
          <div className="fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FiLock style={{ color: 'var(--accent)', fontSize: '1.5rem' }} />
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Ready to start?</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Confirm your enrollment to get immediate access to diet plans and tracking tools.</p>
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handlePayment} disabled={paying}>
                {paying ? 'Processing...' : `Pay ₹${batch.offerPrice}`}
              </button>

              <div style={{ marginTop: 20 }}>
                {['Instant Program Access', 'Expert Guidance', 'Money-back Guarantee'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <FiCheckCircle style={{ color: '#10b981' }} size={14} /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
