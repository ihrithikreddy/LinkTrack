import React, { useState, useEffect, useCallback } from 'react';
import { 
  Link2, 
  MousePointerClick, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardService } from '../services/dashboardService';
import { urlService } from '../services/urlService';
import { StatsCard } from '../components/StatsCard';
import { UrlTable } from '../components/UrlTable';
import { ClicksOverTimeChart } from '../components/AnalyticsChart';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { CreateUrlModal } from '../components/CreateUrlModal';
import { EditUrlModal } from '../components/EditUrlModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Dashboard Overview state
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // URLs table state
  const [urls, setUrls] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [loadingUrls, setLoadingUrls] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState(null);
  const [deactivatingUrl, setDeactivatingUrl] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load Dashboard Aggregate Statistics
  const loadDashboard = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const data = await dashboardService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // Load Paginated URLs
  const loadUrls = useCallback(async () => {
    try {
      setLoadingUrls(true);
      const data = await urlService.getUrls({
        page,
        size: pageSize,
        search,
        status: statusFilter,
        sortBy,
        sortDir,
      });
      setUrls(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch user URLs', err);
    } finally {
      setLoadingUrls(false);
    }
  }, [page, pageSize, search, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadUrls();
  }, [loadUrls]);

  const handleDeactivateConfirm = async () => {
    if (!deactivatingUrl) return;
    try {
      setActionLoading(true);
      await urlService.deleteUrl(deactivatingUrl.id);
      addToast('URL deactivated successfully', 'success');
      setDeactivatingUrl(null);
      loadUrls();
      loadDashboard();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to deactivate URL', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadUrls();
    loadDashboard();
  };

  const handleEditSuccess = () => {
    loadUrls();
    loadDashboard();
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Monitor your links, manage destinations, and review traffic growth.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              loadDashboard();
              loadUrls();
            }}
            title="Refresh statistics"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} />
            Shorten New Link
          </button>
        </div>
      </div>

      {/* Aggregate Statistics Cards */}
      {loadingOverview ? (
        <LoadingSpinner text="Calculating metrics..." />
      ) : (
        <>
          <div className="stats-grid">
            <StatsCard
              title="Total Short Links"
              value={dashboardData?.totalUrls || 0}
              subtitle="All generated links"
              icon={Link2}
              color="var(--primary-light)"
            />
            <StatsCard
              title="Total Link Clicks"
              value={dashboardData?.totalClicks || 0}
              subtitle={`${dashboardData?.clicksToday || 0} clicks today`}
              icon={MousePointerClick}
              color="var(--accent-cyan)"
            />
            <StatsCard
              title="Active Links"
              value={dashboardData?.activeUrls || 0}
              subtitle="Currently routing traffic"
              icon={CheckCircle2}
              color="var(--accent-emerald)"
            />
            <StatsCard
              title="Expired Links"
              value={dashboardData?.expiredUrls || 0}
              subtitle="Passed expiration time"
              icon={AlertTriangle}
              color="var(--accent-amber)"
            />
          </div>

          {/* Clicks Over Time Chart & Top Links Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            {/* 30-Day Activity Chart */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="var(--primary-light)" />
                  <h3 style={{ fontSize: '1.05rem' }}>Clicks Activity (Last 30 Days)</h3>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  {dashboardData?.clicksThisMonth || 0} total monthly clicks
                </div>
              </div>

              <ClicksOverTimeChart data={dashboardData?.clicksOverTime || []} height={240} />
            </div>

            {/* Top Performing URLs */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <BarChart3 size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.05rem' }}>Top Performing Links</h3>
              </div>

              {dashboardData?.topUrls && dashboardData.topUrls.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboardData.topUrls.slice(0, 4).map((topUrl, idx) => (
                    <div
                      key={topUrl.id}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            {topUrl.customAlias || topUrl.shortCode}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {topUrl.originalUrl}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                          {topUrl.clickCount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>clicks</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                  No click activity recorded yet. Share your short links to see top performers!
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* URL Management Section */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        {/* Table Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Your Short Links</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {totalElements} total links managed
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="input-with-icon" style={{ width: '220px' }}>
              <Search size={16} className="input-icon-left" />
              <input
                type="text"
                className="form-input"
                placeholder="Search links..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                style={{ padding: '0.5rem 0.75rem 0.5rem 2.4rem', fontSize: '0.85rem' }}
              />
            </div>

            {/* Status Filter */}
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              style={{ width: '130px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* Sort Selector */}
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(0);
              }}
              style={{ width: '130px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="createdAt">Date Created</option>
              <option value="clickCount">Most Clicks</option>
              <option value="originalUrl">Destination</option>
            </select>
          </div>
        </div>

        {/* URLs Table */}
        {loadingUrls ? (
          <LoadingSpinner text="Fetching links..." />
        ) : urls.length > 0 ? (
          <>
            <UrlTable
              urls={urls}
              onEdit={(url) => setEditingUrl(url)}
              onDeactivate={(url) => setDeactivatingUrl(url)}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                  Showing page {page + 1} of {totalPages}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No shortened links found"
            description={search ? "No links match your search query." : "You haven't created any shortened links yet. Shorten your first link now!"}
            actionText="Shorten a Link"
            onAction={() => setIsCreateOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      <CreateUrlModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditUrlModal
        isOpen={!!editingUrl}
        url={editingUrl}
        onClose={() => setEditingUrl(null)}
        onSuccess={handleEditSuccess}
      />

      <ConfirmModal
        isOpen={!!deactivatingUrl}
        title="Deactivate Short Link"
        message={`Are you sure you want to deactivate the link "${deactivatingUrl?.customAlias || deactivatingUrl?.shortCode}"? Traffic to this link will no longer redirect.`}
        confirmText="Deactivate Link"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setDeactivatingUrl(null)}
      />
    </div>
  );
};
