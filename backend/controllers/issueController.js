const prisma = require("../config/prisma");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiKey = process.env.GEMINI_API_KEY || "dummy_key";
const genAI = new GoogleGenerativeAI(geminiKey);

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

// ─── Aggregated / Clustered Issues (admin) ───────────────────────
exports.getAggregatedIssues = async (req, res) => {
    try {
        const issues = await prisma.issue.findMany({
            include: {
                user: { select: { id: true, email: true } },
                department: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // Grid-snap ≈ 1 km – two issues with the same incident_type
        // whose coordinates round to the same 0.01° cell are clustered.
        const GRID = 100; // 1/0.01
        const buckets = {};

        for (const issue of issues) {
            const type = (issue.incidentType || "unknown").toLowerCase().trim();
            const latKey = issue.latitude != null ? Math.round(issue.latitude * GRID) : "none";
            const lngKey = issue.longitude != null ? Math.round(issue.longitude * GRID) : "none";
            const key = `${type}__${latKey}__${lngKey}`;

            if (!buckets[key]) {
                buckets[key] = {
                    incidentType: issue.incidentType || "Unknown",
                    department: issue.department?.name || "Unassigned",
                    latitude: issue.latitude,
                    longitude: issue.longitude,
                    count: 0,
                    statuses: { pending: 0, in_progress: 0, resolved: 0, rejected: 0 },
                    issues: [],
                };
            }
            buckets[key].count += 1;
            buckets[key].statuses[issue.status] = (buckets[key].statuses[issue.status] || 0) + 1;
            buckets[key].issues.push({
                id: issue.id,
                title: issue.title,
                description: issue.description,
                status: issue.status,
                imageUrl: issue.imageUrl,
                createdAt: issue.createdAt,
                user: issue.user,
            });
        }

        // Sort clusters by count descending
        const clusters = Object.values(buckets).sort((a, b) => b.count - a.count);

        res.json({ clusters, totalIssues: issues.length, totalClusters: clusters.length });
    } catch (error) {
        console.error("Aggregation error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── AI Resolution Flow (admin) ──────────────────────────────────
exports.getResolutionFlow = async (req, res) => {
    try {
        const { incidentType, department, count, sampleDescriptions } = req.body;

        if (!incidentType) {
            return res.status(400).json({ error: "incidentType is required" });
        }

        const prompt = `You are an expert in civic administration and issue resolution for Indian municipalities.

I have a cluster of ${count || 1} citizen complaints about "${incidentType}" under the "${department || 'General'}" department.

Sample complaint descriptions:
${(sampleDescriptions || []).slice(0, 5).map((d, i) => `${i + 1}. ${d}`).join("\n")}

Generate a step-by-step resolution workflow for the admin to follow. Return your response as a VALID JSON object with this exact structure (no markdown, no code fences, just raw JSON):

{
  "steps": [
    {
      "id": "step_1",
      "title": "Short Step Title",
      "description": "Detail of what to do in this step",
      "type": "start|action|decision|review|end",
      "nextSteps": ["step_2"]
    }
  ]
}

Rules:
- First step should be type "start" (e.g., "Receive & Acknowledge Complaints")
- Last step should be type "end" (e.g., "Close Case & Update Citizens")
- Include 5-8 steps total
- If there's a decision point (like "Is issue verified?"), use type "decision" and provide two nextSteps
- For decision nodes, the first nextStep is "Yes" path and second is "No" path
- Make steps specific to the incident type and department, not generic
- Keep titles under 6 words
- Keep descriptions under 30 words`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([prompt]);
        const text = result.response.text();

        // Clean and parse JSON
        let cleaned = text.trim();
        // Remove markdown code fences if present
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

        let flowData;
        try {
            flowData = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("JSON parse error:", parseError.message, "\nRaw text:", text);
            return res.status(500).json({ error: "AI returned invalid JSON. Please try again." });
        }

        res.json({ flow: flowData });
    } catch (error) {
        console.error("Resolution flow error:", error);
        res.status(500).json({ error: "Failed to generate resolution flow" });
    }
};
