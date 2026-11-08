const crypto = require("crypto");
const OTPAuth = require("otpauth");
const QRCode = require("qrcode");

const ALGORITHM = "aes-256-gcm";
const ISSUER = "HustleHub+";

const getEncryptionKey = () => {
    const key = process.env.TOTP_ENCRYPTION_KEY;

    if (!key || !/^[a-fA-F0-9]{64}$/.test(key)) {
        throw new Error(
            "TOTP_ENCRYPTION_KEY must be a valid 64-character hexadecimal key."
        );
    }

    return Buffer.from(key, "hex");
};

// Encrypt the authenticator secret before storing it in MongoDB.
const encryptSecret = (secret) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        getEncryptionKey(),
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(secret, "utf8"),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex")
    ].join(":");
};

// Decrypt the authenticator secret when verification is required.
const decryptSecret = (encryptedValue) => {
    if (!encryptedValue) {
        throw new Error("No authenticator secret was found.");
    }

    const [ivHex, authTagHex, encryptedHex] =
        encryptedValue.split(":");

    if (!ivHex || !authTagHex || !encryptedHex) {
        throw new Error("Stored authenticator secret is invalid.");
    }

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        getEncryptionKey(),
        Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, "hex")),
        decipher.final()
    ]);

    return decrypted.toString("utf8");
};

// Generate a new TOTP secret and QR code.
const generateAuthenticatorSetup = async (email) => {
    const secret = new OTPAuth.Secret({
        size: 20
    });

    const totp = new OTPAuth.TOTP({
        issuer: ISSUER,
        label: email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret
    });

    const qrCodeDataURL = await QRCode.toDataURL(
        totp.toString()
    );

    return {
        secret: secret.base32,
        qrCodeDataURL,
        manualKey: secret.base32
    };
};

// Verify an authenticator code.
// Returns the matched time-step or null.
const verifyAuthenticatorCode = (
    secret,
    token,
    lastUsedStep = -1
) => {
    if (!/^\d{6}$/.test(String(token || ""))) {
        return null;
    }

    const totp = new OTPAuth.TOTP({
        issuer: ISSUER,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
    });

    const matchedDelta = totp.validate({
        token: String(token),
        window: 1,
        afterCounter: lastUsedStep
    });

    if (matchedDelta === null) {
        return null;
    }

    return totp.counter() + matchedDelta;
};

// Generate ten single-use recovery codes.
const generateRecoveryCodes = () => {
    return Array.from(
        { length: 10 },
        () => crypto.randomBytes(8).toString("hex").toUpperCase()
    );
};

// Store only hashes of recovery codes.
const hashRecoveryCode = (code) => {
    return crypto
        .createHash("sha256")
        .update(String(code).toUpperCase())
        .digest("hex");
};

// Compare recovery codes without exposing the stored hash.
const verifyRecoveryCode = (code, storedHashes = []) => {
    if (!code) return -1;

    const suppliedHash = Buffer.from(
        hashRecoveryCode(code),
        "hex"
    );

    return storedHashes.findIndex((storedHash) => {
        const savedHash = Buffer.from(storedHash, "hex");

        return (
            savedHash.length === suppliedHash.length &&
            crypto.timingSafeEqual(savedHash, suppliedHash)
        );
    });
};

module.exports = {
    encryptSecret,
    decryptSecret,
    generateAuthenticatorSetup,
    verifyAuthenticatorCode,
    generateRecoveryCodes,
    hashRecoveryCode,
    verifyRecoveryCode
};