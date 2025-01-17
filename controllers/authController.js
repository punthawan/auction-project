const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.schema'); 
const sendVerificationEmail = require("../modules/email/sendVerificationEmail");

// Register
const register = async (req, res) => {
  try {
      const { username, email, password } = req.body;

      // Check if user exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
          return res.status(400).json({ message: 'Email นี้มีผู้ใช้แล้ว' });
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).json({ message: 'Username นี้มีผู้ใช้แล้ว' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
          username,
          email,
          password: hashedPassword,
          isEmailVerified: false
      });

      // Save new user to the database
      const savedUser = await newUser.save();

      // Generate verification token
      const token = jwt.sign(
          { id: savedUser._id, email: savedUser.email },
          "testtest123", 
          { expiresIn: "1h" }
      );

      // Update the user with the email verification token
      savedUser.emailVerificationToken = token;
      await savedUser.save();

      // Send verification email
      const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;
      await sendVerificationEmail(savedUser.email, verificationLink);

      res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error1' });
  }
};


//Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "อีเมล์ไม่ถูกต้อง" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    if(user.isEmailVerified == false){
      return res.status(400).json({ message: "กรุณายืนยัน Email ก่อน" });
    }

    // Generate new JWT token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_KEY, { expiresIn: "1h" });

    // Save the new token in a database or cache (optional)
    user.token = token; 
    await user.save();

    res.status(200).json({ token, userId: user._id });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Logout
const logout = (req, res) => {
    const token = req.headers["x-acess-token"];

    if (!token) {
        return res.status(401).json({ message: "Token is required" });
    }

    // เพิ่ม token ไปยัง blacklist
    blacklist.add(token);

    res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { register, login, logout }
 