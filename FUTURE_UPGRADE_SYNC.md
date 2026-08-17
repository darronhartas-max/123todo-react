# Encrypted Cloud Sync Architecture

Dual-engine Zero-Knowledge Cloud Sync is implemented via `useGoogleDriveSync.js`, `useCloudflareSync.js`, and `crypto.js`.

## Overview
- **Storage**: Browser `localStorage` + IndexedDB + Web Storage Manager persistent storage API.
- **Encryption**: Zero-knowledge AES-256-GCM client-side encryption (`crypto.js`) with PBKDF2 key derivation.
- **Providers**:
  - **Google Drive**: Google Identity Services OAuth + Google Drive v3 REST API (`appDataFolder`).
  - **Cloudflare D1 & Worker**: Set-and-forget sync worker (`cloudflare-worker/worker.js`) backed by Cloudflare D1 SQL.
- **Sync Logic & Request Optimization**:
  - Conditional pulls with `sinceTimestamp` and 304 not-modified detection.
  - Skip redundant pushes when local or remote state hasn't changed.
  - Throttled lifecycle events (tab focus/visibility throttled to 20s min interval).
  - Adaptive per-user request throttling (scales intervals from 60s ➔ 180s ➔ 300s based on daily request volume).
  - CORS preflight caching (`Access-Control-Max-Age: 86400`).
  - Server-side sliding-window rate limiting with HTTP 429 backoff protection.
- **Drop Detection**: Automatic 401/expired session detection triggering `<SyncDroppedModal>` for single-tap re-auth.
