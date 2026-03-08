const prisma = require("../config/prisma");

/**
 * Calculate priority score for a single issue.
 * Formula: (issueVotes * 2) + (clusterCount * 3) + (daysOpen * 1.5)
 */
function computePriorityScore(voteSum, clusterCount, createdAt) {
    const daysOpen = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return (voteSum * 2) + (clusterCount * 3) + (daysOpen * 1.5);
}

/**
 * Recalculate and persist priority score for a single issue.
 */
async function recalculateIssuePriority(issueId) {
    const issue = await prisma.issue.findUnique({
        where: { id: issueId },
        include: { votes: { select: { value: true } } },
    });
    if (!issue) return;

    const voteSum = issue.votes.reduce((sum, v) => sum + v.value, 0);

    // Get cluster count: same incident type + approximate location
    const GRID = 100;
    let clusterCount = 1;
    if (issue.incidentType) {
        const allSameType = await prisma.issue.findMany({
            where: { incidentType: issue.incidentType },
            select: { latitude: true, longitude: true },
        });
        const latKey = issue.latitude != null ? Math.round(issue.latitude * GRID) : "none";
        const lngKey = issue.longitude != null ? Math.round(issue.longitude * GRID) : "none";
        clusterCount = allSameType.filter((i) => {
            const iLat = i.latitude != null ? Math.round(i.latitude * GRID) : "none";
            const iLng = i.longitude != null ? Math.round(i.longitude * GRID) : "none";
            return iLat === latKey && iLng === lngKey;
        }).length;
    }

    const priorityScore = computePriorityScore(voteSum, clusterCount, issue.createdAt);

    await prisma.issue.update({
        where: { id: issueId },
        data: { priorityScore },
    });

    return priorityScore;
}

/**
 * Batch recalculate priority for all non-resolved issues.
 */
async function recalculateAllPriorities() {
    const issues = await prisma.issue.findMany({
        where: { status: { not: "resolved" } },
        include: { votes: { select: { value: true } } },
    });

    // Build cluster counts
    const GRID = 100;
    const clusterCounts = {};
    for (const issue of issues) {
        const type = (issue.incidentType || "unknown").toLowerCase().trim();
        const latKey = issue.latitude != null ? Math.round(issue.latitude * GRID) : "none";
        const lngKey = issue.longitude != null ? Math.round(issue.longitude * GRID) : "none";
        const key = `${type}__${latKey}__${lngKey}`;
        clusterCounts[key] = (clusterCounts[key] || 0) + 1;
    }

    const updates = issues.map((issue) => {
        const type = (issue.incidentType || "unknown").toLowerCase().trim();
        const latKey = issue.latitude != null ? Math.round(issue.latitude * GRID) : "none";
        const lngKey = issue.longitude != null ? Math.round(issue.longitude * GRID) : "none";
        const key = `${type}__${latKey}__${lngKey}`;
        const voteSum = issue.votes.reduce((sum, v) => sum + v.value, 0);
        const score = computePriorityScore(voteSum, clusterCounts[key] || 1, issue.createdAt);
        return prisma.issue.update({
            where: { id: issue.id },
            data: { priorityScore: score },
        });
    });

    await Promise.all(updates);
}

module.exports = {
    computePriorityScore,
    recalculateIssuePriority,
    recalculateAllPriorities,
};
