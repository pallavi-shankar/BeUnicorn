import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const formatUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    companyName: user.companyName,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    status: user.status,
    kycStatus: user.kycStatus,
    createdAt: user.createdAt,
  };
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, companyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    const allowedRoles = ["admin", "cabin_admin", "member", "guest"];

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || "",
      password,
      role: allowedRoles.includes(role) ? role : "member",
      companyName: companyName || "",
      isEmailVerified: true,
      isPhoneVerified: true,
      status: "active",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
};

export const getMyProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: formatUser(req.user),
  });
};

export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, companyName } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (companyName !== undefined) user.companyName = companyName;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: formatUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile update failed.",
      error: error.message,
    });
  }
};