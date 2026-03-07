/**
 * Seed script: Populates the traffic_fines table with the official
 * Motor Vehicles Act (MVA) / CMVR / MMVR offense catalog.
 *
 * Usage:  node scripts/seed-fines.js
 */

require("dotenv").config();
const prisma = require("../config/prisma");

const offenses = [
    { sr_no: "1", offense_section: "Sec 4(1)/181 MVA", offense_name: "Driving Without valid License Below 16 Years of Age", fine_amount: 5000, repetitive_fine: "Same" },
    { sr_no: "2", offense_section: "Sec 19 to 20/182 (1) MVA", offense_name: "License Disqualified Driver", fine_amount: 10000, repetitive_fine: "Same" },
    { sr_no: "3", offense_section: "Sec 39/192(1) MVA", offense_name: "Without valid Registration Any Vehicle (Driver)", fine_amount: 2000, repetitive_fine: "5,000" },
    { sr_no: "4", offense_section: "Sec 39/192(1) MVA", offense_name: "Without valid Registration Any Vehicle (Owner)", fine_amount: 2000, repetitive_fine: "5,000" },
    { sr_no: "5", offense_section: "Sec 3(1)/181 MVA", offense_name: "Driving Without valid License", fine_amount: 5000, repetitive_fine: "Same" },
    { sr_no: "6", offense_section: "Sec 146/196 MVA", offense_name: "Without valid Insurance (Driver)", fine_amount: 2000, repetitive_fine: "4,000" },
    { sr_no: "7", offense_section: "Sec 146/196 MVA", offense_name: "Without valid Insurance (Owner or person in authorized possession of the Vehicle.)", fine_amount: 2000, repetitive_fine: "4,000" },
    { sr_no: "8", offense_section: "CMVR 3(C)/177 MVA", offense_name: "Driving Without L Board", fine_amount: 500, repetitive_fine: "1,500" },
    { sr_no: "9", offense_section: "CMVR 51/177 MVA", offense_name: "Illegal Number Plate Similar To DADA/ MAMA/ BABA Etc.", fine_amount: 1000, repetitive_fine: "Same" },
    { sr_no: "10", offense_section: "CMVR 51/177 MVA", offense_name: "Registration Number or Letters Not as Per Prescribed Measurement", fine_amount: 500, repetitive_fine: "1,500" },
    { sr_no: "11", offense_section: "Sec 119/177 MVA", offense_name: "No entry in prescribed time limit period for specific vehicle / No entry on Bridge (2W-3W - HMV)", fine_amount: 500, repetitive_fine: "1,500" },
    { sr_no: "12", offense_section: "Sec 125/177 MVA", offense_name: "Obstruction to Driver / Front seating", fine_amount: 500, repetitive_fine: "1,500" },
    { sr_no: "13", offense_section: "Sec 123/177 MVA", offense_name: "Riding on Running Board Outside Vehicle", fine_amount: 500, repetitive_fine: "1,500" },
    { sr_no: "14", offense_section: "Sec 186 MVA", offense_name: "Driver unfit (Physically/Mentally)", fine_amount: 1000, repetitive_fine: "2,000" },
    { sr_no: "15", offense_section: "MMVR 235/177 MVA", offense_name: "Dazzling Light", fine_amount: 500, repetitive_fine: "1,500" },
    { sr_no: "112", offense_section: "Sec 184C MVA (2-3 Wheeler)", offense_name: "Person driving the vehicle only to extent of use of handheld communication devices (2-3 Wheeler)", fine_amount: 1000, repetitive_fine: "10,000 within 3 years of first offence." },
    { sr_no: "115", offense_section: "Sec 194B(1) MVA", offense_name: "Without Seatbelt", fine_amount: 1000, repetitive_fine: "Same" },
];

async function main() {
    console.log("🚦 Seeding traffic fines...");

    for (const o of offenses) {
        await prisma.trafficFine.upsert({
            where: { id: parseInt(o.sr_no) || undefined },
            update: {},
            create: {
                srNo: o.sr_no,
                offenseSection: o.offense_section,
                offenseName: o.offense_name,
                fineAmount: o.fine_amount,
                repetitiveFine: o.repetitive_fine,
            },
        });
    }

    const count = await prisma.trafficFine.count();
    console.log(`✅ Done! ${count} traffic fines in database.`);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
