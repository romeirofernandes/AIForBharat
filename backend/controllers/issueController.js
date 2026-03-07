const prisma = require("../config/prisma");
// restart nodemon to load generated prisma client
exports.createIssue = async (req, res) => {
    try {
        const { department, incident_type, description, latitude, longitude } = req.body;

        if (!department || !incident_type || !description) {
            return res.status(400).json({ error: "Department, incident type, and description are required" });
        }

        const title = `${department} - ${incident_type}`;

        // Get file URLs from S3 upload (req.files)
        let imageUrl = null;
        let videoUrl = null;
        
        if (req.files) {
            if (req.files['image'] && req.files['image'][0]) {
                imageUrl = req.files['image'][0].location;
            }
            if (req.files['vr_image'] && req.files['vr_image'][0]) {
                videoUrl = req.files['vr_image'][0].location; // using videoUrl to store vr_image
            }
        }

        // Find the matching department by name
        const foundDepartment = await prisma.department.findUnique({
            where: { name: department }
        });

        // Use the ID if found, otherwise keep it null (or you can handle unknown departments)
        const departmentId = foundDepartment ? foundDepartment.id : null;

        const issue = await prisma.issue.create({
            data: {
                title,
                description,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                imageUrl: imageUrl || null,
                videoUrl: videoUrl || null,
                departmentId,
                incidentType: incident_type || null,
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
                department: {
                    select: { name: true }
                }
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
