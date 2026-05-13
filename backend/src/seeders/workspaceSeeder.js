import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Building from "../models/Building.js";
import Floor from "../models/Floor.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

dotenv.config();

const seedWorkspace = async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ email: "admin@beunicorn.com" });

    if (!admin) {
      throw new Error("Admin account not found. Run npm run seed:admin first.");
    }

    let building = await Building.findOne({ code: "BUGE" });

    if (!building) {
      building = await Building.create({
        name: "BeUnicorn Golden Enclave",
        code: "BUGE",
        address: "Jayanagar, Bengaluru",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        createdBy: admin._id,
      });

      console.log("Building created.");
    } else {
      console.log("Building already exists.");
    }

    let floor = await Floor.findOne({
      buildingId: building._id,
      floorNumber: 1,
    });

    if (!floor) {
      floor = await Floor.create({
        buildingId: building._id,
        name: "First Floor",
        floorNumber: 1,
        description: "Main coworking and meeting area",
        createdBy: admin._id,
      });

      console.log("Floor created.");
    } else {
      console.log("Floor already exists.");
    }

    const rooms = [
      {
        name: "Meeting Room",
        roomCode: "MR-001",
        type: "meeting_room",
        capacity: 6,
        pricePerHour: 1200,
        amenities: ["WiFi", "TV Display", "Whiteboard", "AC"],
        description: "Premium meeting room for client meetings and team discussions.",
        imageUrl:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200",
      },
      {
        name: "Conference Room",
        roomCode: "CR-001",
        type: "conference_room",
        capacity: 15,
        pricePerHour: 2500,
        amenities: ["WiFi", "Projector", "Conference Table", "Video Call Setup"],
        description: "Large conference space for presentations and workshops.",
        imageUrl:
          "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200",
      },
      {
        name: "Creator Studio",
        roomCode: "CS-001",
        type: "creator_studio",
        capacity: 4,
        pricePerHour: 3500,
        amenities: ["Lighting", "Sound Setup", "Backdrop", "AC"],
        description: "Studio space for podcasts, videos and creative shoots.",
        imageUrl:
          "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1200",
      },
      {
        name: "Event Space",
        roomCode: "ES-001",
        type: "event_space",
        capacity: 50,
        pricePerHour: 8000,
        amenities: ["Stage", "Projector", "Sound System", "Flexible Seating"],
        description: "Premium event area for networking and community events.",
        imageUrl:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200",
      },
      {
        name: "Hot Desk Zone",
        roomCode: "HD-001",
        type: "hot_desk",
        capacity: 20,
        pricePerHour: 300,
        amenities: ["WiFi", "Power Outlet", "Shared Desk", "AC"],
        description: "Flexible hot desk seating for individuals and guests.",
        imageUrl:
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200",
      },
    ];

    for (const roomData of rooms) {
      const existingRoom = await Room.findOne({ roomCode: roomData.roomCode });

      if (!existingRoom) {
        await Room.create({
          ...roomData,
          buildingId: building._id,
          floorId: floor._id,
          googleCalendarResourceId: "",
          availabilityStatus: "available",
          createdBy: admin._id,
        });

        console.log(`${roomData.name} created.`);
      } else {
        console.log(`${roomData.name} already exists.`);
      }
    }

    console.log("Workspace seeding completed.");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Workspace seeding failed:", error.message);
    process.exit(1);
  }
};

seedWorkspace();