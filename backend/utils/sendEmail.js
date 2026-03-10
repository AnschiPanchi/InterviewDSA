import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Needs to be an App Password, NOT actual gmail login
            },
            connectionTimeout: 5000, 
            socketTimeout: 5000,
        });

        const info = await transporter.sendMail({
            from: `"InterviewDSA" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Message sent to actual mailbox: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending real email via node:", error);
        throw error;
    }
};

export default sendEmail;
