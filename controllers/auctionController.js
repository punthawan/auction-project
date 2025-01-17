const Auction = require("../models/auction.schema");
const User = require("../models/user.schema"); 


// Create Auction
const createAuction = async (req, res) => {
  const { title, description, startingPrice, startTime, endTime } = req.body;

  if (!req.body.title) {
    res
      .status(400)
      .send({ status: "error", message: "title can not be empty!" });
    return;
  }

  if (!req.body.description) {
    res
      .status(400)
      .send({ status: "error", message: "description can not be empty!" });
    return;
  }

  if (!req.body.startingPrice) {
    res
      .status(400)
      .send({ status: "error", message: "startingPrice can not be empty!" });
    return;
  }

  if (!req.body.startTime) {
    res
      .status(400)
      .send({ status: "error", message: "startTime can not be empty!" });
    return;
  }

  if (!req.body.endTime) {
    res
      .status(400)
      .send({ status: "error", message: "endTime can not be empty!" });
    return;
  }

  const auction = new Auction({
    title,
    description,
    startingPrice,
    currentPrice: startingPrice,
    startTime,
    endTime,
    status: "ongoing", // กำหนดสถานะเริ่มต้นเป็น 'active'
  });

  try {
    await auction.save();
    res.status(201).json({ message: "Auction created successfully", auction });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// JOIN AUCTION
const joinAuction = async (req, res) => {
  const { auctionId } = req.body;
  const userId = req.user._id; // ใช้ JWT เพื่อดึงข้อมูลผู้ใช้ที่ทำการ request

  if (!userId) {
    return res.status(400).json({ message: "User ID is missing" });
  }

  try {
    // ค้นหาประมูลตาม auctionId ที่ได้รับจาก body
    const auction = await Auction.findById(auctionId);

    // ตรวจสอบว่าประมูลมีอยู่ในระบบหรือไม่
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // ตรวจสอบสถานะการประมูลว่าเสร็จสิ้นหรือยัง
    if (auction.status === "completed") {
      return res.status(400).json({ message: "This auction has already ended" });
    }

    // ตรวจสอบว่า participants มีค่าหรือไม่ หากไม่มีจะตั้งเป็น array ว่าง
    if (!Array.isArray(auction.participants)) {
      auction.participants = [];  // หากไม่มี participants ให้เริ่มต้นเป็น array ว่าง
    }

    // ตรวจสอบก่อนว่า userId ยังไม่อยู่ใน participants
    if (!auction.participants.includes(userId)) {
      auction.participants.push(userId);  // เพิ่ม userId ลงใน participants
    } else {
      return res.status(400).json({ message: "You have already joined this auction" });
    }

    // บันทึกการอัปเดตประมูล
    await auction.save();

    // ส่ง response กลับไปยัง client
    res.status(200).json({ message: "Successfully joined auction", auction });
  } catch (err) {
    // หากเกิดข้อผิดพลาดให้ส่ง response กลับไป
    res.status(500).json({ message: err.message });
  }
};




// Get Auction Details
const getAuctionDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const auction = await Auction.findById(id).populate("highestBidder", "username email"); // เอาข้อมูลผู้ที่เสนอราคาสูงสุด

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.status(200).json({ auction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createAuction, joinAuction, getAuctionDetails };
