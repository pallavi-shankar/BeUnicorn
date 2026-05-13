import express from "express";
import {
  createAdminRoom,
  disableAdminRoom,
  getAdminBookings,
  getAdminRooms,
  getAdminStats,
  getAdminUsers,
  updateAdminRoom,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin", "cabin_admin"));

router.get("/stats", getAdminStats);

router.get("/users", getAdminUsers);
router.patch("/users/:id", updateUserStatus);

router.get("/rooms", getAdminRooms);
router.post("/rooms", createAdminRoom);
router.patch("/rooms/:id", updateAdminRoom);
router.delete("/rooms/:id", disableAdminRoom);

router.get("/bookings", getAdminBookings);

export default router;