import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '480px',
          padding: '3rem 2rem',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(99, 102, 241, 0.1)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <Compass size={32} />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary-light)', marginBottom: '0.5rem' }}>
          404
        </h1>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Page Not Found</h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          The link or page you are looking for does not exist, has been moved, or has expired.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">
            <Home size={16} /> Home
          </Link>
          <Link to="/dashboard" className="btn btn-primary">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
