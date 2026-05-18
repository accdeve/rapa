"use client";
import React from 'react';

function PlanCard({ name, price, features, isCurrent, isDark }: {
  name: string; price: string; features: string[]; isCurrent?: boolean; isDark?: boolean;
}) {
  return (
    <div style={{
      minWidth: '200px', padding: '24px', borderRadius: '20px', flexShrink: 0,
      backgroundColor: isDark ? 'var(--midnight-navy)' : 'white',
      border: isDark ? 'none' : '1px solid rgba(223,192,180,0.4)',
      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
      color: isDark ? 'white' : 'var(--on-surface)',
    }}>
      <h4 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '4px', letterSpacing: '-0.3px' }}>{name}</h4>
      <div style={{ fontWeight: '800', fontSize: '16px', color: isDark ? 'var(--action-orange)' : 'var(--on-surface)', marginBottom: '20px' }}>{price}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.85)' : 'var(--on-surface)', fontWeight: '600' }}>
            <span style={{ color: isDark ? 'var(--action-orange)' : 'var(--secondary)', fontSize: '16px', fontWeight: '800' }}>✓</span> {f}
          </div>
        ))}
      </div>
      <button style={{
        width: '100%', padding: '12px', borderRadius: '12px', fontWeight: '800', fontSize: '13.5px',
        cursor: 'pointer', border: 'none', fontFamily: 'inherit',
        backgroundColor: isDark ? 'var(--action-orange)' : 'rgba(107,56,212,0.1)',
        color: isDark ? 'white' : 'var(--secondary)',
        boxShadow: isDark ? '0 4px 10px rgba(255,122,61,0.2)' : 'none',
        transition: 'all 0.2s',
      }}>
        {isCurrent ? 'Current Plan' : 'Upgrade'}
      </button>
    </div>
  );
}

export default function SettingsTab() {
  return (
    <div>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-0.3px' }}>Settings</h1>
        <span style={{ color: 'var(--outline)', fontSize: '22px', cursor: 'pointer' }}>⋮</span>
      </header>

      {/* Profile Card */}
      <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px 20px', textAlign: 'center', border: '1px solid rgba(223,192,180,0.4)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'radial-gradient(circle, var(--secondary), var(--anon-purple))', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', position: 'relative' }}>
          🟣
          <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--action-orange)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>✏️</div>
        </div>
        <h3 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '4px', letterSpacing: '-0.3px' }}>Alex Facilitator</h3>
        <p style={{ color: 'var(--outline)', fontSize: '13px', marginBottom: '16px', fontWeight: '600' }}>alex@voxsilent.com</p>
        <button style={{ backgroundColor: 'rgba(107,56,212,0.1)', color: 'var(--secondary)', padding: '10px 24px', borderRadius: '100px', border: 'none', fontWeight: '800', fontSize: '13.5px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
          Edit Profile
        </button>
      </div>

      {/* Participant Limit */}
      <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '20px', border: '1px solid rgba(223,192,180,0.4)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ fontWeight: '800', fontSize: '16px', color: 'var(--on-surface)' }}>Participant Limit</h4>
          <span style={{ fontSize: '20px' }}>👥</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--outline)', fontWeight: '700' }}>10 / 10 Participants</span>
          <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--tertiary)' }}>100%</span>
        </div>
        <div style={{ height: '8px', backgroundColor: 'rgba(223,192,180,0.3)', borderRadius: '100px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--tertiary)', borderRadius: '100px' }} />
        </div>
      </div>

      {/* Subscription Plans */}
      <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '16px' }}>Subscription Plans</h3>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        <PlanCard name="Free" price="Rp 0" features={['10 Orang', 'Basic Room', 'Manual Grouping', '7-Day History']} isCurrent />
        <PlanCard name="Professional" price="Rp 299k/bln" features={['50 Orang', 'Unlimited Room', 'AI Grouping', 'Sertifikat', 'Export PDF']} isDark />
      </div>
    </div>
  );
}
