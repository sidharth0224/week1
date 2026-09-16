import React from 'react';
import { Package, ExternalLink, RefreshCw, Layers } from 'lucide-react';

export default function Navbar({ onSeedDatabase, isSeeding, isConnected }) {
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="header-status-badge">
          <span className={`status-dot ${!isConnected ? 'offline' : ''}`} style={!isConnected ? { background: '#ef4444', boxShadow: '0 0 8px #ef4444' } : {}} />
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
          <span>Swagger Docs</span>
          <ExternalLink size={13} style={{ opacity: 0.6 }} />
        </a>

        <button 
          className="btn btn-secondary" 
          onClick={onSeedDatabase}
          disabled={isSeeding}
          style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
        >
          <RefreshCw size={15} className={isSeeding ? 'spin' : ''} />
          <span>{isSeeding ? 'Resetting...' : 'Reset & Seed'}</span>
        </button>
      </div>
    </header>
  );
}
