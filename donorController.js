const Donor = require('../models/Donor');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');

// Get current donor profile
exports.getMyProfile = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id })
      .populate('userId', 'name email phone bloodType location');
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update donor profile
exports.updateProfile = async (req, res, next) => {
  try {
    let donor = await Donor.findOne({ userId: req.user.id });
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }
    
    donor = await Donor.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('userId', 'name email phone bloodType location');
    
    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all donors (admin only)
exports.getDonors = async (req, res, next) => {
  try {
    const donors = await Donor.find()
      .populate('userId', 'name email phone bloodType location')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get donor by ID
exports.getDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id)
      .populate('userId', 'name email phone bloodType location');
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update donor status (admin only)
exports.updateDonorStatus = async (req, res, next) => {
  try {
    const { status, rejectionReasons } = req.body;
    
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        'eligibility.rejectionReasons': rejectionReasons || [],
        'eligibility.lastEligibilityCheck': new Date()
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Record donation
exports.recordDonation = async (req, res, next) => {
  try {
    const { date, location, units, bloodType, requestId } = req.body;
    
    const donor = await Donor.findOne({ userId: req.user.id });
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }
    
    // Add to donation history
    donor.donationHistory.push({
      date: date || new Date(),
      location,
      units: units || 1,
      bloodType: bloodType || donor.healthInfo.bloodType
    });
    
    // Update donation stats
    donor.totalDonations += 1;
    donor.lastDonation = new Date();
    
    // Calculate next eligible donation date (8 weeks later)
    const nextDonationDate = new Date();
    nextDonationDate.setDate(nextDonationDate.getDate() + 56);
    donor.eligibility.nextDonationDate = nextDonationDate;
    
    await donor.save();
    
    // If this donation fulfills a request, update the request status
    if (requestId) {
      await BloodRequest.findByIdAndUpdate(requestId, {
        status: 'Fulfilled',
        fulfilledBy: {
          donor: donor._id,
          date: new Date(),
          unitsProvided: units || 1
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get nearby blood requests for donor
exports.getNearbyRequests = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id })
      .populate('userId', 'location bloodType');
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }
    
    const user = donor.userId;
    
    if (!user.location || !user.location.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'User location not set'
      });
    }
    
    const requests = await BloodRequest.find({
      status: 'Pending',
      'bloodInfo.bloodType': user.bloodType,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: 100000 // 100km radius
        }
      }
    }).sort({ 'bloodInfo.urgency': -1, createdAt: 1 });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get donor statistics
exports.getDonorStats = async (req, res, next) => {
  try {
    const stats = await Donor.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDonations: { $avg: '$totalDonations' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$_id',
          count: { $first: '$count' },
          avgDonations: { $first: '$avgDonations' },
          bloodTypes: {
            $push: '$user.bloodType'
          }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          avgDonations: { $round: ['$avgDonations', 2] },
          bloodTypeDistribution: {
            $arrayToObject: {
              $map: {
                input: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
                as: 'bt',
                in: {
                  k: '$$bt',
                  v: {
                    $size: {
                      $filter: {
                        input: '$bloodTypes',
                        as: 'type',
                        cond: { $eq: ['$$type', '$$bt'] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};