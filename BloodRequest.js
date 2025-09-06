const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientAge: Number,
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  unitsRequired: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Urgent', 'Emergency'],
    default: 'Normal'
  },
  contactNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Fulfilled', 'Rejected'],
    default: 'Pending'
  },
  fulfilledBy: [{
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    },
    units: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);