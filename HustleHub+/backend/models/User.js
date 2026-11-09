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

        // JWT token version
        tokenVersion: {
            type: Number,
            default: 0
        },

        // ==========================================
        // AUTHENTICATOR-APP TWO-FACTOR AUTHENTICATION
        // ==========================================

        twoFactorEnabled: {
            type: Boolean,
            default: false
        },

        // Encrypted active authenticator secret
        twoFactorSecretEncrypted: {
            type: String,
            select: false
        },

        // Encrypted temporary secret during setup
        twoFactorPendingSecretEncrypted: {
            type: String,
            select: false
        },

        // Hashed one-time recovery codes
        twoFactorRecoveryCodes: {
            type: [String],
            default: [],
            select: false
        },

        // Failed authenticator verification attempts
        twoFactorAttempts: {
            type: Number,
            default: 0,
            select: false
        },

        // Prevents reuse of an already accepted TOTP time-step
        twoFactorLastUsedStep: {
            type: Number,
            default: -1,
            select: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);