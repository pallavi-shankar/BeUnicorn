import express from "express";
import {
  createBuilding,
  createFloor,
  createRoom,
  deleteRoom,
  getBuildings,
  getFloors,
  getRoomById,
  getRooms,
  updateBuilding,
  updateFloor,
  updateRoom,
} from "../controllers/workspace.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/buildings", getBuildings);
router.get("/floors", getFloors);
router.get("/rooms", getRooms);
router.get("/rooms/:id", getRoomById);

router.post(
  "/buildings",
  protect,
  allowRoles("admin", "cabin_admin"),
  createBuilding
);

router.patch(
  "/buildings/:id",
  protect,
  allowRoles("admin", "cabin_admin"),
  updateBuilding
);

router.post(
  "/floors",
  protect,
  allowRoles("admin", "cabin_admin"),
  createFloor
);

router.patch(
  "/floors/:id",
  protect,
  allowRoles("admin", "cabin_admin"),
  updateFloor
);

router.post(
  "/rooms",
  protect,
  allowRoles("admin", "cabin_admin"),
  createRoom
);

router.patch(
  "/rooms/:id",
  protect,
  allowRoles("admin", "cabin_admin"),
  updateRoom
);

router.delete(
  "/rooms/:id",
  protect,
  allowRoles("admin", "cabin_admin"),
  deleteRoom
);

export default router;