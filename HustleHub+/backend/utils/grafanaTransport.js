
const Transport = require("winston-transport");

class GrafanaTransport extends Transport {
    constructor(options = {}) {
        super(options);

        this.url = process.env.GRAFANA_OTLP_LOGS_URL;
        this.instanceId = process.env.GRAFANA_INSTANCE_ID;
        this.apiKey = process.env.GRAFANA_API_KEY;
        this.serviceName = process.env.APP_NAME || "HustleHubPlus";

        this.enabled = Boolean(
            this.url && this.instanceId && this.apiKey
        );
    }

    log(info, callback) {
        setImmediate(() => this.emit("logged", info));

        const done = typeof callback === "function"
            ? callback
            : () => {};

        if (!this.enabled) {
            done();
            return;
        }

        const authPair = `${this.instanceId}:${this.apiKey}`;
        const encoded = Buffer.from(authPair).toString("base64");

        const { level, message, ...metadata } = info;

        const severity = {
            error: 17,
            warn: 13,
            info: 9,
            http: 9,
            verbose: 7,
            debug: 5,
            silly: 1
        };

        const body = {
            resourceLogs: [{
                resource: {
                    attributes: [
                        {
                            key: "service.name",
                            value: {
                                stringValue: this.serviceName
                            }
                        }
                    ]
                },
                scopeLogs: [{
                    logRecords: [{
                        timeUnixNano: (
                            BigInt(Date.now()) * 1000000n
                        ).toString(),
                        severityNumber: severity[level] || 9,
                        severityText: String(level).toUpperCase(),
                        body: {
                            stringValue: JSON.stringify({
                                message,
                                ...metadata
                            })
                        }
                    }]
                }]
            }]
        };

        fetch(this.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${encoded}`
            },
            body: JSON.stringify(body)
        })
        .then(async response => {
            if (!response.ok) {
                const responseBody = await response.text();

                process.stderr.write(
                    `Grafana logging failed: HTTP ${response.status} - ${responseBody}\n`
                );
            }
        })
        .catch(error => {
            process.stderr.write(
                `Grafana logging error: ${error.message}\n`
            );
        })
        .finally(done);
    }
}

module.exports = GrafanaTransport;

/*Reference List:
The Independent Institute of Education (IIE), 2026. Information Systems 3D [INSY7314 Module Manual]. The Independent Institute of
Education: Unpublished.
*/