'use client';

import { useState, useMemo } from 'react';

export default function ROICalculator() {
  const [participants, setParticipants] = useState(20);
  const [duration, setDuration] = useState(2);

  const savings = useMemo(() => {
    const biayaRapat = participants * 250000 * duration;
    return biayaRapat * 0.5;
  }, [participants, duration]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <section className="roi-section">
      <div className="container">
        <div className="glass-card">
          <div className="card-header">
            <div className="icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="#BEF264" fillOpacity="0.3" />
                <path d="M10 16l4 4 8-8" stroke="#476800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="card-title">Kalkulator Penghematan</h2>
              <p className="card-subtitle">Hitung berapa banyak yang bisa Anda hemat</p>
            </div>
          </div>

          <div className="sliders">
            <div className="slider-group">
              <div className="slider-header">
                <label className="slider-label">Jumlah Peserta</label>
                <span className="slider-value">{participants} orang</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={participants}
                onChange={(e) => setParticipants(Number(e.target.value))}
                className="slider slider-lime"
              />
              <div className="slider-range">
                <span>1</span>
                <span>100</span>
              </div>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label className="slider-label">Durasi Rapat</label>
                <span className="slider-value">{duration} jam</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="slider slider-lime"
              />
              <div className="slider-range">
                <span>1 jam</span>
                <span>8 jam</span>
              </div>
            </div>
          </div>

          <div className="result-card">
            <div className="result-label">VoxSilent menghemat</div>
            <div className="result-value">
              <span className="currency">Rp</span>
              <span className="amount">{formatCurrency(savings)}</span>
            </div>
            <div className="result-note">
              Berdasarkan biaya rata-rata Rp 250.000 per orang per jam dengan penghematan 50%
            </div>
          </div>

          <div className="calculation-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Biaya rapat tradisional</span>
              <span className="breakdown-value">Rp {formatCurrency(participants * 250000 * duration)}</span>
            </div>
            <div className="breakdown-item highlight">
              <span className="breakdown-label">Dengan VoxSilent (-50%)</span>
              <span className="breakdown-value">Rp {formatCurrency(savings)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .roi-section {
          padding: 40px 24px 80px;
          background: linear-gradient(180deg, #f2f3ff 0%, #F8FAFC 100%);
        }

        .container {
          max-width: 480px;
          margin: 0 auto;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 28px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 28px;
        }

        .icon-wrapper {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: #BEF264;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #131b2e;
          margin-bottom: 4px;
        }

        .card-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #584239;
          opacity: 0.8;
        }

        .sliders {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 28px;
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slider-label {
          font-family: 'Lexend', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #131b2e;
        }

        .slider-value {
          font-family: 'Lexend', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #FF7A3D;
        }

        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #e2e7ff;
          outline: none;
          cursor: pointer;
        }

        .slider-lime::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #BEF264;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(190, 242, 100, 0.5);
          border: 3px solid white;
          transition: transform 0.2s;
        }

        .slider-lime::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .slider-lime::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #BEF264;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(190, 242, 100, 0.5);
          border: 3px solid white;
        }

        .slider-range {
          display: flex;
          justify-content: space-between;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #8c7167;
        }

        .result-card {
          background: linear-gradient(135deg, #BEF264 0%, #a4d64c 100%);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          margin-bottom: 20px;
        }

        .result-label {
          font-family: 'Lexend', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #293e00;
          margin-bottom: 8px;
        }

        .result-value {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 4px;
        }

        .currency {
          font-family: 'Lexend', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #293e00;
        }

        .amount {
          font-family: 'Outfit', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #293e00;
          letter-spacing: -0.02em;
        }

        .result-note {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #293e00;
          opacity: 0.8;
          margin-top: 8px;
        }

        .calculation-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f2f3ff;
          border-radius: 12px;
        }

        .breakdown-item.highlight {
          background: rgba(190, 242, 100, 0.3);
        }

        .breakdown-label {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #584239;
        }

        .breakdown-value {
          font-family: 'Lexend', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #131b2e;
        }

        .breakdown-item.highlight .breakdown-value {
          color: #476800;
        }
      `}</style>
    </section>
  );
}