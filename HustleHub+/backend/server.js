
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");

// Load environment variables first
dotenv.config({
    path: path.join(__dirname, ".env")
});

// Import database connection
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const gigRoutes = require("./routes/gigRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const messageRoutes = require("./routes/messageRoutes");

const {
    notFound,
    errorHandler
} = require("./middleware/errorMiddleware");

const app = express();

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Allow requests from React frontend
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));

// Basic test route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the HustleHub+ API"
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// SSL certificate configuration
const sslOptions = {
    key: fs.readFileSync(
        path.join(__dirname, "certs", "server.key")
    ),
    cert: fs.readFileSync(
        path.join(__dirname, "certs", "server.crt")
    )
};

// Start server only after MongoDB connects
const startServer = async () => {
    try {
        console.log("Connecting to MongoDB...");

        await connectDB();

        console.log("Database connection established.");

        https.createServer(sslOptions, app).listen(PORT, () => {
            console.log(
                `HustleHub+ API running at https://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error(
            "HustleHub+ startup failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();
