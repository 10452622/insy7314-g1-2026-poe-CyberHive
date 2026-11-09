const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");

// Load environment variables before importing application modules.
dotenv.config({
    path: path.join(__dirname, ".env")
});

const connectDB = require("./config/db");

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
const PORT = Number(process.env.PORT || 5000);

// Security and request handling (IIE, 2026).
app.use(helmet());
// Allow requests from the React frontend (Ibrahim, 2024)
app.use(cors());
app.use(express.json({ limit: "10kb" }));

//Basic test route (IIE, 2026)
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the HustleHub+ API"
    });
});

// Application routes.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);

// Error handling must follow the application routes.
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        if (
            !process.env.JWT_SECRET ||
            process.env.JWT_SECRET.length < 32
        ) {
            throw new Error(
                "JWT_SECRET must contain at least 32 characters."
            );
        }

        if (
            !/^[a-fA-F0-9]{64}$/.test(
                process.env.TOTP_ENCRYPTION_KEY || ""
            )
        ) {
            throw new Error(
                "TOTP_ENCRYPTION_KEY must contain exactly 64 hexadecimal characters."
            );
        }

        // Docker and CI explicitly set USE_HTTPS=false.
        const useHttps = process.env.USE_HTTPS !== "false";

        let sslOptions;

        // Only read certificate files when HTTPS is enabled.
        if (useHttps) {
            const keyPath = path.join(
                __dirname,
                "certs",
                "server.key"
            );

            const certPath = path.join(
                __dirname,
                "certs",
                "server.crt"
            );

            if (
                !fs.existsSync(keyPath) ||
                !fs.existsSync(certPath)
            ) {
                throw new Error(
                    "HTTPS certificates are missing. Provide certs/server.key and certs/server.crt, or set USE_HTTPS=false for local HTTP."
                );
            }

            sslOptions = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath)
            };
        }

        console.log("Connecting to MongoDB...");
        await connectDB();
        console.log("Database connection established.");

        //Create the HTTP or HTTPS server (IIE, 2026)
        const server = useHttps
            ? https.createServer(sslOptions, app)
            : require("http").createServer(app);

        server.on("error", (error) => {
            console.error(
                "HTTP server failed:",
                error.message
            );
            process.exit(1);
        });

        server.listen(PORT, "0.0.0.0", () => {
            const protocol = useHttps ? "https" : "http";

            console.log(
                `HustleHub+ API running on ${protocol} port ${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Backend startup failed:",
            error.message
        );
        process.exit(1);
    }
};

startServer();

/*Reference List
- The Independent Institute of Education (IIE), 2026. Information Systems 3D [INSY7314 Module Manual]. The Independent Institute of
  Education: Unpublished.
- Ibrahim, M., 2024. What is Cross Origin Resource Sharing (CORS)?. Super Tokens blog, [blog] 06 July. Available at:
  <https://supertokens.com/blog/what-is-cross-origin-resource-sharing> [Accessed 02 September 2026].
*/
