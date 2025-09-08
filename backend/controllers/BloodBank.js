const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema({
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    required: true
  },
  units: {
    type: Number,
    required: true,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  criticalLevel: {
    type: Number,
    default: 3
  }
});

const bloodBankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: {
    phone: String,
    email: String,
    emergency: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  inventory: [bloodInventorySchema],
  operatingHours: {
    from: String,
    to: String,
    days: [String]
  },
  services: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

bloodBankSchema.index({ location: '2dsphere' });

bloodBankSchema.methods.updateInventory = function(bloodType, units) {
  const inventoryItem = this.inventory.find(item => item.bloodType === bloodType);
  
  if (inventoryItem) {
    inventoryItem.units = units;
    inventoryItem.lastUpdated = new Date();
  } else {
    this.inventory.push({ bloodType, units });
  }
  
  return this.save();
};

bloodBankSchema.methods.getAvailabilityStatus = function(bloodType) {
  const item = this.inventory.find(i => i.bloodType === bloodType);
  if (!item) return 'not-available';
  
  if (item.units === 0) return 'not-available';
  if (item.units <= item.criticalLevel) return 'low';
  return 'available';
};

module.exports = mongoose.model('BloodBank', bloodBankSchema);