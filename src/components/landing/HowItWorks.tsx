'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Buat Ruang',
      description: 'Mulai rapat baru dan undang peserta dengan tautan unik. Tidak perlu registrasi.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" fill="#FF7A3D" fillOpacity="0.15" />
          <path d="M24 14v20M14 24h20" stroke="#FF7A3D" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Semua Submit Anonim',
      description: 'Peserta menginput ide mereka secara anonim. Tidak ada tekanan dari hirarki atau pendapat dominan.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" fill="#8B5CF6" fillOpacity="0.15" />
          <circle cx="24" cy="20" r="6" fill="#8B5CF6" />
          <path d="M12 38c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 28l6 6" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Vote & Keputusan',
      description: 'Semua orang vote untuk ide terbaik. AI membantu grouping dan menampilkan konsensus.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" fill="#BEF264" fillOpacity="0.3" />
          <path d="M16 24l6 6 12-12" stroke="#476800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <section className="how-it-works">
      <div className="container">
        <h2 className="section-title">Bagaimana Rapa Bekerja</h2>
        <p className="section-subtitle">
          Proses yang simpel untuk diskusi yang bermakna
        </p>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-icon">{step.icon}</div>
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="step-connector">
                  <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                    <path d="M0 12h30M30 12l-8-8M30 12l-8 8" stroke="#dfc0b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .how-it-works {
          padding: 80px 24px;
          background: #ffffff;
        }

        .container {
          max-width: 480px;
          margin: 0 auto;
        }

        .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #131b2e;
          text-align: center;
          margin-bottom: 8px;
        }

        .section-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: #584239;
          text-align: center;
          margin-bottom: 40px;
          opacity: 0.8;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .step-card {
          background: #f2f3ff;
          border-radius: 20px;
          padding: 24px;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }

        .step-icon {
          margin-bottom: 16px;
        }

        .step-number {
          font-family: 'Lexend', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #FF7A3D;
          margin-bottom: 8px;
        }

        .step-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #131b2e;
          margin-bottom: 8px;
        }

        .step-description {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #584239;
          opacity: 0.9;
        }

        .step-connector {
          position: absolute;
          bottom: -36px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1;
        }

        @media (min-width: 768px) {
          .steps-container {
            flex-direction: row;
            gap: 20px;
          }

          .step-card {
            flex: 1;
          }

          .step-connector {
            position: static;
            transform: none;
            display: flex;
            align-items: center;
          }
        }
      `}</style>
    </section>
  );
}