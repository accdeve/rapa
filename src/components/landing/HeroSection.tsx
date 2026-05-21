'use client';

import { useState } from 'react';

export default function HeroSection() {
  const [roomId, setRoomId] = useState('');

  return (
    <section className="hero-section">
      <div className="grid-background" />
      
      <div className="hero-decoration">
        <div className="blob blob-1">
          <svg viewBox="0 0 100 100" className="blobSvg">
            <path d="M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 50 10" fill="#8B5CF6" />
          </svg>
          <span className="blobFace">🙂</span>
        </div>
        <div className="blob blob-2">
          <svg viewBox="0 0 100 100" className="blobSvg">
            <path d="M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 50 10" fill="#FF7A3D" />
          </svg>
          <span className="blobFace">🤫</span>
        </div>
        <div className="blob blob-3">
          <svg viewBox="0 0 100 100" className="blobSvg">
            <path d="M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 50 10" fill="#BEF264" />
          </svg>
          <span className="blobFace">✨</span>
        </div>
      </div>

      <div className="hero-content">
        <h1 className="hero-headline">
          Suarakan Ide Tanpa Tekanan, Ambil Keputusan dengan Pasti
        </h1>
        <p className="hero-subheadline">
          Ruang diskusi anonim dimana semua orang bisa berkontribusi tanpa takut dihakimi. 
          Setiap suara terdengar, setiap ide dihargai.
        </p>

        <div className="hero-cta">
          <button className="btn btn-primary btn-large">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Mulai Rapat Baru
          </button>
        </div>

        <div className="hero-join">
          <div className="join-input-container">
            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <input 
              type="text" 
              className="input-field join-input" 
              placeholder="Masukkan Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary btn-large">
            Join Room
          </button>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          overflow: hidden;
          background: linear-gradient(180deg, #F8FAFC 0%, #f2f3ff 100%);
        }

        .hero-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .blob {
          position: absolute;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .blobSvg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 10px 30px rgba(0,0,0,0.15));
        }

        .blobFace {
          position: absolute;
          font-size: 32px;
        }

        .blob-1 {
          top: 15%;
          left: 10%;
          animation: float 4s ease-in-out infinite;
        }

        .blob-2 {
          top: 25%;
          right: 10%;
          animation: float 5s ease-in-out infinite 1s;
        }

        .blob-3 {
          bottom: 20%;
          left: 15%;
          animation: float 4.5s ease-in-out infinite 0.5s;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 480px;
        }

        .hero-headline {
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #131b2e;
          margin-bottom: 16px;
        }

        .hero-subheadline {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.6;
          color: #584239;
          margin-bottom: 32px;
          opacity: 0.9;
        }

        .hero-cta {
          margin-bottom: 20px;
        }

        .hero-join {
          display: flex;
          gap: 12px;
          flex-direction: column;
        }

        .join-input-container {
          position: relative;
          width: 100%;
        }

        .join-input {
          padding: 16px 16px 16px 44px;
          border-radius: 16px;
          border: 2px solid #dfc0b4;
          background-color: #ffffff;
          font-size: 16px;
          width: 100%;
        }

        .join-input:focus {
          outline: none;
          border-color: #FF7A3D;
        }

        .join-input-container .input-icon {
          left: 14px;
          color: #8c7167;
        }

        .btn-large {
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary {
          background-color: #FF7A3D;
          color: white;
          border: none;
          box-shadow: 0 4px 20px rgba(255, 122, 61, 0.4);
        }

        .btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(255, 122, 61, 0.5);
        }

        .btn-primary:active {
          transform: scale(1);
        }

        .btn-secondary {
          background-color: #8B5CF6;
          color: white;
          border: none;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
        }

        .btn-secondary:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(139, 92, 246, 0.4);
        }

        .btn-secondary:active {
          transform: scale(1);
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </section>
  );
}