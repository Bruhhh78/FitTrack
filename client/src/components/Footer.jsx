import { GiWeightLiftingUp } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { FiGithub, FiMail } from 'react-icons/fi';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-content">
        <div>
          <div className="footer-brand">
            <GiWeightLiftingUp size={28} style={{ color: 'var(--primary)' }} />
            <span className="footer-brand-text">FitTrack</span>
          </div>
          <p className="footer-desc">
            Transform your body and mind with our comprehensive weight loss programs.
            Track progress, stay accountable, and achieve your fitness goals with daily guidance.
          </p>
          <div className="footer-socials">
            <a href="https://github.com/Bruhhh78" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="GitHub"><FiGithub /></a>
            <a href="mailto:anmolsrivastava678@gmail.com" className="footer-social-icon" aria-label="Email"><FiMail /></a>
          </div>
        </div>

        <div>
          <div className="footer-title">Quick Links</div>
          <ul className="footer-links">
            <li><Link to="/batches">Programs</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/auth">Get Started</Link></li>
          </ul>
        </div>

        <div>
          <div className="footer-title">Support</div>
          <ul className="footer-links">
            <li><a href="mailto:anmolsrivastava678@gmail.com">Help Center</a></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} FitTrack. All rights reserved. 
        <br />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          A MERN Stack Project developed by <strong style={{ color: 'var(--primary)' }}>Anmol Srivastava</strong> (anmolsrivastava678@gmail.com)
        </span>
      </div>
    </div>

    <style>{`
      .footer-socials {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }
      .footer-social-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--primary-subtle);
        border: 1px solid var(--glass-border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-dim);
        text-decoration: none;
        transition: var(--transition-fast);
        font-size: 1.1rem;
      }
      .footer-social-icon:hover {
        background: var(--primary);
        color: #fff;
        border-color: var(--primary);
        transform: translateY(-3px);
        box-shadow: 0 6px 16px var(--primary-glow);
      }
      @media (max-width: 768px) {
        .footer-socials { justify-content: center; }
      }
    `}</style>
  </footer>
);

export default Footer;
