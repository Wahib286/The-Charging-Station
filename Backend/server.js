require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');

const app = express();

const atlasUri = process.env.ATLAS_URI;     
const localUri = process.env.LOCAL_URI;     
const MONGODB_URI = atlasUri || localUri;   

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
if (!MONGODB_URI) {
  console.error('No MongoDB URI provided! Set ATLAS_URI or LOCAL_URI in .env.');
  process.exit(1);  // Stop the server
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Charging Station API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});