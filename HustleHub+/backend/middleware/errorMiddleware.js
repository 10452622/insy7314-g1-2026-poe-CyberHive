const logger = require("../utils/logger");

//Error handling 
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: "The requested endpoint was not found."
    });
};//(IIE, 2026)

const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = res.statusCode >= 400
        ? res.statusCode
        : 500;

    logger.error("Unhandled API error", {
        message: err.message,
        stack: process.env.NODE_ENV === "production"
            ? undefined
            : err.stack,
        method: req.method,
        path: req.originalUrl,
        statusCode
    });

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500
            ? "An internal server error occurred."
            : err.message
    });
};

module.exports = {
    notFound,
    errorHandler
}; //(IIE, 2026)

/*Reference List
1. The Independent Institute of Education (IIE), 2026. Information Systems 3D [INSY7314 Module Manual]. The Independent Institute of 
  Education: Unpublished.
*/ 