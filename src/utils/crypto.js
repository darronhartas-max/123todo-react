/**
 * crypto.js
 * Utility functions for zero-knowledge encryption of sync data.
 * Uses native Web Crypto API (SubtleCrypto).
 */

const SALT = "123todo_static_salt_v1";
const ITERATIONS = 100000;
const HASH = "SHA-256";
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

// TextEncoder for converting strings to typed arrays
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Derives a strong AES-GCM key from a user-provided passphrase.
 * @param {string} passphrase 
 * @returns {Promise<CryptoKey>}
 */
export async function deriveKey(passphrase) {
    // 1. Get initial key material from the passphrase
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    // 2. Derive the actual AES-GCM key using PBKDF2
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode(SALT),
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
 * @param {object} data The data to encrypt
 * @param {string} passphrase The user's secret passphrase
 * @returns {Promise<string>} Base64 encoded string containing IV + Ciphertext
 */
export async function encryptData(data, passphrase) {
    if (!passphrase) throw new Error("Passphrase is required for encryption");
    
    const key = await deriveKey(passphrase);
    
    // Generate a random 12-byte Initialization Vector (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
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
    
    // Combine IV and Ciphertext for storage
    // We need both to decrypt later
    const ciphertextArray = new Uint8Array(ciphertextBuffer);
    const combinedArray = new Uint8Array(iv.length + ciphertextArray.length);
    combinedArray.set(iv, 0);
    combinedArray.set(ciphertextArray, iv.length);
    
    // Convert to Base64 for easier JSON/Network transport
    return arrayBufferToBase64(combinedArray);
}

/**
 * Decrypts a Base64 string back into a JSON object.
 * @param {string} base64String The encrypted payload
 * @param {string} passphrase The user's secret passphrase
 * @returns {Promise<object>} The decrypted data
 */
export async function decryptData(base64String, passphrase) {
    if (!passphrase) throw new Error("Passphrase is required for decryption");
    
    const key = await deriveKey(passphrase);
    
    const combinedArray = base64ToArrayBuffer(base64String);
    
    // Extract the IV (first 12 bytes)
    const iv = combinedArray.slice(0, 12);
    // Extract the Ciphertext (remaining bytes)
    const ciphertext = combinedArray.slice(12);
    
    try {
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
        throw new Error("Invalid passphrase or corrupted data");
    }
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
