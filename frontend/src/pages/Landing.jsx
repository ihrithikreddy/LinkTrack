import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Link2, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  Globe, 
  Lock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { urlService } from '../services/urlService';

export const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [inputUrl, setInputUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [createdUrl, setCreatedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    if (!isAuthenticated) {
      navigate('/login?redirect=create');
      return;
    }

    let target = inputUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    try {
      setLoading(true);
      const res = await urlService.createUrl({
        originalUrl: target,
        customAlias: customAlias.trim() || null,
      });
      setCreatedUrl(res);
      addToast('Link created!', 'success');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to shorten link', 'error');
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '6rem 2rem 4rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: 'var(--primary-light)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.75rem',
          }}
        >
          <Sparkles size={16} />
          High-Performance URL Shortener & Click Intelligence
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em',
          }}
        >
          Shorten. Share. <br />
          <span className="gradient-text">Analyze Traffic in Real-Time.</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          LinkTrack delivers lightning-fast Base62 short links, custom branded aliases, 
          resilient Redis caching, and deep device, browser, and OS analytics.
        </p>

        {/* Live URL Shortener Widget */}
        <div
          className="glass-card"
          style={{
            maxWidth: '680px',
            margin: '0 auto 3rem',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-lg), 0 0 50px rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          <form onSubmit={handleShorten} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter long destination link (e.g. https://github.com/torvalds/linux)"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                style={{ flex: '1 1 300px' }}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !inputUrl.trim()}
                style={{ flexShrink: 0 }}
              >
                <Sparkles size={16} />
                {loading ? 'Shortening...' : 'Shorten Link'}
              </button>
            </div>

            {/* Optional Custom Alias Inline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Custom alias (optional):</span>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. my-cool-project"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
          </form>

          {/* Result Card if Shortened */}
          {createdUrl && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>SUCCESSFULLY GENERATED</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                  {createdUrl.shortUrl}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" onClick={handleCopy}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={createdUrl.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  Visit
                </a>
              </div>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        {!isAuthenticated && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In to Dashboard
            </Link>
          </div>
        )}
      </section>

      {/* Key Feature Cards */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.75rem' }}>
          Engineered for Performance & Scale
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>
          Everything you need to streamline URL routing and monitor user engagement.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Sub-Millisecond 302 Redirects</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Redis cache lookups backed by indexed PostgreSQL storage ensure ultra-low latency redirection.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Comprehensive Click Intelligence</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Track browsers (Chrome, Safari, Firefox), devices (Desktop, Mobile, Tablet), operating systems, and daily trends.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Enterprise-Grade Security</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Stateless JWT authentication, BCrypt password hashing, role-based authorization (USER & ADMIN), and Bean validation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border)',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-subtle)',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>LinkTrack</strong> — URL Shortener & Analytics Platform. Built with Spring Boot 3 & React.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="http://localhost:8080/swagger-ui/index.html" target="_blank" rel="noreferrer">
              Swagger API Docs
            </a>
            <a href="http://localhost:8080/actuator/health" target="_blank" rel="noreferrer">
              Actuator Health
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
