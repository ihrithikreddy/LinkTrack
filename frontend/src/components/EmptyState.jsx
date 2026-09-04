import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There are no records to display at this moment.',
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--primary-light)',
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          maxWidth: '380px',
          marginBottom: actionText ? '1.25rem' : '0',
        }}
      >
        {description}
      </p>
      {actionText && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          <Plus size={16} />
          {actionText}
        </button>
      )}
    </div>
  );
};
