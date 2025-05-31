require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');

const app = express();

// Get MongoDB URI from .env
const MONGODB_URI = process.env.ATLAS_URI;

// === CORS SETUP ===
// Replace these strings with whatever your real frontend URLs are:
const allowedOrigins = [
  'https://the-charging-station-adw4g1osf-wahib286s-projects.vercel.app', // Preview URL
  'https://the-charging-station.vercel.app',                               // Production URL
  'http://localhost:3000'                                                   // Local dev
];

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // incomingOrigin will be undefined when you test with e.g. Postman or curl,
      // so we allow that too. Otherwise only allow if it’s in allowedOrigins.
      if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin "${incomingOrigin}" not allowed.`));
      }
    },
    credentials: true, // allow cookies or authorization headers if you need them
  })
);

// Body parser
app.use(express.json());

// === MONGOOSE CONNECT ===
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// === ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Charging Station API is running Really!' });
});

// Error handling middleware (for unhandled errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler (for any route not matched above)
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
