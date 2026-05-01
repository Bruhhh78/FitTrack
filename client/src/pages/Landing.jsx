import { Link } from 'react-router-dom';
import { FiTarget, FiTrendingUp, FiCamera, FiAward, FiCheckCircle, FiZap } from 'react-icons/fi';
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

const Landing = () => (
  <div>
    {/* Hero */}
    <section className="hero">
      <div className="container">
        <div className="hero-content fade-in">
          <div className="badge badge-teal" style={{ marginBottom: 16 }}>🔥 Transform Your Life</div>
          <h1>Your <span>Weight Loss</span> Journey Starts Here</h1>
          <p>Join our structured programs with expert guidance, daily tracking, meal management, and streak-based challenges. See real results with accountability.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Start Your Journey</Link>
            <Link to="/batches" className="btn btn-secondary btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>View Programs</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-value">500+</div><div className="hero-stat-label">Transformations</div></div>
            <div className="hero-stat"><div className="hero-stat-value">95%</div><div className="hero-stat-label">Success Rate</div></div>
            <div className="hero-stat"><div className="hero-stat-value">21+</div><div className="hero-stat-label">Day Programs</div></div>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="section">
      <div className="container">
        <h2 className="section-title">Everything You Need to <span style={{ color: 'var(--accent)' }}>Succeed</span></h2>
        <p className="section-subtitle">Comprehensive tools and features designed to make your weight loss journey effective and enjoyable.</p>
        <div className="grid grid-3">
          {features.map((f, i) => (
            <div key={i} className="card feature-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="section" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Get started in 4 simple steps</p>
        <div className="grid grid-4">
          {[
            { step: '01', title: 'Sign Up', desc: 'Create your account with Google or email' },
            { step: '02', title: 'Choose a Program', desc: 'Pick from our curated weight loss batches' },
            { step: '03', title: 'Submit Measurements', desc: 'Enter body measurements & upload progress photos' },
            { step: '04', title: 'Track Daily', desc: 'Log meals, complete exercises, build streaks' },
          ].map((s, i) => (
            <div key={i} className="card fade-in" style={{ textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', opacity: 0.3, marginBottom: 8 }}>{s.step}</div>
              <h3 style={{ marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section" style={{ background: 'var(--gradient-hero)', textAlign: 'center', padding: '80px 0' }}>
      <div className="container">
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: 16 }}>Ready to Transform?</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Join hundreds of people who have already started their weight loss journey with FitTrack.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg" style={{ background: '#fff', color: 'var(--teal-800)' }}>
          <FiZap /> Get Started Free
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default Landing;
