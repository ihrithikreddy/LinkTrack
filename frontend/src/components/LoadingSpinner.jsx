import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', size = 28 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        color: 'var(--text-muted)',
        gap: '0.75rem',
      }}
    >
      <Loader2
        size={size}
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--primary)',
        }}
      />
      {text && <span style={{ fontSize: '0.9rem' }}>{text}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
