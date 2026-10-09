const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
      default: 'Full-time',
    },
    salaryRange: {
      type: String,
      required: [true, 'Salary range is required'],
    },
    category: {
      type: String,
      required: [true, 'Job category is required'],
      default: 'Software Development',
    },
    maxApplicants: {
      type: Number,
      required: [true, 'Maximum applicants threshold is required'],
      min: [1, 'Maximum applicants must be at least 1'],
      default: 5,
    },
    currentApplicants: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    companyLogo: {
      type: String,
      default: '',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobPosting', jobPostingSchema);
