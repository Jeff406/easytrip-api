const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all existing users
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} existing users`);

    // Update each user to have a default role of 'passenger'
    // Note: This is a simple migration. In a real scenario, you might want to
    // determine the role based on other data or ask the user to choose
    for (const user of existingUsers) {
        console.log('user', user);
      if (!user.role) {
        user.role = 'passenger'; // Default role
        await user.save();
        console.log(`Updated user ${user.firebaseId} with role: ${user.role}`);
      }
    }

    // Create the compound index for firebaseId + role
    await User.collection.createIndex(
      { firebaseId: 1, role: 1 }, 
      { unique: true }
    );
    console.log('Created compound index for firebaseId + role');

    // Remove the old unique index on firebaseId if it exists
    try {
      await User.collection.dropIndex('firebaseId_1');
      console.log('Removed old unique index on firebaseId');
    } catch (error) {
      console.log('Old firebaseId index not found or already removed');
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers(); 