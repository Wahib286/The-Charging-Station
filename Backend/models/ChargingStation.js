const mongoose = require('mongoose');

const chargingStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Station name cannot exceed 100 characters']
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Active'
  },
  power: {
    type: Number,
    required: [true, 'Power rating is required'],
    min: [0, 'Power must be a positive number']
  },
  connectorTypes: [{
    type: String,
    enum: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger']
  }],
  pricePerKwh: {
    type: Number,
    min: [0, 'Price must be a positive number']
  },
  amenities: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
chargingStationSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('ChargingStation', chargingStationSchema);