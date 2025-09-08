const express = require('express');
const {
  getAllCamps,
  getCamp,
  createCamp,
  updateCamp,
  deleteCamp,
  registerForCamp
} = require('../controllers/campController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getAllCamps)
  .post(protect, restrictTo('admin'), createCamp);

router.route('/:id')
  .get(getCamp)
  .patch(protect, restrictTo('admin'), updateCamp)
  .delete(protect, restrictTo('admin'), deleteCamp);

router.route('/:id/register')
  .post(protect, registerForCamp);

module.exports = router;