const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const durationMs = Date.now() - start;

        const logData = {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs,
            ip: req.ip,
            userAgent: req.get("user-agent")
        };

        if (res.statusCode >= 500) {
            logger.error("HTTP request failed with server error", logData);
        } else if (res.statusCode >= 400) {
            logger.warn("HTTP request failed with client error", logData);
        } else {
            logger.info("HTTP request completed", logData);
        }
    });

    next();
};

module.exports = requestLogger;

/*Reference List:
The Independent Institute of Education (IIE), 2026. Information Systems 3D [INSY7314 Module Manual]. The Independent Institute of
Education: Unpublished.
*/