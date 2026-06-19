import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiTrendingUp, FiCamera, FiAward, FiCheckCircle, FiZap, FiArrowRight, FiPlay, FiStar, FiShield, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { GiMeal, GiMuscleUp } from 'react-icons/gi';
import Footer from '../components/Footer';

const features = [
  { icon: <FiTarget />, title: 'Guided Programs', desc: 'Expert-designed batches with structured challenges to keep you on track every single day.' },
  { icon: <FiTrendingUp />, title: 'Progress Tracking', desc: 'Track body measurements, weight trends, and see your transformation unfold over time.' },
  { icon: <FiCamera />, title: 'Photo Progress', desc: 'Upload daily body photos and witness the visual changes in your physique week by week.' },
  { icon: <GiMeal />, title: 'Meal Tracking', desc: 'Log your breakfast, lunch & dinner with photo uploads for complete accountability.' },
  { icon: <FiAward />, title: 'Streak System', desc: 'Build unbreakable consistency with daily streak tracking and completion rewards.' },
  { icon: <GiMuscleUp />, title: 'Exercise Plans', desc: 'Access curated exercise routines, instructional videos, and downloadable PDF guides.' },
];

const steps = [
  { num: '01', title: 'Choose Your Program', desc: 'Browse our expert-designed weight loss programs and pick the one that matches your goals.', icon: <FiTarget /> },
  { num: '02', title: 'Track Daily Progress', desc: 'Log your meals, measurements, steps, and photos every day to stay accountable.', icon: <FiBarChart2 /> },
  { num: '03', title: 'Transform Your Body', desc: 'Watch your streak grow, see real results, and build habits that last a lifetime.', icon: <FiAward /> },
];

const testimonials = [
  { name: 'Priya S.', role: 'Lost 8kg in 21 days', quote: 'FitTrack completely changed my relationship with fitness. The daily accountability system kept me on track when I would have normally quit.', avatar: 'P' },
  { name: 'Rahul M.', role: 'Batch 3 Graduate', quote: 'The structured program and meal tracking features are incredible. I could see my progress every single day which kept me motivated.', avatar: 'R' },
  { name: 'Ananya K.', role: 'Active Member', quote: 'The streak system is addictive in the best way possible! I haven\'t missed a single day in my current batch. Highly recommend FitTrack.', avatar: 'A' },
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
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="container">
          <div className="landing-hero-grid">
            <div className="hero-content animate-fade">
              <div className="badge" style={{ marginBottom: 24, fontSize: '0.82rem', letterSpacing: '0.04em' }}>
                <FiZap style={{ marginRight: 6 }} /> Your transformation starts here
              </div>
              <h1>
                Transform Your Body.<br />
                <span className="text-gradient">Empower Your Life.</span>
              </h1>
              <p>FitTrack is your ultimate weight loss companion. Join structured programs, track every meal, and build lasting habits with our guided streak system.</p>
              <div className="hero-cta-row">
                <Link to="/auth" className="btn btn-primary btn-lg" id="hero-cta-primary">
                  Get Started Free <FiArrowRight />
                </Link>
                <Link to="/batches" className="btn btn-outline btn-lg" id="hero-cta-secondary">
                  <FiPlay /> Browse Programs
                </Link>
              </div>

              <div className="hero-stats-row">
                <div className="hero-stat">
                  <div className="hero-stat-value">500+</div>
                  <div className="hero-stat-label">Users Transformed</div>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <div className="hero-stat-value">21+</div>
                  <div className="hero-stat-label">Day Challenges</div>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <div className="hero-stat-value">98%</div>
                  <div className="hero-stat-label">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="hero-visual animate-fade" style={{ animationDelay: '0.3s' }}>
              <div className="hero-image-wrapper">
                <img src="/hero_illustration.png" alt="FitTrack - Transform Your Fitness" />
                <div className="hero-image-glow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUSTED BY ===== */}
      <section className="trusted-section reveal-on-scroll">
        <div className="container">
          <div className="trusted-strip">
            <div className="trusted-item">
              <FiShield /> Secure & Private
            </div>
            <div className="trusted-item">
              <FiUsers /> 500+ Active Users
            </div>
            <div className="trusted-item">
              <FiStar /> 4.9 Average Rating
            </div>
            <div className="trusted-item">
              <FiCheckCircle /> Verified Results
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section" style={{ background: 'var(--bg-dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }} className="reveal-on-scroll">
            <div className="badge" style={{ marginBottom: 16 }}>Features</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Everything You Need To <span className="text-gradient">Succeed</span>
            </h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              We provide the tools, the plan, and the community. You bring the consistency.
            </p>
          </div>

          <div className="grid grid-3">
            {features.map((f, i) => (
              <div key={i} className="card card-interactive feature-card reveal-on-scroll" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="feature-icon-box">{f.icon}</div>
                <h3 style={{ marginBottom: 10, fontSize: '1.15rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }} className="reveal-on-scroll">
            <div className="badge" style={{ marginBottom: 16 }}>How It Works</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Three Steps to a <span className="text-gradient">New You</span>
            </h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>Simple, structured, and designed for real results.</p>
          </div>

          <div className="steps-grid reveal-on-scroll">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{s.num}</div>
                <div className="step-icon-box">{s.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem', lineHeight: 1.6 }}>{s.desc}</p>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section" style={{ background: 'var(--bg-dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }} className="reveal-on-scroll">
            <div className="badge" style={{ marginBottom: 16 }}>Testimonials</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Loved by <span className="text-gradient">Real People</span>
            </h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>Don't just take our word for it — hear from our community.</p>
          </div>

          <div className="grid grid-3">
            {testimonials.map((t, i) => (
              <div key={i} className="card testimonial-card reveal-on-scroll" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="testimonial-stars">
                  {Array(5).fill(null).map((_, j) => <FiStar key={j} />)}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: '1rem' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="section">
        <div className="container">
          <div className="card cta-card reveal-on-scroll">
            <div className="cta-bg-glow" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 20, lineHeight: 1.15 }}>
                Ready to <span className="text-gradient">Level Up</span>?
              </h2>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-dim)', marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
                Join FitTrack today and start your journey towards a healthier, more confident version of yourself.
              </p>
              <Link to="/auth" className="btn btn-primary btn-lg" id="cta-bottom">
                Start Your 21-Day Challenge <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* ===== LANDING STYLES ===== */}
      <style>{`
        .landing-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
        }

        .hero-image-wrapper {
          position: relative;
          width: 100%;
          max-width: 520px;
          border-radius: var(--radius-xl);
          overflow: hidden;
        }

        .hero-image-wrapper img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: var(--radius-xl);
        }

        .hero-image-glow {
          position: absolute;
          inset: 0;
          border-radius: var(--radius-xl);
          box-shadow: inset 0 0 60px rgba(139, 92, 246, 0.15);
          pointer-events: none;
        }

        .hero-cta-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hero-stats-row {
          display: flex;
          gap: 36px;
          margin-top: 52px;
          flex-wrap: wrap;
          align-items: center;
        }

        .hero-stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
          font-family: 'Outfit', sans-serif;
          line-height: 1;
        }

        .hero-stat-label {
          color: var(--text-dim);
          font-size: 0.85rem;
          margin-top: 4px;
        }

        .hero-stat-divider {
          width: 1px;
          height: 40px;
          background: var(--glass-border);
        }

        /* Trusted Section */
        .trusted-section {
          padding: 40px 0;
          border-bottom: 1px solid var(--glass-border);
        }

        .trusted-strip {
          display: flex;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
        }

        .trusted-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .trusted-item svg {
          color: var(--primary);
          font-size: 1.1rem;
        }

        /* Feature Cards */
        .feature-card {
          padding: 32px;
          text-align: left;
        }

        .feature-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: var(--gradient-hero-subtle);
          border: 1px solid var(--primary-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--primary);
          margin-bottom: 20px;
          transition: var(--transition);
        }

        .feature-card:hover .feature-icon-box {
          background: var(--gradient-hero);
          color: #fff;
          box-shadow: 0 0 20px var(--primary-glow);
        }

        /* Steps */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          position: relative;
        }

        .step-card {
          text-align: center;
          position: relative;
          padding: 0 16px;
        }

        .step-number {
          font-size: 3.5rem;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          background: var(--gradient-hero);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0.3;
          line-height: 1;
          margin-bottom: 16px;
        }

        .step-icon-box {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: var(--gradient-hero);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          color: #fff;
          margin: 0 auto 20px;
          box-shadow: 0 8px 24px var(--primary-glow);
        }

        .step-connector {
          display: none;
        }

        /* Testimonials */
        .testimonial-card {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .testimonial-stars {
          display: flex;
          gap: 4px;
          color: #fbbf24;
          font-size: 1rem;
        }

        .testimonial-stars svg {
          fill: #fbbf24;
        }

        .testimonial-quote {
          color: var(--text-dim);
          font-size: 0.95rem;
          line-height: 1.7;
          flex: 1;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: 16px;
          border-top: 1px solid var(--glass-border);
        }

        /* CTA Card */
        .cta-card {
          text-align: center;
          padding: 80px 40px;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--primary-glow);
          background: var(--gradient-hero-subtle);
        }

        .cta-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .landing-hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }
          .hero-content { max-width: 100%; padding: 0 16px; }
          .hero-cta-row { justify-content: center; }
          .hero-stats-row { justify-content: center; }
          .hero-visual { padding: 0 16px; margin-top: 20px; }
          .hero-image-wrapper { max-width: 380px; margin: 0 auto; }
          .steps-grid { grid-template-columns: 1fr; gap: 48px; max-width: 480px; margin: 0 auto; }
        }

        @media (max-width: 768px) {
          .trusted-strip { gap: 24px; justify-content: center; }
          .hero-stats-row { gap: 20px; flex-wrap: wrap; }
          .hero-stat-value { font-size: 1.6rem; }
          .cta-card { padding: 48px 24px; }
        }

        @media (max-width: 480px) {
          .hero-cta-row { flex-direction: column; width: 100%; gap: 12px; }
          .hero-cta-row .btn { width: 100%; justify-content: center; margin: 0; }
          .hero-stat-divider { display: none; }
          .hero-stats-row { gap: 16px; flex-direction: row; justify-content: space-between; width: 100%; padding: 0 10px; flex-wrap: wrap; }
          .hero-stat { flex: 1; text-align: center; min-width: 40%; }
          .hero-stat-value { font-size: 1.4rem; }
          .hero-stat-label { font-size: 0.75rem; }
          .trusted-strip { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: center; justify-items: center; }
          .trusted-item { font-size: 0.8rem; }
          .hero-image-wrapper { max-width: 280px; margin: 0 auto; }
          .feature-card { padding: 24px; text-align: center; }
          .feature-icon-box { margin: 0 auto 16px; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
