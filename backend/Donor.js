

const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    fullName: String,
    age: Number,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    weight: Number,
    height: Number,
    dob: Date
  },
  healthInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      required: true
    },
    hemoglobin: Number,
    bloodPressure: String,
    hasDiabetes: Boolean,
    smoker: Boolean,
    diseases: [String],
    symptoms: [String],
    surgeryHistory: String,
    infectionRisk: Boolean,
    lastCheckup: Date
  },
  contactInfo: {
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    preferredCenter: String,
    availability: [String]
  },
  identification: {
    idType: String,
    idNumber: String,
    idImage: {
      url: String,
      public_id: String
    }
  },
  donationHistory: [{
    date: Date,
    location: String,
    units: Number,
    bloodType: String
  }],
  eligibility: {
    isEligible: {
      type: Boolean,
      default: true
    },
    lastEligibilityCheck: Date,
    nextDonationDate: Date,
    rejectionReasons: [String]
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    donationReminders: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  lastDonation: Date
}, {
  timestamps: true
});

donorSchema.virtual('donationEligibility').get(function() {
  if (!this.lastDonation) return true;
  
  const lastDonation = new Date(this.lastDonation);
  const nextEligibleDate = new Date(lastDonation);
  nextEligibleDate.setDate(nextEligibleDate.getDate() + 56); // 8 weeks
  
  return new Date() >= nextEligibleDate;
});

module.exports = mongoose.model('Donor', donorSchema);