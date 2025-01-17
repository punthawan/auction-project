const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // เชื่อมต่อ MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // ออกจากโปรแกรมเมื่อเชื่อมต่อไม่ได้
  }
};

module.exports = connectDB;
