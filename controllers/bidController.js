const Bid = require("../models/bid.schema");
const Auction = require("../models/auction.schema");

// Place a Bid
const placeBid = async (req, res) => {
  const { auctionId, amount} = req.body; // รับ userId จาก request body
  const userId = req.user._id;

  try {
    // ค้นหา Auction
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // ตรวจสอบว่า Auction สิ้นสุดหรือยัง
    if (auction.status === "completed") {
      return res.status(400).json({ message: "This auction has already ended, you can't bid" });
    }

    //ตรวจสอบว่า join ห้องประมูลรียัง
    if(!auction.participants.includes(userId)){
      return res.status(400).json({ message: "you must join this auction first" });
    }

    // ตรวจสอบว่า bid สูงกว่าราคาปัจจุบันหรือไม่
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ message: "Bid amount must be higher than the current price" });
    }

    // สร้าง Bid ใหม่
    const bid = new Bid({
      auction: auctionId,
      user: userId, 
      amount,
    });

    // อัปเดตราคาปัจจุบันและผู้เสนอราคาสูงสุดใน Auction
    auction.currentPrice = amount;
    auction.highestBidder = userId;

    await bid.save(); // บันทึก Bid
    await auction.save(); // บันทึกการเปลี่ยนแปลงของ Auction

    res.status(201).json({ message: "Bid placed successfully", bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { placeBid };
