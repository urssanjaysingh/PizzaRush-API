import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import { sendVerificationEmail } from "../services/emailServices.js";
import { generateVerificationToken, generateOTP } from "../utils/utils.js";
import JWT from "jsonwebtoken";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function registerUser(req, res) {
  const { name, email, password, phone, address } = req.body;

  try {
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already registered. Please login!",
      });
    }

    const hashedPassword = await hashPassword(password);

    const verificationToken = generateVerificationToken();

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      verificationToken,
    });

    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).send({
      success: true,
      message: "User Registered Successfully.",
      user,
    });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).send({
      success: false,
      message: "Error in Registration.",
      error: error.message,
    });
  }
}

async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const user = await userModel.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).send("Verification token not found or expired");
    }

    user.verified = true;
    await user.save();

    res.sendFile(path.join(__dirname, "./verified.html"));
  } catch (error) {
    console.error("Error in email verification:", error);
    res.status(500).send("Error verifying email");
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User is not registered.",
      });
    }

    if (!user.verified) {
      return res.status(403).send({
        success: false,
        message:
          "Email is not verified. Please verify your email before logging in.",
      });
    }

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Login Successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        verified: user.verified,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
}

async function sendOTPForPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const otp = generateOTP();

    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 60000; // OTP expiry in 1 minute
    await user.save();

    await sendResetPasswordEmail(email, otp);

    return res.status(200).send({
      success: true,
      message: "OTP sent successfully for password reset",
    });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    return res.status(500).send({ message: "Something went wrong" });
  }
}

async function verifyOTPAndResetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .send({ message: "Email, OTP, and new password are required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).send({ message: "Invalid OTP" });
    }

    if (Date.now() > user.resetOTPExpiry) {
      return res.status(400).send({ message: "OTP has expired" });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .send({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in verifying OTP and resetting password:", error);
    return res.status(500).send({ message: "Something went wrong" });
  }
}

export {
  registerUser,
  verifyEmail,
  loginUser,
  sendOTPForPasswordReset,
  verifyOTPAndResetPassword,
};
