const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyJwt = require('../middleware/verifyJwt');

// All admin routes require authentication
router.use(verifyJwt);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/role', adminController.updateUserRole);
router.put('/users/line', adminController.updateUserLine);
router.get('/users/search', adminController.searchUsersByEmail);

// Settings management
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Statistics
router.get('/stats', adminController.getStatistics);
router.get('/stats/lines', adminController.getLineStatistics);

module.exports = router;