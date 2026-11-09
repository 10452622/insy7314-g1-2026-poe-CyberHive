const mongoose = require("mongoose");
const dns = require("dns");
const logger = require("../utils/logger");

// DNS configuration
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error(
                "MONGO_URI is missing from the environment variables."
            );
        }

        logger.info("Attempting MongoDB connection...");

        const connection = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000
        });

        logger.info(
            `MongoDB connected: ${connection.connection.host}`
        );

        logger.info(
            `Database name: ${connection.connection.name}`
        );

        return connection;

    } catch (error) {
        logger.error("MongoDB connection failed", {
            message: error.message
        });

        throw error;
    }
};

module.exports = connectDB;
