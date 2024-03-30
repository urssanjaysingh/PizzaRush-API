import crypto from "crypto";

function generateVerificationToken() {
  const token = crypto.randomBytes(20).toString("hex");
  return token;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export { generateOTP, generateVerificationToken };
