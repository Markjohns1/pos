import React, { useState } from 'react';
import { api } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login(formData.username, formData.password);
      localStorage.setItem('pos_token', result.access_token);
      onLoginSuccess();
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="logo-icon">POS</div>
          <h1>System Admin</h1>
          <p>Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
          background: var(--bg-dark);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 48px;
        }
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo-icon {
          margin: 0 auto 16px;
          width: 50px;
          height: 50px;
          font-size: 1rem;
        }
        .login-header h1 {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }
        .login-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 0.85rem;
          text-align: center;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .form-group label {
          margin-bottom: 8px;
          display: block;
        }
        button {
          width: 100%;
          margin-top: 16px;
          height: 48px;
        }
      `}</style>
    </div>
  );
};

export default Login;
