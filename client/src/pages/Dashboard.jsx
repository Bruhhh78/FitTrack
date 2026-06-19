import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { GiMeal } from 'react-icons/gi';
import { FiActivity, FiTarget, FiCalendar, FiEdit3, FiAward, FiArrowRight, FiPlayCircle } from 'react-icons/fi';

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
  const [todayMeals, setTodayMeals] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [hasMeasurements, setHasMeasurements] = useState(true);
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
      const today = new Date().toLocaleDateString('en-CA');
      api.get(`/measurements/today/${selectedEnrollment.batchId._id}?date=${today}`).then(r => {
        if (!r.data.measurement) {
          setHasMeasurements(false);
          setTodayStats(null);
        } else {
          setHasMeasurements(true);
          setTodayStats(r.data.measurement);
        }
      }).catch(() => {
        setHasMeasurements(false);
        setTodayStats(null);
      });

      api.get(`/meals/today/${selectedEnrollment.batchId._id}?date=${today}`).then(r => {
        setTodayMeals(r.data.mealLog);
      }).catch(() => {});
    }
  }, [selectedEnrollment]);

  const selectProgram = (enrollment) => {
    setSelectedEnrollment(enrollment);
    navigate(`/dashboard/${enrollment.batchId._id}`);
  };

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 20, paddingLeft: 40, paddingRight: 40 }}>
        {/* Header */}
        <div className="fade-in" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-main)' }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
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
                    <h3 style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedEnrollment.batchId?.title}</h3>
                    <span className="badge badge-teal">Day {selectedEnrollment.currentDay} / {selectedEnrollment.batchId?.duration} {selectedEnrollment.batchId?.durationType}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (selectedEnrollment.currentDay / (selectedEnrollment.batchId?.duration || 1)) * 100)}%` }} />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: '1.1rem', padding: '12px' }}
                    onClick={() => navigate(`/learn/${selectedEnrollment.batchId._id}`)}
                  >
                    <FiPlayCircle size={24} /> Start Batch Session
                  </button>
                </div>

                {/* Quick actions */}
                <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-main)' }}>Quick Actions</h3>
                <div className="grid grid-4" style={{ marginBottom: 32 }}>
                  <button className="card card-interactive" style={{ cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--border-strong)' }}
                    onClick={() => navigate(`/measurements/${selectedEnrollment.batchId._id}`)}>
                    <FiEdit3 size={28} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                    <h4 style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-main)' }}>Body Stats</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Morning measurements</p>
                  </button>
                  <button className="card card-interactive" style={{ cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--border-strong)' }}
                    onClick={() => navigate(`/daily/${selectedEnrollment.batchId._id}`)}>
                    <FiActivity size={28} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                    <h4 style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-main)' }}>Walking Steps</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Daily movement log</p>
                  </button>
                  <button className="card card-interactive" style={{ cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--border-strong)' }}
                    onClick={() => navigate(`/meals/${selectedEnrollment.batchId._id}`)}>
                    <GiMeal size={28} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                    <h4 style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-main)' }}>Track Meals</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Log your food</p>
                  </button>
                  <button className="card card-interactive" style={{ cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--border-strong)' }}
                    onClick={() => navigate(`/streak/${selectedEnrollment.batchId._id}`)}>
                    <FiAward size={28} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                    <h4 style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-main)' }}>View Streak</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Check consistency</p>
                  </button>
                </div>

                {/* Daily Updates Summary */}
                <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-main)' }}>Today's Summary</h3>
                
                {todayStats && todayStats.stepsCount > 0 && todayMeals?.meals?.length >= 3 && (
                  <div className="card fade-in" style={{ 
                    marginBottom: 24, 
                    padding: '40px', 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
                    border: '2px solid var(--primary)',
                    boxShadow: '0 0 30px var(--primary-glow)'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>Congratulations!</h2>
                    <p style={{ fontSize: '1rem', color: 'var(--text-main)', maxWidth: 500, margin: '0 auto' }}>
                      You've completed your day with absolute discipline. Stay consistent!
                    </p>
                  </div>
                )}

                <div className="card glass-premium fade-in" style={{ marginBottom: 32, padding: '32px' }}>
                    <div className="grid grid-3" style={{ gap: 32 }}>
                      {/* Body Stats Status */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>📏</div>
                        <h4 style={{ marginBottom: 8 }}>Body Stats</h4>
                        {todayStats ? (
                          <div className="badge badge-success" style={{ margin: '0 auto' }}>✓ Completed</div>
                        ) : (
                          <div className="badge badge-warning" style={{ margin: '0 auto' }}>Pending</div>
                        )}
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 12 }}>
                          {todayStats ? `Logged at ${new Date(todayStats.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Required every morning'}
                        </p>
                      </div>

                      {/* Steps Status */}
                      <div className="dashboard-summary-item mobile-border-none" style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🚶</div>
                        <h4 style={{ marginBottom: 8 }}>Walking Steps</h4>
                        {todayStats?.stepsCount ? (
                          <div className="badge badge-success" style={{ margin: '0 auto' }}>✓ {todayStats.stepsCount} Steps</div>
                        ) : (
                          <div className="badge badge-warning" style={{ margin: '0 auto' }}>Pending</div>
                        )}
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 12 }}>
                          Daily movement target
                        </p>
                      </div>

                      {/* Meals Status */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🍱</div>
                        <h4 style={{ marginBottom: 8 }}>Meal Tracking</h4>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                          {['breakfast', 'lunch', 'dinner'].map(type => {
                            const isLogged = todayMeals?.meals?.some(m => m.type === type);
                            return (
                              <div key={type} 
                                className={`meal-status-dot ${isLogged ? 'active' : ''}`}
                                title={type.charAt(0).toUpperCase() + type.slice(1)}
                              >
                                {type.charAt(0).toUpperCase()}
                              </div>
                            );
                          })}
                        </div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                          {todayMeals?.meals?.length || 0} / 3 Meals Logged
                        </p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-bottom-grid" style={{ marginBottom: 0 }}>
                  {selectedEnrollment.batchId?.guideLink && (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <div className="video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                        <iframe
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                          src={`https://www.youtube.com/embed/${getYouTubeID(selectedEnrollment.batchId.guideLink)}`}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div style={{ padding: '12px 16px' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Program Guide Video</h4>
                      </div>
                    </div>
                  )}

                  <div className="card streak-calendar-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div>
                        <h3 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Activity</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Daily Consistency</p>
                      </div>
                      <div className="streak-badge-glass">
                         <span className="flame-icon">🔥</span>
                         <span className="streak-number">{streak?.currentStreak || 0}</span>
                      </div>
                    </div>

                    <div className="github-streak-wrapper">
                      <div className="github-streak-grid">
                        {Array.from({ length: selectedEnrollment.batchId?.duration || 21 }).map((_, i) => {
                          const dayNum = i + 1;
                          const isCompleted = dayNum <= (streak?.currentStreak || 0); 
                          const isToday = dayNum === selectedEnrollment.currentDay;
                          
                          return (
                            <div 
                              key={i} 
                              className={`streak-square ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}`}
                              title={`Day ${dayNum}`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="streak-status-footer">
                        {streak?.currentStreak > 0 ? (
                          <><span className="dot animate-pulse"></span> You're on a {streak.currentStreak} day streak!</>
                        ) : (
                          "Log your first activity to start your streak!"
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* Mandatory Measurements Overlay */}
        {selectedEnrollment && !hasMeasurements && (
          <div className="mandatory-overlay">
            <div className="card glass-premium fade-in" style={{ maxWidth: 500, textAlign: 'center', padding: '48px 32px' }}>
              <div style={{ fontSize: '4rem', marginBottom: 24 }}>📏</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Daily Stats Required</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: 32 }}>
                Consistency is key! Please log your body measurements and progress for today to unlock your dashboard and continue your streak.
              </p>
              <button 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', padding: '16px' }}
                onClick={() => navigate(`/measurements/${selectedEnrollment.batchId._id}`)}
              >
                Complete My Body Stats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
