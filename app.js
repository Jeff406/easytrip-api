const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const routeRoutes = require('./routes/routeRoutes');
const tripRequestRoutes = require('./routes/tripRequestRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/routes', routeRoutes);
app.use('/api/trip-requests', tripRequestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

const buildMongoUriFromEnv = () => {
  const protocol = process.env.MONGO_PROTOCOL || 'mongodb+srv';
  const host = process.env.MONGO_HOST;
  const dbName = process.env.MONGO_DB;
  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS;
  const options = process.env.MONGO_OPTIONS;

  if (!host) return null;

  const authPart = user ? `${encodeURIComponent(user)}:${encodeURIComponent(pass || '')}@` : '';
  const dbPart = dbName ? `/${dbName}` : '';
  const optionsPart = options ? (options.startsWith('?') ? options : `?${options}`) : '';

  return `${protocol}://${authPart}${host}${dbPart}${optionsPart}`;
};

const mongoUri = process.env.MONGO_URI || buildMongoUriFromEnv();

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));
  
module.exports = app;
