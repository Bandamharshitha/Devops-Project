const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

console.log("Current directory:", __dirname);
console.log("Looking for .env at:", path.resolve(__dirname, "../.env"));
console.log("Loaded MONGODB_URI:", process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env file");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err.message));
