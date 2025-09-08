const express = require('express');
const {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  getRequestStats,
  donorResponse
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const { validateBloodRequest, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRequests)
  .post(validateBloodRequest, handleValidationErrors, createRequest);

router.route('/stats').get(getRequestStats);

router.route('/:id')
  .get(getRequest)
  .put(updateRequest)
  .delete(deleteRequest);

router.route('/:requestId/response').post(donorResponse);

module.exports = router;