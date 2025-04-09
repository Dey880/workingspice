const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyJwt = require('../middleware/verifyJwt');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/user', verifyJwt, authController.user);
router.get('/admins', verifyJwt, authController.getAllAdmins); // New route to get all admins
router.get('/staff', verifyJwt, authController.getStaffByRole);

module.exports = router;