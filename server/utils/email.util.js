import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendAutoStopNotification(email, containerName) {
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Your Breezed Container Was Auto-Stopped',
        text: `Your container "${containerName}" was automatically stopped after running for more than 3 hours.\n\nTo avoid this in the future, please stop your containers manually when not in use.`,
        html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
                <h2>Container Auto-Stopped</h2>
                <p>Your container <strong>${containerName}</strong> was automatically stopped after running for more than 3 hours.</p>
                <p style="color: #666;">To avoid this in the future, please stop your containers manually when not in use.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

async function sendOtp(email, otp) {
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Your Breezed Verification Code',
        text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`,
        html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
                <h2>Your Verification Code</h2>
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${otp}</p>
                <p style="color: #666;">This code expires in 5 minutes.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

export { sendOtp, sendAutoStopNotification };
