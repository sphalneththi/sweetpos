import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login, theme, toggleTheme, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/pos', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the offline local database for authentication
      const user = await window.electronAPI.authLogin(username.trim(), password);

      // We don't have JWT tokens offline, so we pass dummy tokens 
      // The sync engine will generate a real token when authenticating with the cloud later
      login(user, 'offline-access-token', 'offline-refresh-token');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-slide-up">
        {/* Theme Toggle */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          style={{ position: 'absolute', top: 16, right: 16 }}
          title="Toggle theme"
          id="theme-toggle"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="login-logo">🍬</div>
        <h1 className="login-title">SweetPOS</h1>
        <p className="login-subtitle">Sweet Shop Point of Sale System</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-danger-light)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              className="input input-lg"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="input input-lg"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            className="btn btn-primary btn-xl w-full"
            type="submit"
            disabled={loading}
            style={{ marginTop: 'var(--space-4)' }}
          >
            {loading ? (
              <span style={{ animation: 'pulse 1.5s infinite' }}>Signing in...</span>
            ) : (
              <>🔐 Sign In</>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-6)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
          }}
        >
          SweetPOS v1.0 · Production-Grade POS System
        </p>
      </div>
    </div>
  );
};
