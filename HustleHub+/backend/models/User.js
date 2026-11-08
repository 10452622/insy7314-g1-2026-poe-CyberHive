
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true
        },

        firstName: {
            type: String,
            trim: true,
            default: ""
        },

        lastName: {
            type: String,
            trim: true,
            default: ""
        },

        username: {
            type: String,
            trim: true,
            default: ""
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["Client", "Freelancer"],
            required: true
        },

        // Freelancer profile fields
        professionalTitle: {
            type: String,
            trim: true,
            default: ""
        },

        location: {
            type: String,
            trim: true,
            default: ""
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        skills: {
            type: [String],
            default: []
        },

        website: {
            type: String,
            trim: true,
            default: ""
        },

        linkedin: {
            type: String,
            trim: true,
            default: ""
        },

        github: {
            type: String,
            trim: true,
            default: ""
        },

        // Password reset fields
        resetPasswordToken: String,
        resetPasswordExpires: Number,

        // JWT token version for invalidating existing sessions
        tokenVersion: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
