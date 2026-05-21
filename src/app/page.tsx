"use client";

import React, { useEffect } from 'react';
import { useAppSelector } from '@/application/hooks';
import SpotlightOverlay from '../components/layout/SpotlightOverlay';
import HomeTab from '../components/features/HomeTab';
import CanvasTab from '../components/features/CanvasTab';
import VoteTab from '../components/features/VoteTab';
import SettingsTab from '../components/features/SettingsTab';

export default function Home() {
  const { activeTab, showSpotlight, isGMLoggedIn } = useAppSelector((state) => state.ui);
 
  // Disable body scroll when spotlight is active and GM is logged in
  useEffect(() => {
    if (showSpotlight && isGMLoggedIn) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showSpotlight, isGMLoggedIn]);
 
  return (
    <>
      <SpotlightOverlay />
 
      <div className="app-content" style={{ overflow: (showSpotlight && isGMLoggedIn) ? 'hidden' : 'auto' }}>
        <div style={{ display: activeTab === 0 ? 'block' : 'none', height: '100%' }}>
          <HomeTab />
        </div>
        <div style={{ display: activeTab === 1 ? 'block' : 'none', height: '100%' }}>
          <CanvasTab />
        </div>
        <div style={{ display: activeTab === 2 ? 'block' : 'none', height: '100%' }}>
          <VoteTab />
        </div>
        <div style={{ display: activeTab === 3 ? 'block' : 'none', height: '100%' }}>
          <SettingsTab />
        </div>
      </div>
    </>
  );
}
