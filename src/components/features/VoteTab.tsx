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

export default function VoteTab() {
  const isGMLoggedIn = useAppSelector((state) => state.ui.isGMLoggedIn);
  const dispatch = useAppDispatch();

  // Local state for interactive mockup voting page
  const [selectedOption, setSelectedOption] = useState<string | null>('opt-c');
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
    if (!isGMLoggedIn) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          return 30; // reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGMLoggedIn]);

  // NON-GM VIEW: Sleek Premium Copywriting & Call-To-Action (CTA)
  if (!isGMLoggedIn) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        color: '#131b2e',
        fontFamily: 'Inter, sans-serif',
        padding: '8px 4px 48px 4px',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '32px',
          padding: '32px 24px',
          border: '1px solid rgba(223, 192, 180, 0.4)',
          boxShadow: '0 16px 48px rgba(107, 56, 212, 0.05)',
          textAlign: 'center',
          marginBottom: '24px',
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
          </div>
        </div>
      </div>
    );
  }

  // GM VIEW: Stunning, dynamic horizontal voting carousel matching room/page.tsx exactly
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      color: '#131b2e',
      fontFamily: 'Inter, sans-serif',
      padding: '8px 4px 48px 4px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
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

      {/* Submit / Status Button */}
      <button
        onClick={() => {
          if (selectedOption) {
            setHasVoted(true);
            // Simulate adding a vote locally
            setVotingOptions((prev) =>
              prev.map((o) => (o.id === selectedOption ? { ...o, votes: o.votes + 1 } : o))
            );
          }
        }}
        disabled={hasVoted || !selectedOption}
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
        {hasVoted ? (
          <>
            <span>✓</span>
            <span>Pilihan Anda Terkirim (Menunggu GM)</span>
          </>
        ) : (
          <>
            <span>🗳️</span>
            <span>Kirim Suara Anda secara Anonim</span>
          </>
        )}
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
  );
}
