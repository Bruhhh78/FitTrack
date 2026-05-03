import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiUsers, FiCheckCircle, FiDownload, FiVideo, FiKey, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const getYouTubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
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
      // Refresh batch data to show dashboard link
      const r = await api.get(`/batches/${id}`);
      setBatch(r.data.batch);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid token');
    } finally { setValidating(false); }
  };

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;
  if (!batch) return <div className="page-wrapper"><div className="empty-state"><h3>Program not found</h3></div></div>;

  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="container">
          <div className="batch-detail-grid">
            <div className="fade-in">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span className="badge badge-teal"><FiClock /> {batch.duration} {batch.durationType}</span>
                <span className="badge badge-success"><FiUsers /> {batch.enrollmentCount} enrolled</span>
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 16 }}>{batch.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 32 }}>{batch.description}</p>
              {batch.features?.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>What's Included</h3>
                  <div className="grid grid-2">
                    {batch.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <FiCheckCircle style={{ color: 'var(--accent)', flexShrink: 0 }} /> <span style={{ fontSize: '0.9rem' }}>{f}</span>
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
                  <div className="video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                    <iframe
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                      src={`https://www.youtube.com/embed/${getYouTubeID(batch.guideLink)}`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
              {batch.challenges?.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Challenges ({batch.challenges.length})</h3>
                  {batch.challenges.map((c, i) => (
                    <div key={c._id} className="card" style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontWeight: 600 }}>Challenge {i + 1}: {c.title}</h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Day {c.startDay} - Day {c.endDay} • {c.duration} days</p>
                        </div>
                        <span className="badge badge-teal">{c.duration} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Sidebar pricing card */}
            <div className="card fade-in" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 24px)', padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 200, position: 'relative', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {batch.thumbnailUrl ? (
                  <img src={batch.thumbnailUrl} alt={batch.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '4rem' }}>🏋️</span>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
              </div>

              <div style={{ padding: 24 }}>
                <div style={{ textAlign: 'left', marginBottom: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 16px' }}>
                    {['Expert guidance', 'Daily tracking', 'Streak challenges', 'Diet plans', 'Exercise plans', 'Community'].map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <FiCheckCircle style={{ color: 'var(--accent)', flexShrink: 0 }} size={14} /> <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: -4 }}>₹{batch.originalPrice}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)' }}>₹{batch.offerPrice}</div>
                  </div>

                  <div style={{ flex: 1 }}>
                    {user?.role === 'admin' ? (
                      <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => navigate(`/admin/batch/${batch._id}`)}>
                        Admin View
                      </button>
                    ) : batch.isEnrolled ? (
                      <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => navigate(`/dashboard/${batch._id}`)}>
                        Dashboard
                      </button>
                    ) : (
                      <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => setShowTokenModal(true)}>
                        <FiKey /> Unlock with Token
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {showTokenModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTokenModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Authorize Access</h3>
              <button className="modal-close" onClick={() => setShowTokenModal(false)}>×</button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FiLock style={{ color: 'var(--accent)', fontSize: '1.5rem' }} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please enter the 7-character Batch Token provided by your instructor.</p>
            </div>
            <form onSubmit={handleUnlock}>
              <div className="form-group">
                <input 
                  className="form-input" 
                  type="text" 
                  placeholder="Enter Token (e.g. A1B2C3D)" 
                  value={token} 
                  onChange={e => setToken(e.target.value.toUpperCase())} 
                  maxLength={7}
                  style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: 4, fontWeight: 700 }}
                  required 
                />
              </div>
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
