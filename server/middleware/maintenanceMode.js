const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const maintenanceMode = async (req, res, next) => {
  try {
    // Skip for certain routes
    const publicPaths = ['/api/settings/public', '/api/auth/login'];
    if (publicPaths.includes(req.path)) {
      return next();
    }
    
    // Check if maintenance mode is active
    const settings = await Settings.getSettings();
    if (!settings.maintenanceMode) {
      return next();
    }
    
    // Check if user is an admin or owner
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(503).json({ 
        msg: "Site is currently under maintenance. Please try again later."
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ email: decoded.email });
      
      if (user && ['admin', 'owner'].includes(user.role)) {
        // Allow admins and owners to access the site during maintenance
        return next();
      }
    } catch (err) {
      // Token verification failed
    }
    
    return res.status(503).json({ 
      msg: "Site is currently under maintenance. Please try again later."
    });
    
  } catch (err) {
    console.error(err);
    next(); // In case of error, allow the request to proceed
  }
};

module.exports = maintenanceMode;