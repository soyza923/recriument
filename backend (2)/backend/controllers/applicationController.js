const Application = require('../models/Application');
const JobPosting = require('../models/JobPosting');

// @desc    Apply for a job (Create Application) with Business Logic Validation
// @route   POST /api/applications
// @access  Private (Jobseeker)
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, experienceYears, resumeUrl } = req.body;

    if (!jobId || !coverLetter || experienceYears === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide jobId, coverLetter, and experienceYears',
      });
    }

    // 1. Fetch referenced Job Posting
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Target job posting not found with ID ${jobId}`,
      });
    }

    // 2. Business Logic Rule 1: Duplicate Application Check (409 Conflict)
    const existingApp = await Application.findOne({
      jobId: job._id,
      applicantId: req.user.id,
    });

    if (existingApp) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this job posting',
      });
    }

    // 3. Business Logic Rule 2: Capacity & Status Check (400 Bad Request)
    if (job.status === 'Closed' || job.currentApplicants >= job.maxApplicants) {
      return res.status(400).json({
        success: false,
        message: `Application rejected! Job posting '${job.title}' has reached maximum applicant capacity (${job.maxApplicants}/${job.maxApplicants}) or is closed.`,
      });
    }

    // 4. Create Application
    const application = await Application.create({
      jobId: job._id,
      applicantId: req.user.id,
      applicantName: req.user.name,
      applicantEmail: req.user.email,
      coverLetter,
      experienceYears: Number(experienceYears),
      resumeUrl: resumeUrl || '',
      status: 'Pending',
    });

    // 5. Business Logic Rule 3 & 4: Increment applicant count & auto-close if full
    job.currentApplicants += 1;
    if (job.currentApplicants >= job.maxApplicants) {
      job.status = 'Closed';
    }
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
      jobStatusUpdated: {
        currentApplicants: job.currentApplicants,
        maxApplicants: job.maxApplicants,
        status: job.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications (filtered by user role / jobId)
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    const { jobId, status } = req.query;
    let query = {};

    if (req.user.role === 'jobseeker') {
      // Jobseeker sees only their own applications
      query.applicantId = req.user.id;
    } else if (req.user.role === 'employer') {
      // Employer sees applications for jobs they posted
      const myJobs = await JobPosting.find({ postedBy: req.user.id }).select('_id');
      const myJobIds = myJobs.map((j) => j._id);
      query.jobId = { $in: myJobIds };
    }

    if (jobId) {
      query.jobId = jobId;
    }

    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('jobId', 'title companyName location salaryRange status maxApplicants currentApplicants')
      .populate('applicantId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title companyName location salaryRange status companyLogo')
      .populate('applicantId', 'name email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application not found with ID ${req.params.id}`,
      });
    }

    // Auth check: applicant or employer who posted job or admin
    const job = await JobPosting.findById(application.jobId);
    const isApplicant = application.applicantId._id.toString() === req.user.id;
    const isJobOwner = job && job.postedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isJobOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status or details (Status/State change)
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res, next) => {
  try {
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application not found with ID ${req.params.id}`,
      });
    }

    const { status, coverLetter, experienceYears } = req.body;

    // Check permissions based on fields being updated
    if (status) {
      // Status update: only job owner or admin
      const job = await JobPosting.findById(application.jobId);
      if (!job || (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Only the employer who posted this job or an admin can update application status',
        });
      }
      application.status = status;
    }

    if (coverLetter || experienceYears !== undefined) {
      // Content update: only applicant
      if (application.applicantId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only the applicant can modify application contents',
        });
      }
      if (coverLetter) application.coverLetter = coverLetter;
      if (experienceYears !== undefined) application.experienceYears = Number(experienceYears);
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Withdraw application with Business Logic Capacity Release
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application not found with ID ${req.params.id}`,
      });
    }

    // Permission check: applicant, job owner, or admin
    const job = await JobPosting.findById(application.jobId);
    const isApplicant = application.applicantId.toString() === req.user.id;
    const isJobOwner = job && job.postedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isJobOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw/delete this application',
      });
    }

    await application.deleteOne();

    // Business Logic Rule 5: Release capacity on target job & reopen if needed
    if (job) {
      job.currentApplicants = Math.max(0, job.currentApplicants - 1);
      if (job.status === 'Closed' && job.currentApplicants < job.maxApplicants) {
        job.status = 'Open';
      }
      await job.save();
    }

    res.status(200).json({
      success: true,
      message: 'Application withdrawn/deleted successfully and capacity updated',
      deletedApplicationId: req.params.id,
      jobStatusUpdated: job
        ? {
            currentApplicants: job.currentApplicants,
            maxApplicants: job.maxApplicants,
            status: job.status,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
