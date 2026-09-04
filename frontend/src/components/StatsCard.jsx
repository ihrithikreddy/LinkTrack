import React from 'react';

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'var(--primary)',
  trend,
}) => {
  return (
    <div className="glass-card stat-card" style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: color,
          opacity: 0.12,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', lineHeight: 1.2 }}>
        {value !== undefined && value !== null ? value.toLocaleString() : '—'}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {trend && <span style={{ color: trend > 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>{trend > 0 ? `+${trend}` : trend}</span>}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
