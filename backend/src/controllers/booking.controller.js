import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const calculateHours = (startTime, endTime) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const diff = end - start;

  return diff / 60;
};

const hasTimeOverlap = (newStart, newEnd, existingStart, existingEnd) => {
  const ns = timeToMinutes(newStart);
  const ne = timeToMinutes(newEnd);
  const es = timeToMinutes(existingStart);
  const ee = timeToMinutes(existingEnd);

  return ns < ee && ne > es;
};

const populateBooking = async (bookingId) => {
  return Booking.findById(bookingId)
    .populate("userId", "name email phone role companyName")
    .populate("approvedBy", "name email role")
    .populate("rejectedBy", "name email role")
    .populate("cancelledBy", "name email role")
    .populate({
      path: "roomId",
      select:
        "name roomCode type capacity pricePerHour imageUrl description buildingId floorId amenities",
      populate: [
        { path: "buildingId", select: "name code address city state" },
        { path: "floorId", select: "name floorNumber" },
      ],
    });
};

export const createBooking = async (req, res) => {
  try {
    const {
      roomId,
      bookingDate,
      startTime,
      endTime,
      purpose,
      attendeesCount,
    } = req.body;

    if (!roomId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Room, booking date, start time and end time are required.",
      });
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        success: false,
        message: "End time must be greater than start time.",
      });
    }

    const durationHours = calculateHours(startTime, endTime);

    if (durationHours > 8) {
      return res.status(400).json({
        success: false,
        message: "Booking duration cannot exceed 8 hours.",
      });
    }

    const room = await Room.findById(roomId);

    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (room.availabilityStatus !== "available") {
      return res.status(400).json({
        success: false,
        message: "Room is currently not available.",
      });
    }

    if (attendeesCount && Number(attendeesCount) > room.capacity) {
      return res.status(400).json({
        success: false,
        message: `This room capacity is ${room.capacity}.`,
      });
    }

    const existingBookings = await Booking.find({
      roomId,
      bookingDate,
      status: { $in: ["pending", "confirmed"] },
    });

    const overlap = existingBookings.find((booking) =>
      hasTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (overlap) {
      return res.status(409).json({
        success: false,
        message:
          "This room already has a pending or confirmed booking for the selected time slot.",
      });
    }

    const amount = Math.ceil(durationHours * room.pricePerHour);

    const booking = await Booking.create({
      userId: req.user._id,
      roomId,
      bookingDate,
      startTime,
      endTime,
      amount,
      purpose: purpose || "",
      attendeesCount: attendeesCount || 1,
      status: "pending",
    });

    const populatedBooking = await populateBooking(booking._id);

    return res.status(201).json({
      success: true,
      message:
        "Booking request submitted successfully. Please wait for admin confirmation.",
      booking: populatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create booking.",
      error: error.message,
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("approvedBy", "name email role")
      .populate("rejectedBy", "name email role")
      .populate("cancelledBy", "name email role")
      .populate({
        path: "roomId",
        select:
          "name roomCode type capacity pricePerHour imageUrl description buildingId floorId",
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
      message: "Failed to fetch your bookings.",
      error: error.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.roomId) filter.roomId = req.query.roomId;
    if (req.query.bookingDate) filter.bookingDate = req.query.bookingDate;

    const bookings = await Booking.find(filter)
      .populate("userId", "name email phone role companyName")
      .populate("approvedBy", "name email role")
      .populate("rejectedBy", "name email role")
      .populate("cancelledBy", "name email role")
      .populate({
        path: "roomId",
        select:
          "name roomCode type capacity pricePerHour imageUrl description buildingId floorId",
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

export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be approved.",
      });
    }

    const existingConfirmedBookings = await Booking.find({
      _id: { $ne: booking._id },
      roomId: booking.roomId,
      bookingDate: booking.bookingDate,
      status: "confirmed",
    });

    const overlap = existingConfirmedBookings.find((existingBooking) =>
      hasTimeOverlap(
        booking.startTime,
        booking.endTime,
        existingBooking.startTime,
        existingBooking.endTime
      )
    );

    if (overlap) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot approve. Another confirmed booking already exists for this slot.",
      });
    }

    booking.status = "confirmed";
    booking.approvedAt = new Date();
    booking.approvedBy = req.user._id;

    await booking.save();

    const populatedBooking = await populateBooking(booking._id);

    return res.status(200).json({
      success: true,
      message: "Booking approved and confirmed successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve booking.",
      error: error.message,
    });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be rejected.",
      });
    }

    booking.status = "rejected";
    booking.rejectionReason = reason || "Rejected by admin";
    booking.rejectedAt = new Date();
    booking.rejectedBy = req.user._id;

    await booking.save();

    const populatedBooking = await populateBooking(booking._id);

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject booking.",
      error: error.message,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const isOwner = String(booking.userId) === String(req.user._id);
    const isAdmin = ["admin", "cabin_admin"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot cancel this booking.",
      });
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or confirmed bookings can be cancelled.",
      });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason || "Cancelled by user";
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;

    await booking.save();

    const populatedBooking = await populateBooking(booking._id);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking.",
      error: error.message,
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await populateBooking(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const isOwner = String(booking.userId._id) === String(req.user._id);
    const isAdmin = ["admin", "cabin_admin"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this booking.",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking.",
      error: error.message,
    });
  }
};