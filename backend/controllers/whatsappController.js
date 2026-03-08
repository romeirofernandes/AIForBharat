const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const twilio = require("twilio");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const Groq = require("groq-sdk");
const { toFile } = require("groq-sdk");

// Groq client for Whisper transcription + LLaMA classification
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;

// S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
    },
});
const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME || "aiforbharat";
const S3_BASE_URL = process.env.AWS_BUCKET_URL || `https://${S3_BUCKET}.s3.ap-south-1.amazonaws.com`;

// ─── In-memory state ────────────────────────────────────────────
const sessions = new Map();
const pendingReports = new Map();

setInterval(() => {
    const now = Date.now();
    for (const [key, s] of sessions) {
        if (now - s.createdAt > 15 * 60 * 1000) sessions.delete(key);
    }
    for (const [key, r] of pendingReports) {
        if (now - r.createdAt > 30 * 60 * 1000) pendingReports.delete(key);
    }
}, 5 * 60 * 1000);

// ─── TwiML helpers ──────────────────────────────────────────────
function twimlReply(res, message) {
    res.set("Content-Type", "text/xml");
    return res.send(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    );
}

function escapeXml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// ─── Send a follow-up message via Twilio API ────────────────────
async function sendMessage(to, body) {
    try {
        await client.messages.create({
            from: TWILIO_WHATSAPP_NUMBER,
            to: to,
            body: body,
        });
        return true;
    } catch (err) {
        console.error("[WA] Send message failed:", err.message);
        return false;
    }
}

// ─── Download from Twilio (with auth) ───────────────────────────
async function downloadTwilioMedia(url) {
    const auth = "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");
    const resp = await fetch(url, { headers: { Authorization: auth }, redirect: "follow" });
    if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
    return Buffer.from(await resp.arrayBuffer());
}

// ─── Upload buffer to S3 ───────────────────────────────────────
async function uploadToS3(buffer, mediaType) {
    let ext = "jpg", folder = "image";
    if (mediaType.startsWith("video/")) { ext = "mp4"; folder = "video"; }
    else if (mediaType.startsWith("audio/")) { ext = "ogg"; folder = "audio"; }
    else if (mediaType.includes("png")) ext = "png";
    else if (mediaType.includes("webp")) ext = "webp";

    const key = `incident/${folder}/wa_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.${ext}`;
    await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: buffer, ContentType: mediaType }));
    return `${S3_BASE_URL}/${key}`;
}

// ─── Transcribe audio via Groq Whisper ──────────────────────────
async function transcribeWithWhisper(audioBuffer, mediaType) {
    try {
        console.log("[WA] Transcribing with Whisper via Groq...");

        // Groq's Whisper API needs a File-like object
        // Create a Blob/File from the buffer
        const ext = mediaType.includes("ogg") ? "ogg" : mediaType.includes("mp4") ? "mp4" : mediaType.includes("mpeg") ? "mp3" : "ogg";
        const fileName = `voice_${Date.now()}.${ext}`;

        // Use the standalone toFile helper from groq-sdk
        const file = await toFile(audioBuffer, fileName, { type: mediaType });

        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3",
            language: "en",
        });

        console.log("[WA] Whisper transcript:", transcription.text?.substring(0, 100));
        return transcription.text || null;
    } catch (err) {
        console.error("[WA] Whisper transcription failed:", err.message);
        return null;
    }
}

// ─── Classify via Groq LLaMA ────────────────────────────────────
const DEPARTMENTS_AND_TYPES = {
    "Roads & Transport": ["Pothole", "Broken Road", "Missing Sign", "Traffic Signal Malfunction", "Waterlogging", "Other"],
    "Sanitation & Cleaning": ["Garbage Dump", "Overflowing Drain", "Unclean Public Area", "Dead Animal", "Other"],
    "Water Supply & Sewerage": ["Pipe Burst", "No Water Supply", "Contaminated Water", "Sewage Overflow", "Other"],
    "Electricity & Street Lighting": ["Street Light Out", "Exposed Wire", "Power Outage", "Faulty Meter", "Other"],
    "Public Works Department": ["Broken Footpath", "Damaged Bridge", "Construction Hazard", "Other"],
    "Other": ["Noise Complaint", "Encroachment", "Illegal Dumping", "Other"],
};

async function classifyWithGroq(description) {
    let department = "Other", incidentType = "Other";
    if (!description || description.trim().length === 0) return { department, incidentType };

    try {
        const deptList = Object.entries(DEPARTMENTS_AND_TYPES)
            .map(([d, t]) => `- ${d}: ${t.join(", ")}`)
            .join("\n");

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are a civic issue classifier. Classify issues into departments and types. Respond with ONLY valid JSON: {"department":"...","incidentType":"..."}\n\nAvailable:\n${deptList}`
                },
                { role: "user", content: description }
            ],
            temperature: 0,
            max_completion_tokens: 100,
        });

        const text = completion.choices[0]?.message?.content?.trim() || "";
        console.log("[WA] Groq classification:", text);
        const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(jsonStr);

        if (parsed.department && DEPARTMENTS_AND_TYPES[parsed.department]) {
            department = parsed.department;
            if (parsed.incidentType && DEPARTMENTS_AND_TYPES[department].includes(parsed.incidentType)) {
                incidentType = parsed.incidentType;
            }
        }
        console.log(`[WA] Classified: ${department} - ${incidentType}`);
    } catch (err) {
        console.error("[WA] Groq classification failed:", err.message);
    }
    return { department, incidentType };
}

// ═════════════════════════════════════════════════════════════════
// MAIN WEBHOOK
// ═════════════════════════════════════════════════════════════════
exports.handleWebhook = async (req, res) => {
    try {
        const from = req.body.From;
        const body = (req.body.Body || "").trim();
        const bodyLower = body.toLowerCase();
        const mediaUrl = req.body.MediaUrl0 || null;
        const mediaType = req.body.MediaContentType0 || null;

        if (!from) return twimlReply(res, "Invalid request.");
        console.log(`[WA] From: ${from} | Body: "${body}" | NumMedia: ${req.body.NumMedia || 0} | Media: ${mediaUrl ? mediaType : "none"}`);

        // ── /login ──
        if (bodyLower === "/login" || bodyLower === "login") {
            // Check if already logged in
            const existing = await prisma.whatsappUser.findFirst({ where: { chatId: from, isActive: true }, include: { user: { include: { profile: true } } } });
            if (existing) {
                const name = existing.user?.profile?.name || "Citizen";
                return twimlReply(
                    res,
                    `*You are already logged in, ${name}!*\n\n` +
                    "Commands:\n/report - Report incident\n/myissues - View issues\n/challans - View challans\n/logout - Log out"
                );
            }
            sessions.set(from, { step: "awaiting_email", createdAt: Date.now() });
            return twimlReply(res, "*Login to Civic Intel*\n\nPlease enter your registered email address:");
        }

        // ── /logout ──
        if (bodyLower === "/logout" || bodyLower === "logout") {
            const wu = await prisma.whatsappUser.findFirst({ where: { chatId: from, isActive: true } });
            if (!wu) return twimlReply(res, "You are not logged in.\n\nSend /login to get started.");
            await prisma.whatsappUser.update({ where: { id: wu.id }, data: { isActive: false, chatId: null } });
            sessions.delete(from);
            return twimlReply(res, "Logged out successfully.\n\nSend /login to log in again.");
        }

        // ── /report ──
        if (bodyLower === "/report" || bodyLower === "report") {
            const wu = await prisma.whatsappUser.findFirst({ where: { chatId: from, isActive: true }, include: { user: true } });
            if (!wu) return twimlReply(res, "You are not logged in.\n\nSend /login to authenticate first.");

            sessions.set(from, {
                step: "awaiting_report_image",
                userId: wu.userId,
                report: {},
                createdAt: Date.now(),
            });

            return twimlReply(
                res,
                "*Report an Incident*\n\n" +
                "*Step 1: Upload Evidence*\n" +
                "Send a photo or video of the issue.\n\n" +
                "Send *skip* if you don't have one."
            );
        }

        // ── /myissues ──
        if (bodyLower === "/myissues" || bodyLower === "myissues" || bodyLower === "/issues") {
            const wu = await prisma.whatsappUser.findFirst({ where: { chatId: from, isActive: true } });
            if (!wu) return twimlReply(res, "You are not logged in.\n\nSend /login first.");

            const issues = await prisma.issue.findMany({ where: { userId: wu.userId }, orderBy: { createdAt: "desc" }, take: 5 });
            if (issues.length === 0) return twimlReply(res, "*No issues yet.*\n\nSend /report to report one.");

            const sl = { pending: "Pending", in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected" };
            let msg = `*Your Recent Issues* (${issues.length}):\n`;
            issues.forEach((issue, i) => {
                const d = new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                msg += `\n${i + 1}. *${issue.title}*\n   Status: ${sl[issue.status] || issue.status} | ${d}\n`;
            });
            return twimlReply(res, msg + "\nVisit Civic Intel website for details.");
        }

        // ── /challans ──
        if (bodyLower === "/challans" || bodyLower === "challans") {
            const wu = await prisma.whatsappUser.findFirst({ where: { chatId: from, isActive: true } });
            if (!wu) return twimlReply(res, "You are not logged in.\n\nSend /login first.");

            const vehicles = await prisma.userVehicle.findMany({ where: { userId: wu.userId }, select: { id: true, vehicleNumber: true } });
            if (!vehicles.length) return twimlReply(res, "No vehicles linked.");

            const challans = await prisma.trafficChallan.findMany({
                where: { vehicleId: { in: vehicles.map(v => v.id) }, status: "unpaid" },
                orderBy: { issuedAt: "desc" }, take: 5, include: { vehicle: true, fine: true },
            });
            if (!challans.length) return twimlReply(res, "No unpaid challans!");

            let msg = `*Unpaid Challans* (${challans.length}):\n`;
            challans.forEach((c, i) => {
                const d = new Date(c.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                msg += `\n${i + 1}. #${c.id} | ${c.vehicle?.vehicleNumber || "N/A"}\n   ${c.fine?.offenseName || "N/A"} | Rs.${c.amount} | ${d}\n`;
            });
            return twimlReply(res, msg);
        }

        // ── Sessions ──
        const session = sessions.get(from);

        // ════════════════════════════════════════════════════════
        // STEP 1: Image/Video upload
        // ════════════════════════════════════════════════════════
        if (session?.step === "awaiting_report_image") {
            // Skip
            if (!mediaUrl && (bodyLower === "skip" || bodyLower === "no")) {
                session.step = "awaiting_report_description";
                sessions.set(from, session);
                return twimlReply(res, "*Step 2: Describe the Issue*\n\nDescribe the issue in detail.\nYou can type a message or send a voice note.");
            }

            if (!mediaUrl) {
                return twimlReply(res, "Please send a photo or video.\n\nOr send *skip* to proceed without one.");
            }

            // Got media — upload to S3 (await it so imageUrl is ready)
            try {
                const buffer = await downloadTwilioMedia(mediaUrl);
                const s3Url = await uploadToS3(buffer, mediaType);
                console.log("[WA] S3 upload done:", s3Url);
                if (mediaType.startsWith("image/")) session.report.imageUrl = s3Url;
                else if (mediaType.startsWith("video/")) session.report.videoUrl = s3Url;
            } catch (err) {
                console.error("[WA] S3 upload failed:", err.message);
                // Continue without image — don't block the flow
            }

            session.step = "awaiting_report_description";
            sessions.set(from, session);

            return twimlReply(
                res,
                (session.report.imageUrl || session.report.videoUrl
                    ? "*Evidence uploaded!*\n\n"
                    : "*Evidence received!*\n\n") +
                "*Step 2: Describe the Issue*\n\n" +
                "Now describe the issue.\nYou can type a message or send a voice note."
            );
        }

        // ════════════════════════════════════════════════════════
        // STEP 2: Description (text or voice note)
        // ════════════════════════════════════════════════════════
        if (session?.step === "awaiting_report_description") {
            // Guard against messages arriving while async processing is happening
            if (session.processing) {
                return twimlReply(res, "Still processing your last message. Please wait a moment...");
            }

            // Reject "skip"/"no" — description is required
            if (!mediaUrl && (bodyLower === "skip" || bodyLower === "no")) {
                return twimlReply(res, "Description is required.\n\nPlease describe the issue in detail or send a voice note:");
            }

            let description = body || "";

            // Filter filenames
            if (mediaUrl && /^[\w\s\-().]+\.(jpe?g|png|gif|webp|mp4|mov|avi|webm|ogg|mp3|m4a|opus|wav|3gp|pdf)$/i.test(description)) {
                description = "";
            }

            // Voice note → transcribe with Whisper
            if (mediaUrl && mediaType && mediaType.startsWith("audio/")) {
                // Set processing flag to prevent concurrent messages
                session.processing = true;
                sessions.set(from, session);

                // Respond fast, then process async
                twimlReply(res, "Voice note received! Transcribing...");

                // All async work after response in self-contained try-catch
                (async () => {
                    try {
                        console.log("[WA] Downloading voice note from Twilio...");
                        const audioBuffer = await downloadTwilioMedia(mediaUrl);
                        console.log("[WA] Voice note downloaded, size:", audioBuffer.length);

                        // Transcribe with Whisper (audio stored as transcript only, no S3 upload needed)
                        const transcript = await transcribeWithWhisper(audioBuffer, mediaType);

                        if (!transcript || transcript.trim().length === 0) {
                            console.log("[WA] Transcription returned empty");
                            await sendMessage(from, "Could not transcribe voice note. Please type your description instead:");
                            return;
                        }

                        console.log("[WA] Transcription success:", transcript.substring(0, 80));
                        session.report.description = transcript.trim();

                        // Classify with Groq
                        const { department, incidentType } = await classifyWithGroq(transcript);
                        session.report.department = department;
                        session.report.incidentType = incidentType;

                        // Generate location token
                        const token = crypto.randomBytes(16).toString("hex");
                        session.report.locationToken = token;
                        session.step = "awaiting_report_location";
                        sessions.set(from, session);

                        pendingReports.set(token, {
                            userId: session.userId,
                            report: { ...session.report },
                            chatId: from,
                            createdAt: Date.now(),
                        });

                        const locationUrl = `${FRONTEND_URL}/share-location/${token}`;
                        console.log("[WA] Sending Step 3 message...");
                        const sent = await sendMessage(
                            from,
                            `*Transcription:* "${transcript.substring(0, 150)}${transcript.length > 150 ? '...' : ''}"\n\n` +
                            `*Step 3: Share Location*\n\n` +
                            `Classified as: *${department} - ${incidentType}*\n\n` +
                            `Tap the link to pinpoint location on a map:\n${locationUrl}\n\n` +
                            `Or send *skip* to submit without location.`
                        );
                        if (sent) console.log("[WA] Step 3 message sent successfully");
                        else console.error("[WA] Step 3 message FAILED — check TWILIO_WHATSAPP_NUMBER in .env");
                    } catch (err) {
                        console.error("[WA] Voice flow error:", err);
                        session.processing = false;
                        sessions.set(from, session);
                        await sendMessage(from, "Something went wrong processing your voice note. Please try again or type your description:").catch(() => {});
                    }
                })();
                return;
            }

            // Handle extra image/video at this step (just save it)
            if (mediaUrl && mediaType && !mediaType.startsWith("audio/")) {
                downloadTwilioMedia(mediaUrl)
                    .then(buf => uploadToS3(buf, mediaType))
                    .then(url => {
                        if (mediaType.startsWith("image/")) session.report.imageUrl = url;
                        else if (mediaType.startsWith("video/")) session.report.videoUrl = url;
                        sessions.set(from, session);
                    })
                    .catch(e => console.error("[WA] Extra media err:", e.message));
            }

            // Text description
            if (description.length > 0) {
                session.report.description = ((session.report.description || "") + " " + description).trim();
            }

            if (!session.report.description || session.report.description.trim().length === 0) {
                return twimlReply(res, "Please describe the issue.\nType a message or send a voice note:");
            }

            // Set processing flag to prevent concurrent messages
            session.processing = true;
            sessions.set(from, session);

            // Classify with Groq — respond fast, then process async
            twimlReply(res, "Processing your report...");

            // All async work after response in self-contained try-catch
            (async () => {
                try {
                    console.log("[WA] Classifying description...");
                    const { department, incidentType } = await classifyWithGroq(session.report.description);
                    session.report.department = department;
                    session.report.incidentType = incidentType;

                    const token = crypto.randomBytes(16).toString("hex");
                    session.report.locationToken = token;
                    session.step = "awaiting_report_location";
                    sessions.set(from, session);

                    pendingReports.set(token, {
                        userId: session.userId,
                        report: { ...session.report },
                        chatId: from,
                        createdAt: Date.now(),
                    });

                    const locationUrl = `${FRONTEND_URL}/share-location/${token}`;
                    console.log("[WA] Sending Step 3 message...");
                    const sent = await sendMessage(
                        from,
                        `*Step 3: Share Location*\n\n` +
                        `Classified as: *${department} - ${incidentType}*\n\n` +
                        `Tap the link to pinpoint your location on a map:\n${locationUrl}\n\n` +
                        `Or send *skip* to submit without location.`
                    );
                    if (sent) console.log("[WA] Step 3 message sent successfully");
                    else console.error("[WA] Step 3 message FAILED — check TWILIO_WHATSAPP_NUMBER in .env");
                } catch (err) {
                    console.error("[WA] Text flow error:", err);
                    session.processing = false;
                    sessions.set(from, session);
                    await sendMessage(from, "Something went wrong processing your report. Please try /report again.").catch(() => {});
                }
            })();
            return;
        }

        // ════════════════════════════════════════════════════════
        // STEP 3: Location
        // ════════════════════════════════════════════════════════
        if (session?.step === "awaiting_report_location") {
            if (bodyLower === "skip" || bodyLower === "no") {
                try {
                    const title = `${session.report.department || "Other"} - ${session.report.incidentType || "Other"}`;
                    const dept = await prisma.department.findUnique({ where: { name: session.report.department || "Other" } });

                    await prisma.issue.create({
                        data: {
                            title,
                            description: session.report.description || "Reported via WhatsApp",
                            imageUrl: session.report.imageUrl || null,
                            videoUrl: session.report.videoUrl || null,
                            departmentId: dept?.id || null,
                            incidentType: session.report.incidentType || "Other",
                            userId: session.userId,
                        },
                    });

                    if (session.report.locationToken) pendingReports.delete(session.report.locationToken);
                    sessions.delete(from);

                    return twimlReply(
                        res,
                        "*Report submitted successfully!*\n\n" +
                        `Department: ${session.report.department}\n` +
                        `Type: ${session.report.incidentType}\n` +
                        `Location: Not provided\n\n` +
                        "Send /myissues to track your reports."
                    );
                } catch (err) {
                    console.error("[WA] Submit error:", err);
                    sessions.delete(from);
                    return twimlReply(res, "Failed to submit. Try /report again.");
                }
            }
            return twimlReply(res, "Open the link above to pinpoint your location on a map, or send *skip* to submit without location.");
        }

        // ════════════════════════════════════════════════════════
        // LOGIN: Email
        // ════════════════════════════════════════════════════════
        if (session?.step === "awaiting_email") {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body)) {
                return twimlReply(res, "Invalid email. Please enter your registered email:");
            }
            const user = await prisma.user.findUnique({ where: { email: body.toLowerCase() } });
            if (!user) { sessions.delete(from); return twimlReply(res, "No account found.\n\nSign up on Civic Intel first."); }

            const wu = await prisma.whatsappUser.findUnique({ where: { userId: user.id } });
            if (!wu || !wu.otp) { sessions.delete(from); return twimlReply(res, "No OTP found.\n\nGenerate one from your Profile page."); }

            sessions.set(from, { step: "awaiting_otp", email: body.toLowerCase(), userId: user.id, createdAt: Date.now() });
            return twimlReply(res, "Email found!\n\nEnter the 6-digit OTP from your profile:");
        }

        // ════════════════════════════════════════════════════════
        // LOGIN: OTP
        // ════════════════════════════════════════════════════════
        if (session?.step === "awaiting_otp") {
            if (!/^\d{6}$/.test(body.trim())) return twimlReply(res, "Invalid format. Enter 6-digit OTP:");

            const wu = await prisma.whatsappUser.findUnique({ where: { userId: session.userId } });
            if (!wu || !wu.otp) { sessions.delete(from); return twimlReply(res, "No OTP found. Generate a new one."); }

            if (wu.otpExpiresAt && new Date() > new Date(wu.otpExpiresAt)) {
                sessions.delete(from);
                await prisma.whatsappUser.update({ where: { id: wu.id }, data: { otp: null, otpExpiresAt: null } });
                return twimlReply(res, "OTP expired. Generate a new one.");
            }

            const isValid = await bcrypt.compare(body.trim(), wu.otp);
            if (!isValid) return twimlReply(res, "Incorrect OTP. Try again:");

            await prisma.whatsappUser.update({ where: { id: wu.id }, data: { chatId: from, isActive: true, otp: null, otpExpiresAt: null } });
            await prisma.citizenProfile.updateMany({ where: { userId: session.userId }, data: { whatsappVerified: true } });
            sessions.delete(from);

            return twimlReply(
                res,
                "*Logged in successfully!*\n\n" +
                "Commands:\n/report - Report incident\n/myissues - View issues\n/challans - View challans\n/logout - Log out"
            );
        }

        // ── Default ──
        const loggedIn = await prisma.whatsappUser.findFirst({
            where: { chatId: from, isActive: true },
            include: { user: { include: { profile: true } } },
        });

        if (loggedIn) {
            const name = loggedIn.user?.profile?.name || "Citizen";
            return twimlReply(
                res,
                `Hi ${name}!\n\n*Commands:*\n/report - Report incident\n/myissues - View issues\n/challans - View challans\n/logout - Log out`
            );
        }

        return twimlReply(res, "*Welcome to Civic Intel!*\n\nSend /login to get started.\n\nGenerate an OTP from your profile on the website first.");
    } catch (error) {
        console.error("[WA] Webhook error:", error);
        if (!res.headersSent) {
            return twimlReply(res, "Something went wrong. Try again later.");
        }
    }
};

// ─── Save issue from location share page ────────────────────────
exports.saveWhatsAppIssue = async (token, latitude, longitude) => {
    const pending = pendingReports.get(token);
    if (!pending) return { success: false, error: "Invalid or expired token" };

    try {
        const { userId, report, chatId } = pending;
        const title = `${report.department || "Other"} - ${report.incidentType || "Other"}`;
        const dept = await prisma.department.findUnique({ where: { name: report.department || "Other" } });

        const issue = await prisma.issue.create({
            data: {
                title,
                description: report.description || "Reported via WhatsApp",
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                imageUrl: report.imageUrl || null,
                videoUrl: report.videoUrl || null,
                departmentId: dept?.id || null,
                incidentType: report.incidentType || "Other",
                userId,
            },
        });

        pendingReports.delete(token);
        sessions.delete(chatId);

        // Send confirmation
        await sendMessage(
            chatId,
            "*Report submitted successfully!*\n\n" +
            `Department: ${report.department}\n` +
            `Type: ${report.incidentType}\n` +
            `Location: ${parseFloat(latitude).toFixed(4)}, ${parseFloat(longitude).toFixed(4)}\n\n` +
            "Send /myissues to track your reports."
        );

        return { success: true, issue };
    } catch (error) {
        console.error("[WA] saveWhatsAppIssue error:", error);
        return { success: false, error: "Failed to save issue" };
    }
};

exports.getPendingReport = (token) => pendingReports.get(token) || null;
