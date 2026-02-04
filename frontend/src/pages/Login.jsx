import React, { useState } from 'react';
import { api } from '../services/api';
import { ShieldCheck, Lock, User as UserIcon } from 'lucide-react';

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
      setError('AUTHORIZATION DENIED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#020308] items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-sm">
        <div className="bg-[#080914] border border-white/5 rounded-2xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">InterPOS Hub</h1>
              <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[4px]">Secure Admin Access</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] py-2 rounded-lg text-center font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <UserIcon size={10} className="text-blue-500" /> Identity
              </label>
              <input
                type="text"
                required
                className="form-input h-11"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="POS-ADMIN-01"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <Lock size={10} className="text-blue-500" /> Protocol Key
              </label>
              <input
                type="password"
                required
                className="form-input h-11"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn btn-blue w-full h-11 text-xs font-bold uppercase tracking-widest mt-2"
              disabled={loading}
            >
              {loading ? 'Authorizing Path...' : 'Initialize Session'}
            </button>
          </form>

          <div className="pt-4 text-center border-t border-white/5">
            <span className="text-[8px] text-slate-700 font-mono tracking-widest uppercase">
              Secure Terminal Connection • AES-256
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
