import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
