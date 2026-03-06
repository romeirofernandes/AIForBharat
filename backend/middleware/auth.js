const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret";

/**
 * Middleware: Verifies JWT and attaches user to req.user
 */
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { userId, role, email }
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

/**
 * Middleware: Checks if user has admin role
 * Must be used AFTER requireAuth
 */
const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    next();
};

module.exports = { requireAuth, requireAdmin };
