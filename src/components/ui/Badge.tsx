'use client';

import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'tertiary' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES = {
  primary: {
    background: 'var(--action-orange)',
    color: 'white',
    border: 'none',
  },
  secondary: {
    background: 'var(--anon-purple)',
    color: 'white',
    border: 'none',
  },
  tertiary: {
    background: 'var(--success-lime)',
    color: 'var(--midnight-navy)',
    border: 'none',
  },
  outline: {
    background: 'transparent',
    color: 'var(--on-surface)',
    border: '1px solid var(--outline)',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  className = '',
}) => {
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <span
      className={`badge badge-${variant} ${className}`}
      style={{
        ...variantStyle,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontFamily: "'Lexend', sans-serif",
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
};

export default Badge;