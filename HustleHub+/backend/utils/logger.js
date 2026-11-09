
const winston = require("winston");
const GrafanaTransport = require("./grafanaTransport");

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",

    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),

    transports: [
        // Existing terminal logging
        new winston.transports.Console(),

        // Grafana Cloud logging
        new GrafanaTransport()
    ]
});

module.exports = logger;

/*Reference List:
The Independent Institute of Education (IIE), 2026. Information Systems 3D [INSY7314 Module Manual]. The Independent Institute of
Education: Unpublished.
*/