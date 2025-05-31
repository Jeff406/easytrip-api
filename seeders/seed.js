require('dotenv').config();
const mongoose = require('mongoose');
const seedRoutes = require('./routeSeeder');

// MongoDB connection URL - using MONGO_URI from .env
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/easytrip';

const seed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Run seeders
    await seedRoutes();

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seed(); 