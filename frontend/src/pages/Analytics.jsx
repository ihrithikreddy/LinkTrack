import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  BarChart3, 
  MousePointerClick, 
  Globe, 
  Smartphone, 
  Monitor, 
  Calendar, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { urlService } from '../services/urlService';
import { analyticsService } from '../services/analyticsService';
import { useToast } from '../context/ToastContext';
import { StatsCard } from '../components/StatsCard';
import { 
  ClicksOverTimeChart, 
  DistributionPieChart, 
  BreakdownBarChart 
} from '../components/AnalyticsChart';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const Analytics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUrlId = searchParams.get('id');

  const [urls, setUrls] = useState([]);
  const [selectedUrlId, setSelectedUrlId] = useState(initialUrlId || '');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [copied, setCopied] = useState(false);

  const { addToast } = useToast();

  // Load User's available URLs for selector
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoadingUrls(true);
        const res = await urlService.getUrls({ size: 100 });
        const list = res.content || [];
        setUrls(list);

        if (list.length > 0 && !selectedUrlId) {
          setSelectedUrlId(String(list[0].id));
          setSearchParams({ id: String(list[0].id) });
        }
      } catch (err) {
        console.error('Failed to load URLs for analytics selector', err);
      } finally {
        setLoadingUrls(false);
      }
    };

    fetchUrls();
  }, []);

  // Load Analytics for the selected URL
  const loadAnalytics = useCallback(async (urlId) => {
    if (!urlId) return;
    try {
      setLoadingAnalytics(true);
      const data = await analyticsService.getUrlAnalytics(urlId);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
      addToast('Failed to load analytics for selected URL', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (selectedUrlId) {
      loadAnalytics(selectedUrlId);
    }
  }, [selectedUrlId, loadAnalytics]);

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedUrlId(id);
    setSearchParams({ id });
  };

  const handleCopy = () => {
    if (analyticsData) {
      const shortUrl = `${window.location.origin}/${analyticsData.customAlias || analyticsData.shortCode}`;
      navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      addToast('Short link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loadingUrls) {
    return <LoadingSpinner text="Loading analytics workspace..." />;
  }

  if (urls.length === 0) {
    return (
      <div className="page-container" style={{ maxWidth: '600px', marginTop: '3rem' }}>
        <EmptyState
          icon={BarChart3}
          title="No links to analyze"
          description="Create your first shortened link to begin tracking clicks, browsers, devices, and visitor analytics."
          actionText="Create a Link"
          onAction={() => window.location.href = '/create'}
        />
      </div>
    );
  }

  const selectedUrlObject = urls.find((u) => String(u.id) === String(selectedUrlId));

  return (
    <div className="page-container">
      {/* Header & Link Selector */}
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
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Click Intelligence & Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Real-time engagement breakdown by browser, OS, device, and timeline
          </p>
        </div>

        {/* URL Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Select Link:
          </label>
          <select
            className="form-select"
            value={selectedUrlId}
            onChange={handleSelectChange}
            style={{ minWidth: '220px', padding: '0.55rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}
          >
            {urls.map((u) => (
              <option key={u.id} value={u.id}>
                {u.customAlias ? `/${u.customAlias}` : `/${u.shortCode}`} — {u.clickCount} clicks
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingAnalytics ? (
        <LoadingSpinner text="Compiling link analytics..." />
      ) : analyticsData ? (
        <>
          {/* Selected URL Banner Card */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
              border: '1px solid rgba(99, 102, 241, 0.25)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                  {selectedUrlObject?.shortUrl || `/${analyticsData.customAlias || analyticsData.shortCode}`}
                </span>
                {analyticsData.customAlias && (
                  <span className="badge badge-role" style={{ fontSize: '0.7rem' }}>Custom Alias</span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', maxWidth: '600px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Destination: <span style={{ color: 'var(--text-muted)' }}>{analyticsData.originalUrl}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="btn btn-primary btn-sm" onClick={handleCopy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <a
                href={selectedUrlObject?.shortUrl || `/${analyticsData.customAlias || analyticsData.shortCode}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <ExternalLink size={15} /> Visit
              </a>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="stats-grid">
            <StatsCard
              title="Total Clicks"
              value={analyticsData.totalClicks}
              subtitle="Lifetime interactions"
              icon={MousePointerClick}
              color="var(--primary-light)"
            />
            <StatsCard
              title="Clicks Today"
              value={analyticsData.clicksToday}
              subtitle="Since 00:00 UTC"
              icon={Calendar}
              color="var(--accent-cyan)"
            />
            <StatsCard
              title="Clicks This Week"
              value={analyticsData.clicksThisWeek}
              subtitle="Past 7 days"
              icon={BarChart3}
              color="var(--accent-emerald)"
            />
            <StatsCard
              title="Clicks This Month"
              value={analyticsData.clicksThisMonth}
              subtitle="Past 30 days"
              icon={Globe}
              color="var(--accent-amber)"
            />
          </div>

          {/* Timeline Chart */}
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Daily Clicks Trend (Last 30 Days)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Volume of visitor redirects recorded each day
            </p>
            <ClicksOverTimeChart data={analyticsData.dailyClicks || []} height={280} />
          </div>

          {/* Breakdowns: Browser, Device, Operating System */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Browser Breakdown */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Globe size={18} color="var(--primary-light)" />
                <h3 style={{ fontSize: '1.05rem' }}>Browser Distribution</h3>
              </div>
              <DistributionPieChart dataMap={analyticsData.browserStats || {}} height={220} />
            </div>

            {/* Device Breakdown */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Smartphone size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.05rem' }}>Device Category</h3>
              </div>
              <DistributionPieChart dataMap={analyticsData.deviceStats || {}} height={220} />
            </div>

            {/* Operating System Breakdown */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Monitor size={18} color="var(--accent-emerald)" />
                <h3 style={{ fontSize: '1.05rem' }}>Operating Systems</h3>
              </div>
              <BreakdownBarChart dataMap={analyticsData.osStats || {}} height={220} />
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No analytics found" description="Unable to load analytics data for the chosen link." />
      )}
    </div>
  );
};
