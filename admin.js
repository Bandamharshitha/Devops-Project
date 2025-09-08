const express = require('express');
const {
  login,
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAnalytics,
  sendBroadcast,
  exportData
} = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/dashboard', adminAuth, getDashboardStats);
router.get('/users', adminAuth, getUsers);
router.put('/users/:id/status', adminAuth, updateUserStatus);
router.get('/analytics', adminAuth, getAnalytics);
router.post('/broadcast', adminAuth, sendBroadcast);
router.get('/export/:type', adminAuth, exportData);

module.exports = router;