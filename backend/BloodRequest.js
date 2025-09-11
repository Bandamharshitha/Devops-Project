
const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientInfo: {
    name: String,
    age: Number,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    hospital: String,
    diagnosis: String
  },
  bloodInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      required: true
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
    requiredBy: Date
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  contactInfo: {
    primaryContact: String,
    secondaryContact: String,
    relationship: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Fulfilled', 'Expired', 'Cancelled'],
    default: 'Pending'
  },
  matchedDonors: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    },
    status: {
      type: String,
      enum: ['Contacted', 'Accepted', 'Declined', 'Donated'],
      default: 'Contacted'
    },
    contactDate: Date,
    responseDate: Date
  }],
  fulfilledBy: {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    },
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank'
    },
    date: Date,
    unitsProvided: Number
  },
  notes: String,
  expiryDate: {
    type: Date,
    default: function() {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 3); // Default 3 days expiry
      return expiry;
    }
  }
}, {
  timestamps: true
});

bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ status: 1, urgency: -1, createdAt: 1 });

bloodRequestSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

bloodRequestSchema.pre('save', function(next) {
  if (this.isExpired() && this.status !== 'Expired') {
    this.status = 'Expired';
  }
  next();
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);