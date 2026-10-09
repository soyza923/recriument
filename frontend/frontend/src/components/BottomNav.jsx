import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, PlusCircle, FileText, User } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const isEmployerOrAdmin = user?.role === 'employer' || user?.role === 'admin';

  return (
    <nav className="glass-panel fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 py-2 px-4 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Jobs Tab */}
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'jobs' ? 'text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Jobs</span>
        </button>

        {/* Create Job Tab (Employer/Admin) */}
        {isEmployerOrAdmin && (
          <button
            onClick={() => setActiveTab('create-job')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'create-job' ? 'text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Post Job</span>
          </button>
        )}

        {/* Applications Tab */}
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'applications' ? 'text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[11px] font-semibold">
            {isEmployerOrAdmin ? 'Candidates' : 'My Apps'}
          </span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'profile' ? 'text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
