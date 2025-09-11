const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  getRequestStats,
  donorResponse
} = require('../Controllers/requestController');

const router = express.Router();

router.route('/')
  .get(getRequests)
  .post(protect, createRequest);

router.route('/stats').get(getRequestStats);

router.route('/:id')
  .get(getRequest)
  .put(protect, updateRequest)
  .delete(protect, deleteRequest);

router.route('/:id/respond').put(protect, donorResponse);

module.exports = router;
