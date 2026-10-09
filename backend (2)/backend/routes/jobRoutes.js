const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes (Employers & Admins)
router.post(
  '/',
  protect,
  authorize('employer', 'admin'),
  upload.single('companyLogo'),
  createJob
);

router.put(
  '/:id',
  protect,
  authorize('employer', 'admin'),
  upload.single('companyLogo'),
  updateJob
);

router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

module.exports = router;
