const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// User routes
router.post("/", requireAuth, issueController.createIssue);
router.get("/my", requireAuth, issueController.getMyIssues);

// Admin routes
router.get("/all", requireAuth, requireAdmin, issueController.getAllIssues);
router.patch("/:id/status", requireAuth, requireAdmin, issueController.updateIssueStatus);

// Stats (admin)
router.get("/stats", requireAuth, requireAdmin, issueController.getStats);

module.exports = router;
