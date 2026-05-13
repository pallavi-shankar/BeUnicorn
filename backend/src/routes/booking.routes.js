import express from "express";
import {
  approveBooking,
  cancelBooking,
  createBooking,
  getAllBookings,
  getBookingById,
  getMyBookings,
  rejectBooking,
} from "../controllers/booking.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);

router.get(
  "/all",
  protect,
  allowRoles("admin", "cabin_admin"),
  getAllBookings
);

router.get("/:id", protect, getBookingById);

router.patch(
  "/:id/approve",
  protect,
  allowRoles("admin", "cabin_admin"),
  approveBooking
);

router.patch(
  "/:id/reject",
  protect,
  allowRoles("admin", "cabin_admin"),
  rejectBooking
);

router.patch("/:id/cancel", protect, cancelBooking);

export default router;