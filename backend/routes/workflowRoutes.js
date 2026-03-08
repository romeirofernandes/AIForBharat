const express = require("express");
const router = express.Router();
const workflowController = require("../controllers/workflowController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Get workflow by ID
router.get("/:id", requireAuth, requireAdmin, workflowController.getWorkflow);

// Get workflows by cluster key
router.get("/", requireAuth, requireAdmin, workflowController.getClusterWorkflows);

// Update a workflow step
router.patch("/step/:id", requireAuth, requireAdmin, workflowController.updateWorkflowStep);

module.exports = router;
