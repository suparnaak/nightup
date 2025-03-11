import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Exists" : "Missing");

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or another SMTP service like 'Yahoo', 'Outlook'
  auth: {
    user: process.env.EMAIL_USER,  // Add in your .env
    pass: process.env.EMAIL_PASS,  // Add in your .env
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Verification',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    html: `<p>Your OTP is <b>${otp}</b>.</p><p>It will expire in 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email.');
  }
};
