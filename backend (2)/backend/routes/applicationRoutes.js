const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

// All application routes are protected
router.use(protect);

router.post('/', applyForJob);
router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

module.exports = router;
