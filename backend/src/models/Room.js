import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: [true, "Building is required"],
    },

    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
      required: [true, "Floor is required"],
    },

    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
    },

    roomCode: {
      type: String,
      required: [true, "Room code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["meeting_room", "conference_room", "creator_studio", "event_space", "cabin", "hot_desk", "day_pass"],
      required: [true, "Room type is required"],
    },

    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },

    pricePerHour: {
      type: Number,
      required: [true, "Price per hour is required"],
      min: [0, "Price cannot be negative"],
    },

    amenities: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    googleCalendarResourceId: {
      type: String,
      default: "",
      trim: true,
    },

    availabilityStatus: {
      type: String,
      enum: ["available", "maintenance", "inactive"],
      default: "available",
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

roomSchema.index({ buildingId: 1, floorId: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ isActive: 1 });

const Room = mongoose.model("Room", roomSchema);

export default Room;