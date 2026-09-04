import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Sparkles, Calendar, Copy, Check, ExternalLink, ArrowLeft, BarChart2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { urlService } from '../services/urlService';
import { useToast } from '../context/ToastContext';
import { ErrorMessage } from '../components/ErrorMessage';

export const CreateUrl = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!originalUrl.trim()) {
      setError('Please enter a destination URL');
      return;
    }

    let target = originalUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    try {
      setLoading(true);
      const payload = {
        originalUrl: target,
        customAlias: customAlias.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      const res = await urlService.createUrl(payload);
      setCreatedUrl(res);
      addToast('Short link created successfully!', 'success');
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
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
      addToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '720px' }}>
      <button
        onClick={() => navigate('/dashboard')}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}
          >
            <Link2 size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create a Short Link</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Generate a fast, trackable short URL with custom alias branding
            </p>
          </div>
        </div>

        <ErrorMessage message={error} onClose={() => setError(null)} />

        {createdUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                padding: '1.5rem',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-light)', fontWeight: 700, marginBottom: '0.5rem' }}>
                Your Short Link is Live
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
                  {createdUrl.shortUrl}
                </span>
                <button className="btn btn-primary" onClick={handleCopy}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                Destination: <span style={{ color: 'var(--text-muted)' }}>{createdUrl.originalUrl}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href={createdUrl.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <ExternalLink size={16} /> Test Redirect
              </a>
              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/analytics?id=${createdUrl.id}`)}
                style={{ flex: 1 }}
              >
                <BarChart2 size={16} /> View Analytics
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setCreatedUrl(null);
                  setOriginalUrl('');
                  setCustomAlias('');
                  setExpiresAt('');
                }}
                style={{ flex: 1 }}
              >
                Create Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Destination URL *</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://example.com/very-long-destination-url-here"
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
                placeholder="e.g. portfolio-2026"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem', display: 'block' }}>
                Create a memorable custom link. Letters, numbers, hyphens, and underscores only.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Link Expiration <span style={{ color: 'var(--text-subtle)' }}>(Optional)</span>
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem', display: 'block' }}>
                Leave empty for links that never expire.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.25rem' }}
              disabled={loading || !originalUrl.trim()}
            >
              <Sparkles size={18} />
              {loading ? 'Generating Short Link...' : 'Shorten URL'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
