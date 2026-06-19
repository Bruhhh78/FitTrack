import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiTrendingUp, FiCamera, FiAward, FiCheckCircle, FiZap, FiArrowRight } from 'react-icons/fi';
import { GiMeal, GiMuscleUp } from 'react-icons/gi';
import Footer from '../components/Footer';

const features = [
  { icon: <FiTarget />, title: 'Guided Programs', desc: 'Expert-designed batches with structured challenges to keep you on track.' },
  { icon: <FiTrendingUp />, title: 'Progress Tracking', desc: 'Track body measurements, weight, and see your transformation over time.' },
  { icon: <FiCamera />, title: 'Photo Progress', desc: 'Upload daily body photos and see visual changes in your physique.' },
  { icon: <GiMeal />, title: 'Meal Tracking', desc: 'Log your breakfast, lunch & dinner with photo uploads for accountability.' },
  { icon: <FiAward />, title: 'Streak System', desc: 'Build consistency with daily streak tracking and challenge completion.' },
  { icon: <GiMuscleUp />, title: 'Exercise Plans', desc: 'Access curated exercise routines, videos, and PDF guides.' },
];

const Landing = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('animate-reveal');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content animate-fade">
            <div className="badge" style={{ marginBottom: 20 }}>🚀 Your transformation starts here</div>
            <h1>Transform Your Body <br/> <span style={{ color: 'var(--primary)' }}>Empower Your Life</span></h1>
            <p>FitTrack is your ultimate weight loss companion. Join structured programs, track every meal, and build lasting habits with our guided streak system.</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/auth" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/batches" className="btn btn-outline btn-lg">Browse Programs</Link>
            </div>
            
            <div style={{ display: 'flex', gap: 40, marginTop: 60, marginBottom: 40, flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>500+</div><div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Users Transformed</div></div>
              <div style={{ width: 1, background: 'var(--glass-border)', height: 50 }}></div>
              <div><div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>21+</div><div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Day Challenges</div></div>
              <div style={{ width: 1, background: 'var(--glass-border)', height: 50 }}></div>
              <div><div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>98%</div><div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Success Rate</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: 'var(--bg-dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }} className="reveal-on-scroll">
            <h2 style={{ fontSize: '2.5rem', marginBottom: 16 }}>Everything You Need To <span style={{ color: 'var(--primary)' }}>Succeed</span></h2>
            <p style={{ color: 'var(--text-dim)', maxWidth: 600, margin: '0 auto' }}>We provide the tools, the plan, and the community. You bring the consistency.</p>
          </div>
          
          <div className="grid grid-3">
            {features.map((f, i) => (
              <div key={i} className="card card-interactive reveal-on-scroll" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="stat-icon" style={{ marginBottom: 24, width: 60, height: 60, fontSize: '1.6rem' }}>{f.icon}</div>
                <h3 style={{ marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warm CTA */}
      <section className="section">
        <div className="container">
          <div className="card reveal-on-scroll" style={{ 
            textAlign: 'center', 
            padding: '80px 40px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
            borderColor: 'var(--primary-glow)'
          }}>
            <h2 style={{ fontSize: '3rem', marginBottom: 24 }}>Ready to Level Up?</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
              Join FitTrack today and start your journey towards a healthier, more confident version of yourself.
            </p>
            <Link to="/auth" className="btn btn-primary btn-lg">Start Your 21-Day Challenge</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
