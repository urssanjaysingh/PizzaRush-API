import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

async function sendVerificationEmail(email, verificationToken) {
  const transporter = createTransporter();

  const verificationLink = `http://localhost:3500/api/auth/verify?token=${verificationToken}`;

  const mailOptions = {
    from: "sanjaysingh26112000@gmail.com",
    to: email,
    subject: "Welcome to PizzaRush - Email Verification",
    html: `<p>Hi there,</p><p>Welcome to PizzaRush! Please click the following link to verify your email:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>If you did not sign up for PizzaRush, you can safely ignore this email.</p>`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
  } catch (error) {
    console.log("Email sending failed with error: ", error);
  }
}

async function sendResetPasswordEmail(email, otp) {
  const transporter = createTransporter();

  const mailOptions = {
    from: "your@example.com",
    to: email,
    subject: "Pizzarush - Reset Your Password",
    html: `<p>Hello,</p><p>You have requested to reset your password. Your OTP is: <strong>${otp}</strong></p><p>This OTP will expire in one minute. If you did not request this, please ignore this email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset password email sent successfully.");
  } catch (error) {
    console.error("Error sending reset password email:", error);
  }
}

export { sendVerificationEmail, sendResetPasswordEmail };
