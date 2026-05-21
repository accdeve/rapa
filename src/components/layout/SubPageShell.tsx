"use client";
import React from 'react';

/**
 * SubPageShell - Wrapper untuk halaman sub (/create-room, /history, /voting-results)
 * Memberikan scrollable content area dengan padding konsisten, tanpa BottomNav.
 */
export default function SubPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'relative',
      zIndex: 1,
      flex: 1,
      minHeight: 0,          /* ← critical: allows flex child to shrink & scroll */
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '24px 20px 48px 20px',
      display: 'flex',
      flexDirection: 'column',
      WebkitOverflowScrolling: 'touch', /* smooth scroll on iOS */
    }}>
      {children}
    </div>
  );
}
