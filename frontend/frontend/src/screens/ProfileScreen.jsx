import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield, LogOut, CheckCircle, Database, Server, Smartphone } from 'lucide-react';
import api from '../api';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [apiHealth, setApiHealth] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/');
        setApiHealth(res.data);
      } catch (err) {
        setApiHealth({ status: 'Offline', error: err.message });
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-100">User Profile & System Info</h2>
        <p className="text-xs text-slate-400">Account metadata & backend API connectivity dashboard</p>
      </div>

      {/* User Profile Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 mb-6 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-indigo-500/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{user?.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Role: {user?.role}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Authenticated (JWT)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" /> Email Address
            </span>
            <span className="font-semibold text-slate-200">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" /> Phone Number
            </span>
            <span className="font-semibold text-slate-200">{user?.phone || 'Not specified'}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" /> User ID
            </span>
            <span className="font-mono text-[11px] text-slate-400">{user?._id}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full mt-6 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 border border-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Session</span>
        </button>
      </div>

      {/* Backend API Health Status Dashboard */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        <h4 className="font-bold text-slate-200 text-sm mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          System Status & Deployment
        </h4>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Backend REST API</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {apiHealth ? apiHealth.status || 'Connected' : 'Connecting...'}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Database Engine</span>
            <span className="text-indigo-400 font-bold flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              MongoDB Atlas
            </span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 col-span-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Mobile Tech Stack</span>
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              React Native / React Native Web (Express + Mongoose + JWT)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
