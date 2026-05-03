import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut, FiMessageSquare, FiBell, FiBellOff, FiCircle } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';

import { io } from 'socket.io-client';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [hasActiveBatch, setHasActiveBatch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Fetch notifications
      import('../utils/api').then(api => {
        api.default.get('/notifications').then(r => {
          setNotifications(r.data.notifications);
          setUnreadCount(r.data.notifications.filter(n => !n.isRead).length);
        });
      });

      // Socket for real-time notifications
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
      socket.emit('join_private_room', user._id);
      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        import('react-hot-toast').then(toast => toast.default.success(`New Notification: ${notification.title}`));
      });

      return () => socket.disconnect();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      import('../utils/api').then(api => {
        api.default.get('/enrollments/my').then(r => {
          setHasActiveBatch(r.data.enrollments.some(e => e.status === 'active'));
        }).catch(() => {});
      });
    }
  }, [user]);

  const markRead = async (id) => {
    const api = (await import('../utils/api')).default;
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <GiWeightLiftingUp size={28} /> FitTrack
        </Link>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/batches" className={isActive('/batches')} onClick={() => setMenuOpen(false)}>Programs</Link>
          {user ? (
            <>
              <Link 
                to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                className={user.role === 'admin' ? isActive('/admin') : isActive('/dashboard')} 
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              {hasActiveBatch && (
                <Link to="/messenger" className={isActive('/messenger')} onClick={() => setMenuOpen(false)}>
                  Messenger
                </Link>
              )}
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className={`btn btn-primary btn-sm`} onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          
          {user && (
            <div className="notification-wrapper" style={{ position: 'relative' }}>
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', position: 'relative' }}>
                {unreadCount > 0 ? <FiBell style={{ color: 'var(--accent)' }} /> : <FiBellOff />}
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    <button onClick={async () => {
                      const api = (await import('../utils/api')).default;
                      await api.put('/notifications/read-all');
                      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                      setUnreadCount(0);
                    }}>Mark all read</button>
                  </div>
                  <div className="dropdown-content">
                    {notifications.length === 0 ? <p className="empty-notif">No notifications</p> : 
                      notifications.map(n => (
                        <div key={n._id} className={`notification-item ${n.isRead ? 'read' : 'unread'}`} onClick={() => { 
                          markRead(n._id); 
                          let targetLink = n.link;
                          if (user.role === 'admin' && targetLink === '/messenger') targetLink = '/admin?tab=messages';
                          if(targetLink) navigate(targetLink); 
                          setShowNotifications(false); 
                        }}>
                          <div className="notif-icon">{n.isRead ? <FiCircle size={8} /> : <FiCircle size={8} fill="var(--accent)" style={{color: 'var(--accent)'}} />}</div>
                          <div className="notif-text">
                            <h6>{n.title}</h6>
                            <p>{n.message}</p>
                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  <Link to="/notifications" className="dropdown-footer" onClick={() => setShowNotifications(false)}>View All Notifications</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .notification-badge { position: absolute; top: -5px; right: -5px; background: var(--accent); color: #fff; font-size: 0.6rem; width: 15px; height: 15px; border-radius: 50%; display: flex; align-items: center; justifyContent: center; }
        .notification-dropdown { position: absolute; top: 100%; right: 0; width: 300px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 2000; margin-top: 10px; overflow: hidden; }
        .dropdown-header { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-tertiary); }
        .dropdown-header h4 { margin: 0; font-size: 0.9rem; font-weight: 700; }
        .dropdown-header button { background: none; border: none; color: var(--accent); font-size: 0.75rem; cursor: pointer; }
        .dropdown-content { max-height: 400px; overflow-y: auto; }
        .notification-item { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; gap: 12px; cursor: pointer; transition: 0.2s; }
        .notification-item:hover { background: var(--bg-tertiary); }
        .notification-item.unread { background: rgba(13, 148, 136, 0.03); }
        .notif-text h6 { margin: 0 0 4px; font-size: 0.85rem; font-weight: 600; }
        .notif-text p { margin: 0 0 4px; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }
        .notif-text span { font-size: 0.65rem; opacity: 0.6; }
        .empty-notif { padding: 30px; text-align: center; color: var(--text-muted); font-size: 0.85rem; }
        .dropdown-footer { display: block; padding: 12px; text-align: center; font-size: 0.8rem; color: var(--accent); border-top: 1px solid var(--border); background: var(--bg-tertiary); font-weight: 600; }
        .dropdown-footer:hover { text-decoration: underline; }
      `}} />
    </nav>
  );
};

export default Navbar;
