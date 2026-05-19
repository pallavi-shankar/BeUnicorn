import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";
import createNotification from "../utils/createNotification.js";
import {
  createWalletTransaction,
  getWalletBalance,
} from "../utils/wallet.js";

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

const getBookingStartDateTime = (bookingDate, startTime) => {
  return new Date(`${bookingDate}T${startTime}:00`);
};

const calculateRefundAmount = (booking) => {
  const bookingStart = getBookingStartDateTime(
    booking.bookingDate,
    booking.startTime
  );

  const now = new Date();
  const diffMs = bookingStart.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours >= 2) {
    return booking.amount;
  }

  if (diffHours > 0 && diffHours < 2) {
    return Math.round(booking.amount * 0.5);
  }

  return 0;
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

const notifyAdmins = async ({ actorId, title, message, type, bookingId }) => {
  const admins = await User.find({
    role: { $in: ["admin", "cabin_admin"] },
    status: "active",
  }).select("_id");

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        recipientId: admin._id,
        actorId,
        title,
        message,
        type,
        bookingId,
      })
    )
  );
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

    if (durationHours <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking duration.",
      });
    }

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

    await notifyAdmins({
      actorId: req.user._id,
      title: "New Booking Request",
      message: `${req.user.name} requested ${room.name} on ${bookingDate} from ${startTime} to ${endTime}.`,
      type: "booking_requested",
      bookingId: booking._id,
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
    const booking = await Booking.findById(req.params.id).populate(
      "roomId",
      "name"
    );

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
      roomId: booking.roomId._id || booking.roomId,
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

    const existingDebit = await WalletTransaction.findOne({
      userId: booking.userId,
      bookingId: booking._id,
      type: "booking_debit",
      direction: "debit",
    });

    if (!existingDebit) {
      const balance = await getWalletBalance(booking.userId);

      if (balance < booking.amount) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve booking. Member wallet balance is ₹${balance}, but booking amount is ₹${booking.amount}. Please add credits first.`,
        });
      }

      await createWalletTransaction({
        userId: booking.userId,
        type: "booking_debit",
        direction: "debit",
        amount: booking.amount,
        description: `Booking charge for ${
          booking.roomId?.name || "workspace"
        }`,
        bookingId: booking._id,
        actorId: req.user._id,
        source: "booking",
        reason: "Booking approved by admin",
      });
    }

    booking.status = "confirmed";
    booking.approvedAt = new Date();
    booking.approvedBy = req.user._id;

    await booking.save();

    await createNotification({
      recipientId: booking.userId,
      actorId: req.user._id,
      title: "Booking Approved",
      message: `Your booking has been approved. ₹${booking.amount} has been deducted from your wallet.`,
      type: "booking_approved",
      bookingId: booking._id,
    });

    const populatedBooking = await populateBooking(booking._id);
    const balance = await getWalletBalance(booking.userId);

    return res.status(200).json({
      success: true,
      message: "Booking approved, confirmed and wallet deducted successfully.",
      balance,
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

    await createNotification({
      recipientId: booking.userId,
      actorId: req.user._id,
      title: "Booking Rejected",
      message: `Your booking request was rejected. Reason: ${
        booking.rejectionReason || "Not specified"
      }`,
      type: "booking_rejected",
      bookingId: booking._id,
    });

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

    const booking = await Booking.findById(req.params.id).populate(
      "roomId",
      "name"
    );

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

    const wasConfirmed = booking.status === "confirmed";

    booking.status = "cancelled";
    booking.cancellationReason = reason || "Cancelled";
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;

    await booking.save();

    let refundAmount = 0;

    if (wasConfirmed) {
      const existingDebit = await WalletTransaction.findOne({
        userId: booking.userId,
        bookingId: booking._id,
        type: "booking_debit",
        direction: "debit",
      });

      const existingRefund = await WalletTransaction.findOne({
        userId: booking.userId,
        bookingId: booking._id,
        type: "booking_refund",
        direction: "credit",
      });

      if (existingDebit && !existingRefund) {
        refundAmount = calculateRefundAmount(booking);

        if (refundAmount > 0) {
          await createWalletTransaction({
            userId: booking.userId,
            type: "booking_refund",
            direction: "credit",
            amount: refundAmount,
            description: `Refund for cancelled booking - ${
              booking.roomId?.name || "workspace"
            }`,
            bookingId: booking._id,
            actorId: req.user._id,
            source: "booking",
            reason:
              refundAmount === booking.amount
                ? "Full refund - cancelled at least 2 hours before booking"
                : "Partial refund - cancelled less than 2 hours before booking",
          });
        }
      }
    }

    if (isAdmin && String(booking.userId) !== String(req.user._id)) {
      await createNotification({
        recipientId: booking.userId,
        actorId: req.user._id,
        title: "Booking Cancelled",
        message:
          refundAmount > 0
            ? `Your booking was cancelled by admin. ₹${refundAmount} has been refunded to your wallet.`
            : `Your booking was cancelled by admin. Reason: ${
                booking.cancellationReason || "Not specified"
              }`,
        type: "booking_cancelled",
        bookingId: booking._id,
      });
    }

    if (!isAdmin) {
      await notifyAdmins({
        actorId: req.user._id,
        title: "Booking Cancelled by Member",
        message: `${req.user.name} cancelled a booking.`,
        type: "booking_cancelled",
        bookingId: booking._id,
      });
    }

    const populatedBooking = await populateBooking(booking._id);
    const balance = await getWalletBalance(booking.userId);

    return res.status(200).json({
      success: true,
      message:
        refundAmount > 0
          ? `Booking cancelled successfully. ₹${refundAmount} refunded.`
          : "Booking cancelled successfully.",
      refundAmount,
      balance,
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