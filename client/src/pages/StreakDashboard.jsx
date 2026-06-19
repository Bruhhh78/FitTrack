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

    let status = 'upcoming';
    if (completed) status = 'completed';
    else if (isToday) status = 'current';
    else if (isPast) status = 'missed';

    calendarDays.push({ date: d, status, dayNum: i + 1 });
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>🔥 Streak Dashboard</h1>

        {/* Streak summary */}
        <div className="card" style={{ textAlign: 'center', padding: 40, marginBottom: 24, background: 'var(--gradient-hero-subtle)', border: '1px solid var(--primary-glow)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🔥</div>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
            <span className="text-gradient">{streak?.currentStreak || 0}</span>
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '1rem', marginTop: 8, fontWeight: 600 }}>Day Streak</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 28, flexWrap: 'wrap' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontWeight: 700 }}>Course Progress</h3>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--primary)' }}></div> Done</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent)' }}></div> Today</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--danger)' }}></div> Missed</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--bg-tertiary)' }}></div> Upcoming</div>
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
                  background: d.status === 'completed' ? 'var(--primary)' :
                              d.status === 'current' ? 'var(--accent)' :
                              d.status === 'missed' ? 'var(--danger)' : 'var(--bg-tertiary)',
                  color: d.status === 'upcoming' ? 'var(--text-muted)' : '#fff',
                  border: d.status === 'current' ? '2px solid var(--accent-hover)' : 'none',
                  boxShadow: d.status === 'completed' ? '0 0 8px var(--primary-glow)' :
                             d.status === 'current' ? '0 0 8px var(--accent-glow)' : 'none',
                  transition: 'var(--transition-fast)'
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
