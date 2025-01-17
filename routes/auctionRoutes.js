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

module.exports = router;
