"use client";
import React, { useEffect, useState } from 'react';
import { Icons } from '../ui/Icons';
import { useAppDispatch, useAppSelector } from '@/application/hooks';
import { setShowSpotlight, nextSpotlightStep } from '@/application/store/slices/uiSlice';

export default function SpotlightOverlay() {
  const dispatch = useAppDispatch();
  const { showSpotlight, currentSpotlightStep, isGMLoggedIn } = useAppSelector((state) => state.ui);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const steps = [
    { id: "spotlight-join", title: "Gabung Ruangan", desc: "Ketik ID unik ruangan di sini untuk bergabung ke sesi rapat yang sudah berjalan.", icon: Icons.VpnKey, color: "var(--secondary)" },
    { id: "spotlight-new", title: "Mulai Sesi Baru", desc: "Sebagai Fasilitator (GM), buat ruang rapat anonim baru & atur sistem voting di sini.", icon: Icons.Add, color: "var(--action-orange)" },
    { id: "spotlight-history", title: "Riwayat Keputusan", desc: "Akses semua hasil rapat masa lalu, persentase voting, dan draf MoM AI Anda.", icon: Icons.History, color: "var(--tertiary)" },
    { id: "spotlight-nav", title: "Navigasi Menu", desc: "Coba langsung simulasi Papan 2D, Swipe Voting, dan kelola paket langganan Anda.", icon: Icons.MenuOpen, color: "var(--anon-purple)" }
  ];

  useEffect(() => {
    if (!isGMLoggedIn || !showSpotlight) return;

    const timeoutId = setTimeout(() => {
      const targetId = steps[currentSpotlightStep].id;
      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16
        });
      }
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [currentSpotlightStep, showSpotlight, isGMLoggedIn, steps]);

  if (!isGMLoggedIn || !showSpotlight || !targetRect) return null;

  const stepData = steps[currentSpotlightStep];
  const IconCmp = stepData.icon;
  const isBottomHalf = targetRect.top + targetRect.height / 2 > window.innerHeight / 2;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'auto', overflow: 'hidden' }}>
      <div 
        className="animate-pulse-scale"
        style={{
          position: 'absolute',
          top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height,
          border: `3px solid ${stepData.color}`,
          borderRadius: '16px',
          boxShadow: `0 0 0 9999px rgba(0,0,0,0.75), 0 0 20px ${stepData.color}`,
          pointerEvents: 'none',
          transition: 'all 0.3s ease-in-out'
        }}
      />
      <div style={{
        position: 'absolute',
        left: '20px', right: '20px',
        top: !isBottomHalf ? targetRect.top + targetRect.height + 20 : undefined,
        bottom: isBottomHalf ? window.innerHeight - targetRect.top + 20 : undefined,
        backgroundColor: 'var(--surface-container-lowest)',
        padding: '24px', borderRadius: '16px',
        border: `2px solid ${stepData.color}80`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease-in-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: stepData.color }}>
            <IconCmp />
            <h4 style={{ fontWeight: 'bold', fontSize: '16px' }}>{stepData.title}</h4>
          </div>
          <div onClick={() => dispatch(setShowSpotlight(false))} style={{ cursor: 'pointer', color: 'var(--outline)' }}>
            <Icons.Close />
          </div>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(88,66,57,0.8)', lineHeight: 1.4, marginBottom: '20px' }}>
          {stepData.desc}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--outline)' }}>
            Langkah {currentSpotlightStep + 1} dari 4
          </span>
          <button 
            onClick={() => dispatch(nextSpotlightStep())}
            style={{
              backgroundColor: stepData.color, color: 'white',
              border: 'none', padding: '10px 24px', borderRadius: '8px',
              fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            {currentSpotlightStep < 3 ? 'Lanjut' : 'Selesai'}
          </button>
        </div>
      </div>
    </div>
  );
}
