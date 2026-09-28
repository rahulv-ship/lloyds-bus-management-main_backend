const express = require("express");
const cors = require("cors");
require("dotenv").config();


const { sequelize, connectDatabase } = require("./config/database");
require("./models");
const authRoutes = require("./routes/authRoutes");
const app = express();
const busPassRoutes =
  require("./routes/busPassRoutes");
const masterRoutes =
  require("./routes/masterRoutes");
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// =========================
// Middleware
// =========================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use(
  "/api/bus-pass",
  busPassRoutes
);
app.use(
  "/api/master",
  masterRoutes
);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
// =========================
// Test Routes
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lloyds Employee Bus Management API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date(),
  });
});

// =========================
// Start Server
// =========================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();

await sequelize.sync();

console.log("✅ Database tables synchronized");

    app.listen(PORT, () => {
      console.log("========================================");
      console.log("🚍 Lloyds Bus Management API");
      console.log(`🚀 Server running: http://localhost:${PORT}`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
      console.log("========================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error);
    process.exit(1);
  }
};

startServer();
