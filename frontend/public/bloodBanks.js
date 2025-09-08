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

router.route('/')
  .get(getBloodBanks)
  .post(protect, authorize('hospital', 'admin'), createBloodBank);

router.route('/search').get(searchBloodBanks);
router.route('/stats').get(getBloodStats);

router.route('/:id')
  .get(getBloodBank)
  .put(protect, authorize('hospital', 'admin'), updateBloodBank)
  .delete(protect, authorize('hospital', 'admin'), deleteBloodBank);

router.route('/:id/inventory')
  .put(protect, authorize('hospital', 'admin'), updateInventory);

module.exports = router;