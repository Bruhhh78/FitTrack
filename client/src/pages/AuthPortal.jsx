import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { FiArrowRight, FiUserPlus, FiLogIn, FiCheckCircle, FiShield } from 'react-icons/fi';

const AuthPortal = () => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

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
      background: 'var(--bg-deep)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: 600,
        height: 600,
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 1
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
            background: 'var(--primary-subtle)',
            border: '1px solid var(--primary-glow)',
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
          <div className="card portal-card animate-slide-up" style={{ padding: 48, textAlign: 'center', border: '1px solid var(--glass-border)' }}>
            <div className="portal-icon-box" style={{ background: 'var(--info-glow)', color: 'var(--info)' }}>
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
          <div className="card portal-card animate-slide-up" style={{ padding: 48, textAlign: 'center', border: '1px solid var(--primary-glow)', background: 'var(--gradient-hero-subtle)' }}>
            <div className="portal-icon-box" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
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

        <div style={{ marginTop: 60, display: 'flex', gap: 40, color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
          box-shadow: var(--shadow-lg), 0 0 40px var(--primary-glow);
        }
      `}</style>
    </div>
  );
};

export default AuthPortal;
