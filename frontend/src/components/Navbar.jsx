import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Link2, 
  BarChart3, 
  PlusCircle, 
  Shield, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ onOpenCreateModal }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}
          >
            <Link2 size={22} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            LINK<span style={{ color: 'var(--primary-light)' }}>TRACK</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
            }}
            className="desktop-nav"
          >
            <Link
              to="/dashboard"
              className={`btn btn-ghost btn-sm ${isActive('/dashboard') ? 'active-nav-link' : ''}`}
              style={{
                color: isActive('/dashboard') ? 'var(--primary-light)' : 'var(--text-muted)',
                fontWeight: isActive('/dashboard') ? '700' : '500',
              }}
            >
              <BarChart3 size={16} />
              Dashboard
            </Link>

            <Link
              to="/create"
              className={`btn btn-ghost btn-sm ${isActive('/create') ? 'active-nav-link' : ''}`}
              style={{
                color: isActive('/create') ? 'var(--primary-light)' : 'var(--text-muted)',
                fontWeight: isActive('/create') ? '700' : '500',
              }}
            >
              <PlusCircle size={16} />
              New Link
            </Link>

            <Link
              to="/analytics"
              className={`btn btn-ghost btn-sm ${isActive('/analytics') ? 'active-nav-link' : ''}`}
              style={{
                color: isActive('/analytics') ? 'var(--primary-light)' : 'var(--text-muted)',
                fontWeight: isActive('/analytics') ? '700' : '500',
              }}
            >
              <BarChart3 size={16} />
              Analytics
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`btn btn-ghost btn-sm ${isActive('/admin') ? 'active-nav-link' : ''}`}
                style={{
                  color: isActive('/admin') ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontWeight: isActive('/admin') ? '700' : '500',
                }}
              >
                <Shield size={16} color="var(--accent-cyan)" />
                Admin
              </Link>
            )}

            {/* Quick Action Button */}
            {onOpenCreateModal && (
              <button
                className="btn btn-primary btn-sm"
                onClick={onOpenCreateModal}
                style={{ marginLeft: '0.5rem' }}
              >
                <PlusCircle size={16} />
                Shorten Link
              </button>
            )}

            {/* User Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.45rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--primary-glow)',
                    color: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'Account'}
                </span>
                <ChevronDown size={14} color="var(--text-subtle)" />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '200px',
                    background: 'var(--bg-card-solid)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem',
                    zIndex: 60,
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.35rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                    }}
                    className="btn-ghost"
                  >
                    <UserIcon size={15} />
                    Profile Settings
                  </Link>

                  <a
                    href="http://localhost:8080/swagger-ui/index.html"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}
                    className="btn-ghost"
                  >
                    <ExternalLink size={15} />
                    Swagger Docs
                  </a>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      color: '#f87171',
                      fontSize: '0.85rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    className="btn-ghost"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};
