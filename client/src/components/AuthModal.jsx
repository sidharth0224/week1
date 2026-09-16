import React, { useState } from 'react';
import { X, Loader2, AlertTriangle, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setFormData({ username: '', email: '', password: '' });
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onAuthSuccess(mode, formData);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <button className="modal-close" onClick={onClose} disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          margin: '0'
        }}>
          <button
            onClick={() => switchMode('login')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              color: mode === 'login' ? '#6366f1' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderBottom: mode === 'login' ? '2px solid #6366f1' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <LogIn size={15} /> Login
          </button>
          <button
            onClick={() => switchMode('signup')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              color: mode === 'signup' ? '#6366f1' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderBottom: mode === 'signup' ? '2px solid #6366f1' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <UserPlus size={15} /> Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-banner">
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="username"
                required
                className="input-control"
                placeholder="John Doe"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="input-control"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={mode === 'signup' ? 6 : 1}
              className="input-control"
              placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter password'}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="spin" /> Authenticating...</>
            ) : mode === 'login' ? (
              <><LogIn size={16} /> Log In</>
            ) : (
              <><UserPlus size={16} /> Create Account</>
            )}
          </button>

          {mode === 'login' && (
            <p style={{
              textAlign: 'center',
              fontSize: '0.78rem',
              color: '#64748b',
              marginTop: '1rem'
            }}>
              Default: <strong style={{ color: '#94a3b8' }}>admin@example.com</strong> / <strong style={{ color: '#94a3b8' }}>admin123</strong>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
