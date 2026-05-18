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
      overflowY: 'auto',
      padding: '24px 20px 40px 20px',
    }}>
      {children}
    </div>
  );
}
