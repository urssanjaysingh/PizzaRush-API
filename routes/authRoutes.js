import express from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  sendOTPForPasswordReset,
  verifyOTPAndResetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Route to register a new user
router.post("/register", registerUser);

// Route to verify email
router.get("/verify", verifyEmail);

// Route to login user
router.post("/login", loginUser);

// Route to send OTP for password reset
router.post("/send-otp", sendOTPForPasswordReset);

// Route to verify OTP and reset password
router.post("/verify-otp", verifyOTPAndResetPassword);

export default router;
