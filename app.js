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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));
  
module.exports = app;
