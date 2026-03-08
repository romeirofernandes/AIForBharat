const prisma = require("../config/prisma");
const { sendMail } = require("../services/mailer");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Default radius in km – citizens within this radius of a new issue get notified
const NOTIFY_RADIUS_KM = 5;

/**
 * Haversine distance between two lat/lng points in km.
 */
function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * After a new issue is created, find citizens nearby and email them.
 * This runs asynchronously – the caller does NOT await it.
 */
async function notifyNearbyCitizens(issue) {
    try {
        if (issue.latitude == null || issue.longitude == null) return;

        // Get all profiles with emailNotifications ON and home location set
        const profiles = await prisma.citizenProfile.findMany({
            where: {
                emailNotifications: true,
                homeLatitude: { not: null },
                homeLongitude: { not: null },
            },
            include: {
                user: { select: { id: true, email: true } },
            },
        });

        const issueLat = issue.latitude;
        const issueLng = issue.longitude;

        const nearby = profiles.filter((p) => {
            if (p.userId === issue.userId) return false; // don't notify creator
            const dist = haversineKm(p.homeLatitude, p.homeLongitude, issueLat, issueLng);
            return dist <= NOTIFY_RADIUS_KM;
        });

        if (nearby.length === 0) return;

        const issueLink = `${FRONTEND_URL}/user/forum`;

        const promises = nearby.map((p) =>
            sendMail({
                to: p.user.email,
                subject: `New civic issue reported near you: ${issue.title}`,
                html: `
                    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
                        <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">New Issue Near You</h2>
                        <p style="margin: 0 0 20px; font-size: 13px; color: #666;">A fellow citizen reported an issue in your area.</p>
                        <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                            <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #999;">${issue.incidentType || 'Issue'}</p>
                            <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 700;">${issue.title}</h3>
                            <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.5;">${(issue.description || '').substring(0, 200)}${issue.description?.length > 200 ? '...' : ''}</p>
                        </div>
                        <a href="${issueLink}" style="display: inline-block; padding: 12px 28px; background: #171717; color: #fff; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;">View &amp; Vote on The Civic Wire</a>
                        <p style="margin: 24px 0 0; font-size: 11px; color: #999;">You received this because you enabled email notifications on Civic Intel. You can disable them in your profile settings.</p>
                    </div>
                `,
            })
        );

        await Promise.allSettled(promises);
        console.log(`Notified ${nearby.length} citizen(s) about issue #${issue.id}`);
    } catch (err) {
        console.error("notifyNearbyCitizens error:", err.message);
    }
}

module.exports = { notifyNearbyCitizens };
