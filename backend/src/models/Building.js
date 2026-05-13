import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Building name is required"],
      trim: true,
    },

    code: {
      type: String,
      required: [true, "Building code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Building address is required"],
      trim: true,
    },

    city: {
      type: String,
      default: "Bengaluru",
      trim: true,
    },

    state: {
      type: String,
      default: "Karnataka",
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Building = mongoose.model("Building", buildingSchema);

export default Building;