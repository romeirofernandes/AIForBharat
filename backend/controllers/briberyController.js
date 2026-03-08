const prisma = require("../config/prisma");
const fs = require("fs");

const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";

const VALID_STATUSES = ["submitted", "under_review", "action_taken", "resolved", "dismissed"];

const COMPLAINT_TYPES = [
    "No Receipt Given",
    "Charged Excess Fine",
    "Demanded Bribe / Money",
    "Rude or Threatening Behavior",
    "Wrongful Challan Issued",
    "Confiscation Without Reason",
    "Other",
];

// ─── POST /api/bribery ─────────────────────────────────────────
// Create a bribery / misconduct complaint
exports.createComplaint = async (req, res) => {
    try {
        const {
            badgeNumber,
            complaintType,
            otherComplaintType,
            description,
            incidentAt,
            location,
            challanNumber,
            amountDemanded,
        } = req.body;

        if (!badgeNumber || !complaintType || !description || !incidentAt) {
            return res.status(400).json({
                error: "Badge number, complaint type, description, and incident date/time are required.",
            });
        }

        if (!COMPLAINT_TYPES.includes(complaintType)) {
            return res.status(400).json({ error: "Invalid complaint type." });
        }

        // Collect uploaded file URLs
        const mediaUrls = (req.files || []).map((f) => f.location);

        const complaint = await prisma.briberyComplaint.create({
            data: {
                userId: req.user.userId,
                badgeNumber: badgeNumber.trim(),
                complaintType,
                otherComplaintType: complaintType === "Other" ? otherComplaintType?.trim() || null : null,
                description: description.trim(),
                incidentAt: new Date(incidentAt),
                location: location?.trim() || null,
                challanNumber: challanNumber?.trim() || null,
                amountDemanded: amountDemanded ? parseInt(amountDemanded) : null,
                mediaUrls,
                status: "submitted",
            },
        });

        res.status(201).json({ message: "Complaint filed successfully", complaint });
    } catch (err) {
        console.error("createComplaint error:", err);
        res.status(500).json({ error: "Failed to file complaint" });
    }
};

// ─── GET /api/bribery/my ───────────────────────────────────────
// Get all complaints for the authenticated user
exports.getMyComplaints = async (req, res) => {
    try {
        const { status } = req.query;
        const where = { userId: req.user.userId };
        if (status && VALID_STATUSES.includes(status)) {
            where.status = status;
        }

        const complaints = await prisma.briberyComplaint.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        // Compute summary
        const all = await prisma.briberyComplaint.findMany({
            where: { userId: req.user.userId },
            select: { status: true },
        });

        const summary = {
            total: all.length,
            submitted: all.filter((c) => c.status === "submitted").length,
            under_review: all.filter((c) => c.status === "under_review").length,
            action_taken: all.filter((c) => c.status === "action_taken").length,
            resolved: all.filter((c) => c.status === "resolved").length,
            dismissed: all.filter((c) => c.status === "dismissed").length,
        };

        res.json({ complaints, summary });
    } catch (err) {
        console.error("getMyComplaints error:", err);
        res.status(500).json({ error: "Failed to fetch complaints" });
    }
};

// ─── GET /api/bribery/my/:id ───────────────────────────────────
exports.getMyComplaintById = async (req, res) => {
    try {
        const complaint = await prisma.briberyComplaint.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: req.user.userId,
            },
        });

        if (!complaint) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        res.json({ complaint });
    } catch (err) {
        console.error("getMyComplaintById error:", err);
        res.status(500).json({ error: "Failed to fetch complaint" });
    }
};

// ─── POST /api/bribery/transcribe ──────────────────────────────
// Accepts audio file, transcribes via Groq Whisper, then parses with LLaMA
exports.transcribeAndParse = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Audio file is required" });
        }

        // Step 1: Download from S3 URL or use local buffer
        let audioBuffer;
        let audioFilename = req.file.originalname || "audio.webm";

        if (req.file.location) {
            // File is on S3, download it
            const audioResponse = await fetch(req.file.location);
            audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
        } else if (req.file.buffer) {
            audioBuffer = req.file.buffer;
        } else if (req.file.path) {
            audioBuffer = fs.readFileSync(req.file.path);
        } else {
            return res.status(400).json({ error: "Could not read audio file" });
        }

        // Step 2: Transcribe with Groq Whisper
        const formData = new FormData();
        const audioBlob = new Blob([audioBuffer], { type: req.file.mimetype || "audio/webm" });
        formData.append("file", audioBlob, audioFilename);
        formData.append("model", "whisper-large-v3");
        formData.append("language", "en");

        const whisperRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: formData,
        });

        if (!whisperRes.ok) {
            const errBody = await whisperRes.text();
            console.error("Whisper API error:", errBody);
            return res.status(502).json({ error: "Transcription failed" });
        }

        const whisperData = await whisperRes.json();
        const transcript = whisperData.text;

        if (!transcript || transcript.trim().length === 0) {
            return res.json({ transcript: "", parsed: null });
        }

        // Step 3: Parse transcript with LLaMA to extract structured fields
        const systemPrompt = `You are an AI that extracts structured information from a person's verbal complaint about traffic police misconduct or bribery. 
The person is speaking freely and may mention the following details in any order.

Extract and return ONLY a JSON object with these fields (use null for anything not mentioned):
{
  "badgeNumber": "string or null — the officer's badge/ID number",
  "complaintType": "one of: No Receipt Given, Charged Excess Fine, Demanded Bribe / Money, Rude or Threatening Behavior, Wrongful Challan Issued, Confiscation Without Reason, Other — or null",
  "description": "string — a clean summary of what happened, in the person's own words",
  "location": "string or null — where the incident happened",
  "challanNumber": "string or null — if a challan number is mentioned",
  "amountDemanded": "number or null — amount of money demanded/bribe in rupees",
  "incidentDate": "ISO date string or null — when the incident happened (YYYY-MM-DD or YYYY-MM-DDTHH:mm)"
}

Return ONLY the JSON object, no markdown, no explanation.`;

        const chatRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: transcript },
                ],
                temperature: 0.1,
                max_tokens: 500,
            }),
        });

        if (!chatRes.ok) {
            const errBody = await chatRes.text();
            console.error("LLaMA API error:", errBody);
            // Return transcript even if parsing fails
            return res.json({ transcript, parsed: null });
        }

        const chatData = await chatRes.json();
        const rawContent = chatData.choices?.[0]?.message?.content || "";

        let parsed = null;
        try {
            // Try to extract JSON from the response
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            }
        } catch (parseErr) {
            console.error("JSON parse error:", parseErr);
        }

        res.json({ transcript, parsed });
    } catch (err) {
        console.error("transcribeAndParse error:", err);
        res.status(500).json({ error: "Transcription and parsing failed" });
    }
};

// ─── GET /api/bribery/admin/all ────────────────────────────────
// Admin: get all complaints
exports.getAllComplaints = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status && VALID_STATUSES.includes(status)) {
            where.status = status;
        }

        const complaints = await prisma.briberyComplaint.findMany({
            where,
            include: {
                user: {
                    select: { id: true, email: true, profile: { select: { name: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Summary counts
        const all = await prisma.briberyComplaint.findMany({
            select: { status: true },
        });

        const summary = {
            total: all.length,
            submitted: all.filter((c) => c.status === "submitted").length,
            under_review: all.filter((c) => c.status === "under_review").length,
            action_taken: all.filter((c) => c.status === "action_taken").length,
            resolved: all.filter((c) => c.status === "resolved").length,
            dismissed: all.filter((c) => c.status === "dismissed").length,
        };

        res.json({ complaints, summary });
    } catch (err) {
        console.error("getAllComplaints error:", err);
        res.status(500).json({ error: "Failed to fetch complaints" });
    }
};

// ─── PATCH /api/bribery/admin/:id/status ───────────────────────
// Admin: update complaint status with required note
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
        }

        if (!adminNote || adminNote.trim().length === 0) {
            return res.status(400).json({ error: "Admin note is required for all status changes." });
        }

        const complaint = await prisma.briberyComplaint.findUnique({
            where: { id: parseInt(id) },
        });

        if (!complaint) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        const updated = await prisma.briberyComplaint.update({
            where: { id: parseInt(id) },
            data: {
                status,
                adminNote: adminNote.trim(),
            },
        });

        res.json({ message: "Complaint status updated", complaint: updated });
    } catch (err) {
        console.error("updateComplaintStatus error:", err);
        res.status(500).json({ error: "Failed to update complaint status" });
    }
};
