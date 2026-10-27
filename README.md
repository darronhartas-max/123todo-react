# 123 ToDo — User & Architecture Guide

> **A fast, free, private Progressive Web App (PWA) for tasks, projects, and voice notes.**  
> Version **3.8.15** | © Unforgettable Management Ltd 2026 | [app.123todo.com](https://app.123todo.com)

---

## 🌟 Highlights & Key Advantages

- **Actionable Links, Emails & Phone Numbers**: Email addresses (`mailto:`), phone numbers (`tel:`), and web URLs in tasks, task notes, and notes are automatically clickable for instant dialing, emailing, and browsing without opening edit mode.
- **PWA Installation & Awareness Hub**: Simple, device-detected installation guidance (iOS Safari, Android Chrome, Mac/PC) and 1-click install prompt support so users can run 123 To Do as a full-screen, offline native app.
- **Free Core App & Uncapped**: Priority matrix (P1–P4), recurring tasks, subtasks, unlimited projects, unlimited notes, and photo attachments without mandatory subscriptions.
- **Photo Attachments in Notes & Tasks**: Attach up to 5 photos or screenshots per note or task on mobile (camera / gallery) and desktop (drag & drop, direct `Cmd+V` / `Ctrl+V` paste) with sharp client-side compression, IndexedDB caching, and full-screen Lightbox viewer.
- **Productivity & Achievements Hub**: Top header trophy badge opening an interactive house-styled modal with 10-tier level progression, Productivity Points, 6-card productivity insights, daily streaks, 1-2-3 rule balance ratios, unlockable milestone badges, and official 123todo.com blog guides.
- **Dual-Skin OS**: Instant 1-tap toggle between structured **Task Manager Mode** and distraction-free **Simple Voice Notes Mode**.
- **Interactive Drag-and-Drop Subtasks**: Multi-line auto-wrapping checklist subtasks with draggable reordering across Add Task, Edit Task, and Task lists.
- **Compact Note Previews**: Space-efficient single-line note preview under task titles for effortless scanning without clutter.
- **Zero-Knowledge Encrypted Sync**: Client-side AES-256-GCM encryption syncing directly via personal Google Drive or Cloudflare D1 with shared cross-platform stats.
- **Universal Competitor Migration**: 1-click import wizard for Todoist, TickTick, Google Keep, Google Tasks, and Microsoft To Do.
- **Continuous Voice Dictation**: Web Speech API integration with spoken punctuation recognition ("comma", "full stop", "question mark") and auto-submission commands.
- **Wide Mode Kanban Views**: View desktop tasks grouped either by **Priorities (P1–P4)** or **Project Columns** with drag-and-drop.
- **Offline First**: Works anywhere with automatic 24-hour local shadow backups and persistent storage protection.

---

## 🚀 Quick Start

### For End Users

1. **Open the App**: Visit [app.123todo.com](https://app.123todo.com) on any phone, tablet, or computer.
2. **Install as App (PWA)**:
   - **iOS Safari**: Tap the Share button → **Add to Home Screen**.
   - **Android Chrome**: Tap Menu (⋮) → **Install App** / **Add to Home Screen**.
   - **Desktop (Chrome/Edge)**: Click the Install icon in the browser address bar.
3. **Switch Modes**: Tap the top mode switch pill to jump between **Tasks** and **Voice Notes**.

### For Developers & Antigravity Workflows

```bash
# Install dependencies
npm install

# Start local development server (localhost:3000)
npm start

# Run test suite
npm test

# Build production bundle with version stamp
npm run build
```

---

## 📱 Feature Overview

### 1. Dual-Skin Operating System

- **Task Manager Mode**: 4-level priority matrix, due dates, subtasks, project color tabs, drag-and-drop reordering, and customizable swipe actions.
- **Simple Voice Notes Mode**: Large high-legibility builder font, unassigned quick inbox capture, continuous hands-free dictation, and 1-tap conversion to active tasks.

### 2. Priority System

- **P1 — Must Do** (`#dc2626`): Urgent, high-impact tasks.
- **P2 — Should Do** (`#f59e0b`): Important tasks to complete today/this week.
- **P3 — Could Do** (`#6b7280`): Nice-to-have or future tasks.
- **P4 — On Hold** (`#9333ea`): Tasks paused or waiting on external dependencies.

### 3. Voice Input & Smart Commands

- **Desktop Continuous Dictation**: Hands-free continuous listening across thinking pauses with speech accumulation buffers (Mac / Windows / Linux).
- **Mobile Zero-Drop Capture**: Quick single-tap phrase capture engineered to eliminate operating-system bleep loops and audio cutoffs. Seamlessly appends additional speech upon tapping.
- **Native Mobile Keyboard Integration**: Compatible with Gboard (Android) and Apple Dictation (iOS) for continuous, hardware-accelerated long-form dictation.
- **Natural Language Editing Commands**: Spoken deletions (_"delete last word"_, _"delete last 2 words"_, _"scratch that"_), letter-by-letter spelling (_"spell S M Y T H E"_), and auto-submission (_"add task"_, _"save note"_).
- **Automatic Punctuation Conversion**: Live formatting for _"comma"_, _"full stop"_, _"question mark"_, and _"new line"_.

### 4. Customizable Swipe Gestures

- Configure custom **Swipe Left** and **Swipe Right** actions in **Settings ➔ Swipe**.
- Assignable actions: Complete, Delete, On Hold (P4), Edit, or Disabled.
- Vertical scroll lock prevents accidental swipes when scrolling down lists.

### 5. Multi-Competitor Migration Wizard

- Accessible via **Footer ➔ Import ➔ Import from Other Apps**.
- Full multi-file CSV and JSON import support for **Todoist**, **TickTick**, **Google Keep**, **Google Tasks**, and **Microsoft To Do**.
- Automatically preserves descriptions into unlimited text notes, maps subtasks (`↳`), and extracts due dates.

### 6. Zero-Knowledge Cloud Sync & Adaptive Request Throttling

- **Google Drive AppData Sync**: Stores encrypted backups directly in your private Google Drive AppData folder.
- **Cloudflare D1 E2EE Sync**: Set-and-forget multi-device synchronization powered by Cloudflare Workers and D1 SQL database.
- **Client-Side AES-256-GCM**: Data is encrypted locally before transmission; zero plain text leaves your device.
- **Adaptive Request Throttling & Daily Budgeting**: Dynamically adjusts polling intervals (60s ➔ 180s ➔ 300s) and debounce rates as daily usage scales, protecting free-tier limits with zero user disruption.
- **Conditional Syncing & CORS Caching**: Pulls with `sinceTimestamp` and skips redundant pushes when local or remote state hasn't changed.
- **Automatic 2-Way Merge**: Conflict-free active task and tombstone tracking (`deletedTasks`, `deletedProjects`) prevent accidental data resurrection.

### 7. Appearance & Layout Customization

- **Wide Mode Column Views**: Toggle between Priority Columns and Project Columns in wide desktop view.
- **Typography & Font Sizing**: Slider range from 8pt to 20pt with persistent preference storage.
- **Density Controls**: Cozy vs. Compact list spacing.
- **Themes**: System Auto, Dark, and 3 Light Mode tones (Bright, Soft, Muted anti-glare).

---

## 🏗️ Architecture & Codebase Layout

```
src/
├── components/          # Modular UI components
│   ├── layout/          # Header, Footer, NotificationBar, SocialShare, AdminModal
│   ├── modals/          # SettingsModal, SyncModal, SkinDiscoveryModal, TodoistGuideModal, EditModal, ArchiveModal
│   ├── notes/           # NotesView, NoteCard (Simple Voice Notes skin & builder mode)
│   ├── projects/        # ProjectTabs, ProjectColumn
│   └── tasks/           # TaskItem, PrioritySection, AddTask, SearchBar, MilestoneCelebration
├── hooks/               # State & business logic
│   ├── useTasks.js      # Core tasks/projects/notes state, shadow backups, local persistence
│   ├── useCloudflareSync.js # E2E Zero-Knowledge Cloudflare D1 sync engine
│   ├── useGoogleDriveSync.js # Encrypted Google Drive sync & token drop detection
│   └── useAppSystem.js  # Milestones, PWA update detection, persistent storage API
└── utils/               # Constants, AES-256 crypto, date formatters, sync engines, voice parsers
```

---

## 🚀 CI/CD & Dual-Repo Deployment Workflow

Both the **App** (`123todo-react` ➔ `app.123todo.com`) and the **Marketing Website** (`123todo-website` ➔ `www.123todo.com`) deploy automatically via GitHub Actions.

### Commit & Deployment Verification Rules:

1. **Mandatory Minor Version Bump Before Every Commit**:
   > [!IMPORTANT]
   > **Every time an update is made to the app and it is committed and pushed, a minor version bump MUST be performed first.**
   > - **Minor Version Bump Increment**: Increments at the very end of the version number (e.g. `v3.6.11` ➔ `v3.6.12`, `v3.7.0` ➔ `v3.7.1`).
   > - **Major Version Bumps**: Any major version bumps (major digit or middle digit increments) will be specifically notified and requested by the project owner. Never perform major or middle-digit bumps without explicit user instruction.

2. **Lint & Prettier Compliance**: Ensure zero linter errors or Prettier violations before pushing.
3. **Build & Test Verification**: Run `npm test -- --watchAll=false` and `npm run build` locally to verify 100% tests pass and the production bundle compiles with zero warnings.
4. **Push to Origin**:
   - App: `darronhartas-max/123todo-react`
   - Website: `darronhartas-max/123todo-website`
5. **Automated CI Verification**: Check deployment status via GitHub REST API:
   ```bash
   curl -s "https://api.github.com/repos/darronhartas-max/123todo-react/actions/runs?per_page=1"
   curl -s "https://api.github.com/repos/darronhartas-max/123todo-website/actions/runs?per_page=1"
   ```
   Confirm `status: "completed"` and `conclusion: "success"`.

### Version Bumping Protocol (MUST-DO BEFORE EVERY COMMIT):

Whenever preparing an update to the application:

1. **Increment Version**:
   Increment the version number at the end using `npm version <new_version> --no-git-tag-version` or by editing `package.json` and `package-lock.json` (e.g. `3.7.0` ➔ `3.7.1`).
2. **Update Release Changelog**:
   Add release highlights to `RELEASE_CHANGELOG` in `src/utils/constants.js` matching the new version key. This feeds the dynamic in-app "Latest Update Info" modal (`UpdatedModal.js`).
3. **Update Documentation**:
   Update the version header badge and the Recent Release Highlights section in `README.md`.
4. **Build Bundle**:
   Run `npm run build`. The build script automatically syncs `package.json` version into `public/version.json` and verifies compilation.
5. **Run Tests**:
   Run `npm test -- --watchAll=false` to ensure all test suites pass with zero regressions.
6. **Commit & Push**:
   Commit the changes with a concise commit message. The local post-commit hook automatically pushes to `origin/main`, triggering the CI/CD deployment pipeline.

---

## 🔒 Privacy, Security & Data Protection

- **Local-First Storage**: Tasks and notes reside in browser `localStorage` protected with Persistent Storage API.
- **Zero Third-Party Tracking**: No cookies, no IP logging, zero personal identification data collected.
- **On-Device Voice Processing**: Web Speech API processes audio entirely in-browser; zero sound data is recorded or transmitted.
- **Recovery Protection**: Daily automated 24-hour Shadow Backups and 1-click JSON backup export/restore.

---

## 🔄 Recent Release Highlights

### v3.8.15 (Current)

- **Live Microphone Check & Audio Level Meter**: Added a real-time microphone test and VU audio level meter to Settings → Voice so users can instantly verify audio capture, view connected audio devices, and receive smart diagnostics for external audio interfaces (like Focusrite Scarlett) and laptop closed-mode setups.
- **Seamless Audio Permission & Clear Guidance**: Added proactive microphone access verification, refined permission error feedback, and clear troubleshooting instructions for web browsers and installed desktop PWAs.

### v3.8.14

- **Balanced Section Spacing & Uncramped Views**: Added comfortable vertical spacing above the "1 Must Do" priority heading below project tabs and below the "Scheduled & Recurring" heading in collapsed view, eliminating cramped layouts and balancing space above the Archive section.
- **Refined Header Date Size & Width Fit**: Slightly enlarged the header date typography for crisper legibility while constraining its width so it never exceeds the Tasks/Notes mode toggle pill directly above it.

### v3.8.13

- **Polished Header Date Spacing**: Added polished breathing room and a visual spacing gap between the top date and the Tasks/Notes toggle pill in the header for a refined, professional aesthetic.
- **Uniform Line Spacing Across Collapsed Priorities**: Standardized the vertical line spacing between all collapsed priority headings (1 Must Do, 2 Should Do, 3 Could Do, On Hold, and Scheduled) for consistent visual rhythm.
- **Direct Archive Opening Without Keyboard Pop-up**: Removed automatic input focusing on the Archive search bar so mobile users can immediately view recently archived tasks without the virtual keyboard obscuring the list.

### v3.8.12

- **Today's Date in Top Header**: Added today's date formatted to your preferred date format setting right below the Tasks/Notes toggle pill in the top header, providing convenient instant date visibility on mobile devices.
- **1-2-3 Priority Headings & Uniform Badges**: Numbered priority headings to "1 Must Do", "2 Should Do", and "3 Could Do" to align with the core 1-2-3 methodology. Replaced plain count text in On Hold and Scheduled headings with matching circular count badge pills.
- **Clean Archive Trigger & Consistent Spacing**: Simplified the Archive section heading to clean "Archive" without icon clutter, and eliminated extraneous vertical spacing between priority sections for consistent line spacing.

### v3.8.11

- **Stable Desktop Kanban Columns on Empty Board**: Fixed an issue in the desktop Kanban columns layout where clearing all tasks caused categories to collapse into a narrow strip on the left side. Priority columns now maintain equal widths across the board with dedicated empty drop targets and indicators. This bug fix was kindly suggested by user 'Fae'.

### v3.8.10

- **Customizable Priority Label Colors in Settings**: Added priority color customization in Settings under Tasks. Users can now choose distinct colors for Must Do, Should Do, Could Do, and On Hold from a 24-color curated palette or custom color picker, with options to reset individual or all priorities back to default colors. This feature was kindly suggested by user 'Fae'.
- **Dynamic Priority Color Theming Throughout App**: Custom priority colors dynamically update across all task sections, modal editors, dropdowns, drag-and-drop hover zones, note priority tags, and restore modals while preserving default colors as the baseline.

### v3.8.9

- **Permanent Dismiss for Rescheduled (Deferred 5x) Alert**: Added a dedicated dismiss (✕) button to the 5x deferred warning message in both the task editor (`EditModal`) and the task item badge (`TaskItem`), allowing users to remove the notification for good once acknowledged.
- **Intuitive Mode Toggle Icons (Task Organising & Note Taking)**: Replaced the confusing microphone toggle icon at the top of the app with a dedicated notebook and pen icon (`NotebookPen`) for Notes mode, and updated the Tasks icon to an organized checklist icon (`ListTodo`) depicting clear task management.

### v3.8.8

- **Dynamic Subtask Text & Checkbox Scaling in Notes Mode**: Subtask checklists, step descriptions, and checkboxes in Notes view mode now dynamically scale with the user's Notes Text Size setting in both view and edit modes, ensuring high readability and comfortable touch targets on mobile.

### v3.8.7

- **Centered Mobile Archive & Undo Notification**: Fixed bottom horizontal centering for the "Moved to Archive" and task completion Undo snackbar, ensuring it stays perfectly centered on mobile viewports with native safe-area-inset support without clipping off-screen to the right.
- **Settings Access in Notes View Mode**: Added the Settings icon button into the top action toolbar in Notes view mode right next to the Add Note button, mirroring the top layout in Tasks view for seamless cross-mode configuration.
- **Expanded Notes Text Size Range (Up to 36pt)**: Extended the Notes View Text Size slider up to 36pt with dynamic scaling across note card titles, note details, Quick Add, and active note editing textareas for ultra-clear legibility on high-resolution mobile screens.

### v3.8.6

- **Smart Natural Language Quick Add (Phase 4)**: Introduced zero-dependency natural language parsing in Add Task. Automatically detects due dates (`today`, `tomorrow`, `friday`, `in 3 days`, `25th Oct`), scheduled times (`2pm`, `14:30`, `morning`, `evening`), priorities (`!1`, `!2`, `!3`, `!4`, `p1`, `!must`), project hashtags (`#Work`, `#Personal`), and recurrence patterns (`daily`, `weekly`, `every 2 weeks`, `every weekday`) with live interactive preview chips and 1-tap removal.
- **Interactive Quick Undo Toast Snackbar**: Added a bottom-anchored, 5-second interactive Undo snackbar when tasks are completed or moved to archive. Users can effortlessly reverse accidental actions with 1 tap, elevating confidence especially with touch swipe gestures on mobile.
- **Power-User Command Palette (`Cmd + K` / `Ctrl + K`)**: Added a spotlight command palette accessible from anywhere via keyboard shortcuts (`Cmd+K` on Mac, `Ctrl+K` on Windows/Linux) or via Search. Features keyboard navigation for quick actions, instant mode and theme toggling, project switching, and live global search across all active tasks and notes.

### v3.8.5

- **SettingsModal Modularization (Phase 3)**: Decomposed the monolithic 2,592-line `SettingsModal.js` into 8 focused, isolated domain subcomponents under `src/components/modals/settings/` (`SettingsProjectsTab`, `SettingsAppearanceTab`, `SettingsTasksTab`, `SettingsSwipeTab`, `SettingsVoiceTab`, `SettingsShortcutsTab`, `SettingsSyncTab`, `SettingsAboutTab`), reducing main modal complexity down to ~455 lines (-2,137 lines) while preserving 100% pixel-perfect styling, gestures, keyboard navigation, and responsive behavior.
- **Critical Modal & Storage Test Suite Expansion**: Expanded unit test coverage past the 400-test milestone (48 test suites, 401 tests passing) by adding comprehensive automated test suites for `SettingsModal`, all individual settings tabs, `ExportModal`, `SyncModal`, `UniversalImportModal`, and IndexedDB `photoStorage`.
- **Universal Import Component Hardening**: Enhanced `UniversalImportModal` project mapper with robust type-safe normalization handling both string and object project structures seamlessly to prevent runtime rendering crashes.

### v3.8.4

- **Task Editor Architecture Deduplication (Phase 2)**: Extracted shared task editing logic into reusable, modular micro-components (`ProjectPicker`, `PrioritySelector`, `SchedulePicker`, `RecurrencePicker`, `SubtasksEditor`) under `src/components/tasks/editor/`.
- **Codebase Streamlining & Unified Behaviors**: Eliminated over 1,740 lines of duplicate logic across `AddTask` and `EditModal`, standardizing subtask drag-and-drop reordering, circular time scheduling, calendar exports, and project selection while maintaining 100% visual styling and full test coverage.

### v3.8.3

- **Zero-Allocation Drag Handlers & Restored Memoization (Phase 1)**: Refactored drag-and-drop event handlers across `TaskItem`, `PrioritySection`, `ProjectColumn`, and On Hold task lists to pass stable memoized callbacks, eliminating inline closure and object allocations inside `.map()` loops and restoring full `React.memo` prop equality.
- **Progressive Batch Rendering in Archive**: Introduced 30-item progressive batch rendering with instant Load More controls in `ArchiveModal`. Replaced linear project array scans with $O(1)$ indexed Map lookups, enabling instantaneous archive opening even with thousands of completed tasks.

### v3.8.2

- **Dynamic Per-Payload PBKDF2 Salt (SEC-01)**: Upgraded zero-knowledge end-to-end encryption to generate a unique 16-byte cryptographically random salt per payload, neutralizing precomputed rainbow table attacks while preserving 100% backward compatibility for existing encrypted backups.
- **Single-Use Device Pairing Codes (SEC-02)**: Cloudflare Worker now atomically consumes and purges 6-digit device pairing codes immediately upon successful connection, closing the replay window entirely.
- **Hardened CSP & CORS Policies (SEC-03)**: Tightened Content Security Policy `connect-src` directive specifically to the official sync worker domain and restricted Cloudflare Worker CORS headers to authorized application origins.
- **Cryptographic SHA-256 Admin Authentication (SEC-06)**: Upgraded admin passcode verification from polynomial hashing to FIPS 180-4 standard SHA-256 with automatic, seamless in-place migration of existing legacy credentials.

### v3.8.1

- **O(N) Project Task Counting & Fast Tabs Rendering (Phase 5)**: Replaced quadratic nested task counting loops in `ProjectTabs` with a single memoized $O(N)$ lookup pass and wrapped `ProjectTabs` in `React.memo`, eliminating 20+ redundant array traversals on every state change and making project switching instantaneous.
- **Memoized Task Pipeline & Zero-Allocation Lookups**: Memoized active, scheduled, and filtered task pipelines in `App.js` to eliminate redundant multi-key date/time sorting and search re-filtering during typing. Replaced inline project array allocations with indexed map lookups ($O(1)$) for On Hold and Scheduled sections.
- **Smooth 60fps Drag-and-Drop & UI Control Memoization**: Added target ID equality guards to drag-over handlers and stabilized all drag handlers in `useCallback` to prevent rapid state churn during drag gestures. Wrapped `Header`, `Footer`, and `SearchBar` in `React.memo` and unified telemetry storage keys into `STORAGE_KEYS`.

### v3.8.0

- **Dedicated Photo Download vs. Share Actions**: The Download button in the photo Lightbox viewer now strictly executes a direct browser file download to save the original high-resolution image directly into the device's Downloads folder, completely distinct from the Share button which triggers the native system share sheet (AirDrop, Messages, Mail, WhatsApp).
- **Extended Blob Download Reliability**: Extended object URL revocation timeout in `downloadBlob` to 20 seconds, preventing premature download cancellation on mobile networks and larger files.

### v3.7.59

- **Full-Resolution Photo Download & Native Save**: Fixed photo Download in the Lightbox viewer. Desktop users get instant file downloads to their Downloads folder, while mobile users on iOS and Android can 1-tap "Save Image" to their Camera Roll, save to Files, or attach directly to emails via the native system share sheet.
- **Cloud Sync Payload Optimization**: Cloudflare and Google Drive sync payloads now strictly transmit lightweight metadata and compact thumbnails, keeping background sync fast, cellular-data-friendly, and well within Cloudflare Worker limits.

### v3.7.58

- **Zero Photo Loss & Quota-Proof Architecture**: Note photos are permanently stored and safeguarded in IndexedDB protected by the browser Persistent Storage API, eliminating 5MB local storage quota limitations even with hundreds or thousands of photos.
- **Physical Photo ZIP Export**: Added a 1-click "Export All Photos (.ZIP)" feature in both the Export modal and Settings (Cloud Sync & Backup Options) allowing users to download all high-resolution attached note photos across active and archived tasks into a single physical ZIP file.
- **Permanent Photo Retention in Archive**: Completed tasks in the Archive permanently preserve all attached photos and thumbnails, viewable and downloadable in read-only mode without being stripped under storage pressure.
- **Asynchronous Thumbnail Hydration**: Gallery thumbnails hydrate smoothly and asynchronously from IndexedDB without blocking interface interactions or causing memory bloat.

### v3.7.57

- **Top-Prepend for New Subtasks**: Adding new subtasks in Add Task, Edit Task, Task Item, or Notes now places newly added steps immediately at the top of the list for instant visibility and fast multi-step entry.
- **Smart Subtask Auto-Sort on Completion**: When a subtask is marked completed, it automatically moves to just below the remaining uncompleted subtasks, keeping active items prioritized at the top while maintaining completed items cleanly grouped below.
- **Multi-Line Carriage Return Support in Task Creation**: Fixed Enter / Carriage Return key handling in the Add Task textarea so pressing Return naturally inserts new lines across all mobile keyboards (including OnePlus and Android virtual keyboards) and desktop browsers, allowing itemized list creation. Power users can submit with `Cmd+Enter` or `Ctrl+Enter`.

### v3.7.56

- **Unified Subtask Reorder Hook & Modular Architecture (Phase 4)**: Extracted duplicated touch, boundary collision, and drag-and-drop gesture handlers across `TaskItem`, `AddTask`, and `EditModal` into a reusable `useSubtaskReorder` hook, eliminating redundant code and unifying vibration feedback.
- **Storage Keys Centralization & Orphan Key Pruning**: Centralized all local storage identifiers into the `STORAGE_KEYS` registry, resolving fragmented key usage. Added automated pruning of orphaned task section keys on app startup and task deletion to prevent storage leaks.
- **Safe Silent Background Service Worker Activation**: Enhanced silent background service worker update transitions to safeguard against reloading while any modal dialog or active input editing is open, safely deferring reloads until the app is backgrounded.

### v3.7.55

- **Security Hardening & Content Security Policy (Phase 3)**: Introduced strict Content-Security-Policy (CSP) headers restricting script execution, network endpoints, and frame embeddings to authenticated origins.
- **Cloudflare Worker Hardening & Dynamic Google GSI Loading**: Upgraded device pairing codes to cryptographically secure random values (`crypto.getRandomValues`) and enforced a 2MB maximum payload limit on cloud sync pushes. Replaced unconditional Google Identity Services script loading with on-demand dynamic script injection only when Google Drive sync is active.

### v3.7.54

- **Performance & Rendering Optimization (Phase 2)**: Memoized `TaskItem`, `NoteCard`, `PrioritySection`, and `ProjectColumn` components with custom equality comparators to eliminate unnecessary re-renders across task and note lists. Replaced linear project scans with O(1) indexed maps for smoother dragging and list interactions.
- **Granular Storage Persistence & Bounded Photo Caching**: Optimized local storage persistence in `useTasks.js` to only synchronize modified state slices instead of re-serializing the entire archive and active datasets on every state change. Added a bounded 25-item LRU cache and persistent connection pooling for IndexedDB photo storage.

### v3.7.53

- **Performance & Bundle Optimization (Phase 1)**: Introduced intelligent dynamic code-splitting with `React.lazy` and `Suspense` for all modal dialogs and secondary views. Cut initial production entry bundle size by 25% (saving ~65kB gzipped) for faster initial app load and snappy responsiveness on mobile devices.
- **Asset & Storage Streamlining**: Purged over 3.5MB of unused legacy assets, duplicate share images, and unreferenced screenshots from repository and build artifacts, streamlining clean deployments.

### v3.7.52

- **Streamlined Subtasks & Right-Aligned Completion**: Streamlined checklist subtasks across Add Task, Edit Task, Task Item, and Notes views. Moved the completed checkbox from the left to replace the old delete button on the right side. Re-isolated and enlarged the drag handle with dedicated touch and selection safeguards so reordering subtasks never accidentally triggers text selection or focus in the text area.
- **Action Buttons Row Reorganization (Expand & Voice Repositioned)**: Moved the Expand focus editor and Voice (Talk) dictation buttons from the top of the task description title down to the far right of the unified action buttons line (alongside Notes, Subtasks, and Schedule) with generous spacing.
- **Evidentiary Stamp Icon for Notes Timestamps**: Updated the "+ Timestamp" button icon in task notes and the full-screen focus editor to a crisp official stamp icon, replacing the clock face for greater clarity.
- **Dynamic Notes Placeholder on Focus**: The holding placeholder text in the notes entry box now vanishes cleanly as soon as the user clicks or focuses into the text field, providing an uncluttered writing space.

### v3.7.51

- **Streamlined Add Task Controls & Space Optimization**: Removed the redundant Cancel button from the bottom priority button row in the Add Task form, reclaiming valuable horizontal space for priority tier buttons and the Add Task action. Task creation can still be cleanly cancelled at any time via the prominent close cross (✕) in the top right or by pressing the Escape key.

### v3.7.50

- **Active Text Viewport Visibility & Cursor Tracking in Notes and Tasks**: When editing a note attached to a task or typing task descriptions in Add Task and Edit Task modals, the active cursor and newly added text now remain visible inside the viewport at all times. Resolved mobile and desktop issues where adding text to the end of a long note pushed the editing line outside the visible pane or behind the virtual keyboard.
- **Precision Soft-Wrap Line Measuring & Container Auto-Scroll**: Upgraded the internal cursor position tracker with an off-screen typographic measuring mirror that accurately accounts for soft-wrapped sentences without hard returns. Both the internal textarea scroll and the modal container auto-scroll in real time with frame-synchronized alignment during both keyboard typing and voice transcription.

### v3.7.49

- **Voice Dictation Viewport Visibility & Cursor Tracking**: When inserting transcribed text at the beginning or middle of a task description or note using voice mode, the text editor intelligently calculates the cursor insertion point and ensures newly spoken words remain smoothly visible in the viewport instead of forcing the textarea to scroll to the bottom.
- **Search Results Auto-Expansion & Unified Search Close**: Searching for tasks now automatically expands all matching priority sections (Must Do, Should Do, Could Do, On Hold, and Scheduled), ensuring immediate visibility without manual expansion. Streamlined search controls with a single, clear close button on the search bar while keeping the toolbar search icon persistent.
- **Instant Cancel Workflow for Tasks & Notes**: Added clear, unambiguous ways to cancel or dismiss task and note creation at any point. Users can tap the header close "X" button, the dedicated Cancel button next to ADD / Save, or press the Escape key to cleanly discard pending input.

### v3.7.48

- **Uniform "On Hold" Section Heading**: Standardized the On Hold tasks header in the main task list from "ON HOLD TASKS" to simply "ON HOLD", establishing full visual and typographic uniformity alongside Must Do, Should Do, and Could Do sections.
- **Streamlined Archive Row Action Buttons**: Removed the redundant secondary permanent delete button that appeared alongside the Restore button on each archived task row, preserving the dedicated delete button on the left of each task for a cleaner, uncluttered interface.

### v3.7.47

- **Clarified Lightbox Actions, Generous Touch Targets & Spacing**: Simplified and clarified the photo viewer controls by streamlining the "Save to Photos / Share" button to a clear "Share" button for standard system sharing, with generous 38px touch targets, comfortable 12px spacing between action buttons, and clear interactive feedback badges.
- **Reliable Photo Download & Expansive Desktop Lightbox View**: Fixed the photo Download button to reliably export full-resolution images across all desktop and mobile browsers via Blob URLs and IndexedDB hydration. Also resolved images displaying small on desktop monitors by expanding the Lightbox container to up to 1400px wide with aspect-ratio-preserving viewport fitting, and bumped preview thumbnail generation to 480px for sharp previews on high-DPI displays.

### v3.7.46

- **Inline Time Lozenge Wrapping & Clean Section Headings**: When a scheduled time is set on a task, the time lozenge is now rendered inline with the task description, allowing text lines to cleanly wrap directly underneath the lozenge to eliminate awkward gaps and maximize usable space. Also standardized priority list headers by removing the redundant "Show" and "Hide" prefixes from On Hold and Scheduled sections for complete visual uniformity.
- **Modernized Archive Listing, 2-Line Clamping & Safe Edit Flow**: Refined the Archive modal with modernized theme-consistent styling. Archived tasks are now neatly clamped to 2 lines of description for rapid scanning, and clicking an archived task now presents an intuitive confirmation popup prompting to restore it into the live system before opening it in the task editor.

### v3.7.45

- **Concise Calendar Event Titles & Full Details Preservation**: When adding scheduled tasks to Google Calendar or Apple Calendar (.ics), the event title is now cleanly formatted to a concise headline (up to 40 characters) on natural word boundaries without trailing ellipses, allowing you to immediately tap and edit or expand the title in your calendar. The complete original task text and any associated task notes are safely preserved in the calendar event description field so no context is ever lost.

### v3.7.43

- **First-Time User "Getting Started" Guide & Disappearing Helper**: Introduced an intuitive Getting Started function tailored specifically for first-time visitors that links to the beginner-friendly quick-start guide on the website. Directly alleviates new user concerns regarding offline data safety, the 1-2-3 rule, home screen installation, and zero-knowledge device syncing. The Getting Started button in the header and welcome banner automatically disappears once the user begins actively adding, completing, or organizing tasks. Added permanent links to both the Beginner's Guide and the new in-depth Feature Mastery Guide in Settings under App & Updates.

### v3.7.42

- **Frictionless First-Time User Experience & 1-2-3 Starter Onboarding**: Transformed the initial user experience for first-time visitors by eliminating screen-blocking welcome modals and aggressive installation popups. First-time users now land directly into a clean, inviting workspace with a sleek, non-blocking In-Line Welcome Banner introducing the 1-2-3 methodology. Streamlined default sample tasks down to 3 interactive starter tasks demonstrating the Must Do, Should Do, and Could Do tiers. Softened install prompts with consumer-friendly "Add to Home Screen" language and prevented early pop-up interruptions until users have meaningfully engaged with the app.

### v3.7.41

- **Streamlined Recurrence Icon on Schedule Row & Right-Aligned Add Note**: Replaced the textual "Repeat this task" label with a clean Repeat icon toggle, unified directly onto the same line as the schedule time icon to maximize vertical screen space in both Add Task and Edit Task modals. In Notes mode, relocated the Add Note button to the right side of the header bar with generous touch targets for rapid, thumb-friendly note capture.

### v3.7.40

- **Streamlined Timestamp & Time Icons, Optional Creation Timestamp**: Replaced textual timestamp buttons in task notes and fullscreen focus editor with a clean Clock icon to match adjacent tool buttons. Streamlined the time adder in Date & Recurrence scheduling with a minimal clock face and plus icon, removing redundant "(optional)" text. Hid the task creation date and time stamp by default for a cleaner, decluttered task editing view, while adding a new "Task Creation Date & Time" toggle in Settings (Tasks & Workflow) for users who prefer displaying creation timestamps.

### v3.7.39

- **UI Decluttering, Button Display Mode Setting & Compact Footer**: Introduced a cleaner, distraction-free interface by replacing redundant dual icon-and-text labels with streamlined icons by default, spaced with ample touch-safe padding to prevent mis-clicks. Added a new "Feature Buttons & Labels" setting under Appearance & Styling in Settings to toggle between Icons (Clean), Icons & Text, and Text Only across the top bar, task forms, and notes view. Also streamlined the footer by combining the copyright notice and version number into a single compact line.

### v3.7.38

- **Streamlined Footer & Top Bar Achievements**: Removed the achievements trophy badge/link from the footer since it is already readily accessible near the top of the lists view in Tasks mode, giving the footer a cleaner, minimal presentation.

### v3.7.37

- **Direct In-Box Actionable Links & Clean Task View**: Removed the separate cluttered Actionable section when viewing tasks. Phone numbers, email addresses, and web links are now directly linked and interactive inside the task description and notes boxes. Clicking any link immediately calls, emails, or opens the URL without entering edit mode, while clicking anywhere else in the box or tapping the Edit/Done button smoothly transitions into the full text editor.

### v3.7.36

- **Concise Scheduled Time Badge at Start of Tasks**: Tasks with an associated scheduled time now display a small, concise time badge (e.g. 09:00, 2:30 PM) right at the start of the task in the list view across both Pro and Lite views. Provides an instant daily timeline view while keeping the interface clean and space-efficient.

### v3.7.35

- **Complete Active Task Counts in Projects Dropdown**: Audited and refined the active task counts displayed in the Projects dropdown trigger and menu. Project badges now accurately reflect all active tasks across Must Do, Should Do, Could Do, On Hold, and Scheduled & Recurring tasks (including future scheduled dates).

### v3.7.34

- **Full-Width Real-Estate for On Hold & Scheduled Tasks**: Removed the heavy grey box border, background fill, and recessed padding from the On Hold and Scheduled & Recurring task lists. Tasks now render full-width edge-to-edge seamlessly matching the primary priority sections, maximizing visible screen real-estate while maintaining clean collapsible headers with chevron indicators and drop-target responsiveness.

### v3.7.33

- **Chronological Time Ordering & Time Visibility Setting**: Tasks with a scheduled time now automatically appear in chronological time order with the earliest time first, allowing 123ToDo to function like a daily calendar schedule while fully preserving custom drag-and-drop manual reordering. Added a new "Scheduled Task Times" toggle in Settings (Tasks & Workflow) to easily show or hide time selectors and time badges for an even simpler, distraction-free interface.

### v3.7.32

- **Universal Custom Circular Clock Face Time Picker**: Introduced a unified, custom circular clock face time picker across desktop and mobile. Features an intuitive two-step interactive clock dial (hours then minutes), digital time display with direct hour/minute switching, AM/PM toggle, and dial-tap selection for a seamless, consistent experience on all platforms.

### v3.7.31

- **Clean Priority Section Headers**: Removed the redundant "Collapsed" text label from priority section headers in the main task list. Sections maintain clean, uncluttered visual headers with intuitive chevron toggle icons indicating collapse and expansion states.

### v3.7.30

- **Simple Clock Face Time Picker**: Simplified the scheduling time picker to a clean, minimal interface. Clicking the time input opens the intuitive native clock face to easily pick the hour then minutes, eliminating visual clutter while preserving quick Google Calendar and Apple Calendar integration.

### v3.7.29

- **Fast 1-Tap Time Presets & Clean Dropdown Picker**: Upgraded the time picker to make scheduling tasks effortless on both mobile and desktop. Added 1-tap quick preset chips for Morning (09:00), Midday (12:00), Afternoon (14:00), and Evening (18:00), alongside a clean common times dropdown and exact time input, while seamlessly retaining calendar integration.

### v3.7.28

- **Google & Apple Calendar Integration & Automated Reminders**: Added seamless 1-click "Add to Google Calendar" and "Add to Apple Calendar" (.ics) buttons when scheduling tasks. Calendar events automatically include reminder alerts (15-minute advance alert in Apple Calendar and native Google Calendar notifications). Also introduced automated in-app and PWA reminders for due scheduled tasks on desktop and mobile devices, with a preference toggle in Settings.

### v3.7.27

- **Optional Time for Scheduled Tasks**: Added an optional scheduled time alongside the scheduled date in both Add Task and Edit Task modals. Visually minimalist and unobtrusive so it does not clutter the interface for users who only schedule by date, featuring progressive disclosure via "+ Add time", fast clear controls, and chronological date and time ordering.

### v3.7.26

- **Drag-and-Drop Reordering for Due Scheduled Tasks**: Scheduled tasks continue to appear at the top of their priority list when their set due date arrives, but now fully respect custom drag-and-drop reordering without snapping back to the top, allowing users to freely move them anywhere in the list or place other tasks above them.

### v3.7.25

- **Streamlined & Clutter-Free Notes View**: Simplified the Notes view header by removing the achievements badge and settings cog (accessible anytime in Tasks view), neatly aligning the red new note icon on the header row next to projects, and eliminating the redundant Add New Note button below for a cleaner, distraction-free writing experience.

### v3.7.24

- **Continuous Voice Dictation & Word Repetition Elimination**: Resolved speech transcription word duplication and engine stutters during continuous dictation. Added intelligent multi-word and single-word deduplication, seamless interim segment boundary overlap merging, and clean pause recovery across all Talk buttons in Tasks and Notes modes.

### v3.7.23

- **Top Priority Placement for Scheduled Tasks Due Today**: When a scheduled task reaches its set day (or is due today), it is now automatically placed at the top of its priority list, ensuring it is immediately visible and never overlooked even in long lists.

### v3.7.22

- **Chronological Scheduled Tasks Sorting**: Scheduled and recurring tasks in the Scheduled section are now automatically sorted in ascending date order with tasks due the soonest displayed at the top of the list.

### v3.7.21

- **Commercial White-Labeling & Multi-Tenant Branding (Phase 1)**: Introduced an extensible configuration architecture allowing custom branded editions for commercial clients while preserving seamless core app updates for everyone. Supports custom partner footer branding, partner logos, client-specific support/portal links, and client feature flags with instant activation via URL (`?brand=pilot`) and automatic device persistence.

### v3.7.20

- **Styled Projects Dropdown in Notes Mode**: Upgraded the Notes mode project dropdown from a plain native element to the custom styled dropdown matching Tasks mode, complete with dynamic project color borders, colored indicator bands, and formatted note counts.

### v3.7.19

- **Streamlined Notes Toolbar**: Removed the redundant Pro/Lite toggle switch from the Notes view toolbar to match Tasks mode, freeing up screen space for project selection and essential actions. Interface Profile selection (Lite vs Pro) remains fully available and configurable under **Settings > Appearance > Interface Profile**.

### v3.7.18

- **Clean Voice Dictation & Echo Prevention**: Resolved speech recognition text duplication across pauses in Notes mode. Cleaned up recognition instance recycling during natural pauses and pauses between sentences, preventing repeated words, duplicated sentences, and overlapping speech buffers.

### v3.7.17

- **Drag-and-Drop Reordering for On Hold Tasks**: Enabled complete drag-and-drop support for the On Hold tasks section. Users can seamlessly reorder tasks within the On Hold section and drag tasks across priority sections or project columns into and out of On Hold, complete with interactive dashed drop indicators.

### v3.7.16

- **Streamlined Main List Toolbar**: Removed the Pro/Lite interface toggle switch from the main task list toolbar, reclaiming significant horizontal space for the project dropdown and action controls across mobile screens. Interface Profile selection (Lite vs Pro) remains fully available and configurable under **Settings > Appearance > Interface Profile**.

### v3.7.15

- **Restored Drag-and-Drop Task Reordering in Lite Mode**: Re-enabled draggable handlers and task reordering in Lite mode. Users can effortlessly reorder tasks across priority tiers and project columns via drag-and-drop in both Lite and Pro interface profiles, with safeguards ensuring smooth drops without unintended edit modal triggers.

### v3.7.14

- **Adaptive Resolution & Compact Phone Scaling**: Automatic device screen resolution and viewport detection for compact and older phones (such as iPhone SE, iPhone 5/6/7/8, Galaxy A-series, and screens ≤375px wide or ≤640px high). The app automatically adapts base typography, header logo width, modal paddings, task spacing, and touch targets to eliminate cramping and prevent horizontal overflow. Includes a user preference in Settings > Appearance (Auto, Compact, Standard).

### v3.7.13

- **Safe & Clean Lite Notes View**: Removed the expand chevron icon situated immediately adjacent to the archive checkbox in Notes mode Lite view to eliminate accidental taps and completions. Users can effortlessly expand full note details and edit options by simply tapping directly anywhere on the note card or description.

### v3.7.12

- **Safe & Clean Lite Tasks View**: Removed the expand chevron icon situated immediately adjacent to the archive checkbox in Lite tasks view to eliminate the risk of accidental taps and completions. Users can effortlessly access and edit all task details, subtasks, notes, dates, and settings by simply tapping directly anywhere on the task item to launch the full edit modal.

### v3.7.11

- **Truthful & Evidentiary Timestamps Integrity**: Audited timestamp handling across tasks, notes, and archives. Removed legacy fallbacks to sequential numeric IDs that caused false or ancient dates (e.g., 1970). Tasks and notes created prior to timestamp tracking strictly omit timestamp badges unless a genuine creation date was recorded. Added rigorous date validation (`isValidEvidentiaryTimestamp`) ensuring only truthful, modern timestamps are formatted and displayed.

### v3.7.10

- **Unified Expanded Edit Card Across Views**: Clicking any task in Lite view now directly launches the exact same full Pro Task Edit Card (`EditModal`) as in Pro view, ensuring 100% feature and visual parity for task editing (voice dictation mic, priority buttons, project selector, due date & time picker, recurrence settings, subtask checklist with reordering, notes, and photo attachments).
- **Harmonized In-Card Expansion**: Tapping the chevron button in Lite view expands the task inline using the exact standard Pro card layout (project name badge, full description, schedule badge, subtasks, and quick schedule button) with zero divergent styling.

### v3.7.9

- **Enhanced Pro Details & Seamless Card Toggle in Lite Mode**: Clicking any task card or chevron in Lite mode now toggles expansion seamlessly. Expanded cards feature a complete Pro header (priority badge with color indicator, project badge, scheduled/due date with recurrence status, defer count, and photo badge), full unclamped description, interactive subtasks checklist with check-off, formatted notes, and direct access to launch the full Pro Edit Modal via title click or Edit Details button.
- **Mobile Touch Interaction Stabilization**: Streamlined touch handlers on the Lite expand/collapse toggle button, ensuring immediate and reliable tap responsiveness across iOS Safari and Android Chrome.

### v3.7.8

- **Complete Pro Details in Lite View**: In Tasks mode Lite view, clicking any task expands it in-place to display all Pro details: project color tag, unclamped task title, scheduled date & recurrence tags, full subtasks checklist with checkboxes, full multi-line notes, attached photos gallery, and quick action buttons (`Edit Details`, `Schedule / Defer`, `Collapse`).
- **Minimalist Lite Toolbar**: Hid the achievements badge button from the action bar in Lite mode, preserving a distraction-free toolbar.
- **Universal Footer Achievements Badge**: Added the circular achievements badge directly beside the version number in the footer, ensuring 1-tap access to productivity stats and milestones from both Pro and Lite views.

### v3.7.7

- **Header Logo Restored**: Restored the top header logo to its original full size (240px) with clean spacing.
- **Toolbar Pro/Lite Switcher**: Moved the Pro / Lite toggle pill to the secondary toolbar directly between the Projects selector and Achievements badge in both Tasks and Notes modes.
- **Clean 2-Line Lite View**: In Lite mode, task and note cards display up to 2 lines of description only, eliminating secondary badge clutter while retaining the archive/completion checkbox.
- **1-Click Card Expansion**: Clicking any task or note card smoothly reveals all Pro-level controls, subtasks, scheduling, and metadata in place.
- **Clean Notes Timeline by Default**: Notes mode starts with existing notes front and center, collapsing the quick-add editor into a clean `+ Add New Note` button.

### v3.7.6

- **Dual View Modes (⚡ Pro / 🍃 Lite)**: Introduced interface view profile toggle accessible in both the top header and Settings modal, empowering users to switch between a clean minimalist mode and a feature-rich power workspace.
- **Minimalist 2-Line Lite Mode**: Clean 2-line layout across both Tasks and Voice Notes modes. New users start in Lite mode by default with the Must Do list front and center and secondary priorities (Should Do, Could Do, On Hold) collapsed into clean summary headers.
- **Progressive In-Place Disclosure**: 1-tap in-place expansion for tasks and notes revealing full details (subtasks, notes, photo attachments, scheduling, priority picker, and edit tools) with an instant collapse button.
- **Cross-Session View Memory**: Automatically remembers and persists your chosen view profile across sessions.

### v3.7.5

- **Automated Master Changelog Synchronization**: Added automated build hook (`scripts/sync-changelog.js`) that automatically syncs in-app release notes from `constants.js` to `CHANGELOG.md` and the marketing website `123todo-website/src/data/changelog.json`, guaranteeing the public changelog at `123todo.com/changelog` updates with zero manual duplication.

### v3.7.4

- **Comprehensive Release History & Public Web Changelog**: Compiled complete release history from v1.0.0 to present into in-repo `CHANGELOG.md` and added direct navigation link to `123todo.com/changelog` from the in-app update modal.

### v3.7.3

- **Elevated Version Info Modal & Close Controls**: Ensured the "Latest Update Info" modal displays in front of Settings with elevated stacking priority (`zIndex: 2500`), added dedicated close buttons (top-right X and bottom Close button), and expanded release notes to display the last 5 versions.

### v3.7.2

- **Social Share Call-to-Action**: Updated the lowest footer social sharing section with a clearer and more direct call-to-action: *"Share this App and keep it FREE!"*.

### v3.7.1

- **Silent Background App Updates**: New versions now install and activate automatically and silently in the background without intrusive update bars or requiring user button clicks.
- **Clean Footer & Compact Settings Sync**: Moved the prominent sync button from the footer into a compact status button in Settings, keeping the footer minimal while retaining clear versioning (`v{version}`).
- **In-App Version Update History Modal**: Added a "Latest Update Info" button under Settings > App Version & Updates allowing users to view recent release notes on demand.

### v3.7.0

- **1-Click Timestamped Notes**: Quick "+ Timestamp" button in task notes editor and focus modal to append current date & time.
- **Visible Task Creation Timestamps**: Bottom evidentiary creation timestamp displayed in Task Edit Modal.
- **Standardized Top Bar Spacing**: Harmonized icon touch targets and spacing.

### v3.6.0

- **Photo Attachments in Notes & Tasks**: Attach up to 3 photos or screenshots per note on mobile and desktop. Features instant camera capture (`capture="environment"`), file browser, drag-and-drop, direct clipboard pasting (`Cmd+V` / `Ctrl+V`), high-efficiency client-side WebP compression (max 2048px for sharp document legibility), IndexedDB caching, and a full-screen Lightbox viewer with zoom & download.
- **Drag-and-Drop Task Reordering Stabilization**: Resolved pointer event tracking and immediate local state settling, eliminating task snapback issues.
- **Responsive Project Name Line-Wrapping**: Project names in the top header now wrap onto multiple lines cleanly on mobile and compact desktop windows, ensuring the Add Task button and settings icons are never pushed off-screen.
- **Persistent Admin Stats Password Security**: Admin analytics panel credentials now persist safely across version upgrades.
- **Refined Voice Dictation & Notes UI**: Fixed spoken sentence duplication, right-aligned the bold Voice button, renamed Focus Editor to Expand, and defaulted notes on recurring and scheduled tasks to collapsed with 1-click expansion.

### v3.5.2

- **Sync Provider Startup Guard & Optimization**: Startup checks and background polling now only run for your active sync provider, eliminating unnecessary Google Drive checks when syncing via Cloud Sync.
- **Dynamic Provider-Aware Offline Notice**: Offline connection banner dynamically detects and announces your active sync provider ("Cloud Sync" vs "Google Drive").
- **Extended Swipe Action Movement Range & Damping**: Refined swipe-to-act threshold with smoother damping for reliable task actions even during long quick swipes.
- **Widened Project Selectors**: Expanded project selector dropdown in Add Task and Edit modals with dynamic height bounds to accommodate long project lists cleanly.
- **Project Deletion Safety Spacing**: Increased spacing and visual separator between confirmation and delete buttons to prevent accidental project removal.

### v3.5.1

- **10-Tier Level Roadmap & Color-Coded Progress Ladder**: Expandable progression guide in the Achievements Hub detailing all 10 ranks from Focused Starter to 123 Immortal, complete with custom color themes, level descriptions, and point requirements.
- **Featured Streaks & Milestones Blog Guide**: Directly linked our new illustrated guide on *"The Psychology of Productivity Streaks & Milestones"* on 123todo.com.

### v3.5.0

- **Productivity & Achievements Hub**: New trophy badge opening a house-styled modal with 10 progressive achievement tiers (Levels 1–10 with an elite pinnacle), Productivity Points, 6-card productivity insights, daily streaks, 1-2-3 rule balance ratios, unlockable milestone badges, and official 123todo.com blog guides.
- **Drag-and-Drop Subtasks & Line Wrapping**: Multi-line auto-wrapping textareas for subtasks with draggable reordering handles across Add Task, Edit Task, and Task list views.
- **Space-Efficient Note Previews**: Displays the first line of task notes under task titles in a compact, unobtrusive font with 1-tap expansion.
- **Add Task Project Dropdown Styling**: Upgraded native select in Add Task form to match the custom color-accented dropdown from Edit Modal.
- **100% Cross-Platform Synced Metrics**: Streaks, Points, and milestone metrics synchronize automatically across all devices via Cloudflare Sync.

### v3.4.2

- **Accelerated Background Sync Intervals**: Upgraded background polling speeds across standard adaptive sync tiers (30s default, 60s moderate, 120s heavy).

### v3.4.1

### v3.4.0

- **Project Columns View in Wide Mode**: Added layout option to view wide-screen Kanban columns grouped by custom Projects instead of Priorities, with smooth horizontal scrolling and full browser width expansion.
- **Precision Drag-and-Drop Drop Line Alignment**: Aligned task insertion position during drag-and-drop to match the target drop indicator line precisely.

### v3.3.1

- **Dual Encrypted Cloud Sync**: Expanded zero-knowledge sync options covering Cloudflare D1 E2EE alongside Google Drive AppData Sync.

### v3.3.0

- **Multi-Competitor Migration Wizard**: Universal 1-click import supporting Todoist, TickTick, Google Keep, Google Tasks, and Microsoft To Do with zero text truncation.

### v3.2.0

- **Expanded Social Sharing**: Integrated native Web Share image card sharing with support for Bluesky, Threads, Reddit, Telegram, and Pinterest.

### v3.1.6

- **Task-First Notes & Inline Subtask Editing**: Bumped default text size to 14pt, routed notes entry directly to task fields, and added inline subtask text editing.

---

## 📄 License & Credits

**Copyright © Darron Hartas / Unforgettable Management Ltd 2026. All rights reserved.**  
Engineered with React 19, Lucide Icons, and Framer Motion via **Google Antigravity** natural language workflows.
