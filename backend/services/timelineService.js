const prisma = require("../config/prisma");

/**
 * Log an action to the issue timeline.
 */
async function logHistory(issueId, action, actorId, actorRole, metadata = null) {
    try {
        await prisma.issueHistory.create({
            data: {
                issueId,
                action,
                actorId,
                actorRole,
                metadata,
            },
        });
    } catch (error) {
        console.error(`Failed to log history for issue ${issueId}:`, error.message);
    }
}

/**
 * Get full timeline for an issue.
 */
async function getIssueTimeline(issueId) {
    const entries = await prisma.issueHistory.findMany({
        where: { issueId },
        include: {
            actor: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    profile: { select: { name: true } },
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    return entries.map((entry) => ({
        id: entry.id,
        action: entry.action,
        actorRole: entry.actorRole,
        actor: {
            id: entry.actor.id,
            email: entry.actor.email,
            name: entry.actor.profile?.name || null,
        },
        metadata: entry.metadata,
        createdAt: entry.createdAt,
    }));
}

// Action constants
const ACTIONS = {
    ISSUE_CREATED: "issue_created",
    VOTE_ADDED: "vote_added",
    VOTE_REMOVED: "vote_removed",
    COMMENT_ADDED: "comment_added",
    STATUS_UPDATED: "status_updated",
    WORKFLOW_CREATED: "workflow_created",
    WORKFLOW_STEP_COMPLETED: "workflow_step_completed",
};

module.exports = {
    logHistory,
    getIssueTimeline,
    ACTIONS,
};
