import crypto from "crypto";
import Company from "../models/Company.js";
import CompanyInvite from "../models/CompanyInvite.js";
import User from "../models/User.js";
import createNotification from "../utils/createNotification.js";

const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || "http://localhost:5173";
};

const createInviteToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const createCompany = async (req, res) => {
  try {
    const { name, email, phone, address, gstNumber } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    const existingCompany = await Company.findOne({
      name: String(name).trim(),
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: "Company already exists with this name.",
      });
    }

    const company = await Company.create({
      name,
      email: email || "",
      phone: phone || "",
      address: address || "",
      gstNumber: gstNumber || "",
      status: "active",
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully.",
      company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create company.",
      error: error.message,
    });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies.",
      error: error.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { name, email, phone, address, gstNumber, status } = req.body;

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    if (name !== undefined) company.name = name;
    if (email !== undefined) company.email = email;
    if (phone !== undefined) company.phone = phone;
    if (address !== undefined) company.address = address;
    if (gstNumber !== undefined) company.gstNumber = gstNumber;
    if (status !== undefined) company.status = status;

    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company updated successfully.",
      company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update company.",
      error: error.message,
    });
  }
};

export const createCompanyInvite = async (req, res) => {
  try {
    const { companyId, invitedEmail, invitedName, invitedPhone, role } =
      req.body;

    if (!companyId || !invitedEmail) {
      return res.status(400).json({
        success: false,
        message: "Company and invited email are required.",
      });
    }

    const company = await Company.findById(companyId);

    if (!company || company.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Active company not found.",
      });
    }

    const normalizedEmail = String(invitedEmail).toLowerCase().trim();

    const existingPendingInvite = await CompanyInvite.findOne({
      companyId,
      invitedEmail: normalizedEmail,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (existingPendingInvite) {
      return res.status(409).json({
        success: false,
        message: "A pending invite already exists for this email.",
      });
    }

    const token = createInviteToken();

    const invite = await CompanyInvite.create({
      companyId,
      invitedEmail: normalizedEmail,
      invitedName: invitedName || "",
      invitedPhone: invitedPhone || "",
      role: role || "member",
      token,
      status: "pending",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      invitedBy: req.user._id,
    });

    const inviteLink = `${getFrontendUrl()}/register?invite=${token}`;

    return res.status(201).json({
      success: true,
      message: "Company invite created successfully.",
      invite,
      inviteLink,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create company invite.",
      error: error.message,
    });
  }
};

export const getCompanyInvites = async (req, res) => {
  try {
    const invites = await CompanyInvite.find()
      .populate("companyId", "name email phone status")
      .populate("invitedBy", "name email role")
      .populate("acceptedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invites.length,
      invites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company invites.",
      error: error.message,
    });
  }
};

export const getInviteByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await CompanyInvite.findOne({
      token,
      status: "pending",
      expiresAt: { $gt: new Date() },
    }).populate("companyId", "name email phone status");

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found or expired.",
      });
    }

    return res.status(200).json({
      success: true,
      invite,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invite.",
      error: error.message,
    });
  }
};

export const acceptCompanyInvite = async (user, inviteToken) => {
  if (!inviteToken) return null;

  const invite = await CompanyInvite.findOne({
    token: inviteToken,
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).populate("companyId", "name");

  if (!invite) return null;

  if (String(invite.invitedEmail).toLowerCase() !== String(user.email).toLowerCase()) {
    throw new Error("Invite email does not match registered email.");
  }

  user.companyId = invite.companyId._id;
  user.companyName = invite.companyId.name;
  user.role = invite.role;
  user.membershipStatus = "approved";
  user.approvedAt = new Date();
  user.approvedBy = invite.invitedBy;

  await user.save();

  invite.status = "accepted";
  invite.acceptedBy = user._id;
  invite.acceptedAt = new Date();

  await invite.save();

  await createNotification({
    recipientId: invite.invitedBy,
    actorId: user._id,
    title: "Company Invite Accepted",
    message: `${user.name} accepted the invite for ${invite.companyId.name}.`,
    type: "system",
  });

  return invite;
};

export const approveCompanyMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).populate("companyId", "name");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.membershipStatus = "approved";
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();

    await user.save();

    await createNotification({
      recipientId: user._id,
      actorId: req.user._id,
      title: "Company Membership Approved",
      message: `Your company membership has been approved.`,
      type: "system",
    });

    return res.status(200).json({
      success: true,
      message: "Company member approved successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve company member.",
      error: error.message,
    });
  }
};

export const rejectCompanyMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.membershipStatus = "rejected";
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();

    await user.save();

    await createNotification({
      recipientId: user._id,
      actorId: req.user._id,
      title: "Company Membership Rejected",
      message: `Your company membership request has been rejected.`,
      type: "system",
    });

    return res.status(200).json({
      success: true,
      message: "Company member rejected successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject company member.",
      error: error.message,
    });
  }
};