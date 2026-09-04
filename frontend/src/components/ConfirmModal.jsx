import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: confirmVariant === 'danger' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: confirmVariant === 'danger' ? '#f43f5e' : 'var(--primary-light)',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${confirmVariant} btn-sm`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
