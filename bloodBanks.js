const express = require('express');
const {
  getAllHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital,
  searchHospitals,
  updateBloodInventory
} = require('../controllers/bloodBankController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getAllHospitals)
  .post(protect, restrictTo('admin'), createHospital);

router.route('/search').get(searchHospitals);

router.route('/:id')
  .get(getHospital)
  .patch(protect, restrictTo('admin'), updateHospital)
  .delete(protect, restrictTo('admin'), deleteHospital);

router.route('/:id/inventory')
  .patch(protect, restrictTo('admin', 'hospital'), updateBloodInventory);

module.exports = router;