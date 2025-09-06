const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  date: {
    type: Date,
    required: true
  },
  time: String,
  contact: String,
  details: String,
  expectedDonors: Number,
  registeredDonors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Camp', campSchema);