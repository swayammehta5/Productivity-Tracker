const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        theme: user.theme
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      if (!otp) {
        // Generate and send OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const { sendOTPEmail } = require('../utils/emailService');
        await sendOTPEmail(user.email, otpCode);
        
        // Store OTP (in production, use Redis)
        if (!global.otpStore) {
          global.otpStore = new Map();
        }
        global.otpStore.set(user.email, {
          otp: otpCode,
          expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });
        
        return res.status(200).json({ 
          requires2FA: true, 
          message: 'Two-factor authentication required. OTP sent to your email.' 
        });
      }

      // Verify OTP
      if (!global.otpStore) {
        return res.status(400).json({ message: 'OTP not found. Please request a new one.' });
      }
      
      const storedOTP = global.otpStore.get(user.email);
      if (!storedOTP || Date.now() > storedOTP.expiresAt) {
        global.otpStore.delete(user.email);
        return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
      }
      
      if (storedOTP.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      
      // OTP verified, remove it
      global.otpStore.delete(user.email);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        theme: user.theme
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      theme: req.user.theme,
      emailReminders: req.user.emailReminders,
      profilePicture: req.user.profilePicture
    }
  });
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, theme, emailReminders, profilePicture } = req.body;
    
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (theme) user.theme = theme;
    if (emailReminders !== undefined) user.emailReminders = emailReminders;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        theme: user.theme,
        emailReminders: user.emailReminders,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google OAuth route
router.post('/google', async (req, res) => {
  try {
    console.log('🔍 /api/auth/google: Request received');
    
    // Check MongoDB connection first
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('🔍 /api/auth/google: MongoDB not connected! State:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database not available. Please check MongoDB connection.',
        databaseStatus: 'disconnected'
      });
    }
    console.log('🔍 /api/auth/google: MongoDB connection verified ✓');

    const { tokenId } = req.body;

    if (!tokenId) {
      console.error('🔍 /api/auth/google: No tokenId provided');
      return res.status(400).json({ message: 'Google token is required' });
    }

    console.log('🔍 /api/auth/google: TokenId received, length:', tokenId?.length);
    console.log('🔍 /api/auth/google: GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'NOT SET');

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('🔍 /api/auth/google: GOOGLE_CLIENT_ID not configured');
      return res.status(500).json({ message: 'Google OAuth not configured on server' });
    }

    // Verify Google token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let ticket;
    try {
      console.log('🔍 /api/auth/google: Verifying token with Google...');
      ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      console.log('🔍 /api/auth/google: Token verified successfully');
    } catch (error) {
      console.error('🔍 /api/auth/google: Token verification failed:', error.message);
      return res.status(400).json({ message: 'Invalid Google token', details: error.message });
    }

    const payload = ticket.getPayload();
    const googleId = payload.sub; // 'sub' is the Google user ID
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    console.log('🔍 /api/auth/google: Token payload extracted:', { 
      googleId: googleId?.substring(0, 20) + '...', 
      email, 
      name 
    });

    // Check if user exists by Google ID or email
    let user = await User.findOne({ 
      $or: [
        { googleId: googleId },
        { email: email }
      ]
    });

    if (user) {
      console.log('🔍 /api/auth/google: User found (ID:', user._id, 'Email:', user.email, ')');
      // Update Google ID if user exists but doesn't have it
      if (!user.googleId) {
        console.log('🔍 /api/auth/google: Linking Google account to existing user');
        user.googleId = googleId;
        if (picture) user.profilePicture = picture;
        try {
          await user.save();
          console.log('🔍 /api/auth/google: User updated successfully ✓');
        } catch (saveError) {
          console.error('🔍 /api/auth/google: Failed to save user update:', saveError.message);
          throw saveError;
        }
      } else {
        console.log('🔍 /api/auth/google: User already has Google ID linked');
      }
    } else {
      console.log('🔍 /api/auth/google: Creating new user with:', { name, email, googleId: googleId?.substring(0, 20) + '...' });
      // Create new user
      user = new User({
        name: name,
        email: email,
        googleId: googleId,
        profilePicture: picture || '',
        password: undefined // No password for Google OAuth users
      });
      try {
        await user.save();
        console.log('🔍 /api/auth/google: ✅ New user created and saved to DB! ID:', user._id);
        console.log('🔍 /api/auth/google: User data:', {
          id: user._id,
          name: user.name,
          email: user.email,
          googleId: user.googleId ? 'Set' : 'Not set',
          hasProfilePicture: !!user.profilePicture
        });
      } catch (saveError) {
        console.error('🔍 /api/auth/google: ❌ Failed to save new user to DB:', saveError.message);
        console.error('🔍 /api/auth/google: Save error details:', {
          code: saveError.code,
          name: saveError.name,
          errors: saveError.errors
        });
        throw saveError;
      }
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    console.log('🔍 /api/auth/google: JWT token generated, sending response');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        theme: user.theme,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('🔍 /api/auth/google: Error:', error);
    console.error('🔍 /api/auth/google: Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Debug endpoint to check if Google users are in DB (remove in production)
router.get('/google-users', auth, async (req, res) => {
  try {
    const users = await User.find({ googleId: { $ne: null } }).select('name email googleId createdAt');
    res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

module.exports = router;