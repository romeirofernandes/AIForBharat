/**
 * Seed script: Creates mock traffic challans for two vehicles.
 *  - MH01CP6748 → 6 challans
 *  - MH01CP1234 → 4 challans
 *
 * Usage:  node scripts/seed-challans.js
 * NOTE:  Run seed-fines.js first so the TrafficFine rows exist.
 */

require("dotenv").config();
const prisma = require("../config/prisma");

// Random Unsplash traffic / road images (static seeds for reproducibility)
const unsplashImages = [
    "https://images.unsplash.com/photo-1494783329005-e932da8b01fb?w=640&q=80",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=640&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0220?w=640&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=640&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=640&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=640&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=640&q=80",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=640&q=80",
    "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=640&q=80",
    "https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=640&q=80",
];

const locations = [
    "Western Express Highway, Andheri",
    "SV Road, Bandra West",
    "LBS Marg, Mulund",
    "Eastern Freeway, CSMT",
    "Sion-Panvel Highway, Vashi",
    "JJ Flyover, Mumbai",
    "FC Road, Pune",
    "MG Road, Camp, Pune",
    "Hinjewadi Phase 1, Pune",
    "Katraj-Dehu Road Bypass, Pune",
];

const statuses = ["unpaid", "paid", "contested", "cancelled"];

function randomDate(daysBack) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
    d.setHours(Math.floor(Math.random() * 14) + 7); // 7 AM – 9 PM
    d.setMinutes(Math.floor(Math.random() * 60));
    return d;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log("🚦 Seeding traffic challans...");

    // Grab all fines from DB so we can reference their IDs
    const fines = await prisma.trafficFine.findMany();
    if (fines.length === 0) {
        console.error("❌ No fines found. Run seed-fines.js first.");
        process.exit(1);
    }

    // Definition: vehicle → number of challans
    const vehicleChallans = [
        { vehicleNumber: "MH01CP6748", count: 6 },
        { vehicleNumber: "MH01CP1234", count: 4 },
    ];

    let challanSeq = 1;

    for (const vc of vehicleChallans) {
        for (let i = 0; i < vc.count; i++) {
            const fine = pick(fines);
            const issuedAt = randomDate(180); // last 6 months
            const status = pick(statuses);

            await prisma.trafficChallan.create({
                data: {
                    challanNumber: `MH-ECH-2026-${String(challanSeq++).padStart(6, "0")}`,
                    vehicleNumber: vc.vehicleNumber,
                    fineId: fine.id,
                    amount: fine.fineAmount,
                    status,
                    location: pick(locations),
                    imageUrl: Math.random() > 0.2 ? pick(unsplashImages) : null, // ~80% have images
                    issuedAt,
                    paidAt: status === "paid" ? new Date(issuedAt.getTime() + 86400000 * Math.floor(Math.random() * 30)) : null,
                },
            });
        }

        console.log(`  ✔ ${vc.count} challans created for ${vc.vehicleNumber}`);
    }

    const total = await prisma.trafficChallan.count();
    console.log(`✅ Done! ${total} total challans in database.`);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
