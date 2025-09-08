const express = require('express');
const {
  getMyProfile,
  updateProfile,
  getDonors,
  getDonor,
  updateDonorStatus,
  recordDonation,
  getNearbyRequests,
  getDonorStats
} = require('../controllers/donorController');
const { protect, authorize, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateDonorInfo, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.route('/me')
  .get(getMyProfile)
  .put(upload.single('idImage'), validateDonorInfo, handleValidationErrors, updateProfile);

router.route('/donate').post(recordDonation);
router.route('/nearby-requests').get(getNearbyRequests);

// Admin routes
router.use(adminAuth);

router.route('/')
  .get(getDonors);

router.route('/stats').get(getDonorStats);

router.route('/:id')
  .get(getDonor)
  .put(updateDonorStatus);

module.exports = router;