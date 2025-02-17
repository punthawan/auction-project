const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController'); 
const { placeBid } = require("../controllers/bidController");
const authMiddleware = require('../middleware/auth'); 

// Routes
router.post('/create', authMiddleware, auctionController.createAuction); 
router.post('/join', authMiddleware, auctionController.joinAuction);
router.post("/placeBid", authMiddleware, placeBid);
router.get('/:id', auctionController.getAuctionDetails);

router.post("/update-status", async (req, res) => {
    try {
      await updateAuctionStatus();
      res.status(200).json({ message: "Auction statuses updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating auction statuses", error: error.message });
    }
  });

module.exports = router;
