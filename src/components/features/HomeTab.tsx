"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/application/hooks';
import { setGMLoggedIn } from '@/application/store/slices/uiSlice';
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { SupabaseRoomRepository } from '@/infrastructure/repositories/SupabaseRoomRepository';
import { Room } from '@/domain/models/Room';

export default function HomeTab() {
  const [roomId, setRoomId] = useState('');
  const dispatch = useAppDispatch();
  const isGMLoggedIn = useAppSelector((state) => state.ui.isGMLoggedIn);

  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [activeRoomTitle, setActiveRoomTitle] = useState<string | null>(null);

  useEffect(() => {
    const code = localStorage.getItem('activeRoomCode');
    const title = localStorage.getItem('activeRoomTitle');
    if (code && title) {
      setActiveRoomCode(code);
      setActiveRoomTitle(title);
    }
  }, []);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [user, setUser] = useState<any>(null);
  const [roomHistory, setRoomHistory] = useState<Room[]>([]);
  const [participantHistory, setParticipantHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    // 1. Fetch current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        dispatch(setGMLoggedIn(true));
      }
    });

    // 2. Subscribe to auth change events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        dispatch(setGMLoggedIn(true));
      } else {
        setUser(null);
        const isManual = localStorage.getItem('isGMLoggedIn') === 'true';
        if (event === 'SIGNED_OUT') {
          dispatch(setGMLoggedIn(false));
          localStorage.removeItem('isGMLoggedIn');
        } else if (!isManual) {
          dispatch(setGMLoggedIn(false));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Fetch rooms history when logged in (Supabase user OR manual GM login)
  useEffect(() => {
    if (!isGMLoggedIn) {
      setRoomHistory([]);
      setParticipantHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        // --- GM History: merge Supabase DB + localStorage ---
        let dbRooms: Room[] = [];
        if (user) {
          try {
            const roomRepo = new SupabaseRoomRepository();
            dbRooms = await roomRepo.listByGm(user.id);
          } catch (error) {
            console.error('Error fetching room history from DB:', error);
          }
        }

        let localGM: Room[] = [];
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('recentRoomsGM');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) localGM = parsed;
            }
          } catch (_e) { /* ignore parse errors */ }
        }

        const mergedMap = new Map<string, Room>();
        dbRooms.forEach(r => mergedMap.set(r.id, r));
        localGM.forEach(r => { if (!mergedMap.has(r.id)) mergedMap.set(r.id, r); });
        const mergedRooms = Array.from(mergedMap.values()).sort((a, b) => {
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        });
        setRoomHistory(mergedRooms);

        // --- Participant History: localStorage only ---
        let participantRooms: any[] = [];
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('recentRoomsParticipant');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) participantRooms = parsed;
            }
          } catch (_e) { /* ignore */ }
        }
        setParticipantHistory(participantRooms);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user, isGMLoggedIn]);

  const handleGoogleLogin = async () => {
    dispatch(setGMLoggedIn(true));
    localStorage.setItem('isGMLoggedIn', 'true');
    setUser({
      id: 'dummy-gm-id',
      email: 'demo@rapa.app',
      user_metadata: { full_name: 'Game Master Demo' }
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(setGMLoggedIn(false));
      localStorage.removeItem('isGMLoggedIn');
      setUser(null);
      setRoomHistory([]);
    } catch (err: any) {
      console.error('Logout error:', err.message);
    }
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      window.location.href = `/room/${roomId}`;
    }
  };

  const handleCreateRoomClick = (e: React.MouseEvent) => {
    if (!isGMLoggedIn) {
      e.preventDefault();
      handleGoogleLogin();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      backgroundColor: '#FAF8FF',
      margin: '-24px -20px',
      padding: '24px 20px 48px 20px',
      color: '#131b2e',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtleFloat {
          0% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-6px) rotate(2deg) scale(1.02); }
          100% { transform: translateY(0px) rotate(0deg) scale(1); }
        }
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        .btn-orange:hover {
          background-color: #ff651a !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 122, 61, 0.25) !important;
        }
        .btn-orange:active {
          transform: translateY(0);
        }
        .btn-purple:hover {
          background-color: #7c3aed !important;
          transform: translateY(-1px);
        }
        .room-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .room-card:hover {
          transform: translateY(-3px);
          border-color: rgba(139, 92, 246, 0.4) !important;
          box-shadow: 0 8px 24px rgba(107, 56, 212, 0.04) !important;
        }
      `}} />

      {/* HEADER SECTION - Styled exactly matching screen.png */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Left: Logo + Rapa Text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="clayLogoGradHome" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFA87D" />
                <stop offset="50%" stopColor="#FF7A3D" />
                <stop offset="100%" stopColor="#DE4E10" />
              </radialGradient>
              <filter id="clayLogoShadowHome" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#DE4E10" floodOpacity="0.4" />
              </filter>
            </defs>
            <circle cx="7" cy="14" r="5.2" fill="url(#clayLogoGradHome)" filter="url(#clayLogoShadowHome)" />
            <circle cx="16" cy="9" r="5.2" fill="url(#clayLogoGradHome)" filter="url(#clayLogoShadowHome)" />
            <circle cx="15.5" cy="15.5" r="4.8" fill="url(#clayLogoGradHome)" filter="url(#clayLogoShadowHome)" />
          </svg>
          <span style={{ 
            color: '#FF7A3D', 
            fontWeight: '800', 
            fontSize: '20px', 
            letterSpacing: '-0.5px', 
            fontFamily: 'Outfit, sans-serif'
          }}>
            Rapa
          </span>
        </div>

        {/* Right: ID / GM Status & Quick Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isGMLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 122, 61, 0.08)',
                padding: '4px 12px',
                borderRadius: '100px',
                border: '1.5px solid rgba(255, 122, 61, 0.25)'
              }}>
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="GM Avatar"
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: '1.5px solid #FF7A3D'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '13px' }}>👑</span>
                )}
                <span style={{
                  color: '#FF7A3D',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  fontFamily: 'Lexend, sans-serif'
                }}>
                  {user?.user_metadata?.full_name || 'GM Active'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                style={{
                  backgroundColor: 'rgba(19, 27, 46, 0.05)',
                  color: '#584239',
                  border: '1px solid rgba(19, 27, 46, 0.1)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'Lexend, sans-serif',
                  transition: 'all 0.2s'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={handleGoogleLogin}
                style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  color: '#8B5CF6',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'Lexend, sans-serif',
                  transition: 'all 0.2s'
                }}
              >
                🔑 Portal GM (Demo)
              </button>
            </div>
          )}
          <span style={{
            color: '#FF7A3D',
            fontWeight: '800',
            fontSize: '17px',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.3px'
          }}>
            ID: 284-901
          </span>
        </div>
      </header>

      {/* ACTIVE ROOM RE-ENTRY BANNER */}
      {activeRoomCode && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1.5px solid rgba(139, 92, 246, 0.25)',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          animation: 'fadeInUp 0.5s ease-out',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle green pulsing light */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 12px #10B981'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            {/* Pulsing indicator */}
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 8px #10B981',
              animation: 'pulseScale 1.5s ease-in-out infinite'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                color: '#10B981',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: 'Lexend, sans-serif'
              }}>
                Rapat Aktif Terdeteksi
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#131b2e',
                fontFamily: 'Outfit, sans-serif',
                marginTop: '2px'
              }}>
                {activeRoomTitle} ({activeRoomCode})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', zIndex: 5 }}>
            <button
              onClick={() => {
                localStorage.removeItem('activeRoomCode');
                localStorage.removeItem('activeRoomTitle');
                setActiveRoomCode(null);
                setActiveRoomTitle(null);
              }}
              style={{
                backgroundColor: 'rgba(19, 27, 46, 0.05)',
                color: '#584239',
                border: 'none',
                borderRadius: '100px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '800',
                fontFamily: 'Lexend, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              Keluar
            </button>
            <button
              onClick={() => {
                window.location.href = `/room/${activeRoomCode}`;
              }}
              className="btn-purple"
              style={{
                backgroundColor: '#8B5CF6',
                color: 'white',
                border: 'none',
                borderRadius: '100px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '800',
                fontFamily: 'Lexend, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              Masuk Kembali
            </button>
          </div>
        </div>
      )}

      {/* HERO ILLUSTRATION CARD */}
      <div style={{
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: '56px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img
          src="/rapa_hero.png"
          alt="Rapa - Kolaborasi Anonim"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* HERO HEADLINE & SUBTITLE - Styled exactly matching screen.png */}
      <div style={{ textAlign: 'center', marginBottom: '28px', padding: '0 8px' }}>
        <h1 style={{
          fontSize: '25px',
          fontWeight: '800',
          lineHeight: '1.25',
          color: '#131b2e',
          letterSpacing: '-0.5px',
          marginBottom: '8px',
          fontFamily: 'Outfit, sans-serif'
        }}>
          Suarakan Ide Tanpa Tekanan, Ambil Keputusan dengan Pasti.
        </h1>
        <p style={{ 
          fontSize: '14px', 
          color: '#584239', 
          lineHeight: '1.45', 
          fontWeight: '500',
          fontFamily: 'Inter, sans-serif'
        }}>
          Ruang aman untuk kolaborasi anonim dan produktif.
        </p>
      </div>

      {/* INPUT FIELD & BUTTONS ROW - Styled exactly matching screen.png */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {/* Row 1: Lavender Pill Input & Purple Pill Join Button */}
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <input
            type="text"
            placeholder="Masukkan ID Ruang"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{
              flex: 1.2,
              height: '50px',
              borderRadius: '100px',
              backgroundColor: '#eaedff',
              border: 'none',
              padding: '0 24px',
              fontSize: '14.5px',
              fontWeight: '500',
              color: '#131b2e',
              outline: 'none',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          <button 
            onClick={handleJoinRoom}
            className="btn-purple"
            style={{
              flex: 0.6,
              height: '50px',
              borderRadius: '100px',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              fontWeight: '800',
              fontSize: '14.5px',
              cursor: 'pointer',
              fontFamily: 'Lexend, sans-serif',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            Join
          </button>
        </div>

        {/* Row 2: Full-width Solid Orange Pill Button */}
        <Link href="/create-room" style={{ textDecoration: 'none' }} onClick={handleCreateRoomClick}>
          <button 
            className="btn-orange"
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '100px',
              backgroundColor: '#FF7A3D',
              color: 'white',
              border: 'none',
              fontWeight: '800',
              fontSize: '14.5px',
              cursor: 'pointer',
              fontFamily: 'Lexend, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(255, 122, 61, 0.15)',
              outline: 'none'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: '800' }}>+</span>
            <span>Mulai Rapat Baru</span>
          </button>
        </Link>
      </div>

      {/* RIWAYAT RUANG (PAST ROOMS HISTORY) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Riwayat Ruang Title Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '800',
            color: '#131b2e',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '0.6px',
            textTransform: 'uppercase'
          }}>
            RIWAYAT RUANG
          </h3>
          <Link href="/history" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: '13.5px',
              fontWeight: '800',
              color: '#8B5CF6',
              fontFamily: 'Lexend, sans-serif',
              cursor: 'pointer'
            }}>
              Lihat Semua
            </span>
          </Link>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isLoadingHistory ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              backgroundColor: 'white',
              borderRadius: '28px',
              border: '1.5px solid rgba(223, 192, 180, 0.4)'
            }}>
              <div className="spinner" style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(139, 92, 246, 0.1)',
                borderTop: '3px solid #8B5CF6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '12px'
              }} />
              <span style={{ fontSize: '13px', color: '#584239', fontWeight: 'bold', fontFamily: 'Lexend, sans-serif' }}>Memuat Riwayat...</span>
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}} />
            </div>
          ) : !isGMLoggedIn ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 24px',
              backgroundColor: 'rgba(255, 122, 61, 0.03)',
              borderRadius: '28px',
              border: '1.5px dashed rgba(255, 122, 61, 0.35)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</span>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '800',
                color: '#131b2e',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: '6px'
              }}>Riwayat Terkunci</h4>
              <p style={{
                fontSize: '12.5px',
                color: '#584239',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.4,
                marginBottom: '16px',
                maxWidth: '280px'
              }}>Masuk sebagai Game Master untuk melacak rapat dan melihat hasil voting.</p>
              <button 
                onClick={handleGoogleLogin}
                className="btn-orange"
                style={{
                  backgroundColor: '#FF7A3D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'Lexend, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(255, 122, 61, 0.2)'
                }}
              >
                <span>Masuk GM (Demo)</span>
              </button>
            </div>
          ) : (roomHistory.length === 0 && participantHistory.length === 0) ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 20px',
              backgroundColor: 'white',
              borderRadius: '28px',
              border: '1.5px dashed rgba(19, 27, 46, 0.12)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '32px', marginBottom: '8px' }}>📂</span>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '800',
                color: '#131b2e',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: '6px'
              }}>Belum Ada Rapat</h4>
              <p style={{
                fontSize: '12.5px',
                color: '#584239',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.4,
                marginBottom: '14px',
                maxWidth: '260px'
              }}>Buat rapat baru atau ikuti rapat untuk melihat riwayat Anda di sini!</p>
              <Link href="/create-room" style={{ textDecoration: 'none' }}>
                <span style={{
                  color: '#8B5CF6',
                  fontSize: '13px',
                  fontWeight: '800',
                  fontFamily: 'Lexend, sans-serif',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Mulai Rapat</span>
                  <span>➔</span>
                </span>
              </Link>
            </div>
          ) : (
            <>
              {/* ===== SEBAGAI GAME MASTER ===== */}
              {roomHistory.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Section Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    backgroundColor: 'rgba(255, 122, 61, 0.06)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 122, 61, 0.15)'
                  }}>
                    <span style={{ fontSize: '16px' }}>👑</span>
                    <span style={{
                      fontSize: '12.5px',
                      fontWeight: '800',
                      color: '#FF7A3D',
                      fontFamily: 'Lexend, sans-serif',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase'
                    }}>
                      Sebagai Game Master
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#FF7A3D',
                      backgroundColor: 'rgba(255, 122, 61, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '100px',
                      fontFamily: 'Lexend, sans-serif'
                    }}>
                      {roomHistory.length}
                    </span>
                  </div>

                  {/* GM Room Cards */}
                  {roomHistory.map((room) => {
                    const isLive = room.status !== 'finished';
                    const sessionLabel = room.sessionType === 'direct_voting' ? 'Direct Voting' : 'Brainstorming';
                    return (
                      <div 
                        key={room.id}
                        className="room-card"
                        style={{
                          backgroundColor: 'white',
                          border: isLive ? '2px solid #FF7A3D' : '1.5px solid rgba(223, 192, 180, 0.5)',
                          borderRadius: '28px',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                          position: 'relative'
                        }}
                      >
                        {/* Card Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{
                              backgroundColor: isLive ? 'rgba(255, 122, 61, 0.1)' : '#f2fbe0',
                              color: isLive ? '#FF7A3D' : '#476800',
                              fontSize: '10px',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '100px',
                              fontFamily: 'Lexend, sans-serif',
                              letterSpacing: '0.5px'
                            }}>
                              {room.status === 'waiting' ? 'MENUNGGU' : room.status === 'active' ? 'AKTIF' : 'SELESAI'}
                            </span>
                            <span style={{
                              backgroundColor: room.sessionType === 'direct_voting' ? 'rgba(255,122,61,0.08)' : 'rgba(139,92,246,0.08)',
                              color: room.sessionType === 'direct_voting' ? '#FF7A3D' : '#8B5CF6',
                              fontSize: '10px',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '100px',
                              fontFamily: 'Lexend, sans-serif'
                            }}>
                              {sessionLabel}
                            </span>
                          </div>
                          
                          <Link href={`/room/${room.code}`} style={{ textDecoration: 'none' }}>
                            <span style={{
                              color: '#8B5CF6',
                              fontSize: '18px',
                              fontWeight: '900',
                              cursor: 'pointer'
                            }}>
                              ➔
                            </span>
                          </Link>
                        </div>

                        {/* Room Title */}
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: '800',
                          color: '#131b2e',
                          fontFamily: 'Outfit, sans-serif',
                          marginBottom: '8px',
                          letterSpacing: '-0.3px'
                        }}>
                          {room.title}
                        </h4>

                        {/* Room Info Row */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          fontSize: '12.5px', 
                          color: '#584239', 
                          fontWeight: '500', 
                          fontFamily: 'Inter, sans-serif',
                          marginBottom: '14px'
                        }}>
                          <span>📅 {new Date(room.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span style={{ opacity: 0.3 }}>|</span>
                          <span>👥 Kode: {room.code}</span>
                        </div>

                        {/* Divider line */}
                        <hr style={{ border: 'none', borderTop: '1px solid rgba(223, 192, 180, 0.25)', margin: '0 0 12px 0' }} />

                        {/* Bottom Link */}
                        <Link href={`/room/${room.code}`} style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                          <span style={{
                            color: '#8B5CF6',
                            fontSize: '13px',
                            fontWeight: '800',
                            fontFamily: 'Lexend, sans-serif',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>{isLive ? 'Masuk Ruangan' : 'Lihat Hasil'}</span>
                            <span style={{ fontSize: '11px' }}>↗</span>
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ===== SEBAGAI PESERTA ===== */}
              {participantHistory.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: roomHistory.length > 0 ? '8px' : '0' }}>
                  {/* Section Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    backgroundColor: 'rgba(139, 92, 246, 0.06)',
                    borderRadius: '14px',
                    border: '1px solid rgba(139, 92, 246, 0.15)'
                  }}>
                    <span style={{ fontSize: '16px' }}>🙋</span>
                    <span style={{
                      fontSize: '12.5px',
                      fontWeight: '800',
                      color: '#8B5CF6',
                      fontFamily: 'Lexend, sans-serif',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase'
                    }}>
                      Sebagai Peserta
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#8B5CF6',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '100px',
                      fontFamily: 'Lexend, sans-serif'
                    }}>
                      {participantHistory.length}
                    </span>
                  </div>

                  {/* Participant Room Cards */}
                  {participantHistory.map((room: any) => (
                    <div 
                      key={room.code}
                      className="room-card"
                      style={{
                        backgroundColor: 'white',
                        border: '1.5px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '24px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 16px rgba(107, 56, 212, 0.03)',
                        position: 'relative'
                      }}
                    >
                      {/* Header with connected badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '100px',
                          fontSize: '10px',
                          fontWeight: '800',
                          backgroundColor: 'rgba(16, 185, 129, 0.08)',
                          color: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontFamily: 'Lexend, sans-serif',
                          letterSpacing: '0.5px'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                          PESERTA
                        </span>
                        <span style={{
                          fontSize: '12.5px',
                          color: '#584239',
                          fontWeight: '600',
                          fontFamily: 'Inter, sans-serif'
                        }}>
                          Kode: <span style={{ fontWeight: '800', color: '#8B5CF6' }}>{room.code}</span>
                        </span>
                      </div>

                      {/* Room Title */}
                      <h4 style={{
                        fontSize: '17px',
                        fontWeight: '800',
                        color: '#131b2e',
                        fontFamily: 'Outfit, sans-serif',
                        marginBottom: '8px',
                        letterSpacing: '-0.3px'
                      }}>
                        {room.title}
                      </h4>

                      {/* Joined timestamp */}
                      <div style={{
                        fontSize: '12.5px',
                        color: '#584239',
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif',
                        marginBottom: '14px'
                      }}>
                        <span>⏱️ Masuk pada: {new Date(room.joinedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Divider */}
                      <hr style={{ border: 'none', borderTop: '1px solid rgba(223, 192, 180, 0.25)', margin: '0 0 12px 0' }} />

                      {/* Action Link */}
                      <Link href={`/room/${room.code}`} style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                        <span style={{
                          color: '#8B5CF6',
                          fontSize: '13px',
                          fontWeight: '800',
                          fontFamily: 'Lexend, sans-serif',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>Masuk Kembali</span>
                          <span style={{ fontSize: '11px' }}>↗</span>
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
