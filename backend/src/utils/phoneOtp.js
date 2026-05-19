import crypto from "crypto";

export const generateOtp = () => {
  return String(crypto.randomInt(100000, 999999));
};

export const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
};

export const sendOtpSms = async ({ phone, otp }) => {
  // Development mode: no SMS provider yet.
  // Later plug MSG91/Twilio/Firebase Phone Auth here.
  console.log(`Phone OTP for ${phone}: ${otp}`);

  return {
    sent: false,
    reason: "SMS provider not configured",
    devOtp: otp,
  };
};