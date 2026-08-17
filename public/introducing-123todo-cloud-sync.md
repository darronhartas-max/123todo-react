# Introducing 123ToDo Cloud Sync: Zero-Knowledge AES-256-GCM Serverless Sync Engine

*Published by 123 ToDo Team • Version 3.4.2 Technical Announcement*

We are thrilled to announce **123ToDo Cloud Sync** — a high-speed, zero-knowledge, serverless sync engine built on Cloudflare D1. 

Designed alongside our existing **Google Drive AppData Sync** option, 123ToDo Cloud Sync provides a "set-and-forget" synchronization experience across all your phones, tablets, and computers.

---

## Why We Built 123ToDo Cloud Sync

While Google Drive AppData Sync provided excellent privacy for Google account holders, two major technical limitations affected users:

1. **OAuth 1-Hour Token Drops**: Browser OAuth security rules often expire tokens after 60 minutes or upon network changes, forcing users to re-authenticate.
2. **iOS Safari PWA Storage Sandbox Restrictions**: Apple's WebKit engine frequently clears third-party authentication frames inside Progressive Web Apps saved to the iOS Home Screen.

**123ToDo Cloud Sync eliminates both issues completely.**

---

## Key Features

- 🔐 **End-to-End Zero-Knowledge Encryption**: All task titles, notes, and subtasks are encrypted on your local device using **AES-256-GCM** before transmission.
- ⚡ **5-Second 6-Digit Device Pairing**: Pair new devices instantly without typing long passwords or signing into third-party accounts.
- 📱 **100% PWA & iOS Safari Compatibility**: Stays permanently connected on iOS Home Screen PWAs and mobile browsers.
- 🔄 **Sub-Second Multi-Device Sync**: Real-time sync across desktop, tablet, and mobile.

---

## How it Complements Google Drive Sync

Users can choose between **123ToDo Cloud Sync** (default, instant pairing) and **Google Drive AppData Sync** at any time in **Settings ⚙️ ➔ Cloud Sync**.

Read our full [Dual Encrypted Cloud Sync Guide](introducing-google-drive-sync.md) for a detailed feature comparison!
