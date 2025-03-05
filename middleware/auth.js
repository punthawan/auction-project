const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;  

  if (!token) {
    return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;  
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token ไม่ถูกต้อง" });
  }
};

module.exports = authMiddleware;
