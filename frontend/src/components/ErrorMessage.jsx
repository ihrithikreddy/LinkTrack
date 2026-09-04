import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: 'var(--radius-md)',
        color: '#fca5a5',
        fontSize: '0.875rem',
        marginBottom: '1rem',
      }}
    >
      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#f43f5e' }} />
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fca5a5',
            cursor: 'pointer',
            padding: '2px',
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
};
