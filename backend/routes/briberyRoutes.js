const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const briberyController = require("../controllers/briberyController");

// ─── User Routes ────────────────────────────────────────────────

// File a new bribery complaint (up to 5 proof files)
router.post("/", requireAuth, upload.array("proof", 5), briberyController.createComplaint);

// Get all my complaints
router.get("/my", requireAuth, briberyController.getMyComplaints);

// Get a single complaint by ID (user must own it)
router.get("/my/:id", requireAuth, briberyController.getMyComplaintById);

// Transcribe audio + parse with AI
router.post("/transcribe", requireAuth, upload.single("audio"), briberyController.transcribeAndParse);

// ─── Admin Routes ───────────────────────────────────────────────

// Get all complaints (admin only)
router.get("/admin/all", requireAuth, requireAdmin, briberyController.getAllComplaints);

// Update complaint status (admin only)
router.patch("/admin/:id/status", requireAuth, requireAdmin, briberyController.updateComplaintStatus);

module.exports = router;
