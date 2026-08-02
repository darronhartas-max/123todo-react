# Encrypted Cloud Sync Architecture

Google Drive AppData Sync is fully implemented via `useGoogleDriveSync.js` and `crypto.js`.

## Overview
- **Storage**: Browser `localStorage` + IndexedDB + Web Storage Manager persistent storage API.
- **Encryption**: Zero-knowledge AES-256-GCM client-side encryption (`crypto.js`) with PBKDF2 key derivation.
- **Provider**: Google Identity Services OAuth + Google Drive v3 REST API (`appDataFolder`).
- **Sync Logic**: 300ms local push debounce, 4s tab active polling, instant mobile `touchend`/`online` reconnect triggers.
- **Drop Detection**: Automatic 401/expired session detection triggering `<SyncDroppedModal>` for single-tap re-auth.
