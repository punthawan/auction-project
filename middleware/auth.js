const jwt = require("jsonwebtoken");
const User = require("../models/user.schema");

const authMiddleware = async (req, res, next) => {
  const token = req.headers["x-acess-token"];
  if (!token) return res.status(401).json({ message: "Token is required" });

  try {
    // Decode token
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;

    const user = await User.findById(decoded._id);
    if (!user || user.token !== token) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
