import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created successfully!');
      navigate('/batches');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start your transformation today</p>
        <button className="google-btn" onClick={() => window.location.href = '/api/auth/google'} type="button">
          <FcGoogle size={22} /> Continue with Google
        </button>
        <div className="divider">or register with email</div>
        <form onSubmit={handleSubmit}>
          {[
            { name: 'name', label: 'Full Name', icon: <FiUser />, type: 'text', placeholder: 'John Doe' },
            { name: 'email', label: 'Email', icon: <FiMail />, type: 'email', placeholder: 'you@example.com' },
            { name: 'phone', label: 'Phone (optional)', icon: <FiPhone />, type: 'tel', placeholder: '+91 9999999999' },
            { name: 'password', label: 'Password', icon: <FiLock />, type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div className="form-group" key={f.name}>
              <label className="form-label">{f.label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{f.icon}</span>
                <input className="form-input" style={{ paddingLeft: 40 }} type={f.type} name={f.name} placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} required={f.name !== 'phone'} />
              </div>
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
