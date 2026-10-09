import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, UserCheck, LogOut, Smartphone, Monitor } from 'lucide-react';

const Header = ({ isMobileFrame, setIsMobileFrame }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* App Title & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              TalentHub
            </h1>
            <p className="text-[10px] text-indigo-400 font-medium tracking-wide uppercase">
              Recruitment Portal
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Frame Toggle Button (Mobile / Full view) */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-xs flex items-center gap-1.5 border border-slate-700/50"
            title="Toggle App Shell Mode"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Full Width</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Mobile Shell</span>
              </>
            )}
          </button>

          {/* User Profile Badge & Logout */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
                <span className="text-[10px] text-indigo-400 capitalize font-medium">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
