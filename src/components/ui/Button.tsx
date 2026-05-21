'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
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
    color: 'var(--action-orange)',
    border: '2px solid var(--action-orange)',
  },
};

const SIZE_STYLES = {
  sm: {
    padding: '8px 16px',
    fontSize: '12px',
    borderRadius: '9999px',
  },
  md: {
    padding: '12px 24px',
    fontSize: '14px',
    borderRadius: '12px',
  },
  lg: {
    padding: '16px 32px',
    fontSize: '16px',
    borderRadius: '12px',
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <button
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
      style={{
        ...variantStyle,
        ...sizeStyle,
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Lexend', sans-serif",
        fontWeight: 600,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: variant !== 'outline' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseDown={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'scale(0.98)';
          e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = variant !== 'outline' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none';
        }
      }}
    >
      {isLoading ? (
        <>
          <span style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      ) : children}
    </button>
  );
};

export default Button;