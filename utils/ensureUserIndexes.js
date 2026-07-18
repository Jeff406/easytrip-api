const User = require('../models/User');

async function ensureUserIndexes() {
  const collection = User.collection;
  const indexes = await collection.indexes();
  const oldFirebaseIdIndex = indexes.find(
    (index) => index.name === 'firebaseId_1' && index.unique
  );

  if (oldFirebaseIdIndex) {
    await collection.dropIndex('firebaseId_1');
    console.log('Removed legacy unique index on firebaseId');
  }

  await User.syncIndexes();
  console.log('User indexes synced');
}

module.exports = ensureUserIndexes;
