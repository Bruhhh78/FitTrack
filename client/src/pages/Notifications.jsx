import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiBell, FiCircle, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const r = await api.get('/notifications');
      setNotifications(r.data.notifications);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const markRead = async (id, link) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

    let targetLink = link;
    if (user.role === 'admin' && targetLink === '/messenger') targetLink = '/admin?tab=messages';
    if (targetLink) navigate(targetLink);
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>All <span className="text-gradient">Notifications</span></h1>
          {notifications.some(n => !n.isRead) && (
            <button className="btn btn-ghost" onClick={markAllRead}>
              <FiCheckCircle /> Mark All as Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <FiBell size={48} style={{ opacity: 0.2, marginBottom: 20, color: 'var(--primary)' }} />
            <h3>No Notifications Yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>We'll notify you when something important happens.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {notifications.map(n => (
              <div
                key={n._id}
                className="notification-item"
                onClick={() => markRead(n._id, n.link)}
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  display: 'flex',
                  gap: 16,
                  background: n.isRead ? 'transparent' : 'var(--primary-subtle)'
                }}
              >
                <div style={{ marginTop: 4, flexShrink: 0 }}>
                  {n.isRead ? <FiCircle size={10} style={{ color: 'var(--text-muted)' }} /> : <FiCircle size={10} fill="var(--accent)" style={{ color: 'var(--accent)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 12, flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{n.title}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ color: 'var(--text-dim)', marginBottom: 0, lineHeight: 1.6, fontSize: '0.9rem' }}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .notification-item:hover { background: var(--primary-subtle) !important; }
        .notification-item:last-child { border-bottom: none; }
      `}</style>
    </div>
  );
};

export default Notifications;
