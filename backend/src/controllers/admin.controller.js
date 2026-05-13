import User from "../models/User.js";
import Building from "../models/Building.js";
import Floor from "../models/Floor.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  companyName: user.companyName,
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  isPhoneVerified: user.isPhoneVerified,
  kycStatus: user.kycStatus,
  createdAt: user.createdAt,
});

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalRooms,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      rejectedBookings,
      totalBuildings,
      totalFloors,
    ] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments({ status: "rejected" }),
      Building.countDocuments({ isActive: true }),
      Floor.countDocuments({ isActive: true }),
    ]);

    const revenueAgg = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = revenueAgg?.[0]?.totalRevenue || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRooms,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        rejectedBookings,
        totalBuildings,
        totalFloors,
        totalRevenue,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats.",
      error: error.message,
    });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(formatUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (status !== undefined) {
      if (!["active", "pending", "blocked"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user status.",
        });
      }

      user.status = status;
    }

    if (role !== undefined) {
      if (!["admin", "cabin_admin", "member", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role.",
        });
      }

      user.role = role;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: formatUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
      error: error.message,
    });
  }
};

export const getAdminRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("buildingId", "name code address city state")
      .populate("floorId", "name floorNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms.",
      error: error.message,
    });
  }
};

export const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email phone role companyName")
      .populate("approvedBy", "name email role")
      .populate("rejectedBy", "name email role")
      .populate("cancelledBy", "name email role")
      .populate({
        path: "roomId",
        select:
          "name roomCode type capacity pricePerHour imageUrl buildingId floorId",
        populate: [
          { path: "buildingId", select: "name code address city state" },
          { path: "floorId", select: "name floorNumber" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings.",
      error: error.message,
    });
  }
};

export const createAdminRoom = async (req, res) => {
  try {
    const {
      buildingId,
      floorId,
      name,
      roomCode,
      type,
      capacity,
      pricePerHour,
      amenities,
      description,
      imageUrl,
      googleCalendarResourceId,
      availabilityStatus,
    } = req.body;

    if (
      !buildingId ||
      !floorId ||
      !name ||
      !roomCode ||
      !type ||
      !capacity ||
      pricePerHour === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Building, floor, room name, room code, type, capacity and price are required.",
      });
    }

    const existingRoom = await Room.findOne({
      roomCode: roomCode.toUpperCase().trim(),
    });

    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: "Room code already exists.",
      });
    }

    const cleanAmenities = Array.isArray(amenities)
      ? amenities.map((item) => String(item).trim()).filter(Boolean)
      : String(amenities || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    const room = await Room.create({
      buildingId,
      floorId,
      name,
      roomCode,
      type,
      capacity,
      pricePerHour,
      amenities: cleanAmenities,
      description,
      imageUrl,
      googleCalendarResourceId: googleCalendarResourceId || "",
      availabilityStatus: availabilityStatus || "available",
      createdBy: req.user._id,
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("buildingId", "name code address city state")
      .populate("floorId", "name floorNumber");

    return res.status(201).json({
      success: true,
      message: "Room created successfully.",
      room: populatedRoom,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create room.",
      error: error.message,
    });
  }
};

export const updateAdminRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    const allowedFields = [
      "name",
      "type",
      "capacity",
      "pricePerHour",
      "description",
      "imageUrl",
      "googleCalendarResourceId",
      "availabilityStatus",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        room[field] = req.body[field];
      }
    });

    if (req.body.amenities !== undefined) {
      room.amenities = Array.isArray(req.body.amenities)
        ? req.body.amenities.map((item) => String(item).trim()).filter(Boolean)
        : String(req.body.amenities)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate("buildingId", "name code address city state")
      .populate("floorId", "name floorNumber");

    return res.status(200).json({
      success: true,
      message: "Room updated successfully.",
      room: populatedRoom,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update room.",
      error: error.message,
    });
  }
};

export const disableAdminRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    room.isActive = false;
    room.availabilityStatus = "inactive";

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room disabled successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to disable room.",
      error: error.message,
    });
  }
};