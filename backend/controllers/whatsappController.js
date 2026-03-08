const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // whatsapp:+18599276910

// ─── In-memory conversational state for multi-step login ────────
// Key: chatId (e.g. "whatsapp:+919876543210")
// Value: { step: 'awaiting_email' | 'awaiting_otp', email?: string, createdAt: Date }
const sessions = new Map();

// Clean stale sessions older than 15 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, session] of sessions) {
        if (now - session.createdAt > 15 * 60 * 1000) {
            sessions.delete(key);
        }
    }
}, 5 * 60 * 1000);

// ─── Helper: send TwiML response ───────────────────────────────
function twimlReply(res, message) {
    res.set("Content-Type", "text/xml");
    res.send(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    );
}

function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// ─── Main Webhook Handler ───────────────────────────────────────
exports.handleWebhook = async (req, res) => {
    try {
        const from = req.body.From; // e.g. "whatsapp:+919876543210"
        const body = (req.body.Body || "").trim();
        const bodyLower = body.toLowerCase();

        if (!from) {
            return twimlReply(res, "Invalid request.");
        }

        // ── /login command — start login flow ──
        if (bodyLower === "/login" || bodyLower === "login") {
            sessions.set(from, { step: "awaiting_email", createdAt: Date.now() });
            return twimlReply(
                res,
                "🔐 *Login to Civic Intel*\n\nPlease enter your registered email address:"
            );
        }

        // ── /logout command ──
        if (bodyLower === "/logout" || bodyLower === "logout") {
            const whatsappUser = await prisma.whatsappUser.findFirst({
                where: { chatId: from, isActive: true },
            });

            if (!whatsappUser) {
                return twimlReply(res, "❌ You are not logged in.\n\nSend /login to get started.");
            }

            await prisma.whatsappUser.update({
                where: { id: whatsappUser.id },
                data: { isActive: false, chatId: null },
            });

            sessions.delete(from);
            return twimlReply(res, "👋 Logged out successfully.\n\nSend /login to log in again.");
        }

        // ── /challans command ──
        if (bodyLower === "/challans" || bodyLower === "challans") {
            const whatsappUser = await prisma.whatsappUser.findFirst({
                where: { chatId: from, isActive: true },
                include: { user: true },
            });

            if (!whatsappUser) {
                return twimlReply(
                    res,
                    "❌ You are not logged in.\n\nSend /login to authenticate first."
                );
            }

            // Get user's vehicles
            const vehicles = await prisma.userVehicle.findMany({
                where: { userId: whatsappUser.userId },
                select: { id: true, vehicleNumber: true },
            });

            if (vehicles.length === 0) {
                return twimlReply(
                    res,
                    "🚗 You have no vehicles linked to your account.\n\nAdd vehicles on the Civic Intel website to track challans."
                );
            }

            const vehicleIds = vehicles.map((v) => v.id);

            // Fetch last 5 unpaid/contested challans
            const challans = await prisma.trafficChallan.findMany({
                where: {
                    vehicleId: { in: vehicleIds },
                    status: { in: ["unpaid", "contested"] },
                },
                include: { fine: true, vehicle: true },
                orderBy: { issuedAt: "desc" },
                take: 5,
            });

            if (challans.length === 0) {
                return twimlReply(
                    res,
                    "✅ *No unpaid challans found!*\n\nAll your challans are either paid or cancelled. Drive safe! 🚦"
                );
            }

            let msg = `🚦 *Your Unpaid Challans* (${challans.length} most recent):\n`;
            challans.forEach((c, i) => {
                const date = new Date(c.issuedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                });
                msg += `\n${i + 1}. *#${c.challanNumber}*`;
                msg += `\n   Vehicle: ${c.vehicle?.vehicleNumber || c.vehicleNumber}`;
                msg += `\n   Offense: ${c.fine?.offenseName || "N/A"}`;
                msg += `\n   Fine: ₹${c.amount} | Status: ${c.status}`;
                msg += `\n   Issued: ${date}${c.location ? `, ${c.location}` : ""}`;
                msg += `\n`;
            });

            msg += "\nVisit Civic Intel website to pay or contest challans.";
            return twimlReply(res, msg);
        }

        // ── Handle multi-step login session ──
        const session = sessions.get(from);

        if (session?.step === "awaiting_email") {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body)) {
                return twimlReply(
                    res,
                    "❌ That doesn't look like a valid email.\n\nPlease enter your registered email address:"
                );
            }

            // Check user exists
            const user = await prisma.user.findUnique({ where: { email: body.toLowerCase() } });
            if (!user) {
                sessions.delete(from);
                return twimlReply(
                    res,
                    "❌ No account found with this email.\n\nPlease sign up on the Civic Intel website first, then try /login again."
                );
            }

            // Check WhatsappUser row exists (OTP must have been generated from the website)
            const whatsappUser = await prisma.whatsappUser.findUnique({
                where: { userId: user.id },
            });
            if (!whatsappUser || !whatsappUser.otp) {
                sessions.delete(from);
                return twimlReply(
                    res,
                    "❌ No OTP found for this account.\n\nPlease generate an OTP from your Profile → WhatsApp section on the Civic Intel website, then try /login again."
                );
            }

            // Move to OTP step
            sessions.set(from, {
                step: "awaiting_otp",
                email: body.toLowerCase(),
                userId: user.id,
                createdAt: Date.now(),
            });

            return twimlReply(
                res,
                "✅ Email found!\n\nNow enter the 6-digit OTP from your Civic Intel profile page:"
            );
        }

        if (session?.step === "awaiting_otp") {
            const otpInput = body.trim();

            // Validate OTP format
            if (!/^\d{6}$/.test(otpInput)) {
                return twimlReply(
                    res,
                    "❌ Invalid OTP format. Please enter the 6-digit OTP:"
                );
            }

            const whatsappUser = await prisma.whatsappUser.findUnique({
                where: { userId: session.userId },
            });

            if (!whatsappUser || !whatsappUser.otp) {
                sessions.delete(from);
                return twimlReply(
                    res,
                    "❌ No OTP found. Please generate a new OTP from the website and try /login again."
                );
            }

            // Check expiry
            if (whatsappUser.otpExpiresAt && new Date() > new Date(whatsappUser.otpExpiresAt)) {
                sessions.delete(from);
                await prisma.whatsappUser.update({
                    where: { id: whatsappUser.id },
                    data: { otp: null, otpExpiresAt: null },
                });
                return twimlReply(
                    res,
                    "⏰ OTP has expired.\n\nPlease generate a new OTP from the website and try /login again."
                );
            }

            // Compare OTP
            const isValid = await bcrypt.compare(otpInput, whatsappUser.otp);
            if (!isValid) {
                return twimlReply(
                    res,
                    "❌ Incorrect OTP. Please try again.\n\nEnter the 6-digit OTP:"
                );
            }

            // ✅ Login success — whitelist this chatId
            await prisma.whatsappUser.update({
                where: { id: whatsappUser.id },
                data: {
                    chatId: from,
                    isActive: true,
                    otp: null,
                    otpExpiresAt: null,
                },
            });

            // Mark phone as verified in profile
            await prisma.citizenProfile.updateMany({
                where: { userId: session.userId },
                data: { whatsappVerified: true },
            });

            sessions.delete(from);

            return twimlReply(
                res,
                "✅ *Logged in successfully!*\n\n" +
                "You can now use these commands:\n" +
                "📋 /challans — View your unpaid challans\n" +
                "🚪 /logout — Log out from WhatsApp"
            );
        }

        // ── Default — unknown command or no session ──
        // Check if user is logged in for a friendly greeting
        const loggedIn = await prisma.whatsappUser.findFirst({
            where: { chatId: from, isActive: true },
            include: { user: { include: { profile: true } } },
        });

        if (loggedIn) {
            const name = loggedIn.user?.profile?.name || "Citizen";
            return twimlReply(
                res,
                `👋 Hi ${name}!\n\n` +
                "*Available commands:*\n" +
                "📋 /challans — View your unpaid challans\n" +
                "🚪 /logout — Log out from WhatsApp\n\n" +
                "Type a command to get started."
            );
        }

        return twimlReply(
            res,
            "👋 *Welcome to Civic Intel WhatsApp Bot!*\n\n" +
            "*Available commands:*\n" +
            "🔐 /login — Log in to your account\n\n" +
            "To get started, generate an OTP from your profile on the Civic Intel website, then send /login here."
        );
    } catch (error) {
        console.error("WhatsApp webhook error:", error);
        return twimlReply(res, "⚠️ Something went wrong. Please try again later.");
    }
};
