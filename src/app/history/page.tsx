"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SubPageShell from '../../components/layout/SubPageShell';
import { useAppSelector, useAppDispatch } from '@/application/hooks';
import { setGMLoggedIn } from '@/application/store/slices/uiSlice';
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { SupabaseRoomRepository } from '@/infrastructure/repositories/SupabaseRoomRepository';
import { Room } from '@/domain/models/Room';

export default function HistoryPage() {
  const [view, setView] = useState<'gm' | 'peserta'>('gm');
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
      if (user && view === 'gm') {
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
  }, [user, view]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/history' : '',
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

  return (
    <SubPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.25) !important;
        }
        .btn-purple:active {
          transform: translateY(0);
        }
        .room-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .room-card:hover {
          transform: translateY(-3px);
          border-color: rgba(139, 92, 246, 0.4) !important;
          box-shadow: 0 8px 24px rgba(107, 56, 212, 0.04) !important;
        }
        .marketing-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .marketing-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.03) !important;
        }
      `}} />

      {/* HEADER SECTION - Mirroring HomeTab exactly */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Left: Logo (three interconnected orange dots) + VoxSilent Text */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
        </Link>

        {/* Right: Auth Controls & Room ID */}
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
            fontSize: '15px',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.3px'
          }}>
            ID: #8821
          </span>
        </div>
      </header>

      {/* Main Title & Subtitle */}
      <h2 style={{ 
        fontWeight: '900', 
        fontSize: '28px', 
        marginBottom: '6px', 
        letterSpacing: '-0.5px',
        color: '#131b2e',
        fontFamily: 'Outfit, sans-serif'
      }}>
        Riwayat Ruangan
      </h2>
      <p style={{ 
        marginBottom: '24px', 
        fontSize: '14.5px', 
        lineHeight: 1.45,
        color: '#584239',
        fontFamily: 'Inter, sans-serif'
      }}>
        Pantau rapat kolaborasi Anda dan lihat kembali hasil keputusan yang telah disepakati.
      </p>

      {/* Toggle GM / Peserta */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: 'rgba(107, 56, 212, 0.06)', 
        borderRadius: '100px', 
        padding: '5px', 
        marginBottom: '24px',
        border: '1px solid rgba(107, 56, 212, 0.05)'
      }}>
        {(['gm', 'peserta'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, 
            padding: '11px', 
            borderRadius: '100px', 
            border: 'none', 
            cursor: 'pointer', 
            fontFamily: 'Lexend, sans-serif',
            fontWeight: '800', 
            fontSize: '13.5px',
            backgroundColor: view === v ? 'white' : 'transparent',
            color: view === v ? '#FF7A3D' : '#6b7280',
            boxShadow: view === v ? '0 3px 10px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.25s',
          }}>
            {v === 'gm' ? 'Sebagai Game Master' : 'Sebagai Peserta'}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      {view === 'gm' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoadingHistory ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '28px',
              border: '1.5px solid rgba(223, 192, 180, 0.35)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                border: '3px solid rgba(139, 92, 246, 0.1)',
                borderTop: '3px solid #8B5CF6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }} />
              <span style={{ fontSize: '14px', color: '#584239', fontWeight: 'bold', fontFamily: 'Lexend, sans-serif' }}>
                Mengambil riwayat dari database...
              </span>
            </div>
          ) : !isGMLoggedIn ? (
            /* Lock View when not authenticated */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              backgroundColor: 'rgba(255, 122, 61, 0.02)',
              borderRadius: '32px',
              border: '2px dashed rgba(255, 122, 61, 0.25)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</span>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#131b2e',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: '8px'
              }}>Riwayat Rapat Terkunci</h4>
              <p style={{
                fontSize: '13.5px',
                color: '#584239',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.45,
                marginBottom: '20px',
                maxWidth: '300px'
              }}>
                Halaman ini melacak ruangan rapat yang Anda buat. Silakan login sebagai Game Master (GM) untuk melacak kembali sesi Anda.
              </p>
              <button 
                onClick={handleGoogleLogin}
                style={{
                  backgroundColor: '#FF7A3D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '12px 24px',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'Lexend, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(255, 122, 61, 0.2)'
                }}
                className="btn-orange"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" opacity="0.9"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="white" opacity="0.9"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" opacity="0.9"/>
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            </div>
          ) : roomHistory.length === 0 ? (
            /* Empty state for authenticated user who hasn't created any rooms yet */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              backgroundColor: 'white',
              borderRadius: '32px',
              border: '1.5px dashed rgba(19, 27, 46, 0.12)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '44px', marginBottom: '12px' }}>📂</span>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#131b2e',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: '8px'
              }}>Belum Ada Rapat Terdaftar</h4>
              <p style={{
                fontSize: '13px',
                color: '#584239',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.45,
                marginBottom: '20px',
                maxWidth: '280px'
              }}>
                Anda terdaftar sebagai GM, namun Anda belum pernah membuat ruangan rapat baru.
              </p>
              <Link href="/create-room" style={{ textDecoration: 'none' }}>
                <button 
                  style={{
                    backgroundColor: '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '11px 24px',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontFamily: 'Lexend, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  className="btn-purple"
                >
                  <span>Mulai Rapat Pertama Anda</span>
                  <span>➔</span>
                </button>
              </Link>
            </div>
          ) : (
            /* List of actual Supabase rooms */
            roomHistory.map(room => {
              const isLive = room.status !== 'finished';
              const sessionLabel = room.sessionType === 'direct_voting' ? 'Direct Voting' : 'Brainstorming';
              return (
                <div key={room.id} className="room-card" style={{
                  backgroundColor: 'white', 
                  borderRadius: '24px', 
                  padding: '22px', 
                  marginBottom: '6px',
                  border: isLive ? '2.5px solid #FF7A3D' : '1px solid rgba(223,192,180,0.35)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800',
                        backgroundColor: isLive ? 'rgba(255,122,61,0.1)' : '#f2fbe0',
                        color: isLive ? '#FF7A3D' : '#476800',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        fontFamily: 'Lexend, sans-serif'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isLive ? '#FF7A3D' : '#476800', display: 'inline-block' }} />
                        {room.status === 'waiting' ? 'Menunggu' : room.status === 'active' ? 'Aktif' : 'Selesai'}
                      </span>
                      <span style={{
                        padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800',
                        backgroundColor: room.sessionType === 'direct_voting' ? 'rgba(255,122,61,0.08)' : 'rgba(107,56,212,0.08)',
                        color: room.sessionType === 'direct_voting' ? '#FF7A3D' : '#8B5CF6',
                        fontFamily: 'Lexend, sans-serif'
                      }}>{sessionLabel}</span>
                    </div>
                    <span style={{ color: 'var(--outline)', cursor: 'pointer', fontSize: '18px', fontWeight: '800' }}>⋮</span>
                  </div>

                  <h3 style={{ 
                    fontWeight: '800', 
                    fontSize: '20px', 
                    marginBottom: '8px', 
                    letterSpacing: '-0.3px',
                    color: '#131b2e',
                    fontFamily: 'Outfit, sans-serif'
                  }}>{room.title}</h3>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    fontSize: '13px', 
                    color: '#584239', 
                    marginBottom: '18px', 
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    <span>📅 {new Date(room.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>👥 Kode: {room.code}</span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(223,192,180,0.25)', marginBottom: '16px' }} />

                  {isLive ? (
                    <Link href={`/room/${room.code}`} style={{ textDecoration: 'none' }}>
                      <button className="btn btn-primary" style={{ width: '100%', borderRadius: '16px', height: '48px', fontWeight: '800', fontFamily: 'Lexend, sans-serif' }}>
                        Masuk Ruangan →
                      </button>
                    </Link>
                  ) : (
                    <Link href={`/room/${room.code}`} style={{ textDecoration: 'none' }}>
                      <button className="btn btn-secondary" style={{ width: '100%', borderRadius: '16px', height: '48px', fontWeight: '800', fontFamily: 'Lexend, sans-serif' }}>
                        Lihat Hasil Keputusan →
                      </button>
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ==================== MARKETING EXPLANATION FOR PARTICIPANTS ==================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '32px' }}>
          
          {/* Main Info Intro Card */}
          <div style={{
            backgroundColor: '#eaedff',
            borderRadius: '28px',
            padding: '24px',
            border: '1.5px solid rgba(139, 92, 246, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#131b2e',
              fontFamily: 'Outfit, sans-serif',
              marginBottom: '8px'
            }}>VoxSilent untuk Peserta: Suara Anda, Kekuatan Rapat.</h3>
            <p style={{
              fontSize: '13.5px',
              color: '#584239',
              lineHeight: 1.5,
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500'
            }}>
              Sebagai peserta (user), Anda tidak memerlukan akun untuk bergabung dalam diskusi. Semua ide, masukan, dan suara yang Anda berikan 100% anonim. Kami menjaga privasi Anda agar kontribusi Anda murni objektif.
            </p>
          </div>

          <h4 style={{
            fontSize: '15px',
            fontWeight: '800',
            color: '#131b2e',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginTop: '8px'
          }}>Cara Kerja VoxSilent dalam 3 Langkah:</h4>

          {/* Steps Carousel / Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Step 1 */}
            <div className="marketing-card" style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '16px 20px',
              border: '1px solid rgba(223, 192, 180, 0.4)',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                backgroundColor: 'rgba(255, 122, 61, 0.1)',
                color: '#FF7A3D',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '14px',
                flexShrink: 0
              }}>
                1
              </div>
              <div>
                <h5 style={{ fontWeight: '800', fontSize: '15px', color: '#131b2e', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>Masuk dengan Kode</h5>
                <p style={{ fontSize: '13px', color: '#584239', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>
                  Mintalah kode akses unik berisi 6-digit angka dari Game Master (pembuat rapat) Anda, ketik kode tersebut di halaman utama dan klik "Join".
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="marketing-card" style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '16px 20px',
              border: '1px solid rgba(223, 192, 180, 0.4)',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: '#8B5CF6',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '14px',
                flexShrink: 0
              }}>
                2
              </div>
              <div>
                <h5 style={{ fontWeight: '800', fontSize: '15px', color: '#131b2e', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>Brainstorming Ide di Kanvas</h5>
                <p style={{ fontSize: '13px', color: '#584239', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>
                  Tuliskan ide, catatan, atau pendapat Anda pada lembaran memo di kanvas kolaboratif secara real-time. Tanpa nama, murni kekuatan argumen!
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="marketing-card" style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '16px 20px',
              border: '1px solid rgba(223, 192, 180, 0.4)',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '14px',
                flexShrink: 0
              }}>
                3
              </div>
              <div>
                <h5 style={{ fontWeight: '800', fontSize: '15px', color: '#131b2e', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>Voting & Ambil Keputusan</h5>
                <p style={{ fontSize: '13px', color: '#584239', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>
                  Ikuti pemungutan suara (voting) untuk ide-ide terbaik. Hasil voting akan muncul secara realtime untuk melahirkan konsensus bersama.
                </p>
              </div>
            </div>

          </div>

          {/* Premium Call to Action to Become a GM */}
          <div style={{
            backgroundColor: '#fffcf7',
            borderRadius: '28px',
            padding: '24px',
            border: '2px solid rgba(255, 122, 61, 0.25)',
            textAlign: 'center',
            marginTop: '12px',
            boxShadow: '0 4px 16px rgba(255, 122, 61, 0.04)'
          }}>
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>👑</span>
            <h4 style={{
              fontSize: '17px',
              fontWeight: '800',
              color: '#131b2e',
              fontFamily: 'Outfit, sans-serif',
              marginBottom: '6px'
            }}>Ingin Memimpin Rapat Sendiri?</h4>
            <p style={{
              fontSize: '13px',
              color: '#584239',
              lineHeight: 1.45,
              fontFamily: 'Inter, sans-serif',
              marginBottom: '18px',
              maxWidth: '300px',
              marginRight: 'auto',
              marginLeft: 'auto'
            }}>
              Dapatkan kendali penuh untuk membuat ruangan, mengelola kanvas ide, dan memandu sesi voting dengan menjadi Game Master (GM). Gratis!
            </p>
            <button
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                backgroundColor: '#FF7A3D',
                color: 'white',
                border: 'none',
                borderRadius: '100px',
                height: '48px',
                fontWeight: '800',
                fontSize: '13.5px',
                cursor: 'pointer',
                fontFamily: 'Lexend, sans-serif',
                boxShadow: '0 4px 12px rgba(255, 122, 61, 0.15)',
                transition: 'all 0.2s'
              }}
              className="btn-orange"
            >
              Daftar Jadi Game Master dengan Google
            </button>
          </div>

        </div>
      )}

      {/* LOGIN MODAL - Mirrors HomeTab exactly */}
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

    </SubPageShell>
  );
}
