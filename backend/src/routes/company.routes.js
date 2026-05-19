import express from "express";
import {
  approveCompanyMember,
  createCompany,
  createCompanyInvite,
  getCompanies,
  getCompanyInvites,
  getInviteByToken,
  rejectCompanyMember,
  updateCompany,
} from "../controllers/company.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/invite/:token", getInviteByToken);

router.use(protect);

router.get("/", allowRoles("admin", "cabin_admin"), getCompanies);
router.post("/", allowRoles("admin", "cabin_admin"), createCompany);
router.patch("/:id", allowRoles("admin", "cabin_admin"), updateCompany);

router.get("/invites/all", allowRoles("admin", "cabin_admin"), getCompanyInvites);
router.post("/invites", allowRoles("admin", "cabin_admin"), createCompanyInvite);

router.post(
  "/members/approve",
  allowRoles("admin", "cabin_admin"),
  approveCompanyMember
);

router.post(
  "/members/reject",
  allowRoles("admin", "cabin_admin"),
  rejectCompanyMember
);

export default router;