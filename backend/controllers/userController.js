const prisma = require("../config/prisma");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
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
