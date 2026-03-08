const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const upload = require("../middleware/upload");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/profile", requireAuth, authController.getProfile);
router.put("/profile", requireAuth, upload.single("profileImage"), authController.updateProfile);
router.post("/whatsapp/generate-otp", requireAuth, authController.generateWhatsappOtp);

module.exports = router;
