const nodemailer = require("nodemailer");
const User = require("../models/user.schema"); 
const bcrypt = require('bcrypt');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// ฟังก์ชันส่งรหัส OTP ไปที่อีเมล
const sendResetPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
    }

    // สร้างรหัส OTP (6 หลัก)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10); // เข้ารหัส OTP ก่อนบันทึก

    // บันทึก OTP ลงฐานข้อมูล
    user.resetPasswordOTP = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // หมดอายุใน 10 นาที
    await user.save();

    // ส่งอีเมล OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "รหัส OTP สำหรับรีเซ็ตรหัสผ่าน",
      text: `รหัส OTP ของคุณคือ: ${otp} (ใช้ได้ภายใน 10 นาที)`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP ถูกส่งไปที่อีเมลของคุณแล้ว" });

  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการส่ง OTP" });
  }
};

const verifyOTPAndResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
      }
  
      // ตรวจสอบว่า OTP หมดอายุหรือไม่
      if (!user.otpExpires || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: "รหัส OTP หมดอายุแล้ว" });
      }
  
      // ตรวจสอบ OTP
      const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
      if (!isMatch) {
        return res.status(400).json({ message: "รหัส OTP ไม่ถูกต้อง" });
      }
  
      // เข้ารหัสรหัสผ่านใหม่
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
  
      // ลบ OTP ออกจากฐานข้อมูล
      user.resetPasswordOTP = null;
      user.otpExpires = null;
      await user.save();
  
      res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จแล้ว" });
  
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
    }
  };
  
  module.exports = { sendResetPasswordOTP, verifyOTPAndResetPassword };
  
