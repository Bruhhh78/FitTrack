import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiActivity, FiTarget, FiCalendar, FiCamera, FiEdit3, FiAward, FiArrowRight } from 'react-icons/fi';
import { GiMeal } from 'react-icons/gi';

const getYouTubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my').then(r => {
      const data = r.data.enrollments;
      setEnrollments(data);
      
      if (batchId) {
        const found = data.find(e => e.batchId._id === batchId);
        if (found) setSelectedEnrollment(found);
        else if (data.length > 0) setSelectedEnrollment(data[0]);
      } else if (data.length > 0) {
        setSelectedEnrollment(data[0]);
      }
      
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [batchId]);

  useEffect(() => {
    if (selectedEnrollment) {
      api.get(`/streaks/${selectedEnrollment.batchId._id}`).then(r => setStreak(r.data.streak)).catch(() => {});
    }
  }, [selectedEnrollment]);

  const selectProgram = (enrollment) => {
    setSelectedEnrollment(enrollment);
    navigate(`/dashboard/${enrollment.batchId._id}`);
  };

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Header */}
        <div className="fade-in" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track your progress and stay consistent.</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">🏋️</div>
            <h3>No Active Programs</h3>
            <p>Browse our weight loss programs to get started!</p>
            <Link to="/batches" className="btn btn-primary">Browse Programs <FiArrowRight /></Link>
          </div>
        ) : (
          <>
            {/* Enrollment selector */}
            {enrollments.length > 1 && (
              <div className="tabs" style={{ marginBottom: 24 }}>
                {enrollments.map(e => (
                  <button key={e._id} className={`tab ${selectedEnrollment?._id === e._id ? 'active' : ''}`}
                    onClick={() => selectProgram(e)}>{e.batchId?.title}</button>
                ))}
              </div>
            )}

            {selectedEnrollment && (
              <div className="fade-in">
                {/* Stats row */}
                <div className="grid grid-4" style={{ marginBottom: 32 }}>
                  <div className="card stat-card">
                    <div className="stat-icon"><FiActivity /></div>
                    <div><div className="stat-value">{streak?.currentStreak || 0}</div><div className="stat-label">Current Streak</div></div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><FiAward /></div>
                    <div><div className="stat-value">{streak?.longestStreak || 0}</div><div className="stat-label">Longest Streak</div></div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}><FiCalendar /></div>
                    <div><div className="stat-value">{streak?.completedDays?.length || 0}</div><div className="stat-label">Days Logged</div></div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><FiTarget /></div>
                    <div><div className="stat-value">{selectedEnrollment.progress || 0}%</div><div className="stat-label">Progress</div></div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="card" style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ fontWeight: 700 }}>{selectedEnrollment.batchId?.title}</h3>
                    <span className="badge badge-teal">Day {selectedEnrollment.currentDay} / {selectedEnrollment.batchId?.duration} {selectedEnrollment.batchId?.durationType}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (selectedEnrollment.currentDay / (selectedEnrollment.batchId?.duration || 1)) * 100)}%` }} />
                  </div>
                </div>

                {/* Quick actions */}
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
                <div className="grid grid-4" style={{ marginBottom: 32 }}>
                  <button className="card" style={{ cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--border-strong)' }}
                    onClick={() => navigate(`/measurements/${selectedEnrollment.batchId._id}`)}>
                    <FiEdit3 size={28} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                    <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Body Stats</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Morning measurements</p>
                  </button>
                  <button className="card" style={{ cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--border-strong)' }}
                    onClick={() => navigate(`/measurements/${selectedEnrollment.batchId._id}?focus=steps`)}>
                    <FiActivity size={28} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                    <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Walking Steps</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>End of day activity</p>
                  </button>
                  <button className="card" style={{ cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--border-strong)' }}
                    onClick={() => navigate(`/meals/${selectedEnrollment.batchId._id}`)}>
                    <GiMeal size={28} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                    <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Track Meals</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Log your food</p>
                  </button>
                  <button className="card" style={{ cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--border-strong)' }}
                    onClick={() => navigate(`/streak/${selectedEnrollment.batchId._id}`)}>
                    <FiAward size={28} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                    <h4 style={{ fontWeight: 600, marginBottom: 4 }}>View Streak</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Check consistency</p>
                  </button>
                </div>

                {selectedEnrollment.batchId?.guideLink && (
                  <div className="card" style={{ marginBottom: 32 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Program Guide Video</h3>
                    <div className="video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                      <iframe
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                        src={`https://www.youtube.com/embed/${getYouTubeID(selectedEnrollment.batchId.guideLink)}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Streak flame */}
                {streak && streak.currentStreak > 0 && (
                  <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                    <div className="streak-flame">🔥</div>
                    <div className="streak-count">{streak.currentStreak} Day Streak!</div>
                    <p style={{ color: 'var(--text-muted)' }}>Keep going! You're doing amazing.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
