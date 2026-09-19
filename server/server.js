// Load environment variables from a .env file into process.env
require("dotenv").config();

const dns = require("dns");
// Windows/campus DNS often blocks Node's SRV lookups for mongodb+srv:// URIs
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const patientRoutes = require('./routes/patient');
const doctorRoutes = require('./routes/doctor');
const appointmentRoutes = require('./routes/appointment');
const paymentRoutes = require('./routes/payment');

// Create the Express application instance
const app = express();

// Enable CORS so the frontend (on a different origin) can call this API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payment', paymentRoutes);

const authMiddleware = require('./middleware/authMiddleware');

// Connect to MongoDB using the URI from environment variables
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hospital";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check route — confirms the server is running
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start the server on the configured port (defaults to 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
