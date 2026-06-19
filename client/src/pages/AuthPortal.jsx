import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { FiArrowRight, FiUserPlus, FiLogIn, FiCheckCircle, FiShield } from 'react-icons/fi';

const AuthPortal = () => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('choice'); // 'choice', 'login', 'signup'

  const handleGoogleSuccess = async (response) => {
    try {
      const data = await googleLogin(response.credential);
      toast.success('Welcome to FitTrack!');
      navigate(data.user.role === 'admin' ? '/admin' : '/batches');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <div className="auth-portal-wrapper" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      background: '#000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Image with Overlay */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        backgroundImage: `url('/auth_portal_bg_1777805272440.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.4,
        zIndex: 1
      }} />
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        background: 'radial-gradient(circle at center, transparent 0%, #000 80%)',
        zIndex: 2
      }} />

      <div className="container" style={{ 
        position: 'relative', 
        zIndex: 10, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '120px 20px 80px',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '8px 16px', 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.2)', 
            borderRadius: 100,
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: 24,
            textTransform: 'uppercase'
          }}>
            <FiShield style={{ marginRight: 8 }} /> Secure Portal Access
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
            Your <span className="text-gradient">Transformation</span> <br /> Starts Here
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: 600, margin: '0 auto' }}>
            Choose how you want to proceed into the FitTrack 21-Day Challenge environment.
          </p>
        </div>

        <div className="grid grid-2" style={{ width: '100%', maxWidth: 900, gap: 24 }}>
          {/* Sign In Card */}
          <div className="card glass-premium portal-card animate-slide-up" style={{ padding: 48, textAlign: 'center', border: '1px solid var(--glass-border)' }}>
            <div className="portal-icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <FiLogIn size={32} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: 32, fontSize: '0.95rem' }}>
              Already a member? Sign in to track your streak and log your daily progress.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login Failed')}
                theme="filled_black"
                shape="pill"
                text="signin_with"
                width="100%"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
               <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
               <span style={{ margin: '0 12px' }}>OR</span>
               <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
            </div>

            <Link to="/login" className="btn btn-outline btn-lg" style={{ width: '100%', padding: '16px' }}>
              Sign In with Email <FiArrowRight style={{ marginLeft: 8 }} />
            </Link>
          </div>

          {/* Sign Up Card */}
          <div className="card glass-premium portal-card animate-slide-up" style={{ padding: 48, textAlign: 'center', border: '1px solid var(--primary-glow)', background: 'rgba(245, 158, 11, 0.05)' }}>
            <div className="portal-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)' }}>
              <FiUserPlus size={32} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>New Journey</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: 32, fontSize: '0.95rem' }}>
              First time here? Create your account to join the upcoming 21-Day transformation batch.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login Failed')}
                theme="filled_blue"
                shape="pill"
                text="signup_with"
                width="100%"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
               <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
               <span style={{ margin: '0 12px' }}>OR</span>
               <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
            </div>

            <Link to="/register" className="btn btn-primary btn-lg" style={{ width: '100%', padding: '16px' }}>
              Create New Account <FiCheckCircle style={{ marginLeft: 8 }} />
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 60, display: 'flex', gap: 40, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <FiCheckCircle style={{ color: 'var(--success)' }} /> Secure SSL
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <FiCheckCircle style={{ color: 'var(--success)' }} /> Google Verified
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <FiCheckCircle style={{ color: 'var(--success)' }} /> Privacy Protected
          </div>
        </div>

      </div>

      <style>{`
        .portal-icon-box {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .portal-card {
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .portal-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.03);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AuthPortal;
