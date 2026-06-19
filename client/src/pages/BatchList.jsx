import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Footer from '../components/Footer';
import { FiClock, FiUsers, FiArrowRight } from 'react-icons/fi';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/batches').then(r => { setBatches(r.data.batches); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="container">
          <h1 className="section-title">Weight Loss <span className="text-gradient">Programs</span></h1>
          <p className="section-subtitle">Choose the program that fits your goals and start your transformation.</p>
          {batches.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No Programs Available</h3>
              <p style={{ color: 'var(--text-dim)' }}>Check back soon for new weight loss programs.</p>
            </div>
          ) : (
            <>
              {/* My Batches Section */}
              {batches.some(b => b.isEnrolled) && (
                <div style={{ marginBottom: 48 }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>⭐</span> My Batches
                  </h2>
                  <div className="grid grid-3">
                    {batches.filter(b => b.isEnrolled).map((b, i) => (
                      <div key={b._id} className="card card-interactive fade-in" style={{ animationDelay: `${i * 0.1}s`, overflow: 'hidden', padding: 0, border: '2px solid var(--primary)' }}>
                        <div style={{ height: 160, background: 'var(--gradient-hero)', position: 'relative' }}>
                          {b.thumbnailUrl ? <img src={b.thumbnailUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🏋️</div>}
                          <div style={{ position: 'absolute', top: 12, right: 12 }}>
                            <span className="badge badge-success">Active</span>
                          </div>
                        </div>
                        <div style={{ padding: 20 }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{b.title}</h3>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.duration} {b.durationType}</span>
                            <Link to={`/dashboard/${b._id}`} className="btn btn-primary btn-sm">Continue <FiArrowRight /></Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explore Programs Section */}
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.2rem' }}>🔍</span> Explore Programs
              </h2>
              <div className="grid grid-3">
                {batches.filter(b => !b.isEnrolled).map((b, i) => (
                  <div key={b._id} className="card card-interactive fade-in" style={{ animationDelay: `${i * 0.1}s`, overflow: 'hidden', padding: 0 }}>
                    <div style={{ height: 180, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {b.thumbnailUrl ? <img src={b.thumbnailUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                        <span style={{ fontSize: '3rem' }}>🏋️</span>}
                    </div>
                    <div style={{ padding: 24 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        <span className="badge badge-teal"><FiClock style={{ marginRight: 4 }} /> {b.duration} {b.durationType}</span>
                        <span className="badge badge-success"><FiUsers style={{ marginRight: 4 }} /> {b.enrollmentCount || 0} enrolled</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>{b.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{b.originalPrice}</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>₹{b.offerPrice}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/program</span></div>
                        </div>
                        <Link to={`/batches/${b._id}`} className="btn btn-primary btn-sm">View Details <FiArrowRight /></Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BatchList;
