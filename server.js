require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Allow requests from the frontend only (no trailing slash in CLIENT_URL)
const clientUrl = (process.env.CLIENT_URL || "").replace(/\/$/, "");
app.use(cors({ origin: clientUrl || "*" }));
app.use(express.json());

// Health check (also handy to confirm the Vercel deployment works)
app.get("/", (req, res) => {
  res.json({ message: "Auth API is running" });
});

// Make sure MongoDB is connected before any API route runs
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({ message: "Could not connect to the database." });
  }
});

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Locally we start a server. On Vercel the exported app is used instead.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
