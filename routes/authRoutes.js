const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { verifyEmail } = require('../controllers/emailVerificationController');
const { sendResetPasswordOTP, verifyOTPAndResetPassword } = require('../controllers/resetPassword.js');

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Logout user
router.post('/logout', logout);

// verify email
router.get("/verify-email", verifyEmail);

//ขอ OTP
router.post("/forgot-password", sendResetPasswordOTP);

//ยืนยัน OTP
router.post("/reset-password", verifyOTPAndResetPassword);


module.exports = router;
