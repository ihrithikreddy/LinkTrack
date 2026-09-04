import React, { useState, useEffect } from 'react';
import { X, Edit3, Calendar, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { urlService } from '../services/urlService';
import { useToast } from '../context/ToastContext';

export const EditUrlModal = ({ isOpen, url, onClose, onSuccess }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    if (url) {
      setOriginalUrl(url.originalUrl || '');
      setExpiresAt(url.expiresAt ? url.expiresAt.substring(0, 16) : '');
      setActive(url.active !== undefined ? url.active : true);
      setError(null);
    }
  }, [url]);

  if (!isOpen || !url) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!originalUrl.trim()) {
      setError('Original destination URL cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        originalUrl: originalUrl.trim(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        active: active,
      };

      const updated = await urlService.updateUrl(url.id, payload);
      addToast('Link updated successfully', 'success');
      if (onSuccess) onSuccess(updated);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to update URL';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Edit3 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Edit Short Link</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                {url.shortUrl}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fda4af',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} color="#f43f5e" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Destination URL *</label>
            <input
              type="text"
              className="form-input"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expiration Date</label>
            <div className="input-with-icon">
              <Calendar size={18} className="input-icon-left" />
              <input
                type="datetime-local"
                className="form-input"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              marginTop: '1rem',
            }}
            onClick={() => setActive(!active)}
          >
            {active ? (
              <CheckSquare size={20} color="var(--primary-light)" />
            ) : (
              <Square size={20} color="var(--text-subtle)" />
            )}
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Active Status
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                {active ? 'Link is live and routing traffic' : 'Link is deactivated and will not redirect'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !originalUrl.trim()}
              style={{ flex: 1 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
