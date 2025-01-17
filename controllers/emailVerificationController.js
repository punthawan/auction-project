const User = require('../models/user.schema'); 

const verifyEmail = async (req, res) => {
    const { token } = req.query;
  
    try {
      console.log("Token from query:", token); // Debugging
  
      const user = await User.findOne({ emailVerificationToken: token });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      // อัปเดตสถานะการยืนยันอีเมล
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      await user.save();
  
      res.status(200).json({ message: "Email verified successfully" });
    } catch (err) {
      console.error("Error verifying email:", err); // Debugging
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  

  module.exports = { verifyEmail }
