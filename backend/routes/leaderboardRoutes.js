const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");

// Public endpoint — no auth required for leaderboard
router.get("/", leaderboardController.getLeaderboard);

module.exports = router;
