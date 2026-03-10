import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async ({ to, subject, html }) => {
    try {
        // Use real Gmail SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"InterviewDSA" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Message sent to real inbox: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending real email:", error);
        throw error;
    }
};

export default sendEmail;
