import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    try {
        const data = await resend.emails.send({
            from: 'InterviewDSA <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: html,
        });

        console.log("Message sent via Resend REST API:", data);
        return data;
    } catch (error) {
        console.error("Error sending email via Resend:", error);
        throw error;
    }
};

export default sendEmail;
