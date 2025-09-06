const express = require('express');
const {
  getAllRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  fulfillRequest
} = require('../controllers/requestController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, restrictTo('admin', 'hospital'), getAllRequests)
  .post(protect, restrictTo('admin', 'hospital'), createRequest);

router.route('/:id')
  .get(protect, restrictTo('admin', 'hospital'), getRequest)
  .patch(protect, restrictTo('admin', 'hospital'), updateRequest)
  .delete(protect, restrictTo('admin'), deleteRequest);

router.route('/:id/fulfill')
  .post(protect, restrictTo('admin', 'hospital'), fulfillRequest);

module.exports = router;