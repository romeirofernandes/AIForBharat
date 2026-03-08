const prisma = require("../config/prisma");
const { increaseReputation, REWARDS } = require("../services/reputationService");
const { logHistory, ACTIONS } = require("../services/timelineService");
const { recalculateIssuePriority } = require("../services/priorityService");

// ─── Get all issues for forum feed (public to authenticated users) ──
exports.getFeed = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status, department, sort, search } = req.query;

        const where = {};
        if (status) where.status = status;
        if (department) where.department = { name: department };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        const issues = await prisma.issue.findMany({
            where,
            include: {
                user: { select: { id: true, email: true, profile: { select: { name: true } } } },
                department: { select: { name: true } },
                votes: { select: { userId: true, value: true } },
                comments: { select: { id: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // Compute scores and user vote state
        const feed = issues.map((issue) => {
            const score = issue.votes.reduce((sum, v) => sum + v.value, 0);
            const userVote = issue.votes.find((v) => v.userId === userId);
            return {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                latitude: issue.latitude,
                longitude: issue.longitude,
                imageUrl: issue.imageUrl,
                videoUrl: issue.videoUrl,
                status: issue.status,
                incidentType: issue.incidentType,
                department: issue.department?.name || null,
                user: {
                    id: issue.user.id,
                    email: issue.user.email,
                    name: issue.user.profile?.name || null,
                },
                score,
                userVote: userVote ? userVote.value : 0,
                commentCount: issue.comments.length,
                createdAt: issue.createdAt,
            };
        });

        // Sort
        if (sort === "top") {
            feed.sort((a, b) => b.score - a.score);
        } else if (sort === "hot") {
            feed.sort((a, b) => {
                const hotA = a.score + 1 / (1 + (Date.now() - new Date(a.createdAt).getTime()) / 3600000);
                const hotB = b.score + 1 / (1 + (Date.now() - new Date(b.createdAt).getTime()) / 3600000);
                return hotB - hotA;
            });
        }
        // default is "new" — already sorted by createdAt desc

        res.json({ feed });
    } catch (error) {
        console.error("Forum feed error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Vote on an issue (toggle) ─────────────────────────────────
exports.voteIssue = async (req, res) => {
    try {
        const issueId = parseInt(req.params.id);
        const userId = req.user.userId;
        const { value } = req.body; // +1 or -1

        if (value !== 1 && value !== -1) {
            return res.status(400).json({ error: "Value must be 1 or -1" });
        }

        const existing = await prisma.issueVote.findUnique({
            where: { issueId_userId: { issueId, userId } },
        });

        let vote;
        if (existing) {
            if (existing.value === value) {
                // Same vote → remove (toggle off)
                await prisma.issueVote.delete({ where: { id: existing.id } });
                vote = null;
            } else {
                // Flip
                vote = await prisma.issueVote.update({ where: { id: existing.id }, data: { value } });
            }
        } else {
            vote = await prisma.issueVote.create({ data: { issueId, userId, value } });
        }

        // Return new score
        const agg = await prisma.issueVote.aggregate({
            where: { issueId },
            _sum: { value: true },
        });

        // ── Reputation: reward issue author on upvote ──
        if (vote && value === 1) {
            const issue = await prisma.issue.findUnique({ where: { id: issueId }, select: { userId: true } });
            if (issue && issue.userId !== userId) {
                await increaseReputation(issue.userId, REWARDS.ISSUE_UPVOTE_RECEIVED);
            }
        }

        // ── Timeline: log vote ──
        if (vote) {
            await logHistory(issueId, ACTIONS.VOTE_ADDED, userId, req.user.role, { value });
        } else {
            await logHistory(issueId, ACTIONS.VOTE_REMOVED, userId, req.user.role);
        }

        // ── Priority: recalculate ──
        await recalculateIssuePriority(issueId);

        res.json({ score: agg._sum.value || 0, userVote: vote ? vote.value : 0 });
    } catch (error) {
        console.error("Vote issue error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Get threaded comments for an issue ─────────────────────────
exports.getComments = async (req, res) => {
    try {
        const issueId = parseInt(req.params.id);
        const userId = req.user.userId;

        const comments = await prisma.issueComment.findMany({
            where: { issueId, parentId: null },
            include: {
                user: { select: { id: true, email: true, profile: { select: { name: true } } } },
                votes: { select: { userId: true, value: true } },
                replies: {
                    include: {
                        user: { select: { id: true, email: true, profile: { select: { name: true } } } },
                        votes: { select: { userId: true, value: true } },
                        replies: {
                            include: {
                                user: { select: { id: true, email: true, profile: { select: { name: true } } } },
                                votes: { select: { userId: true, value: true } },
                                replies: {
                                    include: {
                                        user: { select: { id: true, email: true, profile: { select: { name: true } } } },
                                        votes: { select: { userId: true, value: true } },
                                    },
                                    orderBy: { createdAt: "asc" },
                                },
                            },
                            orderBy: { createdAt: "asc" },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        // Recursively attach score and userVote
        function mapComment(c) {
            const score = c.votes.reduce((s, v) => s + v.value, 0);
            const uv = c.votes.find((v) => v.userId === userId);
            return {
                id: c.id,
                body: c.body,
                parentId: c.parentId,
                user: { id: c.user.id, email: c.user.email, name: c.user.profile?.name || null },
                score,
                userVote: uv ? uv.value : 0,
                createdAt: c.createdAt,
                replies: (c.replies || []).map(mapComment),
            };
        }

        res.json({ comments: comments.map(mapComment) });
    } catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Add a comment (top-level or reply) ─────────────────────────
exports.addComment = async (req, res) => {
    try {
        const issueId = parseInt(req.params.id);
        const userId = req.user.userId;
        const { body, parentId } = req.body;

        if (!body || !body.trim()) {
            return res.status(400).json({ error: "Comment body is required" });
        }

        // If parentId, verify it belongs to the same issue
        if (parentId) {
            const parent = await prisma.issueComment.findUnique({ where: { id: parentId } });
            if (!parent || parent.issueId !== issueId) {
                return res.status(400).json({ error: "Invalid parent comment" });
            }
        }

        const comment = await prisma.issueComment.create({
            data: {
                body: body.trim(),
                issueId,
                userId,
                parentId: parentId || null,
            },
            include: {
                user: { select: { id: true, email: true, profile: { select: { name: true } } } },
            },
        });

        // ── Timeline: log comment ──
        await logHistory(issueId, ACTIONS.COMMENT_ADDED, userId, req.user.role, {
            commentId: comment.id, parentId: parentId || null,
        });

        res.status(201).json({
            comment: {
                id: comment.id,
                body: comment.body,
                parentId: comment.parentId,
                user: { id: comment.user.id, email: comment.user.email, name: comment.user.profile?.name || null },
                score: 0,
                userVote: 0,
                createdAt: comment.createdAt,
                replies: [],
            },
        });
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Vote on a comment (toggle) ────────────────────────────────
exports.voteComment = async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);
        const userId = req.user.userId;
        const { value } = req.body;

        if (value !== 1 && value !== -1) {
            return res.status(400).json({ error: "Value must be 1 or -1" });
        }

        const existing = await prisma.commentVote.findUnique({
            where: { commentId_userId: { commentId, userId } },
        });

        let vote;
        if (existing) {
            if (existing.value === value) {
                await prisma.commentVote.delete({ where: { id: existing.id } });
                vote = null;
            } else {
                vote = await prisma.commentVote.update({ where: { id: existing.id }, data: { value } });
            }
        } else {
            vote = await prisma.commentVote.create({ data: { commentId, userId, value } });
        }

        // ── Reputation: reward comment author on upvote ──
        if (vote && value === 1) {
            const comment = await prisma.issueComment.findUnique({ where: { id: commentId }, select: { userId: true } });
            if (comment && comment.userId !== userId) {
                await increaseReputation(comment.userId, REWARDS.COMMENT_UPVOTE_RECEIVED);
            }
        }

        const agg = await prisma.commentVote.aggregate({
            where: { commentId },
            _sum: { value: true },
        });

        res.json({ score: agg._sum.value || 0, userVote: vote ? vote.value : 0 });
    } catch (error) {
        console.error("Vote comment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Get workflow for an issue (read-only public view) ──────────
exports.getIssueWorkflow = async (req, res) => {
    try {
        const issueId = parseInt(req.params.id);
        if (isNaN(issueId)) {
            return res.status(400).json({ error: "Invalid issue ID" });
        }

        const stepSelect = {
            id: true, stepId: true, title: true, description: true,
            type: true, status: true, completedAt: true, createdAt: true,
        };

        // Try direct issue link first
        let workflow = await prisma.issueWorkflow.findFirst({
            where: { issueId },
            include: { steps: { orderBy: { createdAt: "asc" }, select: stepSelect } },
            orderBy: { createdAt: "desc" },
        });

        // Fallback: compute clusterKey from issue data and search by it
        if (!workflow) {
            const issue = await prisma.issue.findUnique({
                where: { id: issueId },
                select: { incidentType: true, latitude: true, longitude: true },
            });
            if (issue?.incidentType) {
                const GRID = 100;
                const type = issue.incidentType.toLowerCase().trim();
                const latKey = issue.latitude != null ? Math.round(issue.latitude * GRID) : "none";
                const lngKey = issue.longitude != null ? Math.round(issue.longitude * GRID) : "none";
                const clusterKey = `${type}__${latKey}__${lngKey}`;

                workflow = await prisma.issueWorkflow.findFirst({
                    where: { clusterKey },
                    include: { steps: { orderBy: { createdAt: "asc" }, select: stepSelect } },
                    orderBy: { createdAt: "desc" },
                });
            }
        }

        res.json({ workflow: workflow || null });
    } catch (error) {
        console.error("Get issue workflow error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
