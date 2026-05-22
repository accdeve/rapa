"use client";
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/application/hooks';
import { setActiveTab } from '@/application/store/slices/uiSlice';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { index: 0, label: 'Rooms', icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke={active ? "white" : "#131b2e"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s' }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )},
  { index: 1, label: 'Brainstorm', icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#131b2e"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s' }}>
      <path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 0 0-12 0c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/>
    </svg>
  )},
  { index: 2, label: 'Vote', icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#131b2e"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s' }}>
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  )},
  { index: 3, label: 'Settings', icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#131b2e"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s' }}>
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
    </svg>
  )},
];

export default function BottomNav() {
  const dispatch = useAppDispatch();
  const { activeTab } = useAppSelector((state) => state.ui);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav style={{
      backgroundColor: '#f6f7ff',
      padding: '10px 16px 22px 16px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid rgba(223, 192, 180, 0.2)',
      borderTopLeftRadius: '24px',
      borderTopRightRadius: '24px',
      flexShrink: 0,
      zIndex: 20,
      position: 'relative'
    }}>
      {navItems.map(({ index, label, icon }) => {
        const isActive = activeTab === index;
        return (
          <button
            key={index}
            onClick={() => {
              if (index === 0) {
                router.push('/');
              } else {
                const isRoomPage = pathname.startsWith('/room/');
                if (!isRoomPage && pathname !== '/') {
                  router.push('/');
                }
              }
              dispatch(setActiveTab(index));
            }}
            style={{
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '4px',
              padding: isActive ? '8px 16px' : '8px 12px', 
              borderRadius: '100px', 
              border: 'none', 
              cursor: 'pointer',
              backgroundColor: isActive ? '#8B5CF6' : 'transparent',
              color: isActive ? '#ffffff' : '#584239',
              transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              fontFamily: 'Lexend, sans-serif',
              fontWeight: '700',
              outline: 'none',
              boxShadow: isActive ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
            }}
          >
            {icon(isActive)}
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: isActive ? '#ffffff' : '#584239',
              fontFamily: 'Lexend, sans-serif'
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
