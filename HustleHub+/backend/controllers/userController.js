
const User = require("../models/User");
const bcrypt = require("bcrypt");

const {
    encryptSecret,
    decryptSecret,
    generateAuthenticatorSetup,
    verifyAuthenticatorCode,
    generateRecoveryCodes,
    hashRecoveryCode
} = require("../utils/totpSecurity");

const MAX_2FA_SETUP_ATTEMPTS = 5;

const SAFE_USER_FIELDS =
    "-password -resetPasswordToken -resetPasswordExpires " +
    "-twoFactorSecretEncrypted -twoFactorPendingSecretEncrypted " +
    "-twoFactorRecoveryCodes -twoFactorAttempts -twoFactorLastUsedStep";


// GET /api/users/me
const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select(
            SAFE_USER_FIELDS
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User profile not found."
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        next(error);
    }
};


// PATCH /api/users/me
const updateMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const {
            firstName,
            lastName,
            username,
            professionalTitle,
            location,
            bio,
            skills,
            website,
            linkedin,
            github
        } = req.body;

        const updates = {};

        // Only allow these fields to be updated.
        if (firstName !== undefined) {
            updates.firstName = String(firstName).trim();
        }

        if (lastName !== undefined) {
            updates.lastName = String(lastName).trim();
        }

        if (username !== undefined) {
            updates.username = String(username).trim();
        }

        if (professionalTitle !== undefined) {
            updates.professionalTitle =
                String(professionalTitle).trim();
        }

        if (location !== undefined) {
            updates.location = String(location).trim();
        }

        if (bio !== undefined) {
            updates.bio = String(bio).trim();
        }

        if (website !== undefined) {
            updates.website = String(website).trim();
        }

        if (linkedin !== undefined) {
            updates.linkedin = String(linkedin).trim();
        }

        if (github !== undefined) {
            updates.github = String(github).trim();
        }

        if (skills !== undefined) {
            if (
                !Array.isArray(skills) ||
                !skills.every(skill => typeof skill === "string")
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Skills must be provided as a list of text values."
                });
            }

            updates.skills = [
                ...new Set(
                    skills
                        .map(skill => skill.trim())
                        .filter(Boolean)
                )
            ];
        }

        if (
            updates.firstName !== undefined &&
            !updates.firstName
        ) {
            return res.status(400).json({
                success: false,
                message: "First name is required."
            });
        }

        if (
            updates.lastName !== undefined &&
            !updates.lastName
        ) {
            return res.status(400).json({
                success: false,
                message: "Last name is required."
            });
        }

        if (
            updates.bio !== undefined &&
            updates.bio.length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Your bio cannot exceed 1000 characters."
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        ).select(SAFE_USER_FIELDS);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User profile not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user
        });

    } catch (error) {
        next(error);
    }
};


// PATCH /api/users/change-password
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const {
            currentPassword,
            newPassword,
            confirmNewPassword
        } = req.body;

        if (
            !currentPassword ||
            !newPassword ||
            !confirmNewPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete all password fields."
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Your new password must contain at least 8 characters."
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Your new passwords do not match."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        const passwordMatches = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Your current password is incorrect."
            });
        }

        const samePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (samePassword) {
            return res.status(400).json({
                success: false,
                message: "Your new password must be different from your current password."
            });
        }

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!passwordPattern.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters, including uppercase, lowercase, a number and a special character."
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);

        // Invalidate existing JWTs.
        user.tokenVersion = (user.tokenVersion || 0) + 1;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully. Please log in again."
        });

    } catch (error) {
        next(error);
    }
};


// POST /api/users/2fa/setup
// Verify the password and create an authenticator QR code.
const setupTwoFactor = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword } = req.body;

        if (!currentPassword) {
            return res.status(400).json({
                success: false,
                message: "Please enter your current password."
            });
        }

        const user = await User.findById(userId).select(
            "+twoFactorPendingSecretEncrypted +twoFactorAttempts"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: "Two-factor authentication is already enabled."
            });
        }

        const passwordMatches = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Your current password is incorrect."
            });
        }

        // Create a new authenticator secret and QR code.
        const setup = await generateAuthenticatorSetup(user.email);

        // Store only the encrypted pending secret.
        user.twoFactorPendingSecretEncrypted = encryptSecret(
            setup.secret
        );

        user.twoFactorAttempts = 0;

        await user.save();

        return res.status(200).json({
            success: true,
            requiresVerification: true,
            qrCodeDataURL: setup.qrCodeDataURL,
            manualKey: setup.manualKey,
            message: "Scan this QR code using your authenticator app, then enter the six-digit code shown in the app."
        });

    } catch (error) {
        console.error("Authenticator setup error:", error);
        next(error);
    }
};


// PATCH /api/users/2fa/enable
// Verify the first authenticator code and activate 2FA.
const enableTwoFactor = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { otp } = req.body;

        if (!/^\d{6}$/.test(String(otp || ""))) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid six-digit authenticator code."
            });
        }

        const user = await User.findById(userId).select(
            "+twoFactorPendingSecretEncrypted +twoFactorAttempts"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: "Two-factor authentication is already enabled."
            });
        }

        if (!user.twoFactorPendingSecretEncrypted) {
            return res.status(400).json({
                success: false,
                message: "Please start authenticator setup again to generate a new QR code."
            });
        }

        if (user.twoFactorAttempts >= MAX_2FA_SETUP_ATTEMPTS) {
            user.twoFactorPendingSecretEncrypted = undefined;
            user.twoFactorAttempts = 0;
            await user.save();

            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Please start the authenticator setup again."
            });
        }

        const pendingSecret = decryptSecret(
            user.twoFactorPendingSecretEncrypted
        );

        const matchedStep = verifyAuthenticatorCode(
            pendingSecret,
            String(otp),
            -1
        );

        if (matchedStep === null) {
            user.twoFactorAttempts += 1;

            const attemptsRemaining = Math.max(
                0,
                MAX_2FA_SETUP_ATTEMPTS - user.twoFactorAttempts
            );

            if (user.twoFactorAttempts >= MAX_2FA_SETUP_ATTEMPTS) {
                user.twoFactorPendingSecretEncrypted = undefined;
                user.twoFactorAttempts = 0;
            }

            await user.save();

            return res.status(400).json({
                success: false,
                message: "The authenticator code is incorrect or expired. Please try the current code in your app.",
                attemptsRemaining
            });
        }

        // Generate recovery codes. Only their hashes are stored.
        const recoveryCodes = generateRecoveryCodes();

        user.twoFactorSecretEncrypted =
            user.twoFactorPendingSecretEncrypted;

        user.twoFactorPendingSecretEncrypted = undefined;

        user.twoFactorRecoveryCodes = recoveryCodes.map(
            code => hashRecoveryCode(code)
        );

        user.twoFactorEnabled = true;
        user.twoFactorAttempts = 0;
        user.twoFactorLastUsedStep = matchedStep;

        await user.save();

        // The plain recovery codes are returned only once.
        return res.status(200).json({
            success: true,
            twoFactorEnabled: true,
            recoveryCodes,
            message: "Authenticator two-factor authentication has been enabled successfully. Save your recovery codes somewhere safe."
        });

    } catch (error) {
        console.error("Authenticator enable error:", error);
        next(error);
    }
};


// PATCH /api/users/2fa/disable
// Verify the current password before disabling 2FA.
const disableTwoFactor = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword } = req.body;

        if (!currentPassword) {
            return res.status(400).json({
                success: false,
                message: "Please enter your current password."
            });
        }

        const user = await User.findById(userId).select(
            "+twoFactorSecretEncrypted +twoFactorPendingSecretEncrypted +twoFactorRecoveryCodes +twoFactorAttempts +twoFactorLastUsedStep"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        if (!user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: "Two-factor authentication is already disabled."
            });
        }

        const passwordMatches = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Your current password is incorrect."
            });
        }

        user.twoFactorEnabled = false;
        user.twoFactorSecretEncrypted = undefined;
        user.twoFactorPendingSecretEncrypted = undefined;
        user.twoFactorRecoveryCodes = [];
        user.twoFactorAttempts = 0;
        user.twoFactorLastUsedStep = -1;

        await user.save();

        return res.status(200).json({
            success: true,
            twoFactorEnabled: false,
            message: "Two-factor authentication has been disabled."
        });

    } catch (error) {
        console.error("Authenticator disable error:", error);
        next(error);
    }
};


module.exports = {
    getMyProfile,
    updateMyProfile,
    changePassword,
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor
};
