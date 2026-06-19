import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { GiMeal } from 'react-icons/gi';
import { FiActivity, FiTarget, FiCalendar, FiEdit3, FiAward, FiArrowRight, FiBookOpen } from 'react-icons/fi';
import { DIET_ROUTINE } from '../utils/dietRoutine';

const getYouTubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getActiveMealIndex = () => {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 11) return 0;
  if (hours >= 11 && hours < 17) return 1;
  return 2;
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
  const [skipped, setSkipped] = useState(false);
  const [isVeg, setIsVeg] = useState(true);
  const [routineDay, setRoutineDay] = useState(1);
  const [showFullRoutine, setShowFullRoutine] = useState(false);

  const activeDietRoutine = selectedEnrollment?.batchId?.dietRoutine?.length > 0
    ? selectedEnrollment.batchId.dietRoutine
    : DIET_ROUTINE;

  useEffect(() => {
    api.get('/enrollments/my').then(r => {
      const data = r.data.enrollments;
      setEnrollments(data);

      if (batchId) {
        const found = data.find(e => e.batchId?._id === batchId);
        if (found) setSelectedEnrollment(found);
        else if (data.length > 0) setSelectedEnrollment(data[0]);
      } else if (data.length > 0) {
        setSelectedEnrollment(data[0]);
      }

      setLoading(false);
    }).catch(() => setLoading(false));
  }, [batchId]);

  useEffect(() => {
    if (selectedEnrollment && selectedEnrollment.batchId) {
      const bId = selectedEnrollment.batchId._id;
      api.get(`/streaks/${bId}`).then(r => setStreak(r.data.streak)).catch(() => {});
      const today = new Date().toLocaleDateString('en-CA');
      api.get(`/measurements/today/${bId}?date=${today}`).then(r => {
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

      api.get(`/meals/today/${bId}?date=${today}`).then(r => {
        setTodayMeals(r.data.mealLog);
      }).catch(() => {});

      setRoutineDay(selectedEnrollment.currentDay);
    }
  }, [selectedEnrollment]);

  useEffect(() => {
    const checkDismiss = () => {
      const dismissedAt = sessionStorage.getItem('fittrack-stats-dismissed-at');
      if (dismissedAt) {
        const timePassed = Date.now() - parseInt(dismissedAt, 10);
        if (timePassed < 5 * 60 * 1000) {
          setSkipped(true);
        } else {
          setSkipped(false);
          sessionStorage.removeItem('fittrack-stats-dismissed-at');
        }
      } else {
        setSkipped(false);
      }
    };

    checkDismiss();
    const interval = setInterval(checkDismiss, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    sessionStorage.setItem('fittrack-stats-dismissed-at', Date.now().toString());
    setSkipped(true);
  };

  const selectProgram = (enrollment) => {
    setSelectedEnrollment(enrollment);
    navigate(`/dashboard/${enrollment.batchId._id}`);
  };

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 40, maxWidth: 1100, margin: '0 auto' }}>
        {/* Welcome Header */}
        <div className="dashboard-welcome-banner fade-in" style={{ marginBottom: 36, position: 'relative', overflow: 'hidden', padding: '32px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md), var(--shadow-glow)' }}>
          <div className="welcome-glow-bubble" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="badge badge-teal" style={{ marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Dashboard</span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.03em' }}>
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.02rem', margin: 0 }}>You are on Day <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{selectedEnrollment?.currentDay || 1}</strong> of consistency. Keep going!</p>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">🏋️</div>
            <h3>No Active Programs</h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: 20 }}>Browse our weight loss programs to get started!</p>
            <Link to="/batches" className="btn btn-primary">Browse Programs <FiArrowRight /></Link>
          </div>
        ) : (
          <>
            {/* Enrollment selector */}
            {enrollments.length > 1 && (
              <div className="tabs" style={{ marginBottom: 24 }}>
                {enrollments.map(e => (
                  <button key={e._id} className={`tab ${selectedEnrollment?._id === e._id ? 'active' : ''}`}
                    onClick={() => selectProgram(e)}>{e.batchId?.title || 'Unknown Program'}</button>
                ))}
              </div>
            )}

            {selectedEnrollment && !selectedEnrollment.batchId ? (
              <div className="empty-state card" style={{ padding: 40, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
                <h3 style={{ fontWeight: 800 }}>Program No Longer Available</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20, maxWidth: 500, margin: '0 auto 20px auto' }}>
                  The program you were enrolled in has been updated or removed. Please contact the admin to allot the correct active session.
                </p>
                <Link to="/batches" className="btn btn-primary" style={{ margin: '0 auto' }}>Browse Programs</Link>
              </div>
            ) : selectedEnrollment && (
              <div className="fade-in">
                {/* Stats row */}
                <div className="grid grid-4" style={{ marginBottom: 28 }}>
                  <div className="dashboard-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid var(--primary-glow)' }}><FiActivity /></div>
                    <div><div className="stat-value">{streak?.currentStreak || 0}</div><div className="stat-label">Current Streak</div></div>
                  </div>
                  <div className="dashboard-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}><FiAward /></div>
                    <div><div className="stat-value">{streak?.longestStreak || 0}</div><div className="stat-label">Longest Streak</div></div>
                  </div>
                  <div className="dashboard-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'var(--info-glow)', color: 'var(--info)', border: '1px solid var(--info-glow)' }}><FiCalendar /></div>
                    <div><div className="stat-value">{streak?.completedDays?.length || 0}</div><div className="stat-label">Days Logged</div></div>
                  </div>
                  <div className="dashboard-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'var(--success-glow)', color: 'var(--success)', border: '1px solid var(--success-glow)' }}><FiTarget /></div>
                    <div><div className="stat-value">{selectedEnrollment.progress || 0}%</div><div className="stat-label">Progress</div></div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="card glass-premium" style={{ marginBottom: 28, padding: '28px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <span className="badge badge-teal" style={{ marginBottom: 6 }}>ACTIVE PROGRAM</span>
                      <h3 style={{ fontWeight: 800, fontSize: '1.4rem', margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{selectedEnrollment.batchId?.title}</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge-pill badge-success-pill" style={{ fontSize: '0.82rem', padding: '6px 16px' }}>Day {selectedEnrollment.currentDay} / {selectedEnrollment.batchId?.duration} {selectedEnrollment.batchId?.durationType}</span>
                    </div>
                  </div>
                  <div className="progress-bar-container" style={{ height: 10, background: 'var(--bg-deep)', borderRadius: 10 }}>
                    <div className="progress-bar-fill" style={{ height: '100%', borderRadius: 10, background: 'var(--gradient-hero)', width: `${Math.min(100, (selectedEnrollment.currentDay / (selectedEnrollment.batchId?.duration || 1)) * 100)}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 8 }}>
                    <span>Started Challenge</span>
                    <span>{Math.round(Math.min(100, (selectedEnrollment.currentDay / (selectedEnrollment.batchId?.duration || 1)) * 100))}% Completed</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: '1.02rem', padding: '15px', borderRadius: '16px' }}
                    onClick={() => navigate(`/learn/${selectedEnrollment.batchId?._id}`)}
                  >
                    <FiBookOpen size={20} /> View Course Timeline & Diet Routine
                  </button>
                </div>

                {/* Quick actions */}
                <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Quick Actions</h3>
                <div className="grid grid-4" style={{ marginBottom: 32 }}>
                  {[
                    { icon: <FiEdit3 size={24} />, title: 'Body Stats', desc: 'Morning measurements', path: `/measurements/${selectedEnrollment.batchId?._id}`, color: 'var(--primary)', background: 'var(--primary-subtle)', border: 'var(--primary-glow)' },
                    { icon: <FiActivity size={24} />, title: 'Walking Steps', desc: 'Daily movement log', path: `/daily/${selectedEnrollment.batchId?._id}`, color: 'var(--accent)', background: 'var(--accent-subtle)', border: 'var(--accent-glow)' },
                    { icon: <GiMeal size={24} />, title: 'Track Meals', desc: 'Log your food intake', path: `/meals/${selectedEnrollment.batchId?._id}`, color: 'var(--info)', background: 'var(--info-glow)', border: 'var(--info-glow)' },
                    { icon: <FiAward size={24} />, title: 'View Streak', desc: 'Check consistency metrics', path: `/streak/${selectedEnrollment.batchId?._id}`, color: 'var(--success)', background: 'var(--success-glow)', border: 'var(--success-glow)' },
                  ].map((action, i) => (
                    <button key={i} className="dashboard-action-card"
                      onClick={() => navigate(action.path)}>
                      <div className="action-icon-circle" style={{ background: action.background, color: action.color, border: `1px solid ${action.border}` }}>
                        {action.icon}
                      </div>
                      <h4 style={{ fontWeight: 800, marginBottom: 4, fontSize: '0.98rem', color: 'var(--text-main)' }}>{action.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>{action.desc}</p>
                      <span className="action-card-arrow">→</span>
                    </button>
                  ))}
                </div>

                {/* Daily Updates Summary */}
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Today's Summary</h3>

                {todayStats && todayStats.stepsCount > 0 && todayMeals?.meals?.length >= 3 && (
                  <div className="card fade-in" style={{
                    marginBottom: 24,
                    padding: '40px',
                    textAlign: 'center',
                    background: 'var(--gradient-hero-subtle)',
                    border: '2px solid var(--primary)',
                    boxShadow: '0 0 40px var(--primary-glow)'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
                      <span className="text-gradient">Congratulations!</span>
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'var(--text-dim)', maxWidth: 500, margin: '0 auto' }}>
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

                {/* Today's Diet Plan Card */}
                <div className="card glass-premium fade-in" style={{ marginBottom: 32, padding: '28px', position: 'relative', overflow: 'hidden' }}>
                  <div className="routine-detail-glow" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20, position: 'relative', zIndex: 1 }}>
                    <div>
                      <span className="badge badge-teal" style={{ marginBottom: 6 }}>Day {selectedEnrollment.currentDay} / 21 Diet Routine</span>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        🥗 Today's Meals Menu
                      </h3>
                    </div>
                    {/* Veg / Non-veg switch on Dashboard */}
                    <div style={{ display: 'flex', background: 'var(--bg-deep)', padding: 3, borderRadius: 20, border: '1px solid var(--glass-border)' }}>
                      <button type="button" className={`diet-toggle-btn-sm ${isVeg ? 'active' : ''}`}
                        onClick={() => setIsVeg(true)}>Veg</button>
                      <button type="button" className={`diet-toggle-btn-sm ${!isVeg ? 'active' : ''}`}
                        onClick={() => setIsVeg(false)}>Non-Veg</button>
                    </div>
                  </div>

                  {activeDietRoutine[selectedEnrollment.currentDay - 1] ? (
                    <div className="grid grid-3" style={{ gap: 16, position: 'relative', zIndex: 1 }}>
                      {/* Breakfast */}
                      <div className={`diet-meal-preview-box ${getActiveMealIndex() === 0 ? 'active-meal' : ''}`}>
                        <span className="meal-emoji">🌅</span>
                        <div className="meal-details">
                          <h5 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {activeDietRoutine[selectedEnrollment.currentDay - 1].type === 'fasting' ? 'Meal 1' : 'Breakfast'}
                            {getActiveMealIndex() === 0 && <span className="active-meal-badge">Current</span>}
                          </h5>
                          <p>{isVeg ? activeDietRoutine[selectedEnrollment.currentDay - 1].veg.breakfast : activeDietRoutine[selectedEnrollment.currentDay - 1].nonveg.breakfast}</p>
                        </div>
                      </div>

                      {/* Lunch */}
                      <div className={`diet-meal-preview-box ${getActiveMealIndex() === 1 ? 'active-meal' : ''}`}>
                        <span className="meal-emoji">☀️</span>
                        <div className="meal-details">
                          <h5 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {activeDietRoutine[selectedEnrollment.currentDay - 1].type === 'fasting' ? 'Lemon Water' : 'Lunch'}
                            {getActiveMealIndex() === 1 && <span className="active-meal-badge">Current</span>}
                          </h5>
                          <p>{isVeg ? activeDietRoutine[selectedEnrollment.currentDay - 1].veg.lunch : activeDietRoutine[selectedEnrollment.currentDay - 1].nonveg.lunch}</p>
                        </div>
                      </div>

                      {/* Dinner */}
                      <div className={`diet-meal-preview-box ${getActiveMealIndex() === 2 ? 'active-meal' : ''}`}>
                        <span className="meal-emoji">🌌</span>
                        <div className="meal-details">
                          <h5 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {activeDietRoutine[selectedEnrollment.currentDay - 1].type === 'fasting' ? 'Meal 2' : 'Dinner'}
                            {getActiveMealIndex() === 2 && <span className="active-meal-badge">Current</span>}
                          </h5>
                          <p>{isVeg ? activeDietRoutine[selectedEnrollment.currentDay - 1].veg.dinner : activeDietRoutine[selectedEnrollment.currentDay - 1].nonveg.dinner}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-dim)', margin: 0 }}>No diet routine seeded for this day.</p>
                  )}
                  
                  {/* Option to toggle viewing full 21 days */}
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
                    <button 
                      className="btn btn-ghost btn-sm"
                      style={{ borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => setShowFullRoutine(!showFullRoutine)}
                    >
                      📅 {showFullRoutine ? 'Hide Full Schedule' : 'View Full Schedule'}
                    </button>
                  </div>

                  {showFullRoutine && (
                    <div className="fade-in" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px dashed var(--glass-border)' }}>
                      {/* Grid of Days Selector */}
                      <div className="routine-days-container" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                        {(() => {
                          const weeksMap = {};
                          activeDietRoutine.forEach(item => {
                            if (!weeksMap[item.week]) weeksMap[item.week] = [];
                            weeksMap[item.week].push(item);
                          });
                          return Object.entries(weeksMap).map(([weekNum, days]) => (
                            <div key={weekNum} className="routine-week-row">
                              <span className="routine-week-label">WEEK {weekNum}</span>
                              <div className="routine-days-row">
                                {days.map(item => {
                                  const d = item.day;
                                  const isCleanse = item.type === 'cleanse';
                                  const isFasting = item.type === 'fasting';
                                  return (
                                    <button 
                                      key={d} 
                                      className={`routine-day-dot ${routineDay === d ? 'active' : ''} ${isCleanse ? 'cleanse-day' : ''} ${isFasting ? 'fasting-day' : ''}`}
                                      onClick={() => { setRoutineDay(d); }}
                                    >
                                      {d}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Selected Day Routine Card details */}
                      {activeDietRoutine[routineDay - 1] && (
                        <div className="routine-selected-details-container" style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--glass-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Day {routineDay} Schedule:</span>
                            {activeDietRoutine[routineDay - 1].rule && (
                              <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>{activeDietRoutine[routineDay - 1].rule}</span>
                            )}
                          </div>
                          <div className="grid grid-3" style={{ gap: 12 }}>
                            <div style={{ fontSize: '0.82rem' }}>
                              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                                {activeDietRoutine[routineDay - 1].type === 'fasting' ? '🌅 Meal 1:' : '🌅 Morning:'}
                              </strong>
                              <span style={{ color: 'var(--text-dim)' }}>{isVeg ? activeDietRoutine[routineDay - 1].veg.breakfast : activeDietRoutine[routineDay - 1].nonveg.breakfast}</span>
                            </div>
                            <div style={{ fontSize: '0.82rem' }}>
                              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                                {activeDietRoutine[routineDay - 1].type === 'fasting' ? '☀️ Lemon Water:' : '☀️ Afternoon:'}
                              </strong>
                              <span style={{ color: 'var(--text-dim)' }}>{isVeg ? activeDietRoutine[routineDay - 1].veg.lunch : activeDietRoutine[routineDay - 1].nonveg.lunch}</span>
                            </div>
                            <div style={{ fontSize: '0.82rem' }}>
                              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                                {activeDietRoutine[routineDay - 1].type === 'fasting' ? '🌌 Meal 2:' : '🌌 Evening:'}
                              </strong>
                              <span style={{ color: 'var(--text-dim)' }}>{isVeg ? activeDietRoutine[routineDay - 1].veg.dinner : activeDietRoutine[routineDay - 1].nonveg.dinner}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Activity</h3>
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
        {selectedEnrollment && selectedEnrollment.batchId && !hasMeasurements && !skipped && (
          <div className="mandatory-overlay">
            <div className="card glass-premium fade-in" style={{ maxWidth: 500, textAlign: 'center', padding: '48px 32px' }}>
              <div style={{ fontSize: '4rem', marginBottom: 24 }}>📏</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Daily Stats Required</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: 32 }}>
                Consistency is key! Please log your body measurements and progress for today to unlock your dashboard and continue your streak.
              </p>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', padding: '16px', marginBottom: '12px' }}
                onClick={() => navigate(`/measurements/${selectedEnrollment.batchId?._id}`)}
              >
                Complete My Body Stats
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', padding: '12px' }}
                onClick={handleSkip}
              >
                Skip for Now
            </button>
          </div>
        </div>
      )}
      {/* Style injection */}
      <style dangerouslySetInnerHTML={{ __html: `
          .welcome-glow-bubble {
            position: absolute;
            top: -50px;
            right: -50px;
            width: 250px;
            height: 250px;
            background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
            pointer-events: none;
            filter: blur(35px);
            z-index: 0;
            opacity: 0.65;
          }
          .dashboard-stat-card {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            gap: 20px;
            transition: var(--transition);
            box-shadow: var(--shadow-sm);
          }
          .dashboard-stat-card:hover {
            transform: translateY(-4px);
            border-color: var(--primary);
            box-shadow: var(--shadow-md), var(--shadow-glow);
          }
          .stat-icon-wrapper {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.45rem;
            flex-shrink: 0;
            box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.05);
          }
          .dashboard-action-card {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 24px;
            text-align: left;
            cursor: pointer;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            transition: var(--transition);
            box-shadow: var(--shadow-sm);
            font-family: inherit;
          }
          .dashboard-action-card:hover {
            transform: translateY(-6px);
            border-color: var(--primary);
            box-shadow: var(--shadow-md), var(--shadow-glow);
            background: var(--bg-secondary);
          }
          .action-icon-circle {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            transition: var(--transition);
          }
          .dashboard-action-card:hover .action-icon-circle {
            transform: scale(1.1) rotate(5deg);
          }
          .action-card-arrow {
            position: absolute;
            bottom: 24px;
            right: 24px;
            font-size: 1.1rem;
            color: var(--text-muted);
            opacity: 0;
            transition: var(--transition);
            transform: translateX(-5px);
          }
          .dashboard-action-card:hover .action-card-arrow {
            opacity: 1;
            transform: translateX(0);
            color: var(--primary);
          }
          .diet-toggle-btn-sm {
            padding: 6px 14px;
            border-radius: 12px;
            border: none;
            font-weight: 700;
            font-size: 0.8rem;
            cursor: pointer;
            background: transparent;
            color: var(--text-muted);
            transition: all 0.3s ease;
            font-family: inherit;
          }
          .diet-toggle-btn-sm.active {
            background: var(--primary-subtle);
            color: var(--primary);
          }
          .diet-meal-preview-box {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: var(--bg-secondary);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            transition: var(--transition-fast);
          }
          .diet-meal-preview-box:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
          }
          .diet-meal-preview-box.active-meal {
            border-color: var(--primary);
            background: var(--primary-subtle);
            box-shadow: 0 0 15px var(--primary-glow);
          }
          .active-meal-badge {
            font-size: 0.65rem;
            background: var(--primary);
            color: white;
            padding: 2px 6px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            display: inline-block;
          }
          .meal-emoji {
            font-size: 1.5rem;
            flex-shrink: 0;
          }
          .meal-details {
            flex: 1;
          }
          .meal-details h5 {
            margin: 0 0 6px 0;
            font-weight: 700;
            font-size: 0.88rem;
            color: var(--text-main);
          }
          .meal-details p {
            margin: 0;
            font-size: 0.82rem;
            color: var(--text-dim);
            line-height: 1.4;
          }
          .routine-week-row {
            display: flex;
            align-items: center;
            gap: 16px;
            border-bottom: 1px dashed var(--glass-border);
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .routine-week-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 0;
          }
          .routine-week-label {
            font-family: 'Outfit', sans-serif;
            font-size: 0.72rem;
            font-weight: 800;
            color: var(--primary);
            width: 60px;
            letter-spacing: 0.05em;
            flex-shrink: 0;
          }
          .routine-days-row {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .routine-day-dot {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 1px solid var(--glass-border);
            background: var(--bg-deep);
            color: var(--text-dim);
            font-weight: 700;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .routine-day-dot:hover {
            border-color: var(--primary);
            color: var(--primary);
            transform: translateY(-2px);
          }
          .routine-day-dot.active {
            background: var(--gradient-hero);
            color: white;
            border-color: transparent;
            box-shadow: 0 0 10px var(--primary-glow);
            transform: scale(1.1);
          }
          .routine-day-dot.cleanse-day {
            border-color: rgba(16, 185, 129, 0.3);
            color: #10b981;
          }
          .routine-day-dot.cleanse-day.active {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
          }
          .routine-day-dot.fasting-day {
            border-color: rgba(245, 158, 11, 0.3);
            color: #f59e0b;
          }
          .routine-day-dot.fasting-day.active {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
          }
          .routine-detail-glow {
            position: absolute;
            top: -50px;
            right: -50px;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
            opacity: 0.5;
          }
        `}} />
      </div>
    </div>
  );
};

export default Dashboard;
