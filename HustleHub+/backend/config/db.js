
const mongoose = require("mongoose");
const dns = require("dns");

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

        console.log("Attempting MongoDB connection...");

        const connection = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000
        });

        console.log(
            `MongoDB connected: ${connection.connection.host}`
        );

        console.log(
            `Database name: ${connection.connection.name}`
        );

        return connection;

    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        throw error;
    }
};

module.exports = connectDB;
