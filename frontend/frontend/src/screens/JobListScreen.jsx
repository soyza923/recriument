import React, { useState, useEffect } from 'react';
import { jobAPI } from '../api';
import JobCard from '../components/JobCard';
import { Search, Filter, RefreshCw, Briefcase, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const JobListScreen = ({ onSelectJob, onEditJob, onCreateJobClick }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedType) params.jobType = selectedType;
      if (selectedStatus) params.status = selectedStatus;

      const res = await jobAPI.getJobs(params);
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load job postings from backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedType, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting? All related applications will be deleted.')) {
      try {
        const res = await jobAPI.deleteJob(id);
        if (res.data.success) {
          fetchJobs();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete job posting');
      }
    }
  };

  const isEmployerOrAdmin = user?.role === 'employer' || user?.role === 'admin';

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto">
      {/* Search & Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Explore Openings</h2>
            <p className="text-xs text-slate-400">Discover active job requisitions and apply</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchJobs}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
              title="Refresh Listings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {isEmployerOrAdmin && (
              <button
                onClick={onCreateJobClick}
                className="btn-primary text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post Job</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative mb-4">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, company, or city..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-24 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setSelectedType('')}
            className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
              selectedType === ''
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            All Types
          </button>
          {['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type === selectedType ? '' : type)}
              className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
                selectedType === type
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
          <button
            onClick={() => setSelectedStatus(selectedStatus === 'Open' ? '' : 'Open')}
            className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
              selectedStatus === 'Open'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Open Only
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-medium">Fetching job listings from backend API...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-6 rounded-2xl text-center text-rose-400 text-xs">
          <p>{error}</p>
          <button
            onClick={fetchJobs}
            className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200"
          >
            Try Again
          </button>
        </div>
      ) : jobs.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-10 rounded-3xl text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-3 text-slate-500">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-200 text-base mb-1">No Jobs Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            No active job postings match your search filters. Try clearing filters or post a new job.
          </p>
          {isEmployerOrAdmin && (
            <button
              onClick={onCreateJobClick}
              className="btn-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl"
            >
              Post First Job
            </button>
          )}
        </div>
      ) : (
        /* Job List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onSelect={onSelectJob}
              onEdit={onEditJob}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobListScreen;
