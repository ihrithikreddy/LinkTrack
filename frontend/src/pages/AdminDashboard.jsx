import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Users, 
  Link2, 
  MousePointerClick, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Trash2, 
  ExternalLink,
  Ban,
  Check
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import { StatsCard } from '../components/StatsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [urls, setUrls] = useState([]);
  const [activeTab, setActiveTab] = useState('urls'); // 'urls' | 'users'
  const [loading, setLoading] = useState(true);

  // Pagination for URLs
  const [urlPage, setUrlPage] = useState(0);
  const [urlTotalPages, setUrlTotalPages] = useState(0);

  // Pagination for Users
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);

  // Deactivate modal state
  const [togglingUrl, setTogglingUrl] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useToast();

  const loadPlatformStats = useCallback(async () => {
    try {
      const data = await adminService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    }
  }, []);

  const loadAllUrls = useCallback(async (page) => {
    try {
      const data = await adminService.getAllUrls({ page, size: 10 });
      setUrls(data.content || []);
      setUrlTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Failed to load platform URLs', err);
    }
  }, []);

  const loadAllUsers = useCallback(async (page) => {
    try {
      const data = await adminService.getUsers({ page, size: 10 });
      setUsers(data.content || []);
      setUserTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Failed to load platform users', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadPlatformStats(), loadAllUrls(0), loadAllUsers(0)]);
      setLoading(false);
    };
    init();
  }, [loadPlatformStats, loadAllUrls, loadAllUsers]);

  const handleToggleStatus = async () => {
    if (!togglingUrl) return;
    try {
      setActionLoading(true);
      const newStatus = !togglingUrl.active;
      await adminService.updateUrlStatus(togglingUrl.id, newStatus);
      addToast(`URL ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      setTogglingUrl(null);
      loadAllUrls(urlPage);
      loadPlatformStats();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update URL status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading administration portal..." />;
  }

  return (
    <div className="page-container">
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div
          style={{
            padding: '0.65rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-cyan)',
            display: 'flex',
          }}
        >
          <Shield size={26} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.2rem' }}>Platform Administration</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            System-wide analytics, user registry, and abusive content governance
          </p>
        </div>
      </div>

      {/* System Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total Platform Users"
          value={stats?.totalUsers || 0}
          subtitle="Registered accounts"
          icon={Users}
          color="var(--accent-cyan)"
        />
        <StatsCard
          title="Total Short Links"
          value={stats?.totalUrls || 0}
          subtitle={`${stats?.activeUrls || 0} active links`}
          icon={Link2}
          color="var(--primary-light)"
        />
        <StatsCard
          title="Total Platform Clicks"
          value={stats?.totalClicks || 0}
          subtitle={`${stats?.clicksToday || 0} clicks today`}
          icon={MousePointerClick}
          color="var(--accent-emerald)"
        />
        <StatsCard
          title="Expired Short Links"
          value={stats?.expiredUrls || 0}
          subtitle="Inactive retention"
          icon={AlertTriangle}
          color="var(--accent-amber)"
        />
      </div>

      {/* Tabs: URLs vs Users */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'urls' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('urls')}
          >
            <Link2 size={16} /> All Platform Links ({stats?.totalUrls || 0})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} /> User Accounts ({stats?.totalUsers || 0})
          </button>
        </div>

        {activeTab === 'urls' ? (
          <div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Short Code</th>
                    <th>Destination URL</th>
                    <th>Clicks</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Governance</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => (
                    <tr key={url.id}>
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-light)' }}>
                          {url.customAlias || url.shortCode}
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }} title={url.originalUrl}>
                          {url.originalUrl}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{url.clickCount.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className={`badge ${url.active ? 'badge-active' : 'badge-inactive'}`}>
                          {url.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>{formatDate(url.createdAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className={`btn btn-sm ${url.active ? 'btn-danger' : 'btn-secondary'}`}
                          onClick={() => setTogglingUrl(url)}
                        >
                          {url.active ? (
                            <>
                              <Ban size={14} /> Deactivate
                            </>
                          ) : (
                            <>
                              <Check size={14} /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {urlTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                  Page {urlPage + 1} of {urlTotalPages}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={urlPage === 0}
                    onClick={() => {
                      setUrlPage(urlPage - 1);
                      loadAllUrls(urlPage - 1);
                    }}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={urlPage >= urlTotalPages - 1}
                    onClick={() => {
                      setUrlPage(urlPage + 1);
                      loadAllUrls(urlPage + 1);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-subtle)' }}>#{u.id}</td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>
                        <span className="badge badge-role">{u.role}</span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {userTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                  Page {userPage + 1} of {userTotalPages}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={userPage === 0}
                    onClick={() => {
                      setUserPage(userPage - 1);
                      loadAllUsers(userPage - 1);
                    }}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={userPage >= userTotalPages - 1}
                    onClick={() => {
                      setUserPage(userPage + 1);
                      loadAllUsers(userPage + 1);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!togglingUrl}
        title={`${togglingUrl?.active ? 'Deactivate' : 'Activate'} Platform Link`}
        message={`Are you sure you want to ${togglingUrl?.active ? 'deactivate' : 'activate'} "${togglingUrl?.customAlias || togglingUrl?.shortCode}"?`}
        confirmText={togglingUrl?.active ? 'Deactivate Link' : 'Activate Link'}
        confirmVariant={togglingUrl?.active ? 'danger' : 'primary'}
        loading={actionLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setTogglingUrl(null)}
      />
    </div>
  );
};
