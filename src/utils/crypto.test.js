import { encryptData, decryptData, deriveKey, SALT } from './crypto';

describe('crypto utility (dynamic salt & backward compatibility)', () => {
    const testPassphrase = 'SuperSecretPassphrase!2026';
    const sampleData = {
        todos: [
            { id: 1, text: 'Test Task 1', completed: false, category: 'Work' },
            { id: 2, text: 'Special chars: 🚀 ñoño ü ñ £ $ €', completed: true, category: 'Personal' }
        ],
        categories: ['Work', 'Personal'],
        theme: 'dark'
    };

    test('encrypts and decrypts payload correctly (round-trip)', async () => {
        const encrypted = await encryptData(sampleData, testPassphrase);
        expect(typeof encrypted).toBe('string');
        expect(encrypted.length).toBeGreaterThan(0);

        const decrypted = await decryptData(encrypted, testPassphrase);
        expect(decrypted).toEqual(sampleData);
    });

    test('produces different ciphertexts for identical plaintext due to dynamic salt and IV', async () => {
        const encrypted1 = await encryptData(sampleData, testPassphrase);
        const encrypted2 = await encryptData(sampleData, testPassphrase);

        expect(encrypted1).not.toBe(encrypted2);

        // Both decrypt back to identical data
        const decrypted1 = await decryptData(encrypted1, testPassphrase);
        const decrypted2 = await decryptData(encrypted2, testPassphrase);
        expect(decrypted1).toEqual(sampleData);
        expect(decrypted2).toEqual(sampleData);
    });

    test('throws error when wrong passphrase is provided', async () => {
        const encrypted = await encryptData(sampleData, testPassphrase);
        await expect(decryptData(encrypted, 'WrongPassphrase!')).rejects.toThrow('Invalid passphrase or corrupted data');
    });

    test('throws error when passphrase is empty or missing', async () => {
        await expect(encryptData(sampleData, '')).rejects.toThrow('Passphrase is required for encryption');
        await expect(decryptData('dummy', '')).rejects.toThrow('Passphrase is required for decryption');
    });

    test('throws error on corrupted or malformed base64', async () => {
        await expect(decryptData('NotValidBase64!!!', testPassphrase)).rejects.toThrow();
    });

    test('successfully decrypts legacy v1 payloads (backward compatibility)', async () => {
        // Construct a legacy v1 payload manually:
        // [12-byte IV] + [AES-GCM Ciphertext] using static salt
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(testPassphrase),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        const legacyKey = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(SALT),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        const legacyIv = window.crypto.getRandomValues(new Uint8Array(12));
        const legacyCiphertext = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: legacyIv },
            legacyKey,
            encoder.encode(JSON.stringify(sampleData))
        );

        const legacyCombined = new Uint8Array(legacyIv.length + legacyCiphertext.byteLength);
        legacyCombined.set(legacyIv, 0);
        legacyCombined.set(new Uint8Array(legacyCiphertext), legacyIv.length);

        // Convert to base64
        let binary = '';
        for (let i = 0; i < legacyCombined.byteLength; i++) {
            binary += String.fromCharCode(legacyCombined[i]);
        }
        const legacyBase64 = window.btoa(binary);

        // Verify that decryptData detects that it lacks the magic header and decrypts it with legacy static salt
        const decryptedLegacy = await decryptData(legacyBase64, testPassphrase);
        expect(decryptedLegacy).toEqual(sampleData);

        // Verify that wrong passphrase on legacy payload fails properly
        await expect(decryptData(legacyBase64, 'WrongPassword')).rejects.toThrow('Invalid passphrase or corrupted data');
    });
});
