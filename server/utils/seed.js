const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
require("dotenv").config();

(async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ email: "admin@cavaluer.com" });
    if (existing) {
      console.log("ℹ️ Admin user already exists: admin@cavaluer.com");
      process.exit(0);
    }

    await User.create({
      name: "Admin",
      email: "admin@cavaluer.com",
      password: "admin123",
      role: "admin",
    });

    console.log("✅ Admin user created");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
})();
