import mongoose from "mongoose";

const companyInviteSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    invitedName: {
      type: String,
      default: "",
      trim: true,
    },

    invitedPhone: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      enum: ["member", "cabin_admin"],
      default: "member",
    },

    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

companyInviteSchema.index({ companyId: 1, invitedEmail: 1, status: 1 });

const CompanyInvite = mongoose.model("CompanyInvite", companyInviteSchema);

export default CompanyInvite;