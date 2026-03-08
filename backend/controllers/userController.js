const prisma = require("../config/prisma");
const { getUserReputation } = require("../services/reputationService");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                reputationScore: true,
                createdAt: true,
                _count: {
                    select: { issues: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ users });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get reputation for a user
exports.getUserReputation = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const reputation = await getUserReputation(userId);

        if (!reputation) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ reputation });
    } catch (error) {
        console.error("Get reputation error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get own reputation (for profile page)
exports.getMyReputation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const reputation = await getUserReputation(userId);

        if (!reputation) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ reputation });
    } catch (error) {
        console.error("Get my reputation error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
