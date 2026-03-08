const prisma = require("../config/prisma");

// Major Indian cities with approximate center coordinates
const INDIAN_CITIES = [
    { name: "Mumbai", lat: 19.076, lng: 72.8777 },
    { name: "Delhi", lat: 28.6139, lng: 77.209 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
    { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
    { name: "Indore", lat: 22.7196, lng: 75.8577 },
    { name: "Thane", lat: 19.2183, lng: 72.9781 },
    { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
    { name: "Patna", lat: 25.6093, lng: 85.1376 },
    { name: "Vadodara", lat: 22.3072, lng: 73.1812 },
    { name: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
    { name: "Ludhiana", lat: 30.901, lng: 75.8573 },
    { name: "Agra", lat: 27.1767, lng: 78.0081 },
    { name: "Nashik", lat: 19.9975, lng: 73.7898 },
    { name: "Ranchi", lat: 23.3441, lng: 85.3096 },
    { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
    { name: "Surat", lat: 21.1702, lng: 72.8311 },
    { name: "Rajkot", lat: 22.3039, lng: 70.8022 },
    { name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
    { name: "Mysore", lat: 12.2958, lng: 76.6394 },
    { name: "Guwahati", lat: 26.1445, lng: 91.7362 },
    { name: "Noida", lat: 28.5355, lng: 77.391 },
];

const MAX_CITY_DIST_KM = 50; // Max distance to assign issue to a city

function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestCity(lat, lng) {
    let best = null;
    let bestDist = Infinity;
    for (const city of INDIAN_CITIES) {
        const d = haversineKm(lat, lng, city.lat, city.lng);
        if (d < bestDist) {
            bestDist = d;
            best = city;
        }
    }
    if (bestDist > MAX_CITY_DIST_KM) return null;
    return { ...best, distance: bestDist };
}

/**
 * GET /api/leaderboard
 * Returns city-wise aggregated issue data + raw issue points for heatmap.
 */
exports.getLeaderboard = async (req, res) => {
    try {
        const issues = await prisma.issue.findMany({
            where: {
                latitude: { not: null },
                longitude: { not: null },
            },
            select: {
                id: true,
                latitude: true,
                longitude: true,
                status: true,
                incidentType: true,
                createdAt: true,
            },
        });

        // Assign issues to cities
        const cityMap = {};

        // Init all known cities with 0
        for (const city of INDIAN_CITIES) {
            cityMap[city.name] = {
                name: city.name,
                lat: city.lat,
                lng: city.lng,
                total: 0,
                pending: 0,
                in_progress: 0,
                resolved: 0,
                rejected: 0,
                resolutionRate: 0,
            };
        }

        // Heatmap points (all issues with location)
        const heatmapPoints = [];

        for (const issue of issues) {
            heatmapPoints.push({
                lat: issue.latitude,
                lng: issue.longitude,
                status: issue.status,
            });

            const match = findNearestCity(issue.latitude, issue.longitude);
            if (!match) continue;

            const bucket = cityMap[match.name];
            bucket.total += 1;
            bucket[issue.status] = (bucket[issue.status] || 0) + 1;
        }

        // Calculate resolution rate and rank
        const cities = Object.values(cityMap)
            .filter((c) => c.total > 0)
            .map((c) => ({
                ...c,
                resolutionRate: c.total > 0 ? Math.round((c.resolved / c.total) * 100) : 0,
            }))
            .sort((a, b) => b.total - a.total);

        res.json({
            cities,
            heatmapPoints,
            totalIssues: issues.length,
            totalCities: cities.length,
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
