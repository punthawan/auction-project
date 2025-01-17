const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { verifyEmail } = require('../controllers/emailVerificationController');

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Logout user
router.post('/logout', logout);

// verify email
router.get("/verify-email", verifyEmail);

module.exports = router;
