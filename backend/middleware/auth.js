const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    if (req.user) {
      return next();
    }

    const authorizationHeader = req.header('Authorization') || '';
    const bearerToken = authorizationHeader.replace(/^Bearer\s+/i, '').trim();
    const headerToken = req.header('x-auth-token')?.trim();
    const token = bearerToken || headerToken;
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
