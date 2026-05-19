import express from "express";
import {
  adminAdjustWallet,
  getAllWalletTransactionsByAdmin,
  getMyWallet,
  getUserWalletByAdmin,
} from "../controllers/wallet.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/my", protect, getMyWallet);

router.get(
  "/admin/transactions",
  protect,
  allowRoles("admin", "cabin_admin"),
  getAllWalletTransactionsByAdmin
);

router.get(
  "/admin/user/:userId",
  protect,
  allowRoles("admin", "cabin_admin"),
  getUserWalletByAdmin
);

router.post(
  "/admin/adjust",
  protect,
  allowRoles("admin", "cabin_admin"),
  adminAdjustWallet
);

export default router;