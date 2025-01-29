const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }

  try {
    // ตรวจสอบความถูกต้องของ Token
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded; 
    next(); 
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
