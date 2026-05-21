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

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [user, setUser] = useState<any>(null);
  const [roomHistory, setRoomHistory] = useState<Room[]>([]);
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

  // Fetch rooms history if user is logged in
  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        setIsLoadingHistory(true);
        try {
          const roomRepo = new SupabaseRoomRepository();
          const rooms = await roomRepo.listByGm(user.id);
          setRoomHistory(rooms);
        } catch (error) {
          console.error('Error fetching room history:', error);
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        setRoomHistory([]);
      }
    };

    fetchHistory();
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google login error:', err.message);
      setLoginError(err.message || 'Gagal login dengan Google');
    }
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
      setShowLoginModal(true);
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
        {/* Left: Logo (three interconnected orange dots) + VoxSilent Text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="14" r="5.2" fill="#FF7A3D" />
            <circle cx="16" cy="9" r="5.2" fill="#FF7A3D" />
            <circle cx="15.5" cy="15.5" r="4.8" fill="#FF7A3D" />
          </svg>
          <span style={{ 
            color: '#FF7A3D', 
            fontWeight: '800', 
            fontSize: '20px', 
            letterSpacing: '-0.5px', 
            fontFamily: 'Outfit, sans-serif'
          }}>
            VoxSilent
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
                className="btn-google-header"
                style={{
                  backgroundColor: 'white',
                  color: '#131b2e',
                  border: '1.5px solid rgba(19, 27, 46, 0.15)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'Lexend, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Masuk Google</span>
              </button>
              <button 
                onClick={() => setShowLoginModal(true)}
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
                🔑 Portal GM
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

      {/* HERO ILLUSTRATION CARD - Rounded square card with layered 3D clay blobs */}
      <div style={{
        width: '100%',
        aspectRatio: '1 / 1',
        backgroundColor: '#eff2e7',
        borderRadius: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '85%',
          height: '85%',
          animation: 'subtleFloat 6s ease-in-out infinite',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ambient gradients */}
            <defs>
              <radialGradient id="orangeBlob" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffb088" />
                <stop offset="100%" stopColor="#FF7A3D" />
              </radialGradient>
              <radialGradient id="purpleBlob" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d5c2ff" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </radialGradient>
              <radialGradient id="limeBlob" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e2fd98" />
                <stop offset="100%" stopColor="#BEF264" />
              </radialGradient>
              <radialGradient id="tealBlob" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="100%" stopColor="#06b6d4" />
              </radialGradient>
              <radialGradient id="yellowBlob" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#facc15" />
              </radialGradient>
              <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="2" dy="8" stdDeviation="6" floodColor="#1e1b4b" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Overlapping organic circular blobs styled like a 3D organic clay model */}
            <circle cx="150" cy="150" r="130" fill="url(#yellowBlob)" opacity="0.08" />
            
            {/* The 3D Cluster arrangement */}
            {/* Purple Base Blob */}
            <path d="M 120,170 C 80,170 60,210 100,240 C 140,270 200,250 210,210 C 220,170 160,170 120,170 Z" fill="url(#purpleBlob)" filter="url(#softShadow)" />
            
            {/* Lime Green Blob */}
            <path d="M 190,140 C 160,100 210,60 240,100 C 270,140 250,200 210,190 C 170,180 220,180 190,140 Z" fill="url(#limeBlob)" filter="url(#softShadow)" />
            
            {/* Orange Center Blob */}
            <path d="M 150,110 C 110,90 90,140 120,170 C 150,200 210,180 190,130 C 170,80 190,130 150,110 Z" fill="url(#orangeBlob)" filter="url(#softShadow)" />
            
            {/* Teal Accent Blob */}
            <circle cx="90" cy="130" r="28" fill="url(#tealBlob)" filter="url(#softShadow)" />
            
            {/* Yellow Tiny Blob */}
            <circle cx="160" cy="210" r="20" fill="url(#yellowBlob)" filter="url(#softShadow)" />
            
            {/* Connective structures (Smaller overlapping beads) */}
            <circle cx="120" cy="110" r="16" fill="url(#orangeBlob)" filter="url(#softShadow)" />
            <circle cx="190" cy="110" r="18" fill="url(#limeBlob)" filter="url(#softShadow)" />
            <circle cx="140" cy="180" r="24" fill="url(#purpleBlob)" filter="url(#softShadow)" />
            <circle cx="210" cy="150" r="15" fill="url(#tealBlob)" filter="url(#softShadow)" />
          </svg>
        </div>
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

      {/* RIWAYAT RUANG (PAST ROOMS HISTORY) - Styled exactly matching screen.png */}
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

        {/* List of completed past room cards */}
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
                className="btn-google-locked"
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" opacity="0.9"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="white" opacity="0.9"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" opacity="0.9"/>
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            </div>
          ) : roomHistory.length === 0 ? (
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
              }}>Buat rapat baru di atas untuk melihat riwayat pertama Anda di sini!</p>
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
            roomHistory.map((room) => {
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
            })
          )}
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(19, 27, 46, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '32px',
            padding: '32px 24px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 50px rgba(19, 27, 46, 0.25)',
            border: '1px solid rgba(223, 192, 180, 0.4)',
            position: 'relative',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowLoginModal(false);
                setLoginError('');
                setUsername('');
                setPassword('');
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(19, 27, 46, 0.05)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#131b2e',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              ×
            </button>

            {/* Icon & Title */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                fontSize: '24px'
              }}>
                🔑
              </div>
              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '800',
                fontSize: '20px',
                color: '#131b2e',
                marginBottom: '6px'
              }}>GM Portal Login</h3>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                color: '#584239',
                lineHeight: 1.4
              }}>Masuk sebagai Game Master untuk mengelola rapat dan sesi voting.</p>
            </div>

            {/* Google Sign In Button inside Modal */}
            <button
              onClick={handleGoogleLogin}
              className="btn-google-modal"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '100px',
                backgroundColor: 'white',
                color: '#131b2e',
                border: '1.5px solid rgba(19, 27, 46, 0.15)',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'Lexend, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                marginBottom: '16px',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Masuk dengan Google</span>
            </button>

            {/* OR separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(19, 27, 46, 0.08)' }} />
              <span style={{ fontSize: '11px', color: '#584239', fontWeight: 'bold', fontFamily: 'Lexend, sans-serif' }}>ATAU</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(19, 27, 46, 0.08)' }} />
            </div>

            {/* Test Credentials Alert Box */}
            <div style={{
              backgroundColor: 'rgba(255, 122, 61, 0.08)',
              border: '1px solid rgba(255, 122, 61, 0.25)',
              borderRadius: '16px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              color: '#FF7A3D',
              fontWeight: '600'
            }}>
              💡 <strong>Akun Demo / Testing:</strong><br />
              Username: <code style={{ backgroundColor: 'rgba(255,122,61,0.1)', padding: '2px 4px', borderRadius: '4px' }}>gm</code><br />
              Password: <code style={{ backgroundColor: 'rgba(255,122,61,0.1)', padding: '2px 4px', borderRadius: '4px' }}>password</code>
            </div>

            {/* Error Message */}
            {loginError && (
              <div style={{
                backgroundColor: 'rgba(186, 26, 26, 0.08)',
                border: '1px solid rgba(186, 26, 26, 0.2)',
                borderRadius: '16px',
                padding: '12px 14px',
                marginBottom: '16px',
                color: '#ba1a1a',
                fontSize: '12.5px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif'
              }}>
                ⚠️ {loginError}
              </div>
            )}

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: '800',
                  fontSize: '12.5px',
                  color: '#131b2e',
                  display: 'block',
                  marginBottom: '6px'
                }}>Username</label>
                <input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: '#eaedff',
                    border: 'none',
                    padding: '0 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#131b2e',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
              </div>

              <div>
                <label style={{
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: '800',
                  fontSize: '12.5px',
                  color: '#131b2e',
                  display: 'block',
                  marginBottom: '6px'
                }}>Password</label>
                <input
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: '#eaedff',
                    border: 'none',
                    padding: '0 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#131b2e',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => {
                if (username === 'gm' && password === 'password') {
                  dispatch(setGMLoggedIn(true));
                  setShowLoginModal(false);
                  setLoginError('');
                  // Redirect directly to create room page
                  window.location.href = '/create-room';
                } else {
                  setLoginError('Username atau password salah.');
                }
              }}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '100px',
                backgroundColor: '#8B5CF6',
                color: 'white',
                border: 'none',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'Lexend, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              Masuk & Mulai Rapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
