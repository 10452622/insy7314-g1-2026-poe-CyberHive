
const {
    encryptSecret,
    decryptSecret,
    generateRecoveryCodes,
    hashRecoveryCode,
    verifyRecoveryCode
} = require("./totpSecurity");

describe("TOTP Security Utilities", () => {

    beforeEach(() => {
        process.env.TOTP_ENCRYPTION_KEY =
            "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    });

    afterEach(() => {
        delete process.env.TOTP_ENCRYPTION_KEY;
    });

    describe("Secret encryption and decryption", () => {
        test("should encrypt and decrypt a secret successfully", () => {
            const secret = "MY_AUTHENTICATOR_SECRET";

            const encrypted = encryptSecret(secret);
            const decrypted = decryptSecret(encrypted);

            expect(encrypted).not.toBe(secret);
            expect(decrypted).toBe(secret);
        });

        test("should reject an invalid encryption key", () => {
            process.env.TOTP_ENCRYPTION_KEY = "invalid";

            expect(() => encryptSecret("secret")).toThrow(
                "TOTP_ENCRYPTION_KEY must be a valid 64-character hexadecimal key."
            );
        });

        test("should reject a missing encrypted secret", () => {
            expect(() => decryptSecret(null)).toThrow();
        });

        test("should reject an incorrectly formatted encrypted secret", () => {
            expect(() => decryptSecret("invalid-data")).toThrow();
        });
    });

    describe("Recovery code generation", () => {
        test("should generate ten recovery codes", () => {
            const codes = generateRecoveryCodes();

            expect(codes).toHaveLength(10);
        });

        test("should generate uppercase hexadecimal recovery codes", () => {
            const codes = generateRecoveryCodes();

            codes.forEach((code) => {
                expect(code).toMatch(/^[A-F0-9]{16}$/);
            });
        });
    });

    describe("Recovery code hashing and verification", () => {
        test("should generate the same hash regardless of letter case", () => {
            expect(hashRecoveryCode("abc123")).toBe(
                hashRecoveryCode("ABC123")
            );
        });

        test("should find a valid recovery code", () => {
            const codes = ["CODE123", "CODE456"];
            const hashes = codes.map(hashRecoveryCode);

            expect(verifyRecoveryCode("CODE456", hashes)).toBe(1);
        });

        test("should reject an invalid recovery code", () => {
            const hashes = [hashRecoveryCode("CODE123")];

            expect(verifyRecoveryCode("WRONGCODE", hashes)).toBe(-1);
        });

        test("should reject an empty recovery code", () => {
            expect(verifyRecoveryCode("", [])).toBe(-1);
        });
    });
});

/*Reference List:
The Independent Institute of Education (IIE), 2026. Information Systems 3D [INSY7314 Module Manual]. The Independent Institute of
Education: Unpublished.
*/