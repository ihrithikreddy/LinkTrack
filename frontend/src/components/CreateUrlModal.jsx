import React, { useState } from 'react';
import { X, Link2, Sparkles, Copy, Check, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { urlService } from '../services/urlService';
import { useToast } from '../context/ToastContext';

export const CreateUrlModal = ({ isOpen, onClose, onSuccess }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!originalUrl.trim()) {
      setError('Please enter a destination URL');
      return;
    }

    let urlToSubmit = originalUrl.trim();
    if (!urlToSubmit.startsWith('http://') && !urlToSubmit.startsWith('https://')) {
      urlToSubmit = 'https://' + urlToSubmit;
    }

    try {
      setLoading(true);
      const payload = {
        originalUrl: urlToSubmit,
        customAlias: customAlias.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      const response = await urlService.createUrl(payload);
      setCreatedUrl(response);
      addToast('Short link created successfully!', 'success');

      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create short link';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdUrl) {
      navigator.clipboard.writeText(createdUrl.shortUrl);
      setCopied(true);
      addToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setOriginalUrl('');
    setCustomAlias('');
    setExpiresAt('');
    setCreatedUrl(null);
    setError(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleReset}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
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
              <Link2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {createdUrl ? 'Your Link is Ready!' : 'Shorten a Link'}
              </h2>
            </div>
          </div>
          <button
            onClick={handleReset}
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

        {/* Error Display */}
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

        {/* If created: show success card */}
        {createdUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                padding: '1.25rem',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-light)', fontWeight: 600 }}>
                Short URL
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0.4rem',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    wordBreak: 'break-all',
                  }}
                >
                  {createdUrl.shortUrl}
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleCopy}
                  style={{ flexShrink: 0 }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                Original: <span style={{ color: 'var(--text-muted)' }}>{createdUrl.originalUrl}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href={createdUrl.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <ExternalLink size={16} />
                Test Link
              </a>
              <button
                className="btn btn-primary"
                onClick={handleReset}
                style={{ flex: 1 }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form for creation */
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Destination URL *</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://example.com/very-long-url-path"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Custom Alias <span style={{ color: 'var(--text-subtle)' }}>(Optional)</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. spring-boot-docs"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.25rem', display: 'block' }}>
                Letters, numbers, hyphens and underscores (3–30 characters)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Expiration Date <span style={{ color: 'var(--text-subtle)' }}>(Optional)</span>
              </label>
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

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
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
                <Sparkles size={16} />
                {loading ? 'Creating...' : 'Shorten Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
