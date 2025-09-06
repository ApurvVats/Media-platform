import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Configure the transporter using your .env variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // Use 'true' if your port is 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
   tls: {
    rejectUnauthorized: false
  }
});

export const sendMail = async (options: MailOptions) => {
  try {
    await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      ...options,
    });
    console.log("Email sent successfully to:", options.to);
  } catch (error) {
    console.error("Failed to send email:", error);
    // In a real app, you might throw this error to be handled by your error middleware
    throw new Error("Email could not be sent.");
  }
};