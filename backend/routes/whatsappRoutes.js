const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");

// Twilio sends POST with application/x-www-form-urlencoded — no auth needed  
router.post("/webhook", whatsappController.handleWebhook);

module.exports = router;
