const JobPosting = require('../models/JobPosting');
const Application = require('../models/Application');
const path = require('path');
const fs = require('fs');

// @desc    Create a new job posting with optional company logo image upload
// @route   POST /api/jobs
// @access  Private (Employer / Admin)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      description,
      location,
      jobType,
      salaryRange,
      category,
      maxApplicants,
    } = req.body;

    let companyLogo = '';
    if (req.file) {
      companyLogo = `/uploads/${req.file.filename}`;
    }

    const job = await JobPosting.create({
      title,
      companyName,
      description,
      location,
      jobType: jobType || 'Full-time',
      salaryRange,
      category: category || 'Software Development',
      maxApplicants: maxApplicants ? Number(maxApplicants) : 5,
      companyLogo,
      postedBy: req.user.id,
      status: 'Open',
    });

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all job postings (with search & filter)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const { search, jobType, status, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const jobs = await JobPosting.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job posting by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await JobPosting.findById(req.params.id).populate(
      'postedBy',
      'name email phone'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job posting not found with ID ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job posting
// @route   PUT /api/jobs/:id
// @access  Private (Employer/Admin, owner check)
const updateJob = async (req, res, next) => {
  try {
    let job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job posting not found with ID ${req.params.id}`,
      });
    }

    // Authorization check: only owner or admin can update
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'User is not authorized to update this job posting',
      });
    }

    const updateFields = { ...req.body };

    if (req.file) {
      updateFields.companyLogo = `/uploads/${req.file.filename}`;
      // Remove old logo file if exists locally
      if (job.companyLogo && job.companyLogo.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', job.companyLogo);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {
            console.warn('Could not delete old image file:', e.message);
          }
        }
      }
    }

    // Business Logic: If currentApplicants >= maxApplicants, status must flip to Closed
    if (updateFields.maxApplicants) {
      const newMax = Number(updateFields.maxApplicants);
      if (job.currentApplicants >= newMax) {
        updateFields.status = 'Closed';
      } else if (job.status === 'Closed' && job.currentApplicants < newMax) {
        updateFields.status = 'Open';
      }
    }

    job = await JobPosting.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Employer/Admin, owner check)
const deleteJob = async (req, res, next) => {
  try {
    const job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job posting not found with ID ${req.params.id}`,
      });
    }

    // Authorization check
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'User is not authorized to delete this job posting',
      });
    }

    // Remove logo file if exists
    if (job.companyLogo && job.companyLogo.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', job.companyLogo);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete image file:', e.message);
        }
      }
    }

    // Cascade delete related applications
    await Application.deleteMany({ jobId: job._id });
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting and all associated applications deleted successfully',
      deletedJobId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
