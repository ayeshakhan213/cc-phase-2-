const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, skinType } = req.body;
    console.log(`   → Register attempt: ${email}`);

    // Validate inputs
    if (!name || !email || !password) {
      console.log(`   ✗ Validation failed: missing required fields`);
      return res.status(400).json({ error: 'Please provide name, email and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`   ✗ User already exists: ${email}`);
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      phone,
      skinType: skinType || 'normal'
    });

    await user.save();
    console.log(`   ✓ User registered successfully: ${email}`);

    // Generate token
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skinType: user.skinType,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`   → Login attempt: ${email}`);

    // Validate inputs
    if (!email || !password) {
      console.log(`   ✗ Validation failed: missing email or password`);
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`   ✗ User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      console.log(`   ✗ Invalid password: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`   ✓ Login successful: ${email}`);

    // Generate token
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skinType: user.skinType,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('   ✗ Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log(`   ✗ No token provided`);
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    console.log(`   → Fetching user profile: ${user?.email || 'unknown'}`);

    if (!user) {
      console.log(`   ✗ User not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`   ✓ User profile retrieved: ${user.email}`);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skinType: user.skinType,
        phone: user.phone
      }
    });
  } catch (error) {
    console.log(`   ✗ Authentication error: ${error.message}`);
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log(`   ✗ No token provided for profile update`);
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, phone, skinType, preferredColors } = req.body;
    console.log(`   → Updating profile for user: ${decoded.id}`);

    const user = await User.findByIdAndUpdate(
      decoded.id,
      {
        name: name || undefined,
        phone: phone || undefined,
        skinType: skinType || undefined,
        preferredColors: preferredColors || undefined,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log(`   ✗ User not found for update`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`   ✓ Profile updated successfully: ${user.email}`);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skinType: user.skinType,
        phone: user.phone,
        preferredColors: user.preferredColors
      }
    });
  } catch (error) {
    console.log(`   ✗ Profile update error: ${error.message}`);

    res.status(500).json({ error: error.message || 'Profile update failed' });
  }
});

module.exports = router;
