const express = require('express');
const {
  getAllDonors,
  getDonor,
  createDonor,
  updateDonor,
  deleteDonor,
  searchDonors
} = require('../controllers/donorController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, restrictTo('admin', 'hospital'), getAllDonors)
  .post(createDonor);

router.route('/search').get(protect, restrictTo('admin', 'hospital'), searchDonors);

router.route('/:id')
  .get(protect, restrictTo('admin', 'hospital'), getDonor)
  .patch(protect, updateDonor)
  .delete(protect, restrictTo('admin'), deleteDonor);

module.exports = router;