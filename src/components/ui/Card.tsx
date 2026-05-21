'use client';

import React from 'react';

type CardVariant = 'default' | 'elevated' | 'glassmorphism';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const VARIANT_STYLES = {
  default: {
    background: 'var(--surface-container-lowest)',
    border: '1px solid var(--outline-variant)',
    backdropFilter: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  elevated: {
    background: 'var(--surface-container-lowest)',
    border: 'none',
    backdropFilter: 'none',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  },
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  onClick,
}) => {
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <div
      className={`card card-${variant} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      style={{
        ...variantStyle,
        borderRadius: '24px',
        padding: '20px',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = variant === 'glassmorphism'
            ? '0 12px 40px rgba(0,0,0,0.12)'
            : '0 12px 32px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = variantStyle.boxShadow;
        }
      }}
    >
      {children}
    </div>
  );
};

export default Card;