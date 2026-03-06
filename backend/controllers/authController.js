const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret";

exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert new user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user,
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Fetch user from DB
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                created_at: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
