import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, AlertCircle } from 'lucide-react';

const LoginScreen = ({ onNavigateRegister }) => {
  const { login, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-[80vh] px-4 py-8">
      <div className="max-w-md mx-auto w-full glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to manage job requisitions and candidate applications
          </p>
        </div>

        {/* Error Alert */}
        {(errorMsg || authError) && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg || authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 mt-6 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Help */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-[11px] font-semibold text-slate-400 mb-2">
            Demo Test Accounts (Password: <code className="text-indigo-300">password123</code>):
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => {
                setEmail('hr@techcorp.com');
                setPassword('password123');
              }}
              className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg text-indigo-300 border border-slate-700"
            >
              Employer: hr@techcorp.com
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('alex.rivera@gmail.com');
                setPassword('password123');
              }}
              className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg text-emerald-300 border border-slate-700"
            >
              Jobseeker: alex.rivera@gmail.com
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onNavigateRegister}
            className="text-indigo-400 font-bold hover:underline"
          >
            Create one now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
