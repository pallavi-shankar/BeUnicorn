import Building from "../models/Building.js";
import Floor from "../models/Floor.js";
import Room from "../models/Room.js";

const cleanArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

/* =========================
   BUILDINGS
========================= */

export const createBuilding = async (req, res) => {
  try {
    const { name, code, address, city, state, country } = req.body;

    if (!name || !code || !address) {
      return res.status(400).json({
        success: false,
        message: "Building name, code and address are required.",
      });
    }

    const existingBuilding = await Building.findOne({
      code: code.toUpperCase().trim(),
    });

    if (existingBuilding) {
      return res.status(409).json({
        success: false,
        message: "Building code already exists.",
      });
    }

    const building = await Building.create({
      name,
      code,
      address,
      city,
      state,
      country,
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Building created successfully.",
      building,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create building.",
      error: error.message,
    });
  }
};

export const getBuildings = async (req, res) => {
  try {
    const buildings = await Building.find({ isActive: true }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: buildings.length,
      buildings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch buildings.",
      error: error.message,
    });
  }
};

export const updateBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found.",
      });
    }

    const allowedFields = ["name", "address", "city", "state", "country", "isActive"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        building[field] = req.body[field];
      }
    });

    await building.save();

    return res.status(200).json({
      success: true,
      message: "Building updated successfully.",
      building,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update building.",
      error: error.message,
    });
  }
};

/* =========================
   FLOORS
========================= */

export const createFloor = async (req, res) => {
  try {
    const { buildingId, name, floorNumber, description } = req.body;

    if (!buildingId || !name || floorNumber === undefined) {
      return res.status(400).json({
        success: false,
        message: "Building, floor name and floor number are required.",
      });
    }

    const building = await Building.findById(buildingId);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found.",
      });
    }

    const floor = await Floor.create({
      buildingId,
      name,
      floorNumber,
      description,
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Floor created successfully.",
      floor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create floor.",
      error: error.message,
    });
  }
};

export const getFloors = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.buildingId) {
      filter.buildingId = req.query.buildingId;
    }

    const floors = await Floor.find(filter)
      .populate("buildingId", "name code address")
      .sort({ floorNumber: 1 });

    return res.status(200).json({
      success: true,
      count: floors.length,
      floors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch floors.",
      error: error.message,
    });
  }
};

export const updateFloor = async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found.",
      });
    }

    const allowedFields = ["name", "floorNumber", "description", "isActive"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        floor[field] = req.body[field];
      }
    });

    await floor.save();

    return res.status(200).json({
      success: true,
      message: "Floor updated successfully.",
      floor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update floor.",
      error: error.message,
    });
  }
};

/* =========================
   ROOMS
========================= */

export const createRoom = async (req, res) => {
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

    if (!buildingId || !floorId || !name || !roomCode || !type || !capacity || pricePerHour === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Building, floor, room name, room code, type, capacity and price are required.",
      });
    }

    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found.",
      });
    }

    const floor = await Floor.findById(floorId);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found.",
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

    const room = await Room.create({
      buildingId,
      floorId,
      name,
      roomCode,
      type,
      capacity,
      pricePerHour,
      amenities: cleanArray(amenities),
      description,
      imageUrl,
      googleCalendarResourceId,
      availabilityStatus: availabilityStatus || "available",
      createdBy: req.user?._id,
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("buildingId", "name code address")
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

export const getRooms = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.buildingId) filter.buildingId = req.query.buildingId;
    if (req.query.floorId) filter.floorId = req.query.floorId;
    if (req.query.availabilityStatus) {
      filter.availabilityStatus = req.query.availabilityStatus;
    }

    const rooms = await Room.find(filter)
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

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("buildingId", "name code address city state")
      .populate("floorId", "name floorNumber");

    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch room.",
      error: error.message,
    });
  }
};

export const updateRoom = async (req, res) => {
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
      room.amenities = cleanArray(req.body.amenities);
    }

    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate("buildingId", "name code address")
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

export const deleteRoom = async (req, res) => {
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