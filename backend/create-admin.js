const prisma = require('./config/prisma');
const bcrypt = require('bcrypt');

async function main() {
    const email = 'admin@civic.in';
    const password = 'password123';

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log(`User ${email} already exists. Updating password...`);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where: { email },
            data: { passwordHash, role: 'admin' },
        });
        console.log(`Password reset for ${email}. You can now login with:`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await prisma.user.create({
        data: {
            email,
            passwordHash,
            role: 'admin',
        },
    });

    console.log(`✅ Admin user created!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
