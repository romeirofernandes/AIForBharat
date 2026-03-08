const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false, // STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send a single email.
 * @param {{ to: string, subject: string, html: string }} opts
 */
async function sendMail({ to, subject, html }) {
    try {
        await transporter.sendMail({
            from: `"Civic Intel" <${process.env.FROM_EMAIL}>`,
            to,
            subject,
            html,
        });
    } catch (err) {
        console.error(`Mail send failed to ${to}:`, err.message);
    }
}

module.exports = { sendMail };
