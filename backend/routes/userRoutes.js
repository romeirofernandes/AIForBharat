const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Admin: list all users
router.get("/", requireAuth, requireAdmin, userController.getAllUsers);

// Reputation: get own reputation
router.get("/me/reputation", requireAuth, userController.getMyReputation);

// Reputation: get any user's reputation
router.get("/:id/reputation", requireAuth, userController.getUserReputation);

module.exports = router;
