"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import SubPageShell from '../../components/layout/SubPageShell';

export default function HistoryPage() {
  const [view, setView] = useState<'gm' | 'peserta'>('gm');

  const rooms = [
    { id: 1, title: 'Q3 Strategy Review', date: '12 Okt 2023', participants: 24, status: 'selesai' as const, type: 'Direct Voting' as const },
    { id: 2, title: 'Product Ideation Sprint', date: 'Hari Ini, 14:00', participants: 8, status: 'berlangsung' as const, type: 'Brainstorming' as const },
    { id: 3, title: 'Weekly Standup Retrospective', date: '05 Okt 2023', participants: 12, status: 'selesai' as const, type: 'Brainstorming' as const },
  ];

  return (
    <SubPageShell>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--action-orange)', fontSize: '22px' }}>===</span>
          <span style={{ color: 'var(--action-orange)', fontWeight: '800', fontSize: '20px', letterSpacing: '-0.3px' }}>VoxSilent</span>
        </div>
        <span style={{ color: 'var(--outline)', fontWeight: '800', fontSize: '13px' }}>ID: #8821</span>
      </header>

      <h2 style={{ fontWeight: '900', fontSize: '28px', marginBottom: '6px', letterSpacing: '-0.5px' }}>Riwayat Ruangan</h2>
      <p className="text-body" style={{ marginBottom: '24px', fontSize: '14px', lineHeight: 1.45 }}>Kelola dan lihat aktivitas ruangan Anda.</p>

      {/* Toggle GM / Peserta */}
      <div style={{ display: 'flex', backgroundColor: 'rgba(107,56,212,0.08)', borderRadius: '100px', padding: '4px', marginBottom: '24px' }}>
        {(['gm', 'peserta'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: '10px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: '800', fontSize: '13.5px',
            backgroundColor: view === v ? 'white' : 'transparent',
            color: view === v ? 'var(--action-orange)' : 'var(--outline)',
            boxShadow: view === v ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s',
          }}>
            {v === 'gm' ? 'Sebagai GM' : 'Sebagai Peserta'}
          </button>
        ))}
      </div>

      {/* Room List */}
      {rooms.map(room => {
        const isLive = room.status === 'berlangsung';
        return (
          <div key={room.id} style={{
            backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px',
            border: isLive ? '2px solid var(--action-orange)' : '1px solid rgba(223,192,180,0.35)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            borderLeft: isLive ? '4px solid var(--action-orange)' : undefined,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '800',
                  backgroundColor: isLive ? 'rgba(255,200,150,0.3)' : 'rgba(180,255,180,0.3)',
                  color: isLive ? '#c05c00' : '#3a7a00',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isLive ? '#c05c00' : '#3a7a00', display: 'inline-block' }} />
                  {isLive ? 'Sedang Berlangsung' : 'Selesai'}
                </span>
                <span style={{
                  padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '800',
                  backgroundColor: room.type === 'Direct Voting' ? 'rgba(255,122,61,0.12)' : 'rgba(107,56,212,0.1)',
                  color: room.type === 'Direct Voting' ? 'var(--action-orange)' : 'var(--secondary)',
                }}>{room.type}</span>
              </div>
              <span style={{ color: 'var(--outline)', cursor: 'pointer', fontSize: '18px' }}>⋮</span>
            </div>

            <h3 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '8px', letterSpacing: '-0.3px' }}>{room.title}</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--outline)', marginBottom: '16px', fontWeight: '700' }}>
              <span>📅 {room.date}</span>
              <span>👥 {room.participants} Peserta</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(223,192,180,0.3)', marginBottom: '16px' }} />
            {isLive ? (
              <button className="btn btn-primary" style={{ width: '100%', borderRadius: '14px', height: '48px' }}>
                Masuk Ruangan →
              </button>
            ) : (
              <Link href="/voting-results" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary" style={{ width: '100%', borderRadius: '14px', height: '48px' }}>
                  Lihat Hasil →
                </button>
              </Link>
            )}
          </div>
        );
      })}
    </SubPageShell>
  );
}
