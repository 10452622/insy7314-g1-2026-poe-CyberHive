const express = require("express");
const router = express.Router();

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    getMyProfile,
    updateMyProfile,
    changePassword,
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor
} = require("../controllers/userController");

// ==========================================
// PROFILE ROUTES
// ==========================================

router.get(
    "/profile",
    authenticateToken,
    getMyProfile
);

router.get(
    "/me",
    authenticateToken,
    getMyProfile
);

router.patch(
    "/me",
    authenticateToken,
    updateMyProfile
);


// ==========================================
// PASSWORD ROUTE
// ==========================================

router.patch(
    "/change-password",
    authenticateToken,
    changePassword
);


// ==========================================
// AUTHENTICATOR TWO-FACTOR AUTHENTICATION
// ==========================================

// Step 1: Verify password and generate authenticator QR code.
router.post(
    "/2fa/setup",
    authenticateToken,
    setupTwoFactor
);

// Step 2: Verify the first authenticator code and enable 2FA.
router.patch(
    "/2fa/enable",
    authenticateToken,
    enableTwoFactor
);

// Disable 2FA after verifying the current password.
router.patch(
    "/2fa/disable",
    authenticateToken,
    disableTwoFactor
);


module.exports = router;
