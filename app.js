const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const routeRoutes = require('./routes/routeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/routes', routeRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

module.exports = app;
