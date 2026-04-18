require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// 1. Initialize Express
const app = express();
const server = http.createServer(app);

// 2. Set up WebSockets (The "Canva" real-time magic)
const io = new Server(server, {
  cors: { origin: "*" }, // Allows your React app to connect
});

// Middleware
app.use(express.json());
app.use(cors());

// 3. Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected!"))
  .catch((err) => console.log("Database Error:", err));

// 4. Basic Test Route
app.get("/api/health", (req, res) => {
  res.json({ message: "SHELFLIFE Server is alive!" });
});

// 5. Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
