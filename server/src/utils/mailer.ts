import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Exists" : "Missing");

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
});
//mail for otp verification
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
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email.');
  }
};

//verify document mail by admin
export const sendDocumentVerificationEmail = async (
  email: string,
  action: "approve" | "reject",
  rejectionReason?: string
) => {
  const subject =
    action === "approve"
      ? "Your Document has been Approved"
      : "Your Document has been Rejected";
  const text =
    action === "approve"
      ? "Congratulations! Your uploaded document has been approved by our admin."
      : `We regret to inform you that your uploaded document has been rejected.${rejectionReason ? " Reason: " + rejectionReason : ""} Please update your document and try again.`;
  const html =
    action === "approve"
      ? `<p>Congratulations!</p><p>Your uploaded document has been <b>approved</b> by our admin.</p>`
      : `<p>We regret to inform you that your uploaded document has been <b>rejected</b>.</p>${
          rejectionReason ? `<p>Reason: <i>${rejectionReason}</i></p>` : ""
        }<p>Please update your document and try again.</p>`;

  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Document verification email sent to ${email} with action: ${action}`);
  } catch (error) {
    console.error('Error sending document verification email:', error);
    throw new Error('Failed to send document verification email.');
  }
};