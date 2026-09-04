import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Save, CheckCircle2, Lock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { ErrorMessage } from '../components/ErrorMessage';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { addToast } = useToast();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const updated = await authService.updateProfile({ name: name.trim() });
      updateUser(updated);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return format(parseISO(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '780px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Account Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your personal details, credentials, and account settings
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* User Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800,
                boxShadow: '0 4px 16px var(--primary-glow)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.35rem' }}>{user?.name}</h2>
                <span className="badge badge-role">{user?.role}</span>
              </div>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <ErrorMessage message={error} onClose={() => setError(null)} />

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon-left" />
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon-left" />
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Member Since</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon-left" />
                <input
                  type="text"
                  className="form-input"
                  value={formatDate(user?.createdAt)}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !name.trim() || name === user?.name}
              style={{ marginTop: '0.5rem' }}
            >
              <Save size={16} />
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Security / System Summary Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Lock size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem' }}>Security & API Authentication</h3>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            Your account is secured with salted BCrypt password hashing and stateless HMAC SHA-256 JWT tokens.
            All protected endpoints authenticate via standard Bearer tokens.
          </p>

          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
              Swagger / OpenAPI Specification
            </div>
            <a
              href="http://localhost:8080/swagger-ui/index.html"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Test API Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
