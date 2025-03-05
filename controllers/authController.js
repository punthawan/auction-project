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
          isEmailVerified: false,
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
      try {
        await sendVerificationEmail(savedUser.email, verificationLink); // Catch any errors here
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        return res.status(500).json({ message: 'ไม่สามารถส่งอีเมลยืนยันได้' });
      }

      res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
  } catch (error) {
      console.error("Server error:", error); // Log the actual server error
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ: ' + error.message });
  }
};


//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "อีเมล์ไม่ถูกต้อง" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: "กรุณายืนยัน Email ก่อน" });
    }

    // สร้าง accessToken
    const accessToken = jwt.sign(
      { _id: user._id, email: user.email }, 
      process.env.TOKEN_KEY, 
      { expiresIn: "1h" } // token อายุ 1 ชั่วโมง
    );

    // สร้าง refreshToken
    const refreshToken = jwt.sign(
      { _id: user._id, email: user.email }, 
      process.env.REFRESH_TOKEN_KEY, 
      { expiresIn: "7d" } // refreshToken อายุ 7 วัน
    );

     res.cookie("accessToken", accessToken, {
      httpOnly: true,   
      secure: process.env.NODE_ENV === "production", 
      maxAge: 3600000,  
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,   
      secure: process.env.NODE_ENV === "production", 
      maxAge: 604800000, 
    });

    // ส่ง accessToken และ refreshToken กลับไปยัง Client
    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      accessToken, // ส่ง accessToken
      refreshToken, // ส่ง refreshToken
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

// Update Account Information
const updateAccount = async (req, res) => {
  try {
    const userId = req.user._id; // ได้จาก authMiddleware
    const { username, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    // เปลี่ยน username ถ้ามี
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Username นี้มีคนใช้แล้ว" });
      }
      user.username = username;
    }

    // เปลี่ยน password ถ้ามี
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "รหัสผ่านเดิมไม่ถูกต้อง" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ" });

  } catch (error) {
    console.error("Update Account Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};


// Logout
const logout = (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Token is required" });
    }

    // เพิ่ม token ไปยัง blacklist
    blacklist.add(token);
    res.status(200).json({ message: "Logged out successfully" });
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh Token is required" });
  }

  try {
    // ตรวจสอบว่า refreshToken ถูกต้อง
    const decoded = jwt.verify(refreshToken, process.env.TOKEN_KEY);
    const user = await User.findOne({ _id: decoded._id });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    // สร้าง accessToken ใหม่
    const accessToken = jwt.sign(
      { _id: user._id, email: user.email }, // payload
      process.env.TOKEN_KEY, // secret key
      { expiresIn: "1h" } // accessToken อายุ 1 ชั่วโมง
    );

    // ส่ง accessToken ใหม่กลับไป
    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

module.exports = { register, login, updateAccount, logout, refreshToken}
 