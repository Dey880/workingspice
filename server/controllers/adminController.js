const User = require('../models/User');
const Settings = require('../models/Settings');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');

const adminController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      // Check if requester is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Not authorized. Admin access required." });
      }
      
      const users = await User.find().select('-password');
      res.status(200).json({ users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
  
  // Update user role
  updateUserRole: async (req, res) => {
    try {
      const { userId, newRole } = req.body;
      
      // Check if requester is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Not authorized. Admin access required." });
      }
      
      // Validate role
      if (!['user', 'first-line', 'second-line', 'admin'].includes(newRole)) {
        return res.status(400).json({ msg: "Invalid role specified" });
      }
      
      // Find user to update
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
      
      // Update user role
      user.role = newRole;
      await user.save();
      
      res.status(200).json({ 
        msg: `Successfully updated ${user.username} to ${newRole}`, 
        user: { ...user.toObject(), password: undefined } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
  
  // Update user role to first or second line
  updateUserLine: async (req, res) => {
    try {
      const { userId, newRole } = req.body;
      
      // Check if requester is admin
      if (!['admin'].includes(req.user.role)) {
        return res.status(403).json({ msg: "Not authorized. Admin access required." });
      }
      
      // Validate role
      if (!['user', 'first-line', 'second-line'].includes(newRole)) {
        return res.status(400).json({ msg: "Invalid role specified" });
      }
      
      // Find user to update
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
      
      // Don't allow changing admin 
      if (['admin'].includes(user.role)) {
        return res.status(403).json({ msg: "Cannot change admin roles" });
      }
      
      // Update user role
      user.role = newRole;
      await user.save();
      
      res.status(200).json({ 
        msg: `Successfully updated ${user.username} to ${newRole}`, 
        user: { ...user.toObject(), password: undefined } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
  
  // Get platform settings
  getSettings: async (req, res) => {
    try {
      // Only allow admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Not authorized. Admin access required." });
      }
      
      const settings = await Settings.getSettings();
      res.status(200).json({ settings });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
  
  // Update platform settings
  updateSettings: async (req, res) => {
    try {
      // Only allow admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Not authorized. Admin access required." });
      }
      
      const updates = req.body;
      
      // Don't allow updating certain fields directly for security
      delete updates._id;
      delete updates.__v;
      
      // Add metadata
      updates.updatedAt = new Date();
      updates.updatedBy = req.user.id;
      
      const settings = await Settings.getSettings();
      Object.keys(updates).forEach(key => {
        if (settings[key] !== undefined) {
          settings[key] = updates[key];
        }
      });
      
      await settings.save();
      
      res.status(200).json({ 
        msg: "Settings updated successfully", 
        settings 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
  
  // Get platform statistics for dashboard
  getStatistics: async (req, res) => {
    try {
      // Only allow admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Not authorized. Admin access required." });
      }
      
      // Calculate statistics with separate counts for each role
      const totalUsers = await User.countDocuments();
      const adminCount = await User.countDocuments({ role: 'admin' });
      const firstLineCount = await User.countDocuments({ role: 'first-line' });
      const secondLineCount = await User.countDocuments({ role: 'second-line' });
      const regularUsers = totalUsers - adminCount - firstLineCount - secondLineCount;
      
      const ticketStats = {
        total: await Ticket.countDocuments(),
        open: await Ticket.countDocuments({ status: 'open' }),
        inProgress: await Ticket.countDocuments({ status: 'in-progress' }),
        resolved: await Ticket.countDocuments({ status: 'resolved' }),
        closed: await Ticket.countDocuments({ status: 'closed' })
      };
      const commentCount = await Comment.countDocuments();
      
      // Get newest users
      const newestUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-password');
      
      res.status(200).json({
        userStats: {
          total: totalUsers,
          admins: adminCount,
          firstLine: firstLineCount,
          secondLine: secondLineCount,
          users: regularUsers,
          newest: newestUsers
        },
        ticketStats,
        commentCount
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
  
  // Get line-specific statistics
  getLineStatistics: async (req, res) => {
    try {
      // Only allow admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Not authorized. Admin access required." });
      }
      
      // Calculate line-specific statistics
      const firstLineStats = {
        total: await Ticket.countDocuments({ supportLine: 'first-line' }),
        open: await Ticket.countDocuments({ supportLine: 'first-line', status: 'open' }),
        inProgress: await Ticket.countDocuments({ supportLine: 'first-line', status: 'in-progress' }),
        resolved: await Ticket.countDocuments({ supportLine: 'first-line', status: 'resolved' }),
        closed: await Ticket.countDocuments({ supportLine: 'first-line', status: 'closed' })
      };
      
      const secondLineStats = {
        total: await Ticket.countDocuments({ supportLine: 'second-line' }),
        open: await Ticket.countDocuments({ supportLine: 'second-line', status: 'open' }),
        inProgress: await Ticket.countDocuments({ supportLine: 'second-line', status: 'in-progress' }),
        resolved: await Ticket.countDocuments({ supportLine: 'second-line', status: 'resolved' }),
        closed: await Ticket.countDocuments({ supportLine: 'second-line', status: 'closed' })
      };
      
      const userCounts = {
        firstLine: await User.countDocuments({ role: 'first-line' }),
        secondLine: await User.countDocuments({ role: 'second-line' })
      };
      
      res.status(200).json({
        firstLineStats,
        secondLineStats,
        userCounts
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
  
  // Search users by email
  searchUsersByEmail: async (req, res) => {
    try {
      // Check if requester is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Not authorized. Admin access required." });
      }
      
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ msg: "Email parameter is required" });
      }
      
      // Search for users with emails containing the search term (case insensitive)
      const users = await User.find({
        email: { $regex: email, $options: 'i' }
      }).select('-password');
      
      res.status(200).json({ users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
};

module.exports = adminController;