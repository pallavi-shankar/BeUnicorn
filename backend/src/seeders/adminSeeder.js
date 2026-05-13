import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@beunicorn.com";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.name = "BeUnicorn Admin";
      existingAdmin.phone = "9999999999";
      existingAdmin.role = "admin";
      existingAdmin.companyName = "BeUnicorn";
      existingAdmin.status = "active";
      existingAdmin.isEmailVerified = true;
      existingAdmin.isPhoneVerified = true;
      existingAdmin.password = "BeUnicorn123!";

      await existingAdmin.save();

      console.log("Admin account updated successfully.");
    } else {
      await User.create({
        name: "BeUnicorn Admin",
        email: adminEmail,
        phone: "9999999999",
        password: "BeUnicorn123!",
        role: "admin",
        companyName: "BeUnicorn",
        status: "active",
        isEmailVerified: true,
        isPhoneVerified: true,
      });

      console.log("Admin account created successfully.");
    }

    console.log("Email: admin@beunicorn.com");
    console.log("Password: BeUnicorn123!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();