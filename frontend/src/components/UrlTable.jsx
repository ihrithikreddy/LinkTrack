import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  BarChart2, 
  Edit3, 
  Trash2, 
  Globe, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '../context/ToastContext';

export const UrlTable = ({
  urls = [],
  onEdit,
  onDeactivate,
  loading = false,
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const { addToast } = useToast();

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url.shortUrl);
    setCopiedId(url.id);
    addToast('Link copied to clipboard!', 'success', 2500);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (url) => {
    if (!url.active) {
      return (
        <span className="badge badge-inactive">
          <XCircle size={12} /> Inactive
        </span>
      );
    }
    if (url.isExpired) {
      return (
        <span className="badge badge-expired">
          <AlertTriangle size={12} /> Expired
        </span>
      );
    }
    return (
      <span className="badge badge-active">
        <CheckCircle2 size={12} /> Active
      </span>
    );
  };

  return (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Short Link</th>
            <th>Original Destination</th>
            <th>Clicks</th>
            <th>Status</th>
            <th>Created</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => {
            const isCopied = copiedId === url.id;

            return (
              <tr key={url.id}>
                {/* Short Code & Custom Alias */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--primary-light)',
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                        }}
                      >
                        {url.customAlias || url.shortCode}
                      </span>
                      {url.customAlias && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: '#a5b4fc',
                          }}
                        >
                          alias
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      {url.shortUrl}
                    </span>
                  </div>
                </td>

                {/* Original URL */}
                <td>
                  <div
                    style={{
                      maxWidth: '320px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}
                    title={url.originalUrl}
                  >
                    {url.originalUrl}
                  </div>
                </td>

                {/* Clicks */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        fontFamily: 'var(--font-heading)',
                        color: url.clickCount > 0 ? 'var(--text-main)' : 'var(--text-subtle)',
                      }}
                    >
                      {url.clickCount.toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td>{getStatusBadge(url)}</td>

                {/* Created Date */}
                <td>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {formatDate(url.createdAt)}
                  </div>
                </td>

                {/* Actions */}
                <td>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.4rem',
                    }}
                  >
                    {/* Copy Button */}
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={() => handleCopy(url)}
                      title="Copy short link"
                      aria-label="Copy short link"
                    >
                      {isCopied ? <Check size={15} color="#34d399" /> : <Copy size={15} />}
                    </button>

                    {/* Open Link */}
                    <a
                      href={url.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Open redirect"
                      aria-label="Open redirect"
                    >
                      <ExternalLink size={15} />
                    </a>

                    {/* Analytics */}
                    <Link
                      to={`/analytics?id=${url.id}`}
                      className="btn btn-secondary btn-icon btn-sm"
                      title="View click analytics"
                      aria-label="View click analytics"
                    >
                      <BarChart2 size={15} color="var(--primary-light)" />
                    </Link>

                    {/* Edit */}
                    {onEdit && (
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => onEdit(url)}
                        title="Edit URL"
                        aria-label="Edit URL"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}

                    {/* Deactivate */}
                    {onDeactivate && url.active && (
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => onDeactivate(url)}
                        title="Deactivate URL"
                        aria-label="Deactivate URL"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
