const prisma = require("../config/prisma");

// ─── GET /api/traffic/fines ────────────────────────────────────
// Query params: ?limit=4  (optional, returns all when omitted)
//               ?search=seatbelt
exports.getFines = async (req, res) => {
    try {
        const { limit, search } = req.query;
        const where = search
            ? {
                OR: [
                    { offenseName: { contains: search, mode: "insensitive" } },
                    { offenseSection: { contains: search, mode: "insensitive" } },
                ],
            }
            : {};

        const fines = await prisma.trafficFine.findMany({
            where,
            orderBy: { fineAmount: "desc" },
            ...(limit ? { take: parseInt(limit) } : {}),
        });

        res.json({ fines });
    } catch (err) {
        console.error("getFines error:", err);
        res.status(500).json({ error: "Failed to fetch fines" });
    }
};

// ─── POST /api/traffic/vehicles ────────────────────────────────
// Body: { vehicleNumber: "MH01CP6748" }
exports.addVehicle = async (req, res) => {
    try {
        const { vehicleNumber } = req.body;
        if (!vehicleNumber || vehicleNumber.trim().length < 4) {
            return res.status(400).json({ error: "Valid vehicle number is required" });
        }

        const normalized = vehicleNumber.toUpperCase().replace(/\s+/g, "");

        // Prevent duplicate for the same user
        const existing = await prisma.userVehicle.findFirst({
            where: { vehicleNumber: normalized, userId: req.user.userId },
        });
        if (existing) {
            return res.status(409).json({ error: "Vehicle already linked to your account" });
        }

        const vehicle = await prisma.userVehicle.create({
            data: { vehicleNumber: normalized, userId: req.user.userId },
        });

        // Automatically link any existing challans with this vehicle number
        await prisma.trafficChallan.updateMany({
            where: { vehicleNumber: normalized, vehicleId: null },
            data: { vehicleId: vehicle.id },
        });

        res.status(201).json({ message: "Vehicle linked successfully", vehicle });
    } catch (err) {
        console.error("addVehicle error:", err);
        res.status(500).json({ error: "Failed to add vehicle" });
    }
};

// ─── DELETE /api/traffic/vehicles/:id ──────────────────────────
exports.removeVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await prisma.userVehicle.findFirst({
            where: { id: parseInt(id), userId: req.user.userId },
        });
        if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

        // Unlink challans
        await prisma.trafficChallan.updateMany({
            where: { vehicleId: vehicle.id },
            data: { vehicleId: null },
        });

        await prisma.userVehicle.delete({ where: { id: vehicle.id } });
        res.json({ message: "Vehicle removed" });
    } catch (err) {
        console.error("removeVehicle error:", err);
        res.status(500).json({ error: "Failed to remove vehicle" });
    }
};

// ─── GET /api/traffic/vehicles ─────────────────────────────────
exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await prisma.userVehicle.findMany({
            where: { userId: req.user.userId },
            include: {
                challans: { include: { fine: true }, orderBy: { issuedAt: "desc" } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ vehicles });
    } catch (err) {
        console.error("getVehicles error:", err);
        res.status(500).json({ error: "Failed to fetch vehicles" });
    }
};

// ─── GET /api/traffic/challans ─────────────────────────────────
// Returns challans across ALL vehicles linked to this user
// Query params: ?status=unpaid  (optional filter)
exports.getChallans = async (req, res) => {
    try {
        const vehicles = await prisma.userVehicle.findMany({
            where: { userId: req.user.userId },
            select: { id: true, vehicleNumber: true },
        });

        if (vehicles.length === 0) {
            return res.json({ challans: [], summary: { total: 0, unpaid: 0, paid: 0, contested: 0, cancelled: 0, totalFine: 0, unpaidFine: 0 } });
        }

        const vehicleIds = vehicles.map((v) => v.id);
        const { status } = req.query;

        const where = {
            vehicleId: { in: vehicleIds },
            ...(status ? { status } : {}),
        };

        const challans = await prisma.trafficChallan.findMany({
            where,
            include: { fine: true },
            orderBy: { issuedAt: "desc" },
        });

        // Summary stats
        const allChallans = await prisma.trafficChallan.findMany({
            where: { vehicleId: { in: vehicleIds } },
            select: { status: true, amount: true },
        });

        const summary = {
            total: allChallans.length,
            unpaid: allChallans.filter((c) => c.status === "unpaid").length,
            paid: allChallans.filter((c) => c.status === "paid").length,
            contested: allChallans.filter((c) => c.status === "contested").length,
            cancelled: allChallans.filter((c) => c.status === "cancelled").length,
            totalFine: allChallans.reduce((s, c) => s + c.amount, 0),
            unpaidFine: allChallans.filter((c) => c.status === "unpaid").reduce((s, c) => s + c.amount, 0),
        };

        res.json({ challans, summary });
    } catch (err) {
        console.error("getChallans error:", err);
        res.status(500).json({ error: "Failed to fetch challans" });
    }
};

// ─── GET /api/traffic/challans/:id ─────────────────────────────
exports.getChallanById = async (req, res) => {
    try {
        const challan = await prisma.trafficChallan.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { fine: true, vehicle: true },
        });
        if (!challan) return res.status(404).json({ error: "Challan not found" });

        res.json({ challan });
    } catch (err) {
        console.error("getChallanById error:", err);
        res.status(500).json({ error: "Failed to fetch challan" });
    }
};
