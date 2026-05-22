'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch } from '@/application/hooks';
import { setActiveTab } from '@/application/store/slices/uiSlice';

interface VoteOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Decision {
  id: string;
  text: string;
  category: string;
}

interface Participant {
  id: string;
  avatarColor: string;
  contributionScore: number;
}

export default function VotingResultsPage() {
  const dispatch = useAppDispatch();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [animatedBars, setAnimatedBars] = useState(false);

  useEffect(() => {
    dispatch(setActiveTab(2));
    setTimeout(() => setAnimatedBars(true), 300);
  }, [dispatch]);

  const mockWinningOptions: VoteOption[] = [
    { id: '1', text: 'Remote-first hybrid model', votes: 847, percentage: 72 },
    { id: '2', text: 'Flexible office days (Tue-Thu)', votes: 623, percentage: 53 },
    { id: '3', text: 'Quarterly team offsites', votes: 512, percentage: 44 },
  ];

  const mockDecisions: Decision[] = [
    { id: 'd1', text: 'All-hands meeting moved to async format starting Q2', category: 'Communication' },
    { id: 'd2', text: 'New onboarding process approved with 2-week mentorship period', category: 'HR Policy' },
    { id: 'd3', text: 'Budget allocation: 60% remote tools, 40% in-person events', category: 'Budget' },
  ];

  const mockMVP: Participant = {
    id: 'mvp',
    avatarColor: '#8B5CF6',
    contributionScore: 94,
  };

  const totalParticipants = 1247;

  const handleCopy = async (decision: Decision) => {
    try {
      await navigator.clipboard.writeText(decision.text);
      setCopiedId(decision.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const handleShareWhatsApp = () => {
    const text = `🗳️ Rapa Meeting Results 🏆\n\n📊 Winning Decisions:\n${mockWinningOptions.map((opt, i) => `${i + 1}. ${opt.text} (${opt.percentage}%)`).join('\n')}\n\n👑 The Silent Hero MVP Score: ${mockMVP.contributionScore}\n\n/shared via Rapa`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyAll = async () => {
    const text = `🗳️ Rapa Meeting Results 🏆\n\n📊 Winning Decisions:\n${mockWinningOptions.map((opt, i) => `${i + 1}. ${opt.text} (${opt.percentage}%)`).join('\n')}\n\n📋 Key Decisions:\n${mockDecisions.map((d, i) => `${i + 1}. [${d.category}] ${d.text}`).join('\n')}\n\n👑 MVP Score: ${mockMVP.contributionScore}\n👥 Total Participants: ${totalParticipants}\n\n/shared via Rapa`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId('all');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#faf8ff',
        fontFamily: 'Inter, sans-serif',
        padding: '24px',
        paddingBottom: '100px',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .btn-export:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 16px rgba(37,211,102,0.4) !important;
        }
        .btn-export:active {
          transform: scale(1);
        }
        .btn-copy:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 16px rgba(139,92,246,0.4) !important;
        }
        .btn-copy:active {
          transform: scale(1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
        }
        .bar-animate {
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}} />

      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <Link
          href="/"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#eaedff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: '#131b2e',
            fontSize: '20px',
          }}
        >
          ←
        </Link>
        <div>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '24px',
              fontWeight: '600',
              color: '#131b2e',
              margin: 0,
            }}
          >
            Voting Results
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#584239',
              margin: 0,
              fontFamily: 'Lexend, sans-serif',
            }}
          >
            Meeting #2847 • Final Summary
          </p>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: '1fr',
        }}
      >
        {/* Winner Section - Full Width */}
        <div
          className="card-hover"
          style={{
            background: `linear-gradient(135deg, #BEF264 0%, #a4d64c 100%)`,
            borderRadius: '24px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s ease',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
            }}
          />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p
              style={{
                fontFamily: 'Lexend, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#293e00',
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Top Decision
            </p>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '28px',
                fontWeight: '700',
                color: '#131f00',
                margin: '0 0 16px 0',
                lineHeight: '1.3',
              }}
            >
              {mockWinningOptions[0].text}
            </h2>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  background: '#131f00',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '24px' }}>🏆</span>
                <span
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#BEF264',
                  }}
                >
                  {mockWinningOptions[0].percentage}%
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  color: '#293e00',
                }}
              >
                {mockWinningOptions[0].votes} votes
              </span>
            </div>

            {/* Vote Distribution Bars */}
            <div style={{ display: 'grid', gap: '12px' }}>
              {mockWinningOptions.map((option, index) => (
                <div key={option.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: '#293e00',
                        maxWidth: '70%',
                      }}
                    >
                      {option.text}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Lexend, sans-serif',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#293e00',
                      }}
                    >
                      {option.percentage}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: 'rgba(0,0,0,0.15)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      className="bar-animate"
                      style={{
                        height: '100%',
                        width: animatedBars ? `${option.percentage}%` : '0%',
                        background: index === 0 ? '#131f00' : 'rgba(0,0,0,0.4)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MVP Section - Full Width */}
        <div
          className="card-hover"
          style={{
            background: '#0F172A',
            borderRadius: '24px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s ease',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
            }}
          />
          
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <span
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '32px',
                }}
              >
                👑
              </span>
              
              {/* 3D Blob Avatar */}
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${mockMVP.avatarColor} 0%, #6366f1 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
                  position: 'relative',
                }}
              >
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                  <ellipse cx="25" cy="28" rx="18" ry="16" fill="rgba(255,255,255,0.9)" />
                  <circle cx="18" cy="25" r="3" fill="#131b2e" />
                  <circle cx="32" cy="25" r="3" fill="#131b2e" />
                  <path d="M18 35 Q25 40 32 35" stroke="#131b2e" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    background: '#BEF264',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#131f00',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  ✓
                </div>
              </div>
            </div>

            <h3
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                margin: '0 0 4px 0',
              }}
            >
              The Silent Hero
            </h3>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                margin: '0 0 16px 0',
              }}
            >
              Top contributor this session
            </p>

            <div
              style={{
                background: 'rgba(190,242,100,0.15)',
                borderRadius: '16px',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '36px',
                  fontWeight: '700',
                  color: '#BEF264',
                }}
              >
                {mockMVP.contributionScore}
              </span>
              <div style={{ textAlign: 'left' }}>
                <p
                  style={{
                    fontFamily: 'Lexend, sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)',
                    margin: 0,
                    textTransform: 'uppercase',
                  }}
                >
                  MVP Score
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  Anonymous • Purple Avatar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decision Summary Section */}
        <div
          className="card-hover"
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease',
          }}
        >
          <h3
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '20px',
              fontWeight: '600',
              color: '#131b2e',
              margin: '0 0 20px 0',
            }}
          >
            Decision Summary
          </h3>

          <div style={{ display: 'grid', gap: '12px' }}>
            {mockDecisions.map((decision) => (
              <div
                key={decision.id}
                style={{
                  background: '#f2f3ff',
                  borderRadius: '16px',
                  padding: '16px',
                  position: 'relative',
                  border: '1px solid #e2e7ff',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Lexend, sans-serif',
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#8B5CF6',
                    background: 'rgba(139,92,246,0.1)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {decision.category}
                </span>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    color: '#131b2e',
                    margin: '12px 0 12px 0',
                    lineHeight: '1.5',
                  }}
                >
                  {decision.text}
                </p>
                <button
                  onClick={() => handleCopy(decision)}
                  className="btn-copy"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: copiedId === decision.id ? '#BEF264' : '#ffffff',
                    border: '1px solid #e2e7ff',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: '500',
                    color: copiedId === decision.id ? '#293e00' : '#584239',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {copiedId === decision.id ? (
                    <>
                      <span style={{ fontSize: '14px' }}>✓</span>
                      Copied!
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '14px' }}>📋</span>
                      Copy
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options - Full Width */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h3
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '20px',
              fontWeight: '600',
              color: '#131b2e',
              margin: '0 0 20px 0',
            }}
          >
            Share Results
          </h3>

          <div style={{ display: 'grid', gap: '12px' }}>
            <button
              onClick={handleShareWhatsApp}
              className="btn-export"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                background: '#25D366',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 24px',
                fontSize: '16px',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: '600',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
              }}
            >
              <span style={{ fontSize: '24px' }}>📱</span>
              Share to WhatsApp
            </button>

            <button
              onClick={handleCopyAll}
              className="btn-copy"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                background: '#8B5CF6',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 24px',
                fontSize: '16px',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: '600',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
              }}
            >
              <span style={{ fontSize: '24px' }}>📋</span>
              {copiedId === 'all' ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>

        {/* Stats Footer */}
        <div
          style={{
            background: '#eaedff',
            borderRadius: '24px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '28px',
                fontWeight: '700',
                color: '#131b2e',
                margin: 0,
              }}
            >
              {totalParticipants.toLocaleString()}
            </p>
            <p
              style={{
                fontFamily: 'Lexend, sans-serif',
                fontSize: '12px',
                color: '#584239',
                margin: '4px 0 0 0',
                textTransform: 'uppercase',
              }}
            >
              Participants
            </p>
          </div>
          <div
            style={{
              width: '1px',
              background: '#d2d9f4',
            }}
          />
          <div>
            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '28px',
                fontWeight: '700',
                color: '#131b2e',
                margin: 0,
              }}
            >
              {mockWinningOptions.length + mockDecisions.length}
            </p>
            <p
              style={{
                fontFamily: 'Lexend, sans-serif',
                fontSize: '12px',
                color: '#584239',
                margin: '4px 0 0 0',
                textTransform: 'uppercase',
              }}
            >
              Decisions
            </p>
          </div>
          <div
            style={{
              width: '1px',
              background: '#d2d9f4',
            }}
          />
          <div>
            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '28px',
                fontWeight: '700',
                color: '#131b2e',
                margin: 0,
              }}
            >
              23
            </p>
            <p
              style={{
                fontFamily: 'Lexend, sans-serif',
                fontSize: '12px',
                color: '#584239',
                margin: '4px 0 0 0',
                textTransform: 'uppercase',
              }}
            >
              Min Duration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}