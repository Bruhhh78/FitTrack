import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut, FiBell, FiCircle } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.4rem', fontWeight: 900, textDecoration: 'none', color: 'inherit', letterSpacing: '-0.02em' }}>
          <GiWeightLiftingUp size={30} style={{ color: 'var(--primary)' }} />
          <span className="text-gradient">FitTrack</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/batches" className={`nav-link ${isActive('/batches')}`} onClick={() => setMenuOpen(false)}>Programs</Link>

          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className={`nav-link ${isActive(user.role === 'admin' ? '/admin' : '/dashboard')}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              
              <div className="nav-user-pill">
                {!avatarError && user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    onError={() => setAvatarError(true)}
                    className="nav-avatar"
                  />
                ) : (
                  <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>{user.name?.[0]}</div>
                )}
                <div className="nav-user-info">
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2 }}>{user.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
              </div>

              <button onClick={toggleTheme} className="btn-icon-nav" aria-label="Toggle theme">
                {theme === 'light' ? <FiMoon /> : <FiSun />}
              </button>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                <FiLogOut style={{ marginRight: 4 }} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className={`nav-link ${isActive('/auth')}`} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/auth" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Join Now</Link>
              <button onClick={toggleTheme} className="btn-icon-nav" aria-label="Toggle theme">
                {theme === 'light' ? <FiMoon /> : <FiSun />}
              </button>
            </>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '1.8rem', padding: 4 }}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-icon-nav {
          background: var(--bg-dark);
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          flex-shrink: 0;
        }
        .btn-icon-nav:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-subtle);
        }
        .nav-user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 12px 5px 5px;
          background: var(--primary-subtle);
          border-radius: var(--radius-full);
          border: 1px solid var(--glass-border);
        }
        .nav-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary);
        }
        .nav-user-info {
          display: block;
        }
        @media (max-width: 850px) {
          .navbar-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 300px;
            height: 100vh;
            height: 100dvh;
            background: var(--bg-dark);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 100px 24px 40px;
            border-left: 1px solid var(--glass-border);
            display: flex;
            z-index: 1001;
            box-shadow: -20px 0 60px rgba(0,0,0,0.5);
            transition: all 0.4s cubic-bezier(0.2, 1, 0.3, 1);
            overflow-y: auto;
          }
          .navbar-links.open { right: 0; }
          .mobile-menu-btn { display: block !important; position: relative; z-index: 1002; }
          .nav-link { width: 100%; text-align: left; padding: 14px 20px; font-size: 1.05rem; }
          .nav-user-pill { width: 100%; padding: 12px; }
          .nav-user-info { display: block; }
        }
        @media (min-width: 851px) {
          .nav-user-info { display: none; }
        }
      `}} />
    </nav>
  );
};

export default Navbar;
