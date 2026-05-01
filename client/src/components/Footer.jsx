import { GiWeightLiftingUp } from 'react-icons/gi';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-content">
        <div>
          <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GiWeightLiftingUp style={{ color: 'var(--accent)' }} /> FitTrack
          </div>
          <p className="footer-desc">Transform your body and mind with our comprehensive weight loss programs. Track progress, stay accountable, and achieve your fitness goals.</p>
        </div>
        <div>
          <div className="footer-title">Quick Links</div>
          <ul className="footer-links">
            <li><a href="/batches">Programs</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-title">Support</div>
          <ul className="footer-links">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} FitTrack. All rights reserved.</div>
    </div>
  </footer>
);

export default Footer;
