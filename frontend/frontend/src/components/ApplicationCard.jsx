import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Calendar, Mail, User, Award, Trash2, CheckCircle2 } from 'lucide-react';

const ApplicationCard = ({ application, onUpdateStatus, onWithdraw }) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const isEmployerOrAdmin = user?.role === 'employer' || user?.role === 'admin';
  const job = application.jobId || {};
  const applicant = application.applicantId || {};

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    await onUpdateStatus(application._id, newStatus);
    setUpdating(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'badge-shortlisted';
      case 'Accepted':
        return 'badge-accepted';
      case 'Rejected':
        return 'badge-rejected';
      default:
        return 'badge-pending';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 mb-4 border border-slate-800 hover:border-slate-700 transition-all">
      {/* Header: Referenced Job Info */}
      <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{job.companyName || 'Company'}</span>
          </div>
          <h4 className="font-bold text-slate-100 text-base">{job.title || 'Job Posting'}</h4>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(
            application.status
          )}`}
        >
          {application.status}
        </span>
      </div>

      {/* Applicant Info (Visible to Employer / Admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 mb-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200">
            {application.applicantName || applicant.name || 'Candidate'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400 truncate">
            {application.applicantEmail || applicant.email || ''}
          </span>
        </div>
        <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Experience: <strong className="text-slate-200">{application.experienceYears} Years</strong>
          </span>
        </div>
      </div>

      {/* Cover Letter Snippet */}
      <div className="mb-4">
        <p className="text-xs font-medium text-slate-400 mb-1">Cover Letter / Note:</p>
        <p className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl italic border border-slate-800/80 leading-relaxed">
          "{application.coverLetter}"
        </p>
      </div>

      {/* Footer & Status Controls */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Applied {new Date(application.createdAt || application.appliedAt).toLocaleDateString()}</span>
        </div>

        {/* Employer Status Transition Selector */}
        {isEmployerOrAdmin ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Status:</span>
            <select
              value={application.status}
              onChange={handleStatusChange}
              disabled={updating}
              className="bg-slate-800 text-slate-200 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="Pending">Pending</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        ) : (
          /* Jobseeker Withdraw Action Button */
          <button
            onClick={() => onWithdraw(application._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Withdraw App</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
