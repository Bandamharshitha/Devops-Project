const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const User = require('../models/User');
const { sendNotification } = require('../utils/notifications');
const geocoder = require('../utils/geocoding');

// Create blood request
exports.createRequest = async (req, res, next) => {
  try {
    // Add requester to request
    req.body.requester = req.user.id;
    
    // Geocode location if address is provided
    if (req.body.location && req.body.location.address) {
      const loc = await geocoder.geocode(req.body.location.address);
      req.body.location.coordinates = [loc[0].longitude, loc[0].latitude];
      req.body.location.city = loc[0].city;
      req.body.location.state = loc[0].stateCode;
      req.body.location.pincode = loc[0].zipcode;
    }
    
    const bloodRequest = await BloodRequest.create(req.body);
    
    // Find potential donors and notify them
    await exports.notifyPotentialDonors(bloodRequest);
    
    res.status(201).json({
      success: true,
      data: bloodRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Notify potential donors about a blood request
exports.notifyPotentialDonors = async (bloodRequest) => {
  try {
    const { bloodType, urgency } = bloodRequest.bloodInfo;
    const { coordinates } = bloodRequest.location;
    
    // Find eligible donors nearby with matching blood type
    const donors = await Donor.aggregate([
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
        $match: {
          'user.bloodType': bloodType,
          'user.location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: coordinates
              },
              $maxDistance: 100000 // 100km radius
            }
          },
          'status': 'Active',
          'eligibility.isEligible': true,
          $or: [
            { 'lastDonation': { $exists: false } },
            { 
              'lastDonation': { 
                $lte: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000) // 8 weeks
              } 
            }
          ]
        }
      },
      { $limit: urgency === 'Emergency' ? 50 : 20 } // Limit based on urgency
    ]);
    
    // Add matched donors to request
    bloodRequest.matchedDonors = donors.map(donor => ({
      donor: donor._id,
      contactDate: new Date()
    }));
    
    await bloodRequest.save();
    
    // Send notifications to matched donors
    for (const donor of donors) {
      await sendNotification({
        to: donor.user.email,
        subject: `Urgent: Blood Donation Request - ${bloodType} Blood Needed`,
        template: 'blood-request',
        context: {
          name: donor.user.name,
          bloodType,
          patientName: bloodRequest.patientInfo.name,
          hospital: bloodRequest.patientInfo.hospital,
          urgency: bloodRequest.bloodInfo.urgency,
          units: bloodRequest.bloodInfo.unitsRequired,
          contact: bloodRequest.contactInfo.primaryContact,
          requestId: bloodRequest._id
        }
      });
    }
    
    return donors.length;
  } catch (error) {
    console.error('Error notifying donors:', error);
    return 0;
  }
};

// Get all blood requests
exports.getRequests = async (req, res, next) => {
  try {
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'location'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = BloodRequest.find(JSON.parse(queryStr))
      .populate('requester', 'name email phone')
      .populate('matchedDonors.donor', 'userId')
      .populate('fulfilledBy.donor', 'userId');
    
    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await BloodRequest.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Location-based search
    if (req.query.location) {
      const { latitude, longitude, radius = 100 } = req.query;
      
      if (latitude && longitude) {
        query = query.find({
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              },
              $maxDistance: radius * 1000 // Convert km to meters
            }
          }
        });
      }
    }
    
    // Executing query
    const requests = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: requests.length,
      pagination,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single blood request
exports.getRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requester', 'name email phone')
      .populate('matchedDonors.donor', 'userId')
      .populate('fulfilledBy.donor', 'userId');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update blood request
exports.updateRequest = async (req, res, next) => {
  try {
    let request = await BloodRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }
    
    // Make sure user is request owner or admin
    if (request.requester.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }
    
    request = await BloodRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete blood request
exports.deleteRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }
    
    // Make sure user is request owner or admin
    if (request.requester.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }
    
    await request.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get requests statistics
exports.getRequestStats = async (req, res, next) => {
  try {
    const stats = await BloodRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgUnits: { $avg: '$bloodInfo.unitsRequired' },
          totalUnits: { $sum: '$bloodInfo.unitsRequired' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          avgUnits: { $round: ['$avgUnits', 2] },
          totalUnits: 1,
          _id: 0
        }
      }
    ]);
    
    // Get blood type distribution
    const bloodTypeStats = await BloodRequest.aggregate([
      {
        $group: {
          _id: '$bloodInfo.bloodType',
          count: { $sum: 1 },
          fulfilled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Fulfilled'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          bloodType: '$_id',
          count: 1,
          fulfilled: 1,
          fulfillmentRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$fulfilled', '$count'] },
                  100
                ]
              },
              2
            ]
          },
          _id: 0
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        bloodTypeStats: bloodTypeStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Donor response to blood request
exports.donorResponse = async (req, res, next) => {
  try {
    const { response } = req.body; // 'Accepted' or 'Declined'
    const { requestId } = req.params;
    
    const donor = await Donor.findOne({ userId: req.user.id });
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }
    
    const request = await BloodRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }
    
    // Find the donor in matched donors
    const donorMatch = request.matchedDonors.find(
      match => match.donor.toString() === donor._id.toString()
    );
    
    if (!donorMatch) {
      return res.status(404).json({
        success: false,
        message: 'You are not matched with this request'
      });
    }
    
    // Update donor response
    donorMatch.status = response === 'Accepted' ? 'Accepted' : 'Declined';
    donorMatch.responseDate = new Date();
    
    await request.save();
    
    // If donor accepted, update request status
    if (response === 'Accepted') {
      request.status = 'Processing';
      await request.save();
      
      // Notify requester
      const requester = await User.findById(request.requester);
      
      if (requester) {
        await sendNotification({
          to: requester.email,
          subject: 'Donor Found for Your Blood Request',
          template: 'donor-found',
          context: {
            name: requester.name,
            donorName: req.user.name,
            bloodType: request.bloodInfo.bloodType,
            contact: req.user.phone
          }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Response recorded: ${response}`,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};