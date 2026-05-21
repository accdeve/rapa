'use client';

export default function PricingPreview() {
  const plans = [
    {
      name: 'Free',
      users: '10 users',
      accent: '#FF7A3D',
      features: [
        'Up to 10 participants per room',
        'Basic anonymous voting',
        'Simple room creation',
        '24-hour room history',
      ],
    },
    {
      name: 'Professional',
      users: '50 users',
      accent: '#8B5CF6',
      features: [
        'Up to 50 participants per room',
        'AI-powered idea grouping',
        'Real-time collaboration',
        '7-day room history',
        'Priority support',
      ],
    },
    {
      name: 'Business',
      users: '100 users',
      accent: '#BEF264',
      features: [
        'Up to 100 participants per room',
        'Advanced analytics',
        'Custom branding',
        'Unlimited room history',
        'Dedicated account manager',
        'API integration',
      ],
    },
  ];

  return (
    <section className="pricing-section">
      <div className="container">
        <h2 className="section-title">Pilih Paket yang Tepat untuk Tim Anda</h2>
        <p className="section-subtitle">
          Mulai gratis, upgrade kapan saja
        </p>

        <div className="pricing-cards">
          {plans.map((plan, index) => (
            <div key={index} className="pricing-card" style={{ '--accent': plan.accent } as React.CSSProperties}>
              <div className="card-accent-bar" />
              <div className="card-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-users">{plan.users}</div>
              </div>
              <ul className="features-list">
                {plan.features.map((feature, i) => (
                  <li key={i} className="feature-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" fill={plan.accent} fillOpacity="0.15" />
                      <path d="M6 10l3 3 5-5" stroke={plan.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="waitlist-btn" style={{ backgroundColor: plan.accent }}>
                Join Waitlist
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .pricing-section {
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

        .pricing-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pricing-card {
          background: #f2f3ff;
          border-radius: 20px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        }

        .card-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--accent);
        }

        .card-header {
          margin-bottom: 20px;
        }

        .plan-name {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #131b2e;
          margin-bottom: 4px;
        }

        .plan-users {
          font-family: 'Lexend', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #584239;
          opacity: 0.8;
        }

        .features-list {
          list-style: none;
          margin-bottom: 24px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #131b2e;
        }

        .waitlist-btn {
          width: 100%;
          padding: 14px 24px;
          border-radius: 12px;
          border: none;
          font-family: 'Lexend', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .waitlist-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .waitlist-btn:active {
          transform: scale(1);
        }

        @media (min-width: 768px) {
          .pricing-cards {
            flex-direction: row;
            gap: 20px;
          }

          .pricing-card {
            flex: 1;
          }
        }
      `}</style>
    </section>
  );
}