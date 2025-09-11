const express = require('express');
const {
  getBloodBanks,
  getBloodBank,
  createBloodBank,
  updateBloodBank,
  deleteBloodBank,
  updateInventory,
  searchBloodBanks,
  getBloodStats
} = require('../controllers/bloodBankController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All blood banks
router.route('/')
  .get(getBloodBanks)
  .post(protect, authorize('hospital', 'admin'), createBloodBank);

// Search & stats
router.route('/search').get(searchBloodBanks);
router.route('/stats').get(getBloodStats);

// Single blood bank operations
router.route('/:id')
  .get(getBloodBank)
  .put(protect, authorize('hospital', 'admin'), updateBloodBank)
  .delete(protect, authorize('hospital', 'admin'), deleteBloodBank);

// Update inventory
router.route('/:id/inventory')
  .put(protect, authorize('hospital', 'admin'), updateInventory);

module.exports = router;
