
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const {
    decryptSecret,
    verifyAuthenticatorCode,
    verifyRecoveryCode
} = require("../utils/totpSecurity");

const MAX_2FA_ATTEMPTS = 5;

// Create the normal login JWT
const createAuthToken = (user) => {
    const firstName =
        user.firstName ||
        user.username ||
        user.email.split("@")[0] ||
        "User";

    const lastName = user.lastName || "";

    const token = jwt.sign(
        {
            id: user._id,
            firstName,
            lastName,
            role: user.role,
            tokenVersion: user.tokenVersion || 0
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1h"
        }
    );

    return {
        token,
        user: {
            id: user._id,
            firstName,
            lastName,
            email: user.email,
            role: user.role
        }
    };
};

// Create a short-lived token used only for the second login step
const createLoginChallenge = (user) => {
    return jwt.sign(
        {
            id: user._id,
            purpose: "login-2fa",
            tokenVersion: user.tokenVersion || 0
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "5m"
        }
    );
};


// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            role
        } = req.body;

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "A user with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            _id: crypto.randomUUID(),
            firstName,
            lastName,
            email: normalizedEmail,
            password: passwordHash,
            role
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        next(error);
    }
};


// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        }).select("+twoFactorAttempts");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // If authenticator 2FA is enabled, require a second login step.
        if (user.twoFactorEnabled === true) {
            // Start a fresh attempt counter for this login challenge.
            user.twoFactorAttempts = 0;
            await user.save();

            const challengeToken = createLoginChallenge(user);

            return res.status(200).json({
                success: true,
                requiresTwoFactor: true,
                challengeToken,
                message: "Open your authenticator app and enter your six-digit verification code."
            });
        }

        // Users without 2FA continue with normal login.
        const auth = createAuthToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token: auth.token,
            user: auth.user
        });

    } catch (error) {
        next(error);
    }
};


// POST /api/auth/verify-totp
// Verify an authenticator code or a one-time recovery code.
const verifyLoginTOTP = async (req, res, next) => {
    try {
        const {
            challengeToken,
            token,
            recoveryCode
        } = req.body;

        if (!challengeToken || (!token && !recoveryCode)) {
            return res.status(400).json({
                success: false,
                message: "Your login session and authenticator or recovery code are required."
            });
        }

        if (token && !/^\d{6}$/.test(String(token))) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid six-digit authenticator code."
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                challengeToken,
                process.env.JWT_SECRET
            );
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Your verification session has expired. Please log in again."
            });
        }

        if (decoded.purpose !== "login-2fa") {
            return res.status(401).json({
                success: false,
                message: "Invalid verification session."
            });
        }

        const user = await User.findById(decoded.id).select(
            "+twoFactorSecretEncrypted +twoFactorRecoveryCodes +twoFactorAttempts +twoFactorLastUsedStep"
        );

        if (!user || user.twoFactorEnabled !== true) {
            return res.status(401).json({
                success: false,
                message: "Unable to verify this login."
            });
        }

        // Reject a challenge created before a password change or token reset.
        if (
            Number(decoded.tokenVersion || 0) !==
            Number(user.tokenVersion || 0)
        ) {
            return res.status(401).json({
                success: false,
                message: "Your login session is no longer valid. Please log in again."
            });
        }

        if (user.twoFactorAttempts >= MAX_2FA_ATTEMPTS) {
            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Please log in again to start a new verification session."
            });
        }

        let verificationSuccessful = false;

        // Recovery codes can each be used only once.
        if (recoveryCode) {
            const recoveryCodeIndex = verifyRecoveryCode(
                recoveryCode,
                user.twoFactorRecoveryCodes || []
            );

            if (recoveryCodeIndex !== -1) {
                user.twoFactorRecoveryCodes.splice(
                    recoveryCodeIndex,
                    1
                );

                verificationSuccessful = true;
            }
        } else {
            // Verify the six-digit code from the authenticator app.
            const secret = decryptSecret(
                user.twoFactorSecretEncrypted
            );

            const matchedStep = verifyAuthenticatorCode(
                secret,
                String(token),
                user.twoFactorLastUsedStep ?? -1
            );

            if (matchedStep !== null) {
                user.twoFactorLastUsedStep = matchedStep;
                verificationSuccessful = true;
            }
        }

        if (!verificationSuccessful) {
            user.twoFactorAttempts += 1;
            await user.save();

            const attemptsRemaining = Math.max(
                0,
                MAX_2FA_ATTEMPTS - user.twoFactorAttempts
            );

            return res.status(400).json({
                success: false,
                message: recoveryCode
                    ? "Invalid or already-used recovery code."
                    : "Incorrect or expired authenticator code.",
                attemptsRemaining
            });
        }

        user.twoFactorAttempts = 0;
        await user.save();

        const auth = createAuthToken(user);

        return res.status(200).json({
            success: true,
            message: "Two-factor verification successful.",
            token: auth.token,
            user: auth.user
        });

    } catch (error) {
        next(error);
    }
};


// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        /*
            Always returns the same response whether the email exists or not.
            This prevents account enumeration.
        */
        if (user) {
            const resetToken = crypto
                .randomBytes(32)
                .toString("hex");

            const resetTokenHash = crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");

            user.resetPasswordToken = resetTokenHash;

            user.resetPasswordExpires =
                Date.now() + (15 * 60 * 1000);

            await user.save();

            if (process.env.NODE_ENV !== "production") {
                console.log(
                    `[DEV] Password reset token for ${user.email}: ${resetToken}`
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "If an account exists for this email, a password reset link has been sent."
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    register,
    login,
    forgotPassword,
    verifyLoginTOTP
};


/*Reference List
1. The Independent Institute of Education (IIE), 2026. Information Systems 3D [INSY7314 Module Manual]. The Independent Institute of
  Education: Unpublished.

2. Islam, T., 2019. NodeJS Password Encryption with bcrypt. Medium, [online] 16 December.
  Available at: <https://medium.com/@towfiqu/nodejs-password-encryption-with-bcrypt-8f78d78dc3e8> [Accessed 02 September 2026].

3. GeeksForGeeks, 2026. JWT Authentication In Node.js. [online]
  Available at: <https://www.geeksforgeeks.org/node-js/jwt-authentication-with-node-js/>
  [Accessed 02 September 2026].
*/
