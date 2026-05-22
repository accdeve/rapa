"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SubPageShell from '../../components/layout/SubPageShell';
import { SupabaseRoomRepository } from '@/infrastructure/repositories/SupabaseRoomRepository';
import { LocalHistoryRepository } from '@/infrastructure/repositories/LocalHistoryRepository';
import { generateRoomCode } from '@/utils/codeGenerator';
import { supabase } from '@/infrastructure/supabase/supabaseClient';

type SessionType = 'brainstorming' | 'direct_voting';

interface Question {
  id: string;
  text: string;
  options: string[];
  timer: number;
  timerEnabled: boolean;
}

const ShareIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

export default function CreateRoomPage() {
  const router = useRouter();
  const [sessionType, setSessionType] = useState<SessionType>('brainstorming');
  const [roomName, setRoomName] = useState('');
  const [votingTopic, setVotingTopic] = useState('');
  const [participants, setParticipants] = useState(50);
  const [duration, setDuration] = useState(45);
  const [isCreated, setIsCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q1',
      text: 'What should be our main priority for Q4?',
      options: ['Focus on User Retention', 'Expand to New Markets'],
      timer: 15,
      timerEnabled: true
    }
  ]);

  const roomLink = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomCode}` : `https://rapa.app/room/${roomCode}`;

  const handleCopy = () => {
    const textToCopy = `Undangan Rapat Anonim di Rapa 🚀\n\nRapat Pembahasan: ${roomName.trim() || 'Rapat Curah Pendapat'}\nBatas Anggota: Sebanyak ${participants} peserta\nDurasi Sesi: ${duration} menit\n\nGabung di sini:\n${roomLink}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const textToShare = `Undangan Rapat Anonim di Rapa 🚀\n\nRapat Pembahasan: ${roomName.trim() || 'Rapat Curah Pendapat'}\nBatas Anggota: Sebanyak ${participants} peserta\nDurasi Sesi: ${duration} menit\n\nGabung di sini:\n${roomLink}`;
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Undangan Rapat Rapa',
          text: textToShare,
          url: roomLink
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(textToShare);
      alert('Tautan undangan disalin ke papan klip!');
    }
  };

  const handleAddNewQuestion = () => {
    const newId = 'q' + Date.now();
    setQuestions(prev => [
      ...prev,
      {
        id: newId,
        text: '',
        options: ['', ''],
        timer: 15,
        timerEnabled: true
      }
    ]);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const handleUpdateQuestionText = (qId: string, text: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, text } : q));
  };

  const handleAddOption = (qId: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: [...q.options, ''] } : q));
  };

  const handleUpdateOptionText = (qId: string, optIdx: number, val: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const nextOpts = [...q.options];
        nextOpts[optIdx] = val;
        return { ...q, options: nextOpts };
      }
      return q;
    }));
  };

  const handleDeleteOption = (qId: string, optIdx: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.filter((_, idx) => idx !== optIdx)
        };
      }
      return q;
    }));
  };

  const handleUpdateQuestionTimer = (qId: string, timer: number) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, timer } : q));
  };

  const handleToggleQuestionTimer = (qId: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, timerEnabled: !q.timerEnabled } : q));
  };

  if (isCreated) {
    return (
      <SubPageShell>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setIsCreated(false)} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--on-surface)', 
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <h1 style={{ 
              fontFamily: 'var(--font-outfit)', 
              fontWeight: '800', 
              fontSize: '20px',
              letterSpacing: '-0.3px'
            }}>Ruang Siap!</h1>
          </div>
          <button style={{ 
            background: 'rgba(139, 92, 246, 0.1)', 
            padding: '10px', 
            borderRadius: '50%', 
            border: 'none', 
            color: 'var(--anon-purple)', 
            cursor: 'pointer', 
            display: 'flex' 
          }}>
            <ShareIcon />
          </button>
        </header>

        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ 
            backgroundColor: 'var(--surface-container-lowest)', 
            borderRadius: '24px', 
            padding: '32px 24px', 
            width: '100%', 
            textAlign: 'center', 
            border: '1px solid var(--outline-variant)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            marginBottom: '20px'
          }}>
            <p style={{ 
              fontFamily: 'var(--font-lexend)',
              fontSize: '11px', 
              fontWeight: '800', 
              letterSpacing: '2px', 
              color: 'var(--outline)', 
              marginBottom: '12px',
              textTransform: 'uppercase'
            }}>Kode Ruang Anonim</p>
            
            <div style={{ 
              fontFamily: 'var(--font-outfit)', 
              fontSize: '48px', 
              fontWeight: '900', 
              color: 'var(--action-orange)', 
              letterSpacing: '6px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              {roomCode.split('-').map((part, i) => (
                <React.Fragment key={i}>
                  <span>{part}</span>
                  {i === 0 && <span style={{ color: 'var(--outline)', fontWeight: '400' }}>-</span>}
                </React.Fragment>
              ))}
            </div>

            <div style={{ 
              width: '180px', 
              height: '180px', 
              margin: '0 auto 24px auto', 
              backgroundColor: 'white', 
              borderRadius: '24px', 
              border: '1px solid rgba(0, 0, 0, 0.08)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              padding: '12px',
              boxSizing: 'border-box'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=1C1C1E&data=${encodeURIComponent(roomLink)}`} 
                alt="QR Code Rapat" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain'
                }} 
              />
            </div>

            <h4 style={{ 
              fontFamily: 'var(--font-lexend)',
              fontWeight: '800', 
              fontSize: '17px', 
              marginBottom: '8px', 
              letterSpacing: '-0.3px',
              color: 'var(--on-surface)'
            }}>
              {roomName || (sessionType === 'direct_voting' ? 'Anonymous Direct Vote' : 'Sesi Brainstorm Baru')}
            </h4>
            
            <span style={{
              padding: '6px 16px', 
              borderRadius: '100px', 
              fontSize: '12px', 
              fontWeight: '800',
              fontFamily: 'var(--font-lexend)',
              backgroundColor: sessionType === 'direct_voting' ? 'rgba(255,122,61,0.12)' : 'rgba(139, 92, 246, 0.1)',
              color: sessionType === 'direct_voting' ? 'var(--action-orange)' : 'var(--anon-purple)',
            }}>
              {sessionType === 'direct_voting' ? '🗳 Direct Voting' : '💡 Brainstorming'}
            </span>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid var(--outline-variant)'
            }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ 
                  fontFamily: 'var(--font-outfit)',
                  fontSize: '20px', 
                  fontWeight: '800', 
                  color: 'var(--on-surface)' 
                }}>{participants}</div>
                <div style={{ 
                  fontFamily: 'var(--font-lexend)',
                  fontSize: '11px', 
                  color: 'var(--outline)',
                  fontWeight: '600'
                }}>Peserta</div>
              </div>
              <div style={{ 
                flex: 1, 
                textAlign: 'center',
                borderLeft: '1px solid var(--outline-variant)',
                borderRight: '1px solid var(--outline-variant)'
              }}>
                <div style={{ 
                  fontFamily: 'var(--font-outfit)',
                  fontSize: '20px', 
                  fontWeight: '800', 
                  color: 'var(--on-surface)' 
                }}>{duration}m</div>
                <div style={{ 
                  fontFamily: 'var(--font-lexend)',
                  fontSize: '11px', 
                  color: 'var(--outline)',
                  fontWeight: '600'
                }}>Durasi</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ 
                  fontFamily: 'var(--font-outfit)',
                  fontSize: '20px', 
                  fontWeight: '800', 
                  color: 'var(--on-surface)' 
                }}>{sessionType === 'direct_voting' ? questions.length : '—'}</div>
                <div style={{ 
                  fontFamily: 'var(--font-lexend)',
                  fontSize: '11px', 
                  color: 'var(--outline)',
                  fontWeight: '600'
                }}>Pertanyaan</div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCopy} 
            className="btn btn-secondary" 
            style={{ 
              width: '100%', 
              height: '56px', 
              borderRadius: '16px', 
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <CopyIcon />
            {copied ? '✓ Tautan Disalin!' : 'Salin Tautan Undangan'}
          </button>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginTop: '12px',
            width: '100%'
          }}>
            <button 
              onClick={handleShare}
              style={{
                flex: 1,
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--anon-purple)',
                border: 'none',
                color: 'white',
                fontFamily: 'var(--font-lexend)',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShareIcon />
              Share
            </button>
            <button 
              onClick={async () => {
                try {
                  const roomRepo = new SupabaseRoomRepository();
                  const foundRoom = await roomRepo.findByCode(roomCode);
                  if (foundRoom) {
                    await roomRepo.update(foundRoom.id, { status: 'active' });
                  }
                } catch (err) {
                  console.error("Gagal memulai sesi dari CreateRoom:", err);
                }
                router.push(`/room/${roomCode}`);
              }}
              style={{
                flex: 1,
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--success-lime)',
                border: 'none',
                color: '#3f5d00',
                fontFamily: 'var(--font-lexend)',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🚀 Start Session
            </button>
          </div>
        </div>
      </SubPageShell>
    );
  }

  return (
    <SubPageShell>
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '24px' 
      }}>
        <Link href="/" style={{ 
          color: 'var(--on-surface)', 
          textDecoration: 'none',
          padding: '8px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </Link>
        <h1 style={{ 
          fontFamily: 'var(--font-outfit)', 
          fontWeight: '800', 
          fontSize: '28px', 
          letterSpacing: '-0.5px',
          color: 'var(--on-surface)'
        }}>
          {sessionType === 'direct_voting' ? 'Create Vote' : 'Create Session'}
        </h1>
      </header>

      <p style={{ 
        fontFamily: 'var(--font-inter)', 
        marginBottom: '24px', 
        fontSize: '15px', 
        lineHeight: 1.5,
        color: 'var(--on-surface-variant)'
      }}>
        {sessionType === 'direct_voting' 
          ? 'Set up your anonymous voting session.' 
          : 'Configure your room settings and choose a playbook to get started.'}
      </p>

      {/* Session Type Selection */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => setSessionType('brainstorming')} 
          style={{
            flex: 1, 
            padding: '20px 16px', 
            borderRadius: '24px', 
            cursor: 'pointer',
            backgroundColor: sessionType === 'brainstorming' ? 'rgba(139, 92, 246, 0.08)' : 'var(--surface-container-lowest)',
            border: `2px solid ${sessionType === 'brainstorming' ? 'var(--anon-purple)' : 'var(--outline-variant)'}`,
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>💡</div>
          <h4 style={{ 
            fontFamily: 'var(--font-lexend)', 
            fontWeight: '800', 
            fontSize: '14px', 
            marginBottom: '4px',
            color: 'var(--on-surface)'
          }}>Brainstorming</h4>
          <p style={{ 
            fontFamily: 'var(--font-inter)',
            fontSize: '12px', 
            color: 'var(--outline)', 
            lineHeight: 1.4 
          }}>Collaborative ideation phase followed by voting.</p>
        </button>

        <button 
          onClick={() => setSessionType('direct_voting')} 
          style={{
            flex: 1, 
            padding: '20px 16px', 
            borderRadius: '24px', 
            cursor: 'pointer',
            backgroundColor: sessionType === 'direct_voting' ? 'rgba(255,122,61,0.08)' : 'var(--surface-container-lowest)',
            border: `2px solid ${sessionType === 'direct_voting' ? 'var(--action-orange)' : 'var(--outline-variant)'}`,
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>🗳</div>
          <h4 style={{ 
            fontFamily: 'var(--font-lexend)', 
            fontWeight: '800', 
            fontSize: '14px', 
            marginBottom: '4px',
            color: 'var(--on-surface)'
          }}>Direct Voting</h4>
          <p style={{ 
            fontFamily: 'var(--font-inter)',
            fontSize: '12px', 
            color: 'var(--outline)', 
            lineHeight: 1.4 
          }}>Skip directly to decision making (swipe voting).</p>
        </button>
      </div>

      {/* Room Name */}
      <label style={{ 
        fontFamily: 'var(--font-lexend)', 
        fontWeight: '800', 
        fontSize: '14px', 
        marginBottom: '8px', 
        display: 'block', 
        color: 'var(--on-surface)' 
      }}>Room Name</label>
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>✏️</span>
        <input 
          type="text" 
          className="input-field" 
          placeholder="e.g., Q3 Strategy Brainstorm" 
          style={{ 
            paddingLeft: '44px', 
            height: '52px', 
            borderRadius: '16px',
            fontFamily: 'var(--font-inter)'
          }} 
          value={roomName} 
          onChange={e => setRoomName(e.target.value)} 
        />
      </div>

      {/* Brainstorming Mode */}
      {sessionType === 'brainstorming' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--outline)' }}>≡</span>
            <label style={{ 
              fontFamily: 'var(--font-lexend)', 
              fontWeight: '800', 
              fontSize: '14px', 
              color: 'var(--on-surface)' 
            }}>Voting Topic</label>
          </div>
          <textarea 
            className="input-field" 
            placeholder="Describe the specific goal or topic participants will vote on..." 
            style={{ 
              paddingLeft: '16px', 
              paddingTop: '14px', 
              height: '90px', 
              resize: 'none', 
              borderRadius: '16px', 
              marginBottom: '20px',
              fontFamily: 'var(--font-inter)'
            }} 
            value={votingTopic} 
            onChange={e => setVotingTopic(e.target.value)} 
          />

          {/* Sliders Card */}
          <div style={{ 
            backgroundColor: 'var(--surface-container-lowest)', 
            borderRadius: '24px', 
            padding: '24px', 
            border: '1px solid var(--outline-variant)', 
            marginBottom: '24px'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ 
                  fontFamily: 'var(--font-lexend)', 
                  fontWeight: '800', 
                  fontSize: '14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: 'var(--on-surface)' 
                }}>
                  <span style={{ fontSize: '16px' }}>👥</span> 
                  Participant Limit
                </span>
                <span style={{ 
                  fontFamily: 'var(--font-outfit)', 
                  fontWeight: '900', 
                  fontSize: '18px', 
                  color: 'var(--action-orange)' 
                }}>{participants}</span>
              </div>
              <input 
                type="range" 
                min={2} 
                max={100} 
                value={participants} 
                onChange={e => setParticipants(+e.target.value)} 
                style={{ 
                  width: '100%', 
                  accentColor: 'var(--action-orange)',
                  height: '8px',
                  cursor: 'pointer'
                }} 
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '12px', 
                color: 'var(--outline)', 
                marginTop: '8px',
                fontFamily: 'var(--font-lexend)',
                fontWeight: '600'
              }}>
                <span>2</span>
                <span>100</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', marginBottom: '24px' }} />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ 
                  fontFamily: 'var(--font-lexend)', 
                  fontWeight: '800', 
                  fontSize: '14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: 'var(--on-surface)' 
                }}>
                  <span style={{ fontSize: '16px' }}>⏱</span> 
                  Session Duration
                </span>
                <span style={{ 
                  fontFamily: 'var(--font-outfit)', 
                  fontWeight: '900', 
                  fontSize: '18px', 
                  color: 'var(--action-orange)' 
                }}>{duration}m</span>
              </div>
              <input 
                type="range" 
                min={15} 
                max={120} 
                value={duration} 
                onChange={e => setDuration(+e.target.value)} 
                style={{ 
                  width: '100%', 
                  accentColor: 'var(--action-orange)',
                  height: '8px',
                  cursor: 'pointer'
                }} 
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '12px', 
                color: 'var(--outline)', 
                marginTop: '8px',
                fontFamily: 'var(--font-lexend)',
                fontWeight: '600'
              }}>
                <span>15m</span>
                <span>120m</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Direct Voting Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {questions.map((q, idx) => (
              <div key={q.id} style={{
                backgroundColor: 'var(--surface-container-lowest)', 
                borderRadius: '24px', 
                padding: '24px',
                border: '1px solid var(--outline-variant)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px', 
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      backgroundColor: 'var(--action-orange)',
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontFamily: 'var(--font-outfit)',
                      fontWeight: '800', 
                      fontSize: '13px'
                    }}>{idx + 1}</span>
                    <span style={{ 
                      fontFamily: 'var(--font-lexend)', 
                      fontWeight: '800', 
                      fontSize: '15px', 
                      color: 'var(--on-surface)' 
                    }}>Question {idx + 1}</span>
                  </div>
                  {questions.length > 1 && (
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      style={{ 
                        background: 'rgba(255, 77, 77, 0.08)', 
                        border: 'none', 
                        color: '#ff4d4d', 
                        cursor: 'pointer', 
                        fontSize: '16px',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Hapus pertanyaan"
                    >
                      🗑
                    </button>
                  )}
                </div>

                <textarea
                  value={q.text}
                  onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                  placeholder="What should be our main priority for Q4?"
                  style={{
                    width: '100%', 
                    height: '80px', 
                    borderRadius: '16px', 
                    border: 'none',
                    backgroundColor: 'rgba(139, 92, 246, 0.05)', 
                    color: 'var(--on-surface)',
                    padding: '16px', 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    outline: 'none',
                    resize: 'none', 
                    fontFamily: 'var(--font-inter)', 
                    lineHeight: 1.5
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} style={{
                      display: 'flex', 
                      alignItems: 'center',
                      backgroundColor: 'rgba(139, 92, 246, 0.04)', 
                      borderRadius: '16px',
                      border: '1px solid rgba(139, 92, 246, 0.08)'
                    }}>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateOptionText(q.id, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        style={{
                          flex: 1, 
                          border: 'none', 
                          background: 'transparent', 
                          outline: 'none',
                          padding: '14px 16px', 
                          fontSize: '14px', 
                          fontWeight: '700',
                          color: 'var(--on-surface)', 
                          fontFamily: 'var(--font-inter)'
                        }}
                      />
                      <button
                        onClick={() => handleDeleteOption(q.id, optIdx)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--outline)', 
                          fontSize: '20px', 
                          paddingRight: '14px', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center' 
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddOption(q.id)}
                    style={{
                      height: '44px', 
                      width: '100%', 
                      borderRadius: '100px',
                      border: '1.5px dashed rgba(255,122,61,0.4)', 
                      backgroundColor: 'transparent',
                      color: 'var(--action-orange)', 
                      fontFamily: 'var(--font-lexend)',
                      fontWeight: '800', 
                      fontSize: '13px',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px',
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                      marginTop: '4px'
                    }}
                  >
                    + Add Option
                  </button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ 
                      fontFamily: 'var(--font-lexend)', 
                      fontWeight: '800', 
                      fontSize: '14px', 
                      color: 'var(--on-surface)', 
                      marginBottom: '2px' 
                    }}>Question Timer</h5>
                    <span style={{ 
                      fontFamily: 'var(--font-inter)',
                      fontSize: '12px', 
                      color: 'var(--outline)', 
                      fontWeight: '600' 
                    }}>Auto-close question</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {q.timerEnabled && (
                      <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        backgroundColor: 'rgba(139, 92, 246, 0.08)', 
                        borderRadius: '100px',
                        padding: '8px 14px'
                      }}>
                        <span style={{ fontSize: '14px' }}>🕒</span>
                        <input
                          type="number"
                          value={q.timer}
                          onChange={(e) => handleUpdateQuestionTimer(q.id, Math.max(1, +e.target.value))}
                          style={{
                            width: '32px', 
                            border: 'none', 
                            background: 'transparent', 
                            outline: 'none',
                            textAlign: 'center', 
                            fontFamily: 'var(--font-outfit)',
                            fontWeight: '800', 
                            fontSize: '14px', 
                            color: 'var(--on-surface)'
                          }}
                        />
                        <span style={{ 
                          fontSize: '11px', 
                          color: 'var(--outline)', 
                          fontFamily: 'var(--font-lexend)',
                          fontWeight: '700' 
                        }}>min</span>
                      </div>
                    )}

                    <div 
                      onClick={() => handleToggleQuestionTimer(q.id)} 
                      style={{ 
                        width: '48px', 
                        height: '28px', 
                        borderRadius: '100px', 
                        backgroundColor: q.timerEnabled ? 'var(--action-orange)' : 'rgba(0,0,0,0.1)', 
                        position: 'relative', 
                        cursor: 'pointer', 
                        transition: 'background-color 0.25s ease',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '3px'
                      }}
                    >
                      <div style={{ 
                        width: '22px', 
                        height: '22px', 
                        borderRadius: '50%', 
                        backgroundColor: 'white', 
                        position: 'absolute', 
                        left: q.timerEnabled ? '23px' : '3px', 
                        transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: 'var(--action-orange)',
                        fontFamily: 'var(--font-lexend)',
                        fontWeight: '900'
                      }}>
                        {q.timerEnabled ? '✓' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Question Button */}
          <button
            onClick={handleAddNewQuestion}
            style={{
              width: '100%', 
              height: '52px', 
              borderRadius: '16px',
              border: '1.5px dashed var(--action-orange)', 
              backgroundColor: 'transparent',
              color: 'var(--action-orange)', 
              fontFamily: 'var(--font-lexend)',
              fontWeight: '800', 
              fontSize: '14px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              cursor: 'pointer', 
              transition: 'all 0.2s',
              marginBottom: '24px'
            }}
          >
            <span>📋</span>
            <span>Add New Question</span>
          </button>

          {/* Direct Voting Session Settings Card */}
          <div style={{
            backgroundColor: 'var(--surface-container-lowest)', 
            borderRadius: '24px', 
            padding: '24px',
            border: '1px solid var(--outline-variant)', 
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '18px' }}>⚙️</span>
              <h4 style={{ 
                fontFamily: 'var(--font-lexend)', 
                fontWeight: '800', 
                fontSize: '15px', 
                color: 'var(--on-surface)', 
                letterSpacing: '-0.3px' 
              }}>Session Settings</h4>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ 
                  fontFamily: 'var(--font-lexend)', 
                  fontWeight: '800', 
                  fontSize: '14px', 
                  color: 'var(--on-surface)' 
                }}>Participant Limit</span>
                <span style={{
                  backgroundColor: 'var(--success-lime)', 
                  color: '#3f5d00', 
                  padding: '4px 12px',
                  borderRadius: '8px', 
                  fontSize: '12px', 
                  fontFamily: 'var(--font-lexend)',
                  fontWeight: '800'
                }}>{participants}</span>
              </div>
              <input 
                type="range" 
                min={2} 
                max={100} 
                value={participants} 
                onChange={e => setParticipants(+e.target.value)} 
                style={{ 
                  width: '100%', 
                  accentColor: 'var(--action-orange)',
                  height: '8px',
                  cursor: 'pointer'
                }} 
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '12px', 
                color: 'var(--outline)',
                fontFamily: 'var(--font-lexend)',
                fontWeight: '600',
                marginTop: '8px'
              }}>
                <span>2</span>
                <span>100</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', marginBottom: '24px' }} />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ 
                  fontFamily: 'var(--font-lexend)', 
                  fontWeight: '800', 
                  fontSize: '14px', 
                  color: 'var(--on-surface)' 
                }}>Session Duration</span>
                <span style={{
                  backgroundColor: 'var(--anon-purple)', 
                  color: 'white', 
                  padding: '4px 12px',
                  borderRadius: '8px', 
                  fontSize: '12px', 
                  fontFamily: 'var(--font-lexend)',
                  fontWeight: '800'
                }}>{duration}m</span>
              </div>
              <input 
                type="range" 
                min={15} 
                max={120} 
                value={duration} 
                onChange={e => setDuration(+e.target.value)} 
                style={{ 
                  width: '100%', 
                  accentColor: 'var(--anon-purple)',
                  height: '8px',
                  cursor: 'pointer'
                }} 
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '12px', 
                color: 'var(--outline)',
                fontFamily: 'var(--font-lexend)',
                fontWeight: '600',
                marginTop: '8px'
              }}>
                <span>15m</span>
                <span>120m</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(186,26,26,0.08)',
          border: '1px solid rgba(186,26,26,0.2)',
          borderRadius: '16px',
          padding: '14px 16px',
          marginBottom: '16px',
          color: '#ba1a1a',
          fontFamily: 'var(--font-inter)',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Bottom Main Action Button */}
      <button 
        onClick={async () => {
          setIsLoading(true);
          setErrorMsg('');
          try {
            const code = generateRoomCode();
            const { data: { user } } = await supabase.auth.getUser();
            const gmId = user ? user.id : '';

            const roomRepo = new SupabaseRoomRepository();
            const createdRoom = await roomRepo.create({
              code,
              title: roomName.trim() || (sessionType === 'direct_voting' ? 'Anonymous Direct Vote' : 'Sesi Brainstorm Baru'),
              gmId,
              sessionType,
              maxParticipants: participants,
            });

            // Push created room to GM localStorage history for offline/demo persistence
            const localHistRepo = new LocalHistoryRepository();
            localHistRepo.saveOrUpdateGMRoom(createdRoom);

            if (sessionType === 'direct_voting') {
              for (const q of questions) {
                for (let i = 0; i < q.options.length; i++) {
                  const opt = q.options[i];
                  if (opt.trim()) {
                    const label = `Pilihan ${String.fromCharCode(65 + i)}`;
                    await supabase.from('questions').insert({
                      room_id: createdRoom.id,
                      content: opt.trim(),
                      group_name: `${label}|||opt_${i}`,
                      status: 'active'
                    });
                  }
                }
              }
            }

            setRoomCode(code);
            setIsCreated(true);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Gagal membuat room. Coba lagi.';
            setErrorMsg(msg);
          } finally {
            setIsLoading(false);
          }
        }} 
        disabled={isLoading}
        className="btn btn-primary" 
        style={{ 
          width: '100%', 
          height: '56px', 
          borderRadius: '100px', 
          fontSize: '16px', 
          fontWeight: '800',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '10px',
          opacity: isLoading ? 0.7 : 1,
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }}>⏳</span>
            <span>Membuat Room...</span>
          </>
        ) : sessionType === 'direct_voting' ? (
          <>
            <span>🚀</span>
            <span>Launch Voting Room</span>
          </>
        ) : (
          <>
            <span>▶</span>
            <span>Launch Room</span>
          </>
        )}
      </button>
    </SubPageShell>
  );
}