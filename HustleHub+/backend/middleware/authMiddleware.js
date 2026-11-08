const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT Authentication
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; //(GeeksForGeeks, 2026)

        // Input validation
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required."
            });
        } //(IIE, 2026)

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Check whether the user still exists
        const user = await User.findById(decoded.id).select(
            "tokenVersion"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account could not be found."
            });
        }

        // Check whether the token has been invalidated
        // Older tokens without tokenVersion are treated as version 0.
        const tokenVersion = decoded.tokenVersion ?? 0;
        const currentTokenVersion = user.tokenVersion ?? 0;

        if (tokenVersion !== currentTokenVersion) {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again."
            });
        }

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        }); //(IIE, 2026)
    }
};

module.exports = {
    authenticateToken
};

/*Reference List
1. The Independent Institute of Education (IIE), 2026. Information Systems 3D [INSY7314 Module Manual]. The Independent Institute of
  Education: Unpublished.

2. GeeksForGeeks, 2026. JWT Authentication In Node.js. [online]
  Available at: <https://www.geeksforgeeks.org/node-js/jwt-authentication-with-node-js/>
  [Accessed 02 September 2026].
*/
