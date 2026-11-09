const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables first
dotenv.config({
    path: path.join(__dirname, ".env")
});

// Import remaining dependencies
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./utils/logger");
const requestLogger = require("./middleware/requestLogger");

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
app.use(requestLogger);

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
// Start server only after MongoDB connects
const startServer = async () => {
    try {
        logger.info("Connecting to MongoDB...");

        await connectDB();

        logger.info("Database connection established.");

        https.createServer(sslOptions, app).listen(PORT, () => {
            logger.info(
                `HustleHub+ API running at https://localhost:${PORT}`
            );
        });

    } catch (error) {
        logger.error("HustleHub+ startup failed", {
            message: error.message
        });

        process.exit(1);
    }
};

startServer();
