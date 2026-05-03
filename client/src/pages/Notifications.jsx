import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiBell, FiCircle, FiTrash2, FiCheckCircle } from 'react-icons/fi';
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>All <span style={{ color: 'var(--accent)' }}>Notifications</span></h1>
          {notifications.some(n => !n.isRead) && (
            <button className="btn btn-outline" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiCheckCircle /> Mark All as Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <FiBell size={48} style={{ opacity: 0.2, marginBottom: 20 }} />
            <h3>No Notifications Yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>We'll notify you when something important happens.</p>
          </div>
        ) : (
          <div className="notification-list card" style={{ padding: 0 }}>
            {notifications.map(n => (
              <div 
                key={n._id} 
                className={`notification-page-item ${n.isRead ? 'read' : 'unread'}`}
                onClick={() => markRead(n._id, n.link)}
                style={{ 
                  padding: '24px', 
                  borderBottom: '1px solid var(--border)', 
                  cursor: 'pointer', 
                  transition: '0.2s',
                  display: 'flex',
                  gap: 20,
                  background: n.isRead ? 'transparent' : 'rgba(13, 148, 136, 0.05)'
                }}
              >
                <div style={{ marginTop: 4 }}>
                  {n.isRead ? <FiCircle size={12} /> : <FiCircle size={12} fill="var(--accent)" style={{ color: 'var(--accent)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{n.title}</h4>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 0, lineHeight: 1.6 }}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .notification-page-item:hover { background: var(--bg-tertiary) !important; }
        .notification-page-item:last-child { border-bottom: none; }
        .btn-outline { border: 1px solid var(--border); background: transparent; color: var(--text-main); padding: 8px 16px; border-radius: var(--radius-md); cursor: pointer; }
        .btn-outline:hover { background: var(--bg-tertiary); }
      `}} />
    </div>
  );
};

export default Notifications;
