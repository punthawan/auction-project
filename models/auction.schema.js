const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startingPrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["ongoing", "completed","upcoming"], default: "ongoing" },

  participants: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  ], // เพิ่มฟิลด์สำหรับเก็บผู้เข้าร่วมประมูล
});

module.exports = mongoose.model("Auction", auctionSchema);
