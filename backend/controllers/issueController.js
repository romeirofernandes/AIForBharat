const prisma = require("../config/prisma");

// Create a new issue (user)
exports.createIssue = async (req, res) => {
    try {
        const { title, description, location } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }

        const issue = await prisma.issue.create({
            data: {
                title,
                description,
                location: location || null,
                userId: req.user.userId,
            },
        });

        res.status(201).json({ message: "Issue reported successfully", issue });
    } catch (error) {
        console.error("Create issue error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get issues for the logged-in user
exports.getMyIssues = async (req, res) => {
    try {
        const issues = await prisma.issue.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: "desc" },
        });

        res.json({ issues });
    } catch (error) {
        console.error("Get my issues error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get ALL issues (admin)
exports.getAllIssues = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};

        const issues = await prisma.issue.findMany({
            where,
            include: {
                user: {
                    select: { id: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ issues });
    } catch (error) {
        console.error("Get all issues error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update issue status (admin)
exports.updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "in_progress", "resolved", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
        }

        const issue = await prisma.issue.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        res.json({ message: "Issue status updated", issue });
    } catch (error) {
        console.error("Update issue error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get dashboard stats (admin)
exports.getStats = async (req, res) => {
    try {
        const [totalIssues, pendingIssues, resolvedIssues, totalUsers] = await Promise.all([
            prisma.issue.count(),
            prisma.issue.count({ where: { status: "pending" } }),
            prisma.issue.count({ where: { status: "resolved" } }),
            prisma.user.count({ where: { role: "user" } }),
        ]);

        res.json({
            stats: {
                totalIssues,
                pendingIssues,
                resolvedIssues,
                totalUsers,
            },
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
