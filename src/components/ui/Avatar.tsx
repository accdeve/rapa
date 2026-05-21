'use client';

import React, { useMemo } from 'react';

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarShape = 'blob' | 'cube' | 'cone';

interface AvatarProps {
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
}

const COLORS = ['#FF7A3D', '#8B5CF6', '#BEF264', '#8455ef', '#80af27'];

const SIZES = {
  sm: 40,
  md: 64,
  lg: 96,
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const BlobSVG: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
    <path
      d="M50 5 C 70 5, 95 25, 95 50 C 95 75, 75 95, 50 95 C 25 95, 5 75, 5 50 C 5 25, 30 5, 50 5"
      fill={color}
    />
    <circle cx="35" cy="40" r="8" fill="rgba(255,255,255,0.4)" />
    <circle cx="65" cy="40" r="8" fill="rgba(255,255,255,0.4)" />
    <ellipse cx="50" cy="65" rx="15" ry="8" fill="rgba(255,255,255,0.25)" />
  </svg>
);

const CubeSVG: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
    <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill={color} />
    <polygon points="50,10 90,30 50,50 10,30" fill={color} opacity="0.8" />
    <polygon points="50,50 90,30 90,70 50,90" fill={color} opacity="0.6" />
    <rect x="30" y="35" width="12" height="12" rx="2" fill="rgba(255,255,255,0.5)" />
    <rect x="58" y="35" width="12" height="12" rx="2" fill="rgba(255,255,255,0.5)" />
    <ellipse cx="50" cy="62" rx="10" ry="6" fill="rgba(255,255,255,0.3)" />
  </svg>
);

const ConeSVG: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
    <path d="M50 10 L85 90 L15 90 Z" fill={color} />
    <path d="M50 10 L85 90 L50 85 Z" fill={color} opacity="0.85" />
    <ellipse cx="35" cy="45" rx="6" ry="8" fill="rgba(255,255,255,0.45)" />
    <ellipse cx="55" cy="45" rx="6" ry="8" fill="rgba(255,255,255,0.45)" />
    <path d="M35 65 Q50 75 65 65" stroke="rgba(255,255,255,0.35)" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

export const Avatar: React.FC<AvatarProps> = ({
  name = 'Anonymous',
  size = 'md',
  shape = 'blob',
  className = '',
}) => {
  const color = useMemo(() => {
    const index = hashString(name) % COLORS.length;
    return COLORS[index];
  }, [name]);

  const pixelSize = SIZES[size];

  const renderShape = () => {
    switch (shape) {
      case 'cube':
        return <CubeSVG size={pixelSize} color={color} />;
      case 'cone':
        return <ConeSVG size={pixelSize} color={color} />;
      default:
        return <BlobSVG size={pixelSize} color={color} />;
    }
  };

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      title={name}
    >
      {renderShape()}
    </div>
  );
};

export default Avatar;