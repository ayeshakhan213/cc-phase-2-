const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Root route
app.get('/', (req, res) => {
  res.send('🎉 Glamcart Backend is Running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Glamcart backend listening on port ${PORT}`);
});
