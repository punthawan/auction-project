const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },  // ชี้ไปที่ Auction
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },      // ชี้ไปที่ User
  amount: { type: Number, required: true },  // จำนวนเงินที่ผู้ใช้เสนอ
  bidTime: { type: Date, default: Date.now },  // เวลาที่ทำการประมูล
});

module.exports = mongoose.model("Bid", bidSchema);  
