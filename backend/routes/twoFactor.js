const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/emailService');

let authenticator;
try {
  authenticator = require('otplib').authenticator;
} catch (error) {
  console.log('otplib module not installed. 2FA will use email OTP only.');
}

const router = express.Router();

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate and send OTP
router.post('/generate-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: 'Two-factor authentication is not enabled' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    await sendOTPEmail(user.email, otp);

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enable 2FA
router.post('/enable', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Generate a simple secret (in production, use proper secret generation)
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = true;
    await user.save();

    let otpauth = '';
    if (authenticator) {
      otpauth = authenticator.keyuri(user.email, 'Productivity Tracker', secret);
    }

    res.json({
      secret,
      otpauth,
      message: 'Two-factor authentication enabled. OTP will be sent via email.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Disable 2FA
router.post('/disable', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    await user.save();

    res.json({ message: 'Two-factor authentication disabled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP during login
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Check stored OTP
    const storedOTP = otpStore.get(email);
    if (!storedOTP) {
      return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
    }

    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified, remove it
    otpStore.delete(email);

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

