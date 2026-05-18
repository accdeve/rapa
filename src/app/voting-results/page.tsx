"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch } from '../../lib/hooks';
import { setActiveTab } from '../../lib/features/ui/uiSlice';
import SubPageShell from '../../components/layout/SubPageShell';

export default function VotingResultsPage() {
  const dispatch = useAppDispatch();
  const [showShareModal, setShowShareModal] = useState(false);

  // Automatically illuminate the 'Vote' bottom tab on page mount to match screen.png
  useEffect(() => {
    dispatch(setActiveTab(2));
  }, [dispatch]);

  return (
    <SubPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
        .btn-export:hover {
          background-color: #7c3aed !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.25) !important;
        }
        .btn-export:active {
          transform: translateY(0);
        }
        .btn-back:hover {
          border-color: #8B5CF6 !important;
          color: #8B5CF6 !important;
          background-color: rgba(139, 92, 246, 0.02) !important;
        }
        .stat-card-zoom {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .stat-card-zoom:hover {
          transform: translateY(-2px);
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

      {/* RESULTS OVERVIEW SECTION */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#131b2e',
          fontFamily: 'Outfit, sans-serif',
          letterSpacing: '-0.5px',
          marginBottom: '16px'
        }}>
          Results Overview
        </h2>

        {/* Grid layout of 3 stats cards */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Card 1 (Large Left Card) */}
          <div 
            className="stat-card-zoom"
            style={{
              flex: 1.1,
              backgroundColor: '#eaedff',
              borderRadius: '28px',
              padding: '24px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Custom Orange ballot box icon SVG */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '10px' }}>
              <path d="M4 11H20L18 20H6L4 11Z" stroke="#FF7A3D" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
              <path d="M9 5H15L16 11H8L9 5Z" stroke="#FF7A3D" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
              <circle cx="12" cy="15" r="2.2" fill="#FF7A3D" />
            </svg>
            
            <div style={{ 
              fontSize: '38px', 
              fontWeight: '900', 
              color: '#131b2e', 
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1
            }}>
              156
            </div>
            
            <div style={{ 
              fontSize: '13px', 
              color: '#584239', 
              fontWeight: '700',
              fontFamily: 'Inter, sans-serif',
              marginTop: '4px'
            }}>
              Total Votes
            </div>
          </div>

          {/* Right Column containing 2 horizontal cards */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Card 2 (Top Right Mint-Green Card) */}
            <div 
              className="stat-card-zoom"
              style={{
                backgroundColor: '#edf5f1',
                borderRadius: '24px',
                padding: '16px',
                textAlign: 'center'
              }}
            >
              <div style={{ 
                fontSize: '25px', 
                fontWeight: '900', 
                color: '#476800', 
                fontFamily: 'Outfit, sans-serif',
                lineHeight: 1
              }}>
                78%
              </div>
              
              <div style={{ 
                fontSize: '12px', 
                color: '#584239', 
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                marginTop: '4px'
              }}>
                Contribute
              </div>
            </div>

            {/* Card 3 (Bottom Right Lavender Card) */}
            <div 
              className="stat-card-zoom"
              style={{
                backgroundColor: '#f3f0ff',
                borderRadius: '24px',
                padding: '16px',
                textAlign: 'center'
              }}
            >
              <div style={{ 
                fontSize: '25px', 
                fontWeight: '900', 
                color: '#8B5CF6', 
                fontFamily: 'Outfit, sans-serif',
                lineHeight: 1
              }}>
                45m
              </div>
              
              <div style={{ 
                fontSize: '12px', 
                color: '#584239', 
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                marginTop: '4px'
              }}>
                Time Saved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOP VOTED IDEAS SECTION */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#131b2e',
          fontFamily: 'Outfit, sans-serif',
          letterSpacing: '-0.5px',
          marginBottom: '16px'
        }}>
          Top Voted Ideas
        </h2>

        {/* The beautiful Top Voted Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1.5px solid rgba(223, 192, 180, 0.4)',
          borderRadius: '32px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header Row: Title & Thumbs-up Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#131b2e',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.3,
              margin: 0
            }}>
              Implement Flexible Four-Day Work Week
            </h3>
            
            {/* Green Badge thumbs-up */}
            <div style={{
              backgroundColor: '#f0f2ff',
              color: '#131b2e',
              fontSize: '12.5px',
              fontWeight: '800',
              padding: '6px 12px',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'Lexend, sans-serif',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '11px' }}>👍</span>
              <span>124</span>
            </div>
          </div>

          {/* Lime Green Progress Bar */}
          <div style={{
            height: '8px',
            backgroundColor: '#eaedff',
            borderRadius: '100px',
            margin: '18px 0 20px 0',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: '78%',
              backgroundColor: '#BEF264',
              borderRadius: '100px',
              transition: 'width 1s ease'
            }} />
          </div>

          {/* Speech Bubbles Container (Inner Card) */}
          <div style={{
            backgroundColor: '#f2f4ff',
            borderRadius: '24px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Quote 1: Purple avatar + text */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {/* Purple organic blob mock avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'white' }} />
              </div>
              
              <p style={{
                fontSize: '13.5px',
                color: '#584239',
                fontWeight: '500',
                lineHeight: 1.4,
                margin: 0,
                fontFamily: 'Inter, sans-serif'
              }}>
                "This would significantly reduce burnout and actually increase our overall velocity on sprints."
              </p>
            </div>

            {/* Quote 2: Orange avatar + text */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {/* Orange organic blob mock avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#FF7A3D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'white' }} />
              </div>
              
              <p style={{
                fontSize: '13.5px',
                color: '#584239',
                fontWeight: '500',
                lineHeight: 1.4,
                margin: 0,
                fontFamily: 'Inter, sans-serif'
              }}>
                "We piloted this in Q2 and saw a 15% drop in sick days."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ACTION CTAS */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {/* Export Insights purple pill button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="btn-export"
          style={{
            height: '48px',
            borderRadius: '100px',
            backgroundColor: '#8B5CF6',
            color: 'white',
            border: 'none',
            fontWeight: '800',
            fontSize: '14.5px',
            cursor: 'pointer',
            padding: '0 32px',
            fontFamily: 'Lexend, sans-serif',
            transition: 'all 0.25s',
            outline: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Export Insights
        </button>

        {/* Back to history link button */}
        <Link href="/" style={{ textDecoration: 'none', width: '100%' }}>
          <button 
            className="btn-back"
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '100px',
              backgroundColor: 'transparent',
              border: '1.5px solid rgba(223, 192, 180, 0.6)',
              color: '#131b2e',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'Lexend, sans-serif',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            ← Kembali ke Home
          </button>
        </Link>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(19, 27, 46, 0.4)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'center', 
          zIndex: 999 
        }} onClick={() => setShowShareModal(false)}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '28px 28px 0 0', 
            padding: '28px 24px 40px 24px', 
            width: '100%', 
            maxWidth: '480px',
            borderTop: '1px solid rgba(223, 192, 180, 0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: '800', fontSize: '20px', textAlign: 'center', flex: 1, fontFamily: 'Outfit, sans-serif', color: '#131b2e' }}>Pratinjau Kartu Berbagi</h3>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#584239' }}>✕</button>
            </div>
            
            {/* Beautiful sharing preview card */}
            <div style={{ 
              backgroundColor: '#f2f4ff', 
              borderRadius: '24px', 
              padding: '24px',
              marginBottom: '20px', 
              border: '1.5px solid rgba(223, 192, 180, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{ color: '#FF7A3D', fontWeight: '800', fontSize: '15px' }}>VoxSilent</span>
                <span style={{ color: '#584239', fontSize: '11px', fontWeight: '600' }}>ID: 284-901</span>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#131b2e', margin: '0 0 8px 0', fontFamily: 'Outfit, sans-serif' }}>Implement Flexible Four-Day Work Week</h4>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#8B5CF6', fontFamily: 'Outfit, sans-serif' }}>78% Konsensus</div>
              <div style={{ fontSize: '12px', color: '#584239', marginTop: '4px', fontWeight: '600' }}>Disuarakan secara aman & anonim.</div>
            </div>

            <button 
              className="btn-export"
              style={{ 
                width: '100%', 
                height: '48px', 
                borderRadius: '100px', 
                backgroundColor: '#8B5CF6', 
                color: 'white', 
                border: 'none', 
                fontWeight: '800', 
                fontSize: '14.5px',
                marginBottom: '12px',
                fontFamily: 'Lexend, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ⬇ &nbsp; Unduh Gambar
            </button>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Tautan hasil voting disalin!");
              }}
              style={{ 
                width: '100%', 
                height: '48px', 
                borderRadius: '100px', 
                backgroundColor: 'transparent', 
                border: '2px solid #8B5CF6', 
                color: '#8B5CF6',
                fontWeight: '800',
                fontSize: '14.5px',
                fontFamily: 'Lexend, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📋 &nbsp; Salin Tautan
            </button>
          </div>
        </div>
      )}
    </SubPageShell>
  );
}
