
const Admin = require('../models/Admin');
const User = require('../models/user');
const Donor = require('../models/Donor');
const BloodBank = require('../models/BloodBank');
const BloodRequest = require('../models/BloodRequest');
const jwt = require('jsonwebtoken');

// Generate JWT Token for admin
const sendTokenResponse = (admin, statusCode, res) => {
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      role: admin.role
    }
  });
};

// Admin login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate username & password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Check for admin
    const admin = await Admin.findOne({ username }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(admin, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalBloodBanks,
      totalRequests,
      activeRequests,
      fulfilledRequests,
      totalDonations
    ] = await Promise.all([
      User.countDocuments(),
      Donor.countDocuments(),
      BloodBank.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: { $in: ['Pending', 'Processing'] } }),
      BloodRequest.countDocuments({ status: 'Fulfilled' }),
      Donor.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$totalDonations' }
          }
        }
      ])
    ]);

    // Get blood inventory summary
    const bloodInventory = await BloodBank.aggregate([
      { $unwind: '$inventory' },
      {
        $group: {
          _id: '$inventory.bloodType',
          totalUnits: { $sum: '$inventory.units' },
          criticalCount: {
            $sum: {
              $cond: [
                { $lte: ['$inventory.units', '$inventory.criticalLevel'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          bloodType: '$_id',
          totalUnits: 1,
          criticalCount: 1,
          status: {
            $cond: [
              { $eq: ['$totalUnits', 0] },
              'not-available',
              {
                $cond: [
                  { $gt: ['$criticalCount', 0] },
                  'low',
                  'available'
                ]
              }
            ]
          },
          _id: 0
        }
      }
    ]);

    // Get recent activities
    const recentRequests = await BloodRequest.find()
      .populate('requester', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentDonations = await Donor.find()
      .populate('userId', 'name')
      .sort({ lastDonation: -1 })
      .limit(5)
      .select('donationHistory userId lastDonation');

    res.status(200).json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          donors: totalDonors,
          bloodBanks: totalBloodBanks,
          requests: totalRequests,
          activeRequests,
          fulfilledRequests,
          donations: totalDonations[0]?.total || 0
        },
        bloodInventory,
        recentActivities: {
          requests: recentRequests,
          donations: recentDonations
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: status === 'active' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get system analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    // Monthly request statistics
    const monthlyRequests = await BloodRequest.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          fulfilled: {
            $sum: { $cond: [{ $eq: ['$status', 'Fulfilled'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Donor demographics
    const donorDemographics = await Donor.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: {
            bloodType: '$user.bloodType',
            ageGroup: {
              $switch: {
                branches: [
                  { case: { $lte: ['$personalInfo.age', 25] }, then: '18-25' },
                  { case: { $lte: ['$personalInfo.age', 35] }, then: '26-35' },
                  { case: { $lte: ['$personalInfo.age', 45] }, then: '36-45' },
                  { case: { $lte: ['$personalInfo.age', 55] }, then: '46-55' },
                  { case: { $lte: ['$personalInfo.age', 65] }, then: '56-65' }
                ],
                default: 'Unknown'
              }
            }
          },
          count: { $sum: 1 },
          avgDonations: { $avg: '$totalDonations' }
        }
      }
    ]);

    // Geographic distribution
    const geographicDistribution = await User.aggregate([
      { $match: { 'location.state': { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$location.state',
          userCount: { $sum: 1 },
          donorCount: {
            $sum: {
              $cond: [{ $ifNull: ['$bloodType', false] }, 1, 0]
            }
          }
        }
      },
      { $sort: { userCount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyRequests,
        donorDemographics,
        geographicDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send broadcast notification
exports.sendBroadcast = async (req, res, next) => {
  try {
    const { subject, message, target } = req.body;
    
    let users;
    
    if (target === 'all') {
      users = await User.find({ isActive: true });
    } else if (target === 'donors') {
      users = await User.find({
        isActive: true,
        bloodType: { $exists: true }
      });
    } else if (target === 'specific') {
      const { bloodType, location } = req.body;
      const query = { isActive: true };
      
      if (bloodType) query.bloodType = bloodType;
      if (location) query['location.state'] = location;
      
      users = await User.find(query);
    }
    
    // In a real implementation, you would send emails/notifications here
    // For now, we'll just return the count
    
    res.status(200).json({
      success: true,
      message: `Notification prepared for ${users.length} users`,
      data: {
        recipients: users.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export data
exports.exportData = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    let data;
    let filename;
    
    switch (type) {
      case 'donors':
        data = await Donor.find().populate('userId', 'name email phone bloodType location');
        filename = `donors-export-${Date.now()}.json`;
        break;
      case 'requests':
        data = await BloodRequest.find().populate('requester', 'name email');
        filename = `blood-requests-export-${Date.now()}.json`;
        break;
      case 'bloodbanks':
        data = await BloodBank.find().populate('hospitalId', 'name email');
        filename = `blood-banks-export-${Date.now()}.json`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    res.status(200).send(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};