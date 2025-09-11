const BloodBank = require('../models/BloodBank');
const User = require('../models/user');
const geocoder = require('../utils/geocoding');

// @desc    Get all blood banks
// @route   GET /api/bloodbanks
// @access  Public
exports.getBloodBanks = async (req, res) => {
  try {
    const bloodBanks = await BloodBank.find().populate('hospitalId', 'name email phone');
    res.status(200).json({ success: true, count: bloodBanks.length, data: bloodBanks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single blood bank
// @route   GET /api/bloodbanks/:id
// @access  Public
exports.getBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id).populate('hospitalId', 'name email phone');
    if (!bloodBank) return res.status(404).json({ success: false, message: 'Blood bank not found' });
    res.status(200).json({ success: true, data: bloodBank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a blood bank
// @route   POST /api/bloodbanks
// @access  Private (hospital, admin)
exports.createBloodBank = async (req, res) => {
  try {
    req.body.hospitalId = req.user.id;
    const bloodBank = await BloodBank.create(req.body);
    res.status(201).json({ success: true, data: bloodBank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a blood bank
// @route   PUT /api/bloodbanks/:id
// @access  Private (hospital, admin)
exports.updateBloodBank = async (req, res) => {
  try {
    let bloodBank = await BloodBank.findById(req.params.id);
    if (!bloodBank) return res.status(404).json({ success: false, message: 'Blood bank not found' });

    bloodBank = await BloodBank.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: bloodBank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a blood bank
// @route   DELETE /api/bloodbanks/:id
// @access  Private (hospital, admin)
exports.deleteBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    if (!bloodBank) return res.status(404).json({ success: false, message: 'Blood bank not found' });

    await bloodBank.remove();
    res.status(200).json({ success: true, message: 'Blood bank deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blood inventory
// @route   PUT /api/bloodbanks/:id/inventory
// @access  Private (hospital, admin)
exports.updateInventory = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    if (!bloodBank) return res.status(404).json({ success: false, message: 'Blood bank not found' });

    bloodBank.inventory = req.body.inventory; // Assuming req.body.inventory is an object like { A+: 10, B-: 5 }
    await bloodBank.save();

    res.status(200).json({ success: true, data: bloodBank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search blood banks by query
// @route   GET /api/bloodbanks/search
// @access  Public
exports.searchBloodBanks = async (req, res) => {
  try {
    const { q } = req.query;
    const bloodBanks = await BloodBank.find({ name: { $regex: q, $options: 'i' } });
    res.status(200).json({ success: true, count: bloodBanks.length, data: bloodBanks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get blood statistics
// @route   GET /api/bloodbanks/stats
// @access  Public
exports.getBloodStats = async (req, res) => {
  try {
    const stats = await BloodBank.aggregate([
      { $unwind: '$inventory' },
      { $group: { _id: '$inventory.type', total: { $sum: '$inventory.quantity' } } }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
