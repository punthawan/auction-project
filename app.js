const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // เรียกใช้ connectDB
const cookieParser = require("cookie-parser");


dotenv.config(); // โหลด environment variables

const app = express();

// ใช้ cookie-parser
app.use(cookieParser());

// เชื่อมต่อ MongoDB
connectDB();

app.use(express.json()); // Middleware สำหรับ JSON

app.get("/",(req,res)=>{
  res.send("<h1>Hello express.js</h1>")
})

// เส้นทางสำหรับ auth
const authRouter = require('./routes/authRoutes'); // เพิ่มการเรียกใช้ authRoutes
app.use('/api/auth', authRouter);  

// เส้นทางสำหรับ auction
const auctionRoutes = require('./routes/auctionRoutes'); 
app.use('/api/auction', auctionRoutes); 

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
