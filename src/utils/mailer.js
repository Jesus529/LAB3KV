const nodemailer = require("nodemailer");

const hasSMTP =
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

let transporter = null;

if (hasSMTP) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

async function sendMfaEmail(to, code) {
    if (!transporter) {
        console.log(
            "SMTP no configurado. Código MFA:",
            code
        );

        return;
    }

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: "Código MFA - TechStore",
        text: `Tu código de verificación MFA es: ${code}. Este código es válido durante 5 minutos.`
    });
}

module.exports = {
    sendMfaEmail
};