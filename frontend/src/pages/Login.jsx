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
    <div className="flex bg-slate-950 items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-primary/20 mb-4">
              POS
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-[2px]">Admin Access</h1>
            <p className="text-slate-500 text-sm">Secure Terminal Authorization Required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg text-center font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Terminal ID / Username</label>
              <input
                type="text"
                required
                className="form-input text-sm h-11"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="POS-ADMIN-01"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Access Key / Password</label>
              <input
                type="password"
                required
                className="form-input text-sm h-11"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn btn-blue w-full h-12 text-sm uppercase tracking-widest mt-2"
              disabled={loading}
            >
              {loading ? 'Verifying Path...' : 'Enter Dashboard'}
            </button>
          </form>

          <div className="pt-4 text-center">
            <span className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
              Encrypted Session • TLS 1.3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
