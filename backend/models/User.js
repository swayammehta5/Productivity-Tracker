const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google OAuth
    },
    minlength: 6
  },
  googleId: {
    type: String,
    default: null,
    sparse: true // Allows multiple null values but enforces uniqueness for non-null
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  emailReminders: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: ''
  },
  googleCalendarTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  notificationPreferences: {
    browserNotifications: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String,
      default: '09:00'
    }
  },
  locationPreferences: {
    enabled: {
      type: Boolean,
      default: false
    },
    homeLocation: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and exists (not for Google OAuth users)
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
