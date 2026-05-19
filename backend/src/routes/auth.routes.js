import express from "express";
import {
  getMe,
  googleLogin,
  login,
  register,
  resendVerificationEmail,
  sendPhoneOtp,
  verifyEmail,
  verifyPhoneOtp,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

router.get("/me", protect, getMe);

router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification-email", protect, resendVerificationEmail);

router.post("/send-phone-otp", protect, sendPhoneOtp);
router.post("/verify-phone-otp", protect, verifyPhoneOtp);

export default router;