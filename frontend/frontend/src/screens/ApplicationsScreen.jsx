import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import ApplicationCard from '../components/ApplicationCard';
import { FileText, RefreshCw, Filter, CheckCircle } from 'lucide-react';

const ApplicationsScreen = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await applicationAPI.getApplications(params);
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch applications from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await applicationAPI.updateApplication(id, { status: newStatus });
      if (res.data.success) {
        fetchApplications();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
    }
  };

  const handleWithdrawApplication = async (id) => {
    if (window.confirm('Are you sure you want to withdraw this application? This will free up applicant capacity for this job.')) {
      try {
        const res = await applicationAPI.deleteApplication(id);
        if (res.data.success) {
          fetchApplications();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to withdraw application.');
      }
    }
  };

  const isEmployerOrAdmin = user?.role === 'employer' || user?.role === 'admin';

  return (
    <div className="pb-24 pt-4 px-4 max-w-3xl mx-auto">
      {/* Screen Title */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">
            {isEmployerOrAdmin ? 'Candidate Submissions' : 'My Job Applications'}
          </h2>
          <p className="text-xs text-slate-400">
            {isEmployerOrAdmin
              ? 'Review candidate profiles and manage interview status pipelines'
              : 'Track status changes and manage your submitted applications'}
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
          title="Refresh Applications"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 text-xs mb-4">
        <span className="text-slate-500 font-semibold flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {['', 'Pending', 'Shortlisted', 'Accepted', 'Rejected'].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-xl border shrink-0 font-medium transition-all ${
              statusFilter === status
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {status || 'All Statuses'}
          </button>
        ))}
      </div>

      {/* Content area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs">Loading application records...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-6 rounded-2xl text-center text-rose-400 text-xs">
          <p>{error}</p>
          <button onClick={fetchApplications} className="mt-3 px-4 py-2 bg-slate-800 rounded-xl">
            Retry
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-card p-10 rounded-3xl text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-3 text-slate-500">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-200 text-base mb-1">No Applications Found</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {isEmployerOrAdmin
              ? 'No candidate applications have been received for your job postings yet.'
              : 'You have not submitted any job applications yet.'}
          </p>
        </div>
      ) : (
        <div>
          {applications.map((app) => (
            <ApplicationCard
              key={app._id}
              application={app}
              onUpdateStatus={handleUpdateStatus}
              onWithdraw={handleWithdrawApplication}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsScreen;
