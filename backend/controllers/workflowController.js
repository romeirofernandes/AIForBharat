const prisma = require("../config/prisma");
const { logHistory, ACTIONS } = require("../services/timelineService");

// Get a workflow by ID
exports.getWorkflow = async (req, res) => {
    try {
        const { id } = req.params;
        const workflow = await prisma.issueWorkflow.findUnique({
            where: { id: parseInt(id) },
            include: {
                steps: { orderBy: { createdAt: "asc" } },
            },
        });

        if (!workflow) {
            return res.status(404).json({ error: "Workflow not found" });
        }

        res.json({ workflow });
    } catch (error) {
        console.error("Get workflow error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update a workflow step (mark completed, add notes, upload evidence)
exports.updateWorkflowStep = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, evidenceUrl, assignedTo } = req.body;

        const step = await prisma.workflowStep.findUnique({
            where: { id: parseInt(id) },
            include: {
                workflow: {
                    include: { steps: { orderBy: { createdAt: "asc" } } },
                },
            },
        });

        if (!step) {
            return res.status(404).json({ error: "Step not found" });
        }

        // Build update data
        const updateData = {};
        if (notes !== undefined) updateData.notes = notes;
        if (evidenceUrl !== undefined) updateData.evidenceUrl = evidenceUrl;
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

        if (status === "completed" && step.status !== "completed") {
            updateData.status = "completed";
            updateData.completedAt = new Date();
        } else if (status && status !== "completed") {
            updateData.status = status;
        }

        const updatedStep = await prisma.workflowStep.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        // ── If step completed, activate next steps ──
        if (status === "completed") {
            const flowJson = step.workflow.flowJson;
            const flowStep = (flowJson.steps || []).find((s) => s.id === step.stepId);

            if (flowStep && flowStep.nextSteps && flowStep.nextSteps.length > 0) {
                // Activate all next steps
                const nextStepIds = flowStep.nextSteps;
                await prisma.workflowStep.updateMany({
                    where: {
                        workflowId: step.workflowId,
                        stepId: { in: nextStepIds },
                        status: "pending",
                    },
                    data: { status: "active" },
                });
            }

            // ── Auto-update linked issue statuses ──
            if (step.workflow.issueId) {
                const allSteps = step.workflow.steps;
                const isFirstStep = allSteps[0]?.id === step.id;
                const isLastStep = flowStep && (!flowStep.nextSteps || flowStep.nextSteps.length === 0);

                // Check if all steps are now completed
                const remainingSteps = allSteps.filter(
                    (s) => s.id !== step.id && s.status !== "completed"
                );

                if (isLastStep || remainingSteps.length === 0) {
                    // Final step → resolve issue
                    await prisma.issue.update({
                        where: { id: step.workflow.issueId },
                        data: { status: "resolved" },
                    });
                    await prisma.issueWorkflow.update({
                        where: { id: step.workflowId },
                        data: { status: "completed" },
                    });
                } else if (isFirstStep) {
                    // First step completed → in_progress
                    await prisma.issue.update({
                        where: { id: step.workflow.issueId },
                        data: { status: "in_progress" },
                    });
                }

                // ── Timeline: log step completion ──
                await logHistory(
                    step.workflow.issueId,
                    ACTIONS.WORKFLOW_STEP_COMPLETED,
                    req.user.userId,
                    req.user.role,
                    { stepId: step.stepId, stepTitle: step.title }
                );
            }
        }

        // Return updated workflow
        const updatedWorkflow = await prisma.issueWorkflow.findUnique({
            where: { id: step.workflowId },
            include: { steps: { orderBy: { createdAt: "asc" } } },
        });

        res.json({ step: updatedStep, workflow: updatedWorkflow });
    } catch (error) {
        console.error("Update workflow step error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get workflows for a cluster
exports.getClusterWorkflows = async (req, res) => {
    try {
        const { clusterKey } = req.query;
        if (!clusterKey) {
            return res.status(400).json({ error: "clusterKey is required" });
        }

        const workflows = await prisma.issueWorkflow.findMany({
            where: { clusterKey },
            include: { steps: { orderBy: { createdAt: "asc" } } },
            orderBy: { createdAt: "desc" },
        });

        res.json({ workflows });
    } catch (error) {
        console.error("Get cluster workflows error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
