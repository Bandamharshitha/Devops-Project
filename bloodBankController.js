const BloodBank = require('../models/BloodBank');
const User = require('../models/User');
const geocoder = require('../utils/geocoding');

// Get all blood banks
exports.getBloodBanks = async (req, res, next) => {
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
    query = BloodBank.find(JSON.parse(queryStr)).populate('hospitalId', 'name email phone');
    
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
    const total = await BloodBank.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Location-based search
    if (req.query.location) {
      const { latitude, longitude, radius = 50 } = req.query;
      
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
    const bloodBanks = await query;
    
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
      count: bloodBanks.length,
      pagination,
      data: bloodBanks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single blood bank
exports.getBloodBank = async (req, res, next) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id).populate('hospitalId', 'name email phone');
    
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: bloodBank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create blood bank
exports.createBloodBank = async (req, res, next) => {
  try {
    // Check if user is a hospital admin
    if (req.user.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospital administrators can create blood banks'
      });
    }
    
    // Add user to req.body
    req.body.hospitalId = req.user.id;
    
    // Geocode address
    if (req.body.location && req.body.location.address) {
      const loc = await geocoder.geocode(req.body.location.address);
      req.body.location.coordinates = [loc[0].longitude, loc[0].latitude];
      req.body.location.city = loc[0].city;
      req.body.location.state = loc[0].stateCode;
      req.body.location.pincode = loc[0].zipcode;
    }
    
    const bloodBank = await BloodBank.create(req.body);
    
    res.status(201).json({
      success: true,
      data: bloodBank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update blood bank
exports.updateBloodBank = async (req, res, next) => {
  try {
    let bloodBank = await BloodBank.findById(req.params.id);
    
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }
    
    // Make sure user is blood bank owner or admin
    if (bloodBank.hospitalId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blood bank'
      });
    }
    
    // Geocode address if updated
    if (req.body.location && req.body.location.address) {
      const loc = await geocoder.geocode(req.body.location.address);
      req.body.location.coordinates = [loc[0].longitude, loc[0].latitude];
      req.body.location.city = loc[0].city;
      req.body.location.state = loc[0].stateCode;
      req.body.location.pincode = loc[0].zipcode;
    }
    
    bloodBank = await BloodBank.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: bloodBank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update blood inventory
exports.updateInventory = async (req, res, next) => {
  try {
    const { bloodType, units } = req.body;
    
    let bloodBank = await BloodBank.findById(req.params.id);
    
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }
    
    // Make sure user is blood bank owner or admin
    if (bloodBank.hospitalId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blood bank inventory'
      });
    }
    
    bloodBank = await bloodBank.updateInventory(bloodType, units);
    
    res.status(200).json({
      success: true,
      data: bloodBank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete blood bank
exports.deleteBloodBank = async (req, res, next) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }
    
    // Make sure user is blood bank owner or admin
    if (bloodBank.hospitalId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blood bank'
      });
    }
    
    await bloodBank.remove();
    
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

// Search blood banks by location and blood type
exports.searchBloodBanks = async (req, res, next) => {
  try {
    const { latitude, longitude, bloodType, radius = 50 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }
    
    let query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    };
    
    // If blood type is specified, check inventory
    if (bloodType) {
      query['inventory.bloodType'] = bloodType;
      query['inventory.units'] = { $gt: 0 };
    }
    
    const bloodBanks = await BloodBank.find(query)
      .populate('hospitalId', 'name email phone')
      .select('name contact location inventory');
    
    res.status(200).json({
      success: true,
      count: bloodBanks.length,
      data: bloodBanks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get blood availability statistics
exports.getBloodStats = async (req, res, next) => {
  try {
    const stats = await BloodBank.aggregate([
      { $unwind: '$inventory' },
      {
        $group: {
          _id: '$inventory.bloodType',
          totalUnits: { $sum: '$inventory.units' },
          bloodBanks: { $addToSet: '$_id' },
          averageUnits: { $avg: '$inventory.units' }
        }
      },
      {
        $project: {
          bloodType: '$_id',
          totalUnits: 1,
          bloodBankCount: { $size: '$bloodBanks' },
          averageUnits: { $round: ['$averageUnits', 2] },
          _id: 0
        }
      },
      { $sort: { bloodType: 1 } }
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