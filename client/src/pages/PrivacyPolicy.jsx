import React from 'react';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 800 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Privacy Policy</h1>
        <div className="card" style={{ padding: 40 }}>
          <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="content-section" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>1. Introduction</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Welcome to FitTrack. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our 
              website and tell you about your privacy rights and how the law protects you.
            </p>
          </div>

          <div className="content-section" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>2. Data We Collect</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul style={{ color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: 20 }}>
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Health Data</strong> includes body measurements, weight tracking, and progress photos.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
            </ul>
          </div>

          <div className="content-section" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>3. How We Use Your Data</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to provide and improve our services, manage your account, and provide customer support.
            </p>
          </div>

          <div className="content-section">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>4. Contact Us</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              If you have any questions about this privacy policy or our privacy practices, please contact us at: <br/>
              <strong>Email:</strong> anmolsrivastava678@gmail.com
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
