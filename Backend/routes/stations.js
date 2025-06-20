// routes/stations.js
const express = require('express');
const auth = require('../middlewere/auth');      // ← intentional middlewere naming
const ChargingStation = require('../models/ChargingStation');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// ─── GET /api/stations ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const stations = await ChargingStation.find();
    return res.json({ stations });
  } catch (err) {
    console.error('Error fetching stations:', err);
    return res.status(500).json({ message: 'Failed to fetch stations' });
  }
});

// ─── POST /api/stations/create ──────────────────────────────────
router.post(
  '/create',
  auth,
  [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name is required and cannot exceed 100 characters'),
    body('location.latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude is required'),
    body('location.longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude is required'),
    body('location.address')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Address cannot exceed 200 characters'),
    body('power')
      .isFloat({ min: 0 })
      .withMessage('Power rating is required and must be positive'),
    body('connectorTypes')
      .optional()
      .isArray()
      .withMessage('Connector types must be an array'),
    body('connectorTypes.*')
      .isIn(['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'])
      .withMessage('Invalid connector type'),
    body('pricePerKwh')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('amenities')
      .optional()
      .isArray()
      .withMessage('Amenities must be an array'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array().map(err => ({ field: err.param, message: err.msg })),
        });
      }

      const { name, location, status, power, connectorTypes, pricePerKwh, amenities } =
        req.body;

      const station = new ChargingStation({
        name,
        location,
        status: status || 'Active',
        power,
        connectorTypes,
        pricePerKwh,
        amenities,
        createdBy: req.user._id, // comes from auth middleware
      });

      await station.save();
      return res.status(201).json({
        message: 'Charging station created successfully',
        station,
      });
    } catch (error) {
      console.error('Error creating charging station:', error);
      return res.status(500).json({ message: 'Server error during station creation' });
    }
  }
);

// ─── PUT /api/stations/:id ────────────────────────────────────────
router.put(
  '/:id',
  auth,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('location.latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude is required'),
    body('location.longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude is required'),
    body('location.address')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Address cannot exceed 200 characters'),
    body('power')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Power must be positive'),
    body('connectorTypes')
      .optional()
      .isArray()
      .withMessage('Connector types must be an array'),
    body('connectorTypes.*')
      .optional()
      .isIn(['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'])
      .withMessage('Invalid connector type'),
    body('pricePerKwh')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be positive'),
    body('amenities')
      .optional()
      .isArray()
      .withMessage('Amenities must be an array'),
    body('status')
      .optional()
      .isIn(['Active', 'Inactive', 'Under Maintenance'])
      .withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array().map(err => ({ field: err.param, message: err.msg })),
        });
      }

      const updatedStation = await ChargingStation.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedStation) {
        return res.status(404).json({ message: 'Station not found' });
      }

      return res.json({ message: 'Station updated successfully', station: updatedStation });
    } catch (err) {
      console.error('Error updating station:', err);
      return res.status(500).json({ message: 'Server error during update' });
    }
  }
);

// ─── DELETE /api/stations/:id ────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedStation = await ChargingStation.findByIdAndDelete(req.params.id);

    if (!deletedStation) {
      return res.status(404).json({ message: 'Station not found' });
    }

    return res.json({ message: 'Station deleted successfully' });
  } catch (err) {
    console.error('Error deleting station:', err);
    return res.status(500).json({ message: 'Server error during deletion' });
  }
});

module.exports = router;
