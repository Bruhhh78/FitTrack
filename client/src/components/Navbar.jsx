import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut, FiBell, FiBellOff, FiCircle } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { io } from 'socket.io-client';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', fontWeight: 900, textDecoration: 'none', color: 'inherit' }}>
          <GiWeightLiftingUp size={32} color="var(--primary)" /> FitTrack
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/batches" className={`nav-link ${isActive('/batches')}`}>Programs</Link>
          
          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className={`nav-link ${isActive(user.role === 'admin' ? '/admin' : '/dashboard')}`}>Dashboard</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)' }}>
                <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1 }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
                {!avatarError && user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    onError={() => setAvatarError(true)}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
                  />
                ) : (
                  <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>{user.name?.[0]}</div>
                )}
              </div>
              <button onClick={toggleTheme} className="btn-icon-nav">
                {theme === 'light' ? <FiMoon /> : <FiSun />}
              </button>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                <FiLogOut style={{ marginRight: 6 }} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className={`nav-link ${isActive('/auth')}`}>Login</Link>
              <Link to="/auth" className="btn btn-primary btn-sm">Join Now</Link>
              <button onClick={toggleTheme} className="btn-icon-nav">
                {theme === 'light' ? <FiMoon /> : <FiSun />}
              </button>
            </>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '1.8rem' }}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-icon-nav { background: var(--bg-dark); border: 1px solid var(--glass-border); color: var(--text-main); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition); }
        .btn-icon-nav:hover { border-color: var(--primary); color: var(--primary); }
        @media (max-width: 850px) {
          .navbar-links { 
            position: fixed; 
            top: 0; 
            right: -100%; 
            width: 280px; 
            height: 100vh;
            background: var(--bg-dark); 
            flex-direction: column; 
            padding: 100px 30px; 
            border-left: 1px solid var(--glass-border); 
            display: flex;
            z-index: 1001;
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
            transition: all 0.4s cubic-bezier(0.2, 1, 0.3, 1);
          }
          .navbar-links.open { right: 0; }
          .mobile-menu-btn { display: block !important; position: relative; z-index: 1002; }
          .nav-link { width: 100%; text-align: left; padding: 15px 20px; font-size: 1.1rem; }
        }
      `}} />
    </nav>
  );
};

export default Navbar;
