const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");

// Twilio sends POST with application/x-www-form-urlencoded — no auth needed  
router.post("/webhook", whatsappController.handleWebhook);

// Location share page endpoints (public — token-authenticated)
router.get("/pending-report/:token", (req, res) => {
    const pending = whatsappController.getPendingReport(req.params.token);
    if (!pending) {
        return res.status(404).json({ error: "Report not found or expired" });
    }
    res.json({
        department: pending.report.department,
        incidentType: pending.report.incidentType,
        description: pending.report.description?.substring(0, 100),
        hasImage: !!pending.report.imageUrl,
        hasVideo: !!pending.report.videoUrl,
    });
});

router.post("/submit-location/:token", async (req, res) => {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
    }
    const result = await whatsappController.saveWhatsAppIssue(req.params.token, latitude, longitude);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }
    res.json({ message: "Issue reported successfully", issue: result.issue });
});

module.exports = router;
