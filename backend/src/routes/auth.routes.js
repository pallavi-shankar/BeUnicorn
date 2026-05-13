import express from "express";
import {
  getMyProfile,
  loginUser,
  registerUser,
  updateMyProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);

export default router;