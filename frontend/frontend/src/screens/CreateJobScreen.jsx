import React, { useState, useEffect } from 'react';
import { jobAPI } from '../api';
import { PlusCircle, Upload, CheckCircle2, AlertCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const CreateJobScreen = ({ jobToEdit, onComplete, onCancel }) => {
  const isEditing = !!jobToEdit;

  const [title, setTitle] = useState(jobToEdit?.title || '');
  const [companyName, setCompanyName] = useState(jobToEdit?.companyName || '');
  const [description, setDescription] = useState(jobToEdit?.description || '');
  const [location, setLocation] = useState(jobToEdit?.location || '');
  const [jobType, setJobType] = useState(jobToEdit?.jobType || 'Full-time');
  const [salaryRange, setSalaryRange] = useState(jobToEdit?.salaryRange || '');
  const [category, setCategory] = useState(jobToEdit?.category || 'Software Engineering');
  const [maxApplicants, setMaxApplicants] = useState(jobToEdit?.maxApplicants || 5);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    jobToEdit?.companyLogo
      ? jobToEdit.companyLogo.startsWith('http')
        ? jobToEdit.companyLogo
        : `http://localhost:5000${jobToEdit.companyLogo}`
      : null
  );

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFeedback({ type: 'error', message: 'File size exceeds 5MB limit!' });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setFeedback({ type: '', message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !companyName || !description || !location || !salaryRange) {
      setFeedback({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('companyName', companyName);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('jobType', jobType);
      formData.append('salaryRange', salaryRange);
      formData.append('category', category);
      formData.append('maxApplicants', maxApplicants);

      if (logoFile) {
        formData.append('companyLogo', logoFile);
      }

      let res;
      if (isEditing) {
        res = await jobAPI.updateJob(jobToEdit._id, formData);
      } else {
        res = await jobAPI.createJob(formData);
      }

      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: isEditing ? 'Job updated successfully!' : 'Job posted successfully with logo image upload!',
        });
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 800);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save job posting.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto">
      {/* Back / Title Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">
            {isEditing ? 'Edit Job Requisition' : 'Post New Vacancy'}
          </h2>
          <p className="text-xs text-slate-400">
            Create a primary entity job posting with image upload & capacity threshold
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>

      {/* Form Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
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
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Logo Image Upload Field (Multer Integration) */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Company Logo / Header Image (Multer Upload)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 relative">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Choose Image (JPG, PNG, WEBP)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Max file size: 5MB. Processed server-side via Multer middleware.
                </p>
              </div>
            </div>
          </div>

          {/* Title & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior React Native Engineer"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="TechCorp Global"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Location & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA or Remote"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Salary Range *
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="$110,000 - $135,000 / year"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Type, Category & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Software Engineering"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Capacity Threshold *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={maxApplicants}
                onChange={(e) => setMaxApplicants(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Description & Requirements *
            </label>
            <textarea
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail job roles, responsibilities, and required candidate qualifications..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
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
                <PlusCircle className="w-4 h-4" />
                <span>{isEditing ? 'Update Job Posting' : 'Publish Job Posting'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJobScreen;
