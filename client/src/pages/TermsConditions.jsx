import React from 'react';
import Footer from '../components/Footer';

const TermsConditions = () => {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 800 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Terms & Conditions</h1>
        <div className="card" style={{ padding: 40 }}>
          <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Last updated: {new Date().toLocaleDateString()}</p>

          <div className="content-section" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>1. Agreement to Terms</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              By accessing or using FitTrack, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you may not access the service.
            </p>
          </div>

          <div className="content-section" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>2. Health Disclaimer</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              FitTrack provides fitness and health tracking tools, but we are not medical professionals. The information provided through our programs should not be interpreted as medical advice. Always consult with a qualified healthcare provider before starting any new diet or exercise program.
            </p>
          </div>

          <div className="content-section" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>3. User Accounts</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
            </p>
          </div>
          
          <div className="content-section">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>4. Contact Us</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              If you have any questions about these Terms, please contact us at: <br/>
              <strong>Email:</strong> anmolsrivastava678@gmail.com
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsConditions;
