"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/application/hooks';
import { setGMLoggedIn } from '@/application/store/slices/uiSlice';

interface VotingOption {
  id: string;
  text: string;
  votes: number;
  supports?: string[];
}

export default function VoteTab({ isActive }: { isActive?: boolean }) {
  const isGMLoggedIn = useAppSelector((state) => state.ui.isGMLoggedIn);
  const dispatch = useAppDispatch();
  const hasAutoScrolled = useRef(false);

  // Local state for interactive mockup voting page
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timer, setTimer] = useState(28);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Voting options mimicking /room/[code] vertical cards
  const [votingOptions, setVotingOptions] = useState<VotingOption[]>([
    {
      id: 'opt-a',
      text: 'Gagasan A: Penerapan sistem light mode baru',
      votes: 12,
      supports: ['Bagus sekali!', 'Setuju ide A', 'Sangat efisien']
    },
    {
      id: 'opt-b',
      text: 'Gagasan B: Desain whiteboard 2D interaktif',
      votes: 8,
      supports: ['Sangat interaktif!', 'Suka ide whiteboard']
    },
    {
      id: 'opt-c',
      text: 'Gagasan C: Optimasi integrasi Supabase Realtime',
      votes: 15,
      supports: ['Ini krusial untuk sinkronisasi data', 'Perlu performa cepat']
    }
  ]);

  // Keep current slide within bounds of voting options
  useEffect(() => {
    if (currentSlide >= votingOptions.length && votingOptions.length > 0) {
      setCurrentSlide(votingOptions.length - 1);
    }
  }, [votingOptions, currentSlide]);

  // Local timer loop to make page feel dynamic and "live"
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          return 30; // reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Smooth scroll down to trial area on start scrolling
  useEffect(() => {
    if (!isActive) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const scrollTop = target.scrollTop;

      if (scrollTop > 15 && !hasAutoScrolled.current) {
        hasAutoScrolled.current = true;
        target.scrollTo({
          top: target.scrollHeight,
          behavior: 'smooth'
        });
      } else if (scrollTop === 0) {
        hasAutoScrolled.current = false;
      }
    };

    const scrollParent = document.querySelector('.app-content');
    if (scrollParent) {
      scrollParent.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (scrollParent) {
        scrollParent.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isActive]);

  // Calculate results parameters
  const winningOption = [...votingOptions].sort((a, b) => b.votes - a.votes)[0];
  const totalVotes = votingOptions.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      color: '#131b2e',
      fontFamily: 'Inter, sans-serif',
      padding: '8px 4px 48px 4px',
      animation: 'fadeIn 0.5s ease-out',
      gap: '16px'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
          60% {
            transform: translateY(-4px);
          }
        }
        .swipe-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .swipe-card.selected {
          border: 3px solid #BEF264 !important;
          box-shadow: 0 8px 24px rgba(190, 242, 100, 0.25) !important;
        }
        .btn-purple {
          background-color: #8B5CF6;
          color: white;
          transition: all 0.2s;
        }
        .btn-purple:hover {
          background-color: #7c3aed;
          transform: translateY(-1px);
        }
      `}} />

      {/* Explanation Container */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '32px',
        padding: '32px 24px',
        border: '1px solid rgba(223, 192, 180, 0.4)',
        boxShadow: '0 16px 48px rgba(107, 56, 212, 0.05)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Neon Accent Blur */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 122, 61, 0.06)',
          filter: 'blur(20px)',
          pointerEvents: 'none'
        }} />

        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗳️</div>
        <h2 style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: '900',
          fontSize: '22px',
          color: '#131b2e',
          marginBottom: '8px',
          letterSpacing: '-0.5px'
        }}>Sistem Voting Anonim Pintar</h2>
        <p style={{
          fontSize: '13.5px',
          color: '#584239',
          lineHeight: 1.5,
          marginBottom: '24px'
        }}>
          Ambil keputusan strategis lebih cepat, objektif, dan adil. Sistem voting terenkripsi penuh VoxSilent memastikan pendapat setiap anggota didengar murni tanpa intervensi.
        </p>

        {/* Premium Bullet Points */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          textAlign: 'left',
          marginBottom: '28px',
          backgroundColor: '#faf8ff',
          borderRadius: '20px',
          padding: '20px',
          border: '1.5px solid rgba(139, 92, 246, 0.06)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '18px' }}>🔒</span>
            <div>
              <strong style={{ fontSize: '13px', color: '#131b2e', fontFamily: 'Lexend, sans-serif' }}>Pilihan Enkripsi Anonim</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#584239', lineHeight: 1.4 }}>Identitas Anda disembunyikan sepenuhnya di database, menjaga pilihan Anda bebas dari bias hierarki.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '18px' }}>📈</span>
            <div>
              <strong style={{ fontSize: '13px', color: '#131b2e', fontFamily: 'Lexend, sans-serif' }}>Visualisasi Hasil Live</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#584239', lineHeight: 1.4 }}>Lihat grafik perolehan suara secara transparan dan real-time setelah sesi diakhiri oleh moderator.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '18px' }}>🚀</span>
            <div>
              <strong style={{ fontSize: '13px', color: '#131b2e', fontFamily: 'Lexend, sans-serif' }}>Pengambilan Keputusan Demokratis</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#584239', lineHeight: 1.4 }}>Eliminasi dominasi opini mayoritas kelompok (HIPPO effect) untuk mencapai mufakat adil.</p>
            </div>
          </div>
        </div>

        {/* CTA Banner Card */}
        <div style={{
          backgroundColor: 'rgba(139, 92, 246, 0.05)',
          border: '1.5px solid rgba(139, 92, 246, 0.15)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '800',
            color: '#8B5CF6',
            fontFamily: 'Lexend, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>👑 Mulai Pengambilan Keputusan Adil</span>
          <p style={{ margin: 0, fontSize: '12px', color: '#584239', lineHeight: 1.4 }}>
            Mulai memimpin rapat Anda sendiri sebagai Game Master (GM) untuk meluncurkan ruang voting dinamis sejenis ini.
          </p>
          {!isGMLoggedIn && (
            <button
              onClick={() => dispatch(setGMLoggedIn(true))}
              className="btn-purple"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                fontWeight: '800',
                fontSize: '13.5px',
                fontFamily: 'Lexend, sans-serif',
                cursor: 'pointer',
                backgroundColor: '#8B5CF6',
                color: 'white',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              Aktifkan Portal Game Master
            </button>
          )}
        </div>

        {/* Scroll Down Indicator with Animation */}
        <div 
          onClick={() => {
            const scrollParent = document.querySelector('.app-content');
            if (scrollParent) {
              scrollParent.scrollTo({
                top: scrollParent.scrollHeight,
                behavior: 'smooth'
              });
            }
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '24px',
            cursor: 'pointer',
            opacity: 0.85,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
        >
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#8B5CF6',
            marginBottom: '6px',
            fontFamily: 'Lexend, sans-serif'
          }}>
            Scroll kebawah untuk uji coba
          </span>
          <div style={{
            width: '20px',
            height: '32px',
            borderRadius: '10px',
            border: '2px solid #8B5CF6',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            animation: 'bounce 2s infinite'
          }}>
            <div style={{
              width: '4px',
              height: '8px',
              borderRadius: '2px',
              backgroundColor: '#8B5CF6',
              position: 'absolute',
              top: '6px'
            }} />
          </div>
        </div>
      </div>

      {/* Header Row / Target for Scroll */}
      <div id="uji-coba-voting-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', marginTop: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="text-h1" style={{ marginBottom: '4px', letterSpacing: '-0.5px' }}>
              Uji Coba Voting Anonim
            </h2>
            <span style={{
              backgroundColor: '#8B5CF6',
              color: 'white',
              fontSize: '10px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '100px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Mode Uji Coba
            </span>
          </div>
          <p className="text-body" style={{ fontSize: '13px', lineHeight: 1.4, color: 'var(--outline)' }}>
            Pilih salah satu gagasan di bawah ini dan kirim suara Anda untuk melihat visualisasi hasil voting.
          </p>
        </div>
      </div>

      {/* Trial Voting Container */}
      <div style={{
        position: 'relative',
        height: 'calc(100vh - 160px)',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderRadius: '32px',
        border: '1.5px solid rgba(223, 192, 180, 0.5)',
        padding: '28px',
        boxShadow: '0 16px 48px rgba(107, 56, 212, 0.05)',
        overflow: 'hidden'
      }}>
        {hasVoted ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            {/* Header */}
            <div>
              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '900',
                fontSize: '20px',
                color: '#131b2e',
                marginBottom: '4px',
                letterSpacing: '-0.3px',
                textAlign: 'center'
              }}>
                📊 Hasil Voting Sementara
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#584239',
                textAlign: 'center',
                marginBottom: '20px',
                fontFamily: 'Lexend, sans-serif'
              }}>
                Topic: Optimasi Performa Infrastruktur Q4
              </p>
            </div>

            {/* Winner Card */}
            <div style={{
              background: 'linear-gradient(135deg, #BEF264 0%, #a4d64c 100%)',
              borderRadius: '20px',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(190, 242, 100, 0.15)',
              marginBottom: '20px'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                pointerEvents: 'none'
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  fontFamily: 'Lexend, sans-serif',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#293e00',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  🏆 Keputusan Terpopuler
                </span>
                <h4 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '16px',
                  fontWeight: '800',
                  color: '#131f00',
                  margin: '0 0 12px 0',
                  lineHeight: '1.4'
                }}>
                  {winningOption.text}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '24px',
                    fontWeight: '900',
                    color: '#131f00'
                  }}>
                    {totalVotes > 0 ? Math.round((winningOption.votes / totalVotes) * 100) : 0}%
                  </span>
                  <span style={{ fontSize: '13px', color: '#293e00' }}>
                    ({winningOption.votes} suara)
                  </span>
                </div>
              </div>
            </div>

            {/* All Options Progress */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              flex: 1,
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {votingOptions.map((option, index) => {
                const isSelected = option.id === selectedOption;
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                return (
                  <div key={option.id} style={{
                    backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.04)' : '#faf8ff',
                    border: isSelected ? '1.5px solid rgba(139, 92, 246, 0.25)' : '1.5px solid rgba(0,0,0,0.02)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px'
                    }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#131b2e',
                        fontFamily: 'Outfit, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? '#BEF264' : '#eaedff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '800',
                          color: isSelected ? '#293e00' : '#8B5CF6'
                        }}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                          {option.text.replace(/Gagasan [A-C]: /, '')}
                        </span>
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isSelected && (
                          <span style={{
                            backgroundColor: '#BEF264',
                            color: '#293e00',
                            fontSize: '9px',
                            fontWeight: '800',
                            padding: '2px 6px',
                            borderRadius: '100px',
                            textTransform: 'uppercase',
                            fontFamily: 'Lexend, sans-serif'
                          }}>
                            Pilihan Anda
                          </span>
                        )}
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '800',
                          color: '#131b2e',
                          fontFamily: 'Outfit, sans-serif'
                        }}>
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div style={{
                      height: '8px',
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: isSelected ? '#8B5CF6' : 'rgba(139, 92, 246, 0.4)',
                        borderRadius: '4px',
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Retry Action */}
            <button
              onClick={() => {
                // Decrement the voted choice to restore initial state
                if (selectedOption) {
                  setVotingOptions((prev) =>
                    prev.map((o) => (o.id === selectedOption ? { ...o, votes: Math.max(0, o.votes - 1) } : o))
                  );
                }
                setHasVoted(false);
              }}
              className="btn-purple"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                fontWeight: '800',
                fontSize: '14.5px',
                fontFamily: 'Lexend, sans-serif',
                cursor: 'pointer',
                backgroundColor: '#8B5CF6',
                color: 'white',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>🔄</span>
              <span>Ulangi Voting (Reset)</span>
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between'
          }}>
            {/* Timer Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#131b2e',
                fontFamily: 'Lexend, sans-serif'
              }}>
                Pilih voting kamu (Demo GM)
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: timer <= 10 ? 'rgba(186, 26, 26, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                padding: '8px 14px',
                borderRadius: '100px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={timer <= 10 ? '#ba1a1a' : '#8B5CF6'} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: timer <= 10 ? '#ba1a1a' : '#8B5CF6',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  {timer}s
                </span>
              </div>
            </div>

            {/* Question Reminder */}
            <div style={{
              backgroundColor: '#eaedff',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '20px'
            }}>
              <span style={{
                fontSize: '13px',
                color: '#584239',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '700'
              }}>
                Topic: Optimasi Performa Infrastruktur Q4
              </span>
            </div>

            {/* 3D Horizontal Carousel Card Deck */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '370px',
              margin: '10px 0 15px 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {/* Track / Deck */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '310px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {votingOptions.map((option, index) => {
                  const offset = index - currentSlide;
                  const isActive = offset === 0;
                  const isVisible = Math.abs(offset) <= 1;

                  if (!isVisible) return null;

                  return (
                    <div
                      key={option.id}
                      onClick={() => {
                        if (!isActive) {
                          setCurrentSlide(index);
                        } else if (!hasVoted) {
                          setSelectedOption(option.id);
                        }
                      }}
                      className={`swipe-card ${selectedOption === option.id ? 'selected' : ''}`}
                      style={{
                        position: 'absolute',
                        width: '270px',
                        height: '290px',
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '24px',
                        border: selectedOption === option.id ? '3px solid #BEF264' : '1.5px solid rgba(223, 192, 180, 0.4)',
                        boxShadow: selectedOption === option.id 
                          ? '0 12px 32px rgba(190, 242, 100, 0.3)' 
                          : isActive 
                            ? '0 10px 25px rgba(139, 92, 246, 0.08)' 
                            : '0 4px 12px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transform: `translateX(${offset * 105}%) scale(${isActive ? 1 : 0.88})`,
                        opacity: isActive ? 1 : 0.4,
                        zIndex: isActive ? 10 : 5 - Math.abs(offset),
                        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                        cursor: isActive ? 'default' : 'pointer',
                        pointerEvents: 'auto',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Card Header: Option Tag & Selection Icon */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          backgroundColor: selectedOption === option.id ? '#BEF264' : '#eaedff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '16px',
                          color: selectedOption === option.id ? '#293e00' : '#8B5CF6',
                          fontFamily: 'Outfit, sans-serif'
                        }}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        {selectedOption === option.id && (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#BEF264',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'scaleIn 0.2s ease-out'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#293e00" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Option Text */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#131b2e',
                          fontFamily: 'Outfit, sans-serif',
                          lineHeight: '1.4'
                        }}>
                          {option.text}
                        </span>

                        {/* Support comments inside card in speech bubble */}
                        {option.supports && option.supports.length > 0 && (
                          <div style={{
                            marginTop: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            padding: '10px 12px',
                            backgroundColor: '#f5f3ff',
                            borderRadius: '12px',
                            border: '1.5px solid rgba(139, 92, 246, 0.05)'
                          }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '800',
                              color: '#8B5CF6',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              💬 Pendukung ({option.supports.length}):
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '55px', overflowY: 'auto' }}>
                              {option.supports.map((sup, idx) => (
                                <span key={idx} style={{
                                  fontSize: '11.5px',
                                  fontStyle: 'italic',
                                  color: '#584239',
                                  fontFamily: 'Inter, sans-serif',
                                  lineHeight: '1.3'
                                }}>
                                  &quot;{sup}&quot;
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Floating Navigation Controls */}
                {votingOptions.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    <button
                      onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                      disabled={currentSlide === 0}
                      style={{
                        position: 'absolute',
                        left: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: '1.5px solid rgba(139, 92, 246, 0.15)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                        opacity: currentSlide === 0 ? 0.3 : 0.9,
                        zIndex: 20,
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>

                    {/* Right Arrow */}
                    <button
                      onClick={() => setCurrentSlide(prev => Math.min(votingOptions.length - 1, prev + 1))}
                      disabled={currentSlide === votingOptions.length - 1}
                      style={{
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: '1.5px solid rgba(139, 92, 246, 0.15)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentSlide === votingOptions.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: currentSlide === votingOptions.length - 1 ? 0.3 : 0.9,
                        zIndex: 20,
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Slide Indicator Dots */}
              {votingOptions.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '12px',
                  zIndex: 20
                }}>
                  {votingOptions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      style={{
                        width: index === currentSlide ? '18px' : '6px',
                        height: '6px',
                        borderRadius: '100px',
                        backgroundColor: index === currentSlide ? '#8B5CF6' : 'rgba(139, 92, 246, 0.2)',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        outline: 'none'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              disabled={!selectedOption}
              onClick={() => {
                if (selectedOption) {
                  setHasVoted(true);
                  // Simulate adding a vote locally
                  setVotingOptions((prev) =>
                    prev.map((o) => (o.id === selectedOption ? { ...o, votes: o.votes + 1 } : o))
                  );
                }
              }}
              className="btn-purple"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                fontWeight: '800',
                fontSize: '14.5px',
                fontFamily: 'Lexend, sans-serif',
                cursor: selectedOption ? 'pointer' : 'not-allowed',
                backgroundColor: selectedOption ? '#8B5CF6' : 'rgba(139, 92, 246, 0.4)',
                color: selectedOption ? 'white' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: selectedOption ? '0 6px 20px rgba(139, 92, 246, 0.2)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: selectedOption ? 1 : 0.6
              }}
            >
              <span>🗳️</span>
              <span>Kirim Suara Anda secara Anonim</span>
            </button>

            {/* Hint */}
            <div style={{
              textAlign: 'center',
              color: '#584239',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '15px'
            }}>
              <span>Geser kartu atau klik tombol panah ◀ ▶ untuk melihat gagasan lainnya</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
