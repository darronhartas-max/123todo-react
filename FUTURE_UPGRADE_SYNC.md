# Future Upgrade Plan: Encrypted Cross-Platform Sync

This plan outlines the architecture for moving from a local-first application to a globally synchronized task manager while maintaining strict user privacy through client-side encryption.

## 🏗️ Architecture Overview

The system will transition to a **Synchronization** model rather than a simple save/load model. The goal is to ensure that "Last Update Wins" for any given task, while keeping the main data store on the device.

### 🛡️ Privacy & Encryption
*   **Zero-Knowledge Architecture**: The server will never see the task content.
*   **Client-Side Encryption**:
    *   **Algorithm**: AES-256-GCM.
    *   **Keys**: Derived from a user-provided passphrase using PBKDF2 with a high iteration count.
    *   **Storage**: The derived key remains only in memory or highly secure storage (not plain localStorage).

### 🔄 Sync Logic (Push/Pull)
*   **The "Dirty" Flag**: Each state change (task add, edit, delete) will mark the local data as "dirty."
*   **Throttled Push**: When online, the app will wait for a short idle period (e.g., 5 seconds of no changes) before encrypting and pushing the full state to the server.
*   **Pull on Startup**: On app initialization, the client will pull the server's version and compare timestamps.
*   **Conflict Resolution**: Use a **Timestamp-per-Task** or **Atomic Snapshot** approach.
    *   *Approach*: **Atomic Snapshot with Checksum**. The server stores the latest snapshot + a unique version ID (hash). If the client tries to push but the server version ID has changed since the client's last pull, a merge or "Newer Wins" check is triggered.

## 🚀 Implementation Phases

### Phase 1: Authentication & Key Management
- Implement a simple "Sync Profile" (Username/Passphrase).
- Create a library (`src/utils/crypto.js`) to handle key derivation and AES encryption.
- Test encryption/decryption of the current `.json` export format.

### Phase 2: Synchronization API (Server-Side)
- **POST `/api/sync/push`**: Accepts an encrypted blob + version hash.
- **GET `/api/sync/pull`**: Returns the latest encrypted blob + version hash.
- **Logic**: The server simply acts as a secure, version-controlled blob storage.

### Phase 3: Client-Side Integration
- Replace the current "Shadow Backup" triggers with a `useSync` hook.
- Implement background syncing with visual status indicators in the footer (e.g., "☁️ Synced").
- Add a "Merge" UI for resolving conflicts if two devices edit simultaneously.

## 📝 Technical Requirements
*   **Crypto Library**: `SubtleCrypto` (Web Crypto API) for modern, fast, native encryption.
*   **Backend**: A lightweight Node.js/Astro or Firebase service for blob storage.
*   **Network Resilience**: Use `navigator.onLine` and a retry queue for offline changes.
