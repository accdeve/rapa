'use client';

import { useState } from 'react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const waitlist = JSON.parse(localStorage.getItem('voxsilent_waitlist') || '[]');
      waitlist.push({ email, timestamp: new Date().toISOString() });
      localStorage.setItem('voxsilent_waitlist', JSON.stringify(waitlist));
      
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setEmail('');
  };

  return (
    <section className="waitlist-section">
      <div className="container">
        {!isSubmitted ? (
          <div className="form-card">
            <div className="form-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" fill="#8B5CF6" fillOpacity="0.15" />
                <path d="M16 24h16M24 16v16" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="form-title">Jadi yang Pertama Tahu</h2>
            <p className="form-description">
              Masukkan email Anda untuk mendapatkan akses prioritas ke VoxSilent dan update terbaru.
            </p>
            <form onSubmit={handleSubmit} className="form">
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@ perusahaan.com"
                  className="email-input"
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="loading-spinner" />
                ) : (
                  <>
                    Dapatkan Akses
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 10h12M12 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </form>
            <p className="form-note">
              Kami tidak akan spam. Unsubscribe kapan saja.
            </p>
          </div>
        ) : (
          <div className="success-card">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#BEF264" fillOpacity="0.3" />
                <path d="M20 32l8 8 16-16" stroke="#476800" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="success-title">Yeay! Anda berhasil terdaftar</h2>
            <p className="success-description">
              Kami akan menghubungi Anda di <strong>{email}</strong> ketika VoxSilent siap digunakan.
            </p>
            <button onClick={handleRetry} className="retry-btn">
              Daftar email lain
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .waitlist-section {
          padding: 40px 24px 80px;
          background: linear-gradient(180deg, #F8FAFC 0%, #f2f3ff 100%);
        }

        .container {
          max-width: 480px;
          margin: 0 auto;
        }

        .form-card, .success-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 32px 24px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
        }

        .form-icon, .success-icon {
          margin-bottom: 20px;
        }

        .form-title, .success-title {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #131b2e;
          margin-bottom: 12px;
        }

        .form-description, .success-description {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #584239;
          margin-bottom: 28px;
          opacity: 0.9;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-group {
          width: 100%;
        }

        .email-input {
          width: 100%;
          padding: 16px 20px;
          border-radius: 14px;
          border: 2px solid #dfc0b4;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          transition: border-color 0.2s;
          background: #faf8ff;
        }

        .email-input:focus {
          outline: none;
          border-color: #8B5CF6;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 32px;
          background: #8B5CF6;
          color: white;
          border: none;
          border-radius: 14px;
          font-family: 'Lexend', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .form-note {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #8c7167;
          margin-top: 16px;
        }

        .success-title {
          color: #293e00;
        }

        .success-description {
          color: #131b2e;
        }

        .success-description strong {
          color: #8B5CF6;
        }

        .retry-btn {
          margin-top: 20px;
          padding: 12px 24px;
          background: transparent;
          border: 2px solid #dfc0b4;
          border-radius: 12px;
          font-family: 'Lexend', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #584239;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }

        .retry-btn:hover {
          border-color: #8B5CF6;
          color: #8B5CF6;
        }
      `}</style>
    </section>
  );
}