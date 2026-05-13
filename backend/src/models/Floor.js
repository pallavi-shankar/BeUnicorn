import mongoose from "mongoose";

const floorSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: [true, "Building is required"],
    },

    name: {
      type: String,
      required: [true, "Floor name is required"],
      trim: true,
    },

    floorNumber: {
      type: Number,
      required: [true, "Floor number is required"],
    },

    description: {
      type: String,
      default: "",
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

floorSchema.index({ buildingId: 1, floorNumber: 1 }, { unique: true });

const Floor = mongoose.model("Floor", floorSchema);

export default Floor;