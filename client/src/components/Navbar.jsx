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
              <button onClick={toggleTheme} className="btn-icon-nav">
                {theme === 'light' ? <FiMoon /> : <FiSun />}
              </button>
              <button onClick={handleLogout} className="btn btn-primary btn-sm">
                <FiLogOut style={{ marginRight: 6 }} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
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
        @media (max-width: 768px) {
          .navbar-links { position: fixed; top: var(--navbar-height); left: 0; right: 0; background: var(--bg-dark); flex-direction: column; padding: 20px; border-bottom: 1px solid var(--glass-border); display: none; }
          .navbar-links.open { display: flex; }
        }
      `}} />
    </nav>
  );
};

export default Navbar;
