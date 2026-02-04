import React, { useState } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Fingerprint, Lock, Cpu, Globe } from 'lucide-react';

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
      setError('AUTHORIZATION DENIED: INVALID CREDENTIALS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#020308] items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Tech Details */}
      <div className="absolute top-10 left-10 opacity-20 hidden lg:block">
        <div className="flex flex-col gap-2 font-mono text-[8px] text-blue-500 font-bold uppercase tracking-widest leading-none">
          <span>NETWORK_STATUS: ENCRYPTED</span>
          <span>NODE_ID: HUB-A1-ZETA</span>
          <span>SECURE_CHIP: ACTIVE</span>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 opacity-20 hidden lg:block">
        <Globe size={120} strokeWidth={0.5} className="text-blue-500" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-[#080914] border border-white/5 rounded-[32px] shadow-2xl p-10 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 italic font-black text-[40px] select-none uppercase tracking-tighter">VAULT</div>

          <div className="text-center space-y-4 pt-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 mb-6">
              <Fingerprint size={32} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-widest text-white uppercase italic">INTERPOS</h1>
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[4px]">System Registry</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] px-4 py-3 rounded-xl text-center font-black tracking-widest flex items-center justify-center gap-2">
                <ShieldAlert size={12} /> {error}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={10} strokeWidth={3} className="text-blue-500" /> Authorized ID
                </label>
              </div>
              <input
                type="text"
                required
                className="form-input h-14 bg-black/40 border-white/5 rounded-2xl font-bold tracking-widest placeholder:text-slate-800"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="POS-ADMIN-01"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={10} strokeWidth={3} className="text-blue-500" /> Secure Key
                </label>
              </div>
              <input
                type="password"
                required
                className="form-input h-14 bg-black/40 border-white/5 rounded-2xl font-bold tracking-widest placeholder:text-slate-800"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn btn-blue w-full h-14 text-xs font-black uppercase tracking-[3px] mt-4 rounded-2xl italic"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Cpu className="animate-spin-slow" size={14} /> AUTHORIZING...
                </div>
              ) : 'Open Session'}
            </button>
          </form>

          <div className="pt-4 text-center border-t border-white/5">
            <span className="text-[8px] text-slate-700 font-mono tracking-[4px] uppercase font-black">
              TLS_PROTOCOL_v3 • HUB_LINK:STABLE
            </span>
          </div>
        </div>

        <p className="text-center mt-8 text-[9px] font-black text-slate-800 uppercase tracking-[10px]">
          International Commerce Shield
        </p>
      </div>
    </div>
  );
};

export default Login;
