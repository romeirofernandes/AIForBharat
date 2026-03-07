const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret";

function generateAvatar(username, gender) {
    const seed = Math.floor(Math.random() * 100000);
    const validGender = gender ? gender.toLowerCase() : 'male';
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&gender=${validGender}`;
}

exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Signup always creates a "user" role — admins are inserted manually
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: "user",
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

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

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                profile: await prisma.citizenProfile.findUnique({ where: { userId: user.id } })
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                profile: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, age, gender } = req.body;
        
        if (!name) {
             return res.status(400).json({ error: "Name is required" });
        }

        const currentProfile = await prisma.citizenProfile.findUnique({ where: { userId: req.user.userId } });
        let newAvatarUrl = currentProfile?.imageUrl;

        // Determine new avatar URL
        if (req.file) {
            newAvatarUrl = req.file.location;
        } else if (!newAvatarUrl || (currentProfile && currentProfile.gender !== gender)) {
            newAvatarUrl = generateAvatar(name, gender);
        }

        await prisma.citizenProfile.upsert({
            where: { userId: req.user.userId },
            update: {
                name,
                age: age ? parseInt(age) : null,
                gender: gender || null,
                imageUrl: newAvatarUrl,
            },
            create: {
                userId: req.user.userId,
                name,
                age: age ? parseInt(age) : null,
                gender: gender || null,
                imageUrl: newAvatarUrl,
            }
        });

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                profile: true,
            },
        });

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
