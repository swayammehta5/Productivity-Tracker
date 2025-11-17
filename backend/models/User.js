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
    required: true,
    minlength: 6
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
  if (!this.isModified('password')) {
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
