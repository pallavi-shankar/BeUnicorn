import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { acceptCompanyInvite } from "./company.controller.js";
import generateToken from "../utils/generateToken.js";
import {
  generateEmailVerificationToken,
  hashEmailVerificationToken,
  sendVerificationEmail,
} from "../utils/emailVerification.js";
import { generateOtp, hashOtp, sendOtpSms } from "../utils/phoneOtp.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sanitizeUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  companyId: user.companyId,
  companyName: user.companyName,
  membershipStatus: user.membershipStatus,
  approvedBy: user.approvedBy,
  approvedAt: user.approvedAt,
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  isPhoneVerified: user.isPhoneVerified,
  emailVerifiedAt: user.emailVerifiedAt,
  phoneVerifiedAt: user.phoneVerifiedAt,
  phoneOtpLastSentAt: user.phoneOtpLastSentAt,
  kycStatus: user.kycStatus,
  createdAt: user.createdAt,
});

const getBackendBaseUrl = (req) => {
  return process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
};

const sendUserVerificationEmail = async (req, user) => {
  const { rawToken, hashedToken, expiresAt } = generateEmailVerificationToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = expiresAt;

  await user.save();

  const verificationUrl = `${getBackendBaseUrl(
    req
  )}/api/auth/verify-email/${rawToken}`;

  const result = await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl,
  });

  return {
    verificationUrl,
    emailSent: result.sent,
  };
};

const sendUserPhoneOtp = async (user) => {
  const otp = generateOtp();

  user.phoneOtpHash = hashOtp(otp);
  user.phoneOtpExpires = new Date(Date.now() + 1000 * 60 * 10);
  user.phoneOtpLastSentAt = new Date();

  await user.save();

  const result = await sendOtpSms({
    phone: user.phone,
    otp,
  });

  return {
    otpSent: result.sent,
    devOtp: process.env.NODE_ENV === "production" ? undefined : otp,
  };
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, companyName, role, inviteToken } =
      req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      companyName: companyName || "",
      role: role || "member",
      status: "active",
      isEmailVerified: false,
      isPhoneVerified: false,
      membershipStatus: inviteToken ? "pending" : "none",
    });

    const emailResult = await sendUserVerificationEmail(req, user);
    const otpResult = await sendUserPhoneOtp(user);

    if (inviteToken) {
      await acceptCompanyInvite(user, inviteToken);
      await user.populate("companyId", "name email phone status");
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Verification email and phone OTP have been sent.",
      token,
      user: sanitizeUser(user),
      emailVerification: {
        emailSent: emailResult.emailSent,
        verificationUrl:
          process.env.NODE_ENV === "production"
            ? undefined
            : emailResult.verificationUrl,
      },
      phoneVerification: {
        otpSent: otpResult.otpSent,
        devOtp: otpResult.devOtp,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. Please contact admin.",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (
      !process.env.GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID.includes("PASTE_")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Google login is not configured yet. Please add GOOGLE_CLIENT_ID.",
      });
    }

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({
        success: false,
        message: "Google account email not found.",
      });
    }

    const email = String(payload.email).toLowerCase().trim();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: payload.name || "Google User",
        email,
        phone: "google-login-pending",
        password: `Google@${Date.now()}${Math.random()
          .toString(36)
          .slice(2)}`,
        companyName: "",
        role: "member",
        status: "active",
        isEmailVerified: Boolean(payload.email_verified),
        emailVerifiedAt: payload.email_verified ? new Date() : null,
        isPhoneVerified: false,
        membershipStatus: "none",
      });
    } else if (payload.email_verified && !user.isEmailVerified) {
      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      await user.save();
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. Please contact admin.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Google login failed.",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
      error: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    const hashedToken = hashEmailVerificationToken(token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).send(`
        <html>
          <body style="font-family:Arial; padding:40px;">
            <h2>Email verification failed</h2>
            <p>This verification link is invalid or expired.</p>
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }/login">Go to login</a>
          </body>
        </html>
      `);
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).send(`
      <html>
        <body style="font-family:Arial; padding:40px;">
          <h2>Email verified successfully</h2>
          <p>Your BeUnicorn email has been verified.</p>
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/login">Go to login</a>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send(`
      <html>
        <body style="font-family:Arial; padding:40px;">
          <h2>Something went wrong</h2>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "+emailVerificationToken +emailVerificationExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    const emailResult = await sendUserVerificationEmail(req, user);

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully.",
      emailVerification: {
        emailSent: emailResult.emailSent,
        verificationUrl:
          process.env.NODE_ENV === "production"
            ? undefined
            : emailResult.verificationUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email.",
      error: error.message,
    });
  }
};

export const sendPhoneOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "+phoneOtpHash +phoneOtpExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone is already verified.",
      });
    }

    const otpResult = await sendUserPhoneOtp(user);

    return res.status(200).json({
      success: true,
      message: "Phone OTP sent successfully.",
      phoneVerification: {
        otpSent: otpResult.otpSent,
        devOtp: otpResult.devOtp,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send phone OTP.",
      error: error.message,
    });
  }
};

export const verifyPhoneOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    const user = await User.findById(req.user._id).select(
      "+phoneOtpHash +phoneOtpExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone is already verified.",
      });
    }

    if (!user.phoneOtpHash || !user.phoneOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP not requested. Please request a new OTP.",
      });
    }

    if (user.phoneOtpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    const hashedOtp = hashOtp(otp);

    if (hashedOtp !== user.phoneOtpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    user.isPhoneVerified = true;
    user.phoneVerifiedAt = new Date();
    user.phoneOtpHash = null;
    user.phoneOtpExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Phone verified successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify phone OTP.",
      error: error.message,
    });
  }
};