import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      navigate(data.user.role === 'admin' ? '/admin' : '/batches');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at top right, rgba(245, 158, 11, 0.05), transparent), radial-gradient(circle at bottom left, rgba(249, 115, 22, 0.05), transparent)'
    }}>
      <div className="card animate-fade" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-dim)' }}>Sign in to continue your transformation</p>
        </div>

        <button className="btn btn-outline" onClick={() => window.location.href = '/api/auth/google'} style={{ width: '100%', marginBottom: '24px', display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <FcGoogle size={20} style={{ marginRight: 10 }} /> Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }}></div>
          <span style={{ margin: '0 15px' }}>or with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input className="form-input" style={{ paddingLeft: 48 }} type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input className="form-input" style={{ paddingLeft: 48, paddingRight: 48 }} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
            {loading ? 'Logging in...' : <>Sign In <FiArrowRight style={{ marginLeft: 8 }} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.95rem', color: 'var(--text-dim)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
