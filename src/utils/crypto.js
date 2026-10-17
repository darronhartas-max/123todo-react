/**
 * crypto.js
 * Utility functions for zero-knowledge encryption of sync data.
 * Uses native Web Crypto API (SubtleCrypto).
 */

export const SALT = "123todo_static_salt_v1";
const ITERATIONS = 100000;
const HASH = "SHA-256";
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

// TextEncoder for converting strings to typed arrays
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Envelope v2: Magic prefix "123S" (4 bytes) + Salt (16 bytes) + IV (12 bytes) + Ciphertext
const MAGIC_HEADER = new Uint8Array([0x31, 0x32, 0x33, 0x53]); // "123S"
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Derives a strong AES-GCM key from a user-provided passphrase.
 * @param {string} passphrase 
 * @param {Uint8Array|string} [salt=SALT] Dynamic or static salt
 * @returns {Promise<CryptoKey>}
 */
export async function deriveKey(passphrase, salt = SALT) {
    // 1. Get initial key material from the passphrase
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const saltBuffer = typeof salt === "string" ? encoder.encode(salt) : salt;

    // 2. Derive the actual AES-GCM key using PBKDF2
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: ITERATIONS,
            hash: HASH
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts a JSON object into a Base64 string.
 * Generates a dynamic 16-byte random salt and 12-byte IV per payload.
 * Encapsulated envelope: [Magic "123S" (4B)] + [Salt (16B)] + [IV (12B)] + [Ciphertext]
 * @param {object} data The data to encrypt
 * @param {string} passphrase The user's secret passphrase
 * @returns {Promise<string>} Base64 encoded string
 */
export async function encryptData(data, passphrase) {
    if (!passphrase) throw new Error("Passphrase is required for encryption");
    
    // Generate unique per-payload salt and IV
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    const key = await deriveKey(passphrase, salt);
    const encodedData = encoder.encode(JSON.stringify(data));
    
    // Encrypt the data
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
        {
            name: ALGORITHM,
            iv: iv
        },
        key,
        encodedData
    );
    
    // Combine Magic Header + Salt + IV + Ciphertext for storage
    const ciphertextArray = new Uint8Array(ciphertextBuffer);
    const combinedArray = new Uint8Array(
        MAGIC_HEADER.length + salt.length + iv.length + ciphertextArray.length
    );
    combinedArray.set(MAGIC_HEADER, 0);
    combinedArray.set(salt, MAGIC_HEADER.length);
    combinedArray.set(iv, MAGIC_HEADER.length + salt.length);
    combinedArray.set(ciphertextArray, MAGIC_HEADER.length + salt.length + iv.length);
    
    // Convert to Base64 for easier JSON/Network transport
    return arrayBufferToBase64(combinedArray);
}

/**
 * Decrypts a Base64 string back into a JSON object.
 * Autodetects v2 dynamic salt envelope and seamlessly falls back to legacy v1 static salt.
 * @param {string} base64String The encrypted payload
 * @param {string} passphrase The user's secret passphrase
 * @returns {Promise<object>} The decrypted data
 */
export async function decryptData(base64String, passphrase) {
    if (!passphrase) throw new Error("Passphrase is required for decryption");
    
    const combinedArray = base64ToArrayBuffer(base64String);
    
    // Detect v2 envelope by magic header "123S"
    const isV2 = combinedArray.length >= (MAGIC_HEADER.length + SALT_LENGTH + IV_LENGTH) &&
        combinedArray[0] === MAGIC_HEADER[0] &&
        combinedArray[1] === MAGIC_HEADER[1] &&
        combinedArray[2] === MAGIC_HEADER[2] &&
        combinedArray[3] === MAGIC_HEADER[3];

    if (isV2) {
        try {
            const salt = combinedArray.slice(MAGIC_HEADER.length, MAGIC_HEADER.length + SALT_LENGTH);
            const iv = combinedArray.slice(MAGIC_HEADER.length + SALT_LENGTH, MAGIC_HEADER.length + SALT_LENGTH + IV_LENGTH);
            const ciphertext = combinedArray.slice(MAGIC_HEADER.length + SALT_LENGTH + IV_LENGTH);

            const key = await deriveKey(passphrase, salt);
            const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: ALGORITHM,
                    iv: iv
                },
                key,
                ciphertext
            );
            
            const decryptedString = decoder.decode(decryptedBuffer);
            return JSON.parse(decryptedString);
        } catch (e) {
            // Fallback to legacy decryption in case of rare collision
            try {
                return await decryptLegacy(combinedArray, passphrase);
            } catch {
                throw new Error("Invalid passphrase or corrupted data");
            }
        }
    }

    // Legacy v1 payload (static salt, [12B IV] + [Ciphertext])
    try {
        return await decryptLegacy(combinedArray, passphrase);
    } catch (e) {
        throw new Error("Invalid passphrase or corrupted data");
    }
}

async function decryptLegacy(combinedArray, passphrase) {
    const key = await deriveKey(passphrase, SALT);
    const iv = combinedArray.slice(0, 12);
    const ciphertext = combinedArray.slice(12);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
            name: ALGORITHM,
            iv: iv
        },
        key,
        ciphertext
    );
    
    const decryptedString = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedString);
}

// Helper to convert Uint8Array to Base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Helper to convert Base64 to Uint8Array
function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}
