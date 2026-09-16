import React from 'react';
import { Package, ExternalLink, RefreshCw, Layers, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar({ onSeedDatabase, isSeeding, isConnected, user, onOpenAuth, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo">
          <Package size={24} />
        </div>
        <div>
          <div className="brand-title">Inventory Hub</div>
          <div className="brand-subtitle">REST API Client v1.0 • Express & SQLite</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="header-status-badge">
          <span className="status-dot" style={!isConnected ? { background: '#ef4444', boxShadow: '0 0 8px #ef4444' } : {}} />
          <span>{isConnected ? 'API Connected' : 'API Offline'}</span>
        </div>

        <a
          href="/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
        >
          <Layers size={15} />
          <span>Swagger</span>
          <ExternalLink size={13} style={{ opacity: 0.6 }} />
        </a>

        {user && (
          <button
            className="btn btn-secondary"
            onClick={onSeedDatabase}
            disabled={isSeeding}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
          >
            <RefreshCw size={15} className={isSeeding ? 'spin' : ''} />
            <span>{isSeeding ? 'Resetting...' : 'Reset & Seed'}</span>
          </button>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#a5b4fc'
            }}>
              <User size={14} />
              <span>{user.username || user.email}</span>
            </div>
            <button
              className="btn btn-danger"
              onClick={onLogout}
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onOpenAuth}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            <LogIn size={15} />
            <span>Login / Signup</span>
          </button>
        )}
      </div>
    </header>
  );
}
