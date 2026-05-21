'use client';

import React, { useId } from 'react';

type InputVariant = 'text' | 'textarea' | 'search';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const VARIANT_STYLES = {
  text: {
    padding: '14px 16px',
    minHeight: '48px',
  },
  textarea: {
    padding: '14px 16px',
    minHeight: '120px',
    resize: 'vertical' as const,
  },
  search: {
    padding: '14px 16px 14px 44px',
    minHeight: '48px',
  },
};

export const Input: React.FC<InputProps> = ({
  variant = 'text',
  leftIcon,
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const isTextarea = variant === 'textarea';
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: "'Lexend', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--on-surface)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
        {leftIcon && variant === 'search' && (
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--outline)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {leftIcon}
          </span>
        )}
        {isTextarea ? (
          <textarea
            id={inputId}
            className={`input-field input-${variant} ${error ? 'input-error' : ''} ${className}`}
            style={{
              ...variantStyle,
              width: '100%',
              border: error ? '2px solid var(--error)' : '1px solid var(--outline-variant)',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-container-lowest)',
              fontFamily: "'Lexend', sans-serif",
              fontSize: '14px',
              color: 'var(--on-surface)',
              transition: 'border-color 0.2s',
              outline: 'none',
            }}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--action-orange)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? 'var(--error)' : 'var(--outline-variant)';
            }}
          />
        ) : (
          <input
            id={inputId}
            type={variant === 'search' ? 'search' : 'text'}
            className={`input-field input-${variant} ${error ? 'input-error' : ''} ${className}`}
            style={{
              ...variantStyle,
              width: '100%',
              border: error ? '2px solid var(--error)' : '1px solid var(--outline-variant)',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-container-lowest)',
              fontFamily: "'Lexend', sans-serif",
              fontSize: '14px',
              color: 'var(--on-surface)',
              transition: 'border-color 0.2s',
              outline: 'none',
            }}
            {...props}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--action-orange)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? 'var(--error)' : 'var(--outline-variant)';
            }}
          />
        )}
      </div>
      {error && (
        <span style={{
          fontFamily: "'Lexend', sans-serif",
          fontSize: '12px',
          color: 'var(--error)',
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;