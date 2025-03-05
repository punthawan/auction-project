const Auction = require("../models/auction.schema");
const User = require("../models/user.schema"); 
const sendEmail = require("../modules/email/sendVerificationEmail");


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
    status: new Date(startTime) > new Date() ? "upcoming" : "ongoing"
  });

  try {
    await auction.save();
    res.status(201).json({ message: "Auction created successfully", auction });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateAuctionStatus = async () => {
  try {
    const now = new Date();
    const auctions = await Auction.find({ status: "completed", winner: null });

    // อัปเดตสถานะจาก "upcoming" -> "ongoing"
    await Auction.updateMany(
      { startTime: { $lte: now }, status: "upcoming" },
      { status: "ongoing" }
    );

    // อัปเดตสถานะจาก "ongoing" -> "completed"
    await Auction.updateMany(
      { endTime: { $lte: now }, status: "ongoing" },
      { status: "completed" }
    );

    // ตรวจสอบผู้ชนะและส่งอีเมลแจ้งเตือน
    for (let auction of auctions) {
      if (auction.highestBidder) {
        // อัปเดต winner
        auction.winner = auction.highestBidder;
        await auction.save();

        // ดึงข้อมูลอีเมลของผู้ชนะจาก User schema
        const winnerUser = await User.findById(auction.highestBidder);
        if (winnerUser && winnerUser.email) {
          await sendEmail(
            winnerUser.email,
            "🎉 Congratulations! You won the auction!",
            `Dear ${winnerUser.username},\n\nYou have won the auction "${auction.title}" with a bid of ${auction.currentPrice}.\n\nThank you for participating!`
          );
        }

        console.log(`🎉 Winner updated & email sent for auction: ${auction._id}`);
      } else {
        console.log(`⚠️ No highestBidder for auction: ${auction._id}`);
      }
    }

    console.log("✅ Auction status updated successfully");
  } catch (error) {
    console.error("❌ Error updating auction statuses:", error);
  }
};

// JOIN AUCTION
const joinAuction = async (req, res) => {
  const { auctionId } = req.body;
  const userId = req.user._id; 

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

    if (auction.status === "upcoming") {
      return res.status(400).json({ message: "ห้องประมูลนี้ยังไม่เริ่ม" });
    }

    // ตรวจสอบว่า participants มีค่าหรือไม่ หากไม่มีจะตั้งเป็น array ว่าง
    if (!Array.isArray(auction.participants)) {
      auction.participants = [];  
    }

    // ตรวจสอบก่อนว่า userId ยังไม่อยู่ใน participants
    if (!auction.participants.includes(userId)) {
      auction.participants.push(userId); 
    } else {
      return res.status(400).json({ message: "You have already joined this auction" });
    }

    // บันทึกการอัปเดตประมูล
    await auction.save();
    res.status(200).json({ message: "Successfully joined auction", auction });
  } catch (err) {
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
