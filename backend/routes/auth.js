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
module.exports = router;