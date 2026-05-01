import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiCheckCircle } from 'react-icons/fi';

const StreakDashboard = () => {
  const { batchId } = useParams();
  const [streak, setStreak] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/streaks/${batchId}`).then(r => { 
      setStreak(r.data.streak); 
      setEnrollment(r.data.enrollment);
      setLoading(false); 
    }).catch(() => setLoading(false));
  }, [batchId]);

  const logToday = async () => {
    try {
      const { data } = await api.post('/streaks/log', { batchId, completedExercise: true, completedDiet: true });
      setStreak(data.streak);
      toast.success('Day logged! 🔥');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;

  const today = new Date().toDateString();
  const isLoggedToday = streak?.completedDays?.some(d => new Date(d.date).toDateString() === today);

  // Generate calendar based on course duration
  const startDate = new Date(enrollment?.enrolledAt || streak?.createdAt || new Date());
  startDate.setHours(0, 0, 0, 0);
  
  const batch = streak?.batchId;
  const totalDays = batch?.durationType === 'weeks' ? batch.duration * 7 : batch?.durationType === 'months' ? batch.duration * 30 : batch?.duration || 30;

  const calendarDays = [];
  const now = new Date(); now.setHours(0, 0, 0, 0);

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    
    const completed = streak?.completedDays?.some(cd => new Date(cd.date).toDateString() === d.toDateString());
    const isToday = d.toDateString() === now.toDateString();
    const isPast = d < now;

    let status = 'upcoming'; // Default grey
    if (completed) status = 'completed'; // Green
    else if (isToday) status = 'current'; // Yellow
    else if (isPast) status = 'missed'; // Red

    calendarDays.push({ date: d, status, dayNum: i + 1 });
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>🔥 Streak Dashboard</h1>

        {/* Streak summary */}
        <div className="card" style={{ textAlign: 'center', padding: 40, marginBottom: 24 }}>
          <div className="streak-flame">🔥</div>
          <div className="streak-count">{streak?.currentStreak || 0}</div>
          <div className="streak-label">Day Streak</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 24 }}>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{streak?.longestStreak || 0}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Longest Streak</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{streak?.totalPoints || 0}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Points</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{streak?.completedDays?.length || 0}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Days Done</div></div>
          </div>
        </div>

        {/* Log today */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Today's Check-in</h3>
          {isLoggedToday ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--success)' }}>
              <FiCheckCircle size={24} /> <span style={{ fontWeight: 600 }}>You've logged today! Keep it up! 💪</span>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={logToday} style={{ width: '100%' }}>
              <FiCheckCircle /> Mark Today as Complete
            </button>
          )}
        </div>

        {/* Course Progress Calendar */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700 }}>Course Progress</h3>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--success)' }}></div> Done</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#fbbf24' }}></div> Today</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444' }}></div> Missed</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--border)' }}></div> Upcoming</div>
            </div>
          </div>
          
          <div className="streak-calendar" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {calendarDays.map((d, i) => (
              <div 
                key={i} 
                className="streak-day"
                style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'default',
                  background: d.status === 'completed' ? 'var(--success)' : 
                              d.status === 'current' ? '#fbbf24' : 
                              d.status === 'missed' ? '#ef4444' : 'var(--border)',
                  color: d.status === 'upcoming' ? 'var(--text-muted)' : '#fff',
                  border: d.status === 'current' ? '2px solid #b45309' : 'none'
                }}
                title={d.date.toLocaleDateString()}
              >
                {d.dayNum}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakDashboard;
