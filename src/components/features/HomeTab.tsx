"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function HomeTab() {
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      window.location.href = `/room/${roomId}`;
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

        {/* Right: Static ID: 284-901 in Orange */}
        <div>
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
        <Link href="/create-room" style={{ textDecoration: 'none' }}>
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
          {/* Card 1: Q3 Strategy Review */}
          <div 
            className="room-card"
            style={{
              backgroundColor: 'white',
              border: '1.5px solid rgba(223, 192, 180, 0.5)',
              borderRadius: '28px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}
          >
            {/* Card Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{
                backgroundColor: '#f2fbe0',
                color: '#476800',
                fontSize: '10px',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '100px',
                fontFamily: 'Lexend, sans-serif',
                letterSpacing: '0.5px'
              }}>
                SELESAI
              </span>
              
              <Link href="/voting-results" style={{ textDecoration: 'none' }}>
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
              Q3 Strategy Review
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
              <span>📅 12 Okt 2023</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>👥 12 Peserta</span>
            </div>

            {/* Divider line */}
            <hr style={{ border: 'none', borderTop: '1px solid rgba(223, 192, 180, 0.25)', margin: '0 0 12px 0' }} />

            {/* Bottom Link */}
            <Link href="/voting-results" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
              <span style={{
                color: '#8B5CF6',
                fontSize: '13px',
                fontWeight: '800',
                fontFamily: 'Lexend, sans-serif',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>Lihat Hasil</span>
                <span style={{ fontSize: '11px' }}>↗</span>
              </span>
            </Link>
          </div>

          {/* Card 2: Product Sync */}
          <div 
            className="room-card"
            style={{
              backgroundColor: 'white',
              border: '1.5px solid rgba(223, 192, 180, 0.5)',
              borderRadius: '28px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}
          >
            {/* Card Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{
                backgroundColor: '#f2fbe0',
                color: '#476800',
                fontSize: '10px',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '100px',
                fontFamily: 'Lexend, sans-serif',
                letterSpacing: '0.5px'
              }}>
                SELESAI
              </span>
              
              <Link href="/voting-results" style={{ textDecoration: 'none' }}>
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
              Product Sync
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
              <span>📅 10 Okt 2023</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>👥 8 Peserta</span>
            </div>

            {/* Divider line */}
            <hr style={{ border: 'none', borderTop: '1px solid rgba(223, 192, 180, 0.25)', margin: '0 0 12px 0' }} />

            {/* Bottom Link */}
            <Link href="/voting-results" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
              <span style={{
                color: '#8B5CF6',
                fontSize: '13px',
                fontWeight: '800',
                fontFamily: 'Lexend, sans-serif',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>Lihat Hasil</span>
                <span style={{ fontSize: '11px' }}>↗</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
