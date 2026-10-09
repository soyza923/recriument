import React, { useState, useEffect } from 'react';
import { applicationAPI, jobAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, DollarSign, Users, Briefcase, Calendar, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

const JobDetailScreen = ({ jobId, onBack, onAppliedSuccess }) => {
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await jobAPI.getJobById(jobId);
      if (res.data.success) {
        setJob(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      setFeedback({ type: 'error', message: 'Failed to fetch job details from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) fetchJobDetails();
  }, [jobId]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!coverLetter) {
      setFeedback({ type: 'error', message: 'Please provide a cover letter snippet.' });
      return;
    }
    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await applicationAPI.apply({
        jobId: job._id,
        coverLetter,
        experienceYears: Number(experienceYears),
      });

      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: 'Application submitted successfully! Your application has been logged.',
        });
        setCoverLetter('');
        // Re-fetch job details to update live applicant capacity & status
        fetchJobDetails();
        if (onAppliedSuccess) onAppliedSuccess();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <p className="text-xs">Loading job requisition details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        <p>Job posting not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-slate-200">
          Back to Listings
        </button>
      </div>
    );
  }

  const imageUrl = job.companyLogo
    ? job.companyLogo.startsWith('http')
      ? job.companyLogo
      : `http://localhost:5000${job.companyLogo}`
    : null;

  const isClosed = job.status === 'Closed' || job.currentApplicants >= job.maxApplicants;
  const isJobseeker = user?.role === 'jobseeker';

  return (
    <div className="pb-28 pt-4 px-4 max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition-colors mb-4 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </button>

      {/* Main Job Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 mb-6 border border-slate-800 relative overflow-hidden">
        {/* Background Accent Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Company Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              {imageUrl ? (
                <img src={imageUrl} alt={job.companyName} className="w-full h-full object-cover" />
              ) : (
                <Briefcase className="w-8 h-8 text-indigo-400" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">{job.title}</h1>
              <p className="text-xs font-bold text-indigo-400 mt-0.5">{job.companyName}</p>
            </div>
          </div>

          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${
              job.status === 'Open' ? 'badge-open' : 'badge-closed'
            }`}
          >
            {job.status}
          </span>
        </div>

        {/* Key Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Location</span>
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {job.location}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Salary</span>
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              {job.salaryRange}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Job Type</span>
            <span className="text-xs font-semibold text-indigo-300">{job.jobType}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Capacity</span>
            <span className={`text-xs font-semibold ${isClosed ? 'text-rose-400' : 'text-emerald-400'}`}>
              {job.currentApplicants} / {job.maxApplicants} max
            </span>
          </div>
        </div>

        {/* Job Description */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-200 mb-2">Job Description & Requirements</h3>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/30 p-4 rounded-2xl border border-slate-800/80">
            {job.description}
          </p>
        </div>
      </div>

      {/* Application Form Section (Jobseeker Mode) */}
      {isJobseeker && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" />
            Submit Job Application
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Complete the form below to apply for this position.
          </p>

          {/* Feedback Banner */}
          {feedback.message && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs flex items-center gap-3 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Capacity Full / Closed Business Logic Warning Banner */}
          {isClosed ? (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1">Business Rule Enforcement: Applications Closed</strong>
                <span>
                  This job posting has reached its maximum applicant capacity limit ({job.maxApplicants}/{job.maxApplicants}) or has been marked as Closed. New application submissions are automatically restricted by the server.
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Years of Relevant Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cover Letter / Introduction Note
                </label>
                <textarea
                  rows="4"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why you are a great fit for this position..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || isClosed}
                className="w-full btn-primary text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetailScreen;
