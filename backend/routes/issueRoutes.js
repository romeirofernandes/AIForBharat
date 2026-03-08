const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const upload = require("../middleware/upload");

// User routes
router.post("/", requireAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'vr_image', maxCount: 1 }]), issueController.createIssue);
router.get("/my", requireAuth, issueController.getMyIssues);

// Admin routes
router.get("/all", requireAuth, requireAdmin, issueController.getAllIssues);
router.get("/aggregated", requireAuth, requireAdmin, issueController.getAggregatedIssues);
router.post("/resolution-flow", requireAuth, requireAdmin, issueController.getResolutionFlow);
router.patch("/:id/status", requireAuth, requireAdmin, issueController.updateIssueStatus);

// Stats (admin)
router.get("/stats", requireAuth, requireAdmin, issueController.getStats);

module.exports = router;
