const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret";

function generateAvatar(gender) {
    const random = Math.floor(Math.random() * 100000);

    if (gender === "male") {
        return `https://api.dicebear.com/7.x/personas/svg?seed=male_${random}`;
    } else {
        return `https://api.dicebear.com/7.x/personas/svg?seed=female_${random}`;
    }
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
                whatsappUser: {
                    select: {
                        isActive: true,
                        chatId: true,
                        createdAt: true,
                    },
                },
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
        const { name, age, gender, homeLatitude, homeLongitude, emailNotifications } = req.body;
        
        if (!name) {
             return res.status(400).json({ error: "Name is required" });
        }

        const currentProfile = await prisma.citizenProfile.findUnique({ where: { userId: req.user.userId } });
        let newAvatarUrl = currentProfile?.imageUrl;

        // Determine new avatar URL
        if (req.file) {
            newAvatarUrl = req.file.location;
        } else if (!newAvatarUrl || (currentProfile && currentProfile.gender !== gender)) {
            newAvatarUrl = generateAvatar(gender);
        }

        await prisma.citizenProfile.upsert({
            where: { userId: req.user.userId },
            update: {
                name,
                age: age ? parseInt(age) : null,
                gender: gender || null,
                imageUrl: newAvatarUrl,
                homeLatitude: homeLatitude != null ? parseFloat(homeLatitude) : null,
                homeLongitude: homeLongitude != null ? parseFloat(homeLongitude) : null,
                emailNotifications: emailNotifications === true || emailNotifications === 'true',
            },
            create: {
                userId: req.user.userId,
                name,
                age: age ? parseInt(age) : null,
                gender: gender || null,
                imageUrl: newAvatarUrl,
                homeLatitude: homeLatitude != null ? parseFloat(homeLatitude) : null,
                homeLongitude: homeLongitude != null ? parseFloat(homeLongitude) : null,
                emailNotifications: emailNotifications === true || emailNotifications === 'true',
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

// ─── POST /api/auth/whatsapp/generate-otp ──────────────────────
exports.generateWhatsappOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || !/^\+\d{10,15}$/.test(phone)) {
            return res.status(400).json({
                error: "Valid phone number required (E.164 format, e.g. +919876543210)",
            });
        }

        // Generate 6-digit OTP
        const otpPlain = crypto.randomInt(100000, 999999).toString();
        const otpHash = await bcrypt.hash(otpPlain, 10);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Upsert WhatsappUser row
        await prisma.whatsappUser.upsert({
            where: { userId: req.user.userId },
            update: {
                otp: otpHash,
                otpExpiresAt,
                isActive: false, // reset until they verify via WhatsApp
            },
            create: {
                userId: req.user.userId,
                otp: otpHash,
                otpExpiresAt,
            },
        });

        // Save phone to CitizenProfile
        await prisma.citizenProfile.upsert({
            where: { userId: req.user.userId },
            update: { phone },
            create: {
                userId: req.user.userId,
                name: req.user.email.split("@")[0], // fallback name
                phone,
            },
        });

        // Get updated whatsapp status
        const whatsappUser = await prisma.whatsappUser.findUnique({
            where: { userId: req.user.userId },
            select: { isActive: true, chatId: true, createdAt: true },
        });

        res.json({
            message: "OTP generated successfully",
            otp: otpPlain, // shown to user once — never stored in plaintext
            expiresInMinutes: 10,
            whatsappUser,
        });
    } catch (error) {
        console.error("Generate WhatsApp OTP error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
