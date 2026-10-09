import React from 'react';
import { MapPin, DollarSign, Users, Briefcase, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const JobCard = ({ job, onSelect, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user && (user._id === job.postedBy?._id || user._id === job.postedBy || user.role === 'admin');

  // Backend image URL resolution
  const imageUrl = job.companyLogo
    ? job.companyLogo.startsWith('http')
      ? job.companyLogo
      : `http://localhost:5000${job.companyLogo}`
    : null;

  const capacityPercent = Math.min(
    100,
    Math.round(((job.currentApplicants || 0) / (job.maxApplicants || 1)) * 100)
  );

  return (
    <div
      onClick={() => onSelect(job)}
      className="glass-card rounded-2xl p-5 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 transition-all group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {/* Company Logo Image / Fallback */}
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={job.companyName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <Briefcase className="w-6 h-6 text-indigo-400" />
            )}
          </div>

          <div>
            <h3 className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors text-base line-clamp-1">
              {job.title}
            </h3>
            <p className="text-xs font-semibold text-slate-400">{job.companyName}</p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shrink-0 ${
            job.status === 'Open' ? 'badge-open' : 'badge-closed'
          }`}
        >
          {job.status}
        </span>
      </div>

      {/* Info Pills */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mb-4">
        <span className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          {job.location}
        </span>
        <span className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          {job.salaryRange}
        </span>
        <span className="bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/20 font-medium">
          {job.jobType}
        </span>
      </div>

      {/* Business Logic Capacity Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Capacity
          </span>
          <span className={`font-bold ${job.currentApplicants >= job.maxApplicants ? 'text-rose-400' : 'text-slate-300'}`}>
            {job.currentApplicants || 0} / {job.maxApplicants} applicants
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              job.currentApplicants >= job.maxApplicants
                ? 'bg-rose-500'
                : capacityPercent > 70
                ? 'bg-amber-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span className="text-[11px] text-slate-500">
          Category: {job.category || 'General'}
        </span>

        {isOwner && (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(job)}
              className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
              title="Edit Job"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(job._id)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
              title="Delete Job"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
