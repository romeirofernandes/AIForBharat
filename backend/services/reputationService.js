const prisma = require("../config/prisma");

/**
 * Increase a user's reputation score by the given amount.
 */
async function increaseReputation(userId, amount) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { reputationScore: { increment: amount } },
        });
    } catch (error) {
        console.error(`Failed to update reputation for user ${userId}:`, error.message);
    }
}

/**
 * Calculate a user's trust level based on their reputation score.
 */
function calculateTrustLevel(score) {
    if (score >= 500) return { level: "Civic Leader", tier: 4 };
    if (score >= 150) return { level: "Community Reporter", tier: 3 };
    if (score >= 50) return { level: "Active Citizen", tier: 2 };
    return { level: "Citizen", tier: 1 };
}

/**
 * Get full reputation data for a user.
 */
async function getUserReputation(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            reputationScore: true,
            _count: {
                select: {
                    issues: true,
                    comments: true,
                    issueVotes: true,
                },
            },
        },
    });

    if (!user) return null;

    const trustInfo = calculateTrustLevel(user.reputationScore);

    // Calculate achievements
    const achievements = [];
    if (user._count.issues >= 1) achievements.push({ id: "first_report", label: "First Report", icon: "📝" });
    if (user._count.issues >= 10) achievements.push({ id: "ten_reports", label: "10 Issues Reported", icon: "🔟" });
    if (user._count.issues >= 50) achievements.push({ id: "fifty_reports", label: "50 Issues Reported", icon: "⭐" });
    if (user._count.comments >= 5) achievements.push({ id: "commenter", label: "Community Voice", icon: "💬" });
    if (user._count.comments >= 25) achievements.push({ id: "active_commenter", label: "Active Commenter", icon: "🗣️" });
    if (user.reputationScore >= 50) achievements.push({ id: "active_citizen", label: "Active Citizen", icon: "🏛️" });
    if (user.reputationScore >= 150) achievements.push({ id: "community_reporter", label: "Community Reporter", icon: "📰" });
    if (user.reputationScore >= 500) achievements.push({ id: "civic_leader", label: "Civic Leader", icon: "👑" });
    if (user._count.issueVotes >= 10) achievements.push({ id: "voter", label: "Civic Voter", icon: "🗳️" });

    return {
        score: user.reputationScore,
        trustLevel: trustInfo.level,
        trustTier: trustInfo.tier,
        achievements,
        stats: {
            issuesReported: user._count.issues,
            commentsPosted: user._count.comments,
            votesCast: user._count.issueVotes,
        },
    };
}

// Reputation reward constants
const REWARDS = {
    REPORT_ISSUE: 5,
    ISSUE_UPVOTE_RECEIVED: 3,
    COMMENT_UPVOTE_RECEIVED: 2,
    ISSUE_RESOLVED: 10,
};

module.exports = {
    increaseReputation,
    calculateTrustLevel,
    getUserReputation,
    REWARDS,
};
