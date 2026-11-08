const express = require("express");
const router = express.Router();

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    getMyProfile,
    updateMyProfile,
    changePassword
} = require("../controllers/userController");

// Profile routes
router.get("/profile", authenticateToken, getMyProfile);
router.get("/me", authenticateToken, getMyProfile);
router.patch("/me", authenticateToken, updateMyProfile);

// Password route
router.patch(
    "/change-password",
    authenticateToken,
    changePassword
);

module.exports = router;