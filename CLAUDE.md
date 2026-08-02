# 123 ToDo - Project Overview & Deployment Plan

## Project Summary
**123 ToDo** is a React-based Progressive Web App (PWA) for task management with offline support, priority-based organization, and achievement tracking.

## Current Status
- **Version**: v2.4.12
- **Tech Stack**: React 19.x, Create React App, lucide-react, framer-motion
- **State**: Production Refactor Complete (2026-02-21), Google Drive Sync Active
- **Data Storage**: Browser localStorage (client-side only)
- **Git**: Automated backup to GitHub via `post-commit` hook
- **Live URL**: https://app.123todo.com

## Key Features
1. **4-Level Priority System**
   - Must Do (Priority 1) - Red
   - Should Do (Priority 2) - Orange
   - Could Do (Priority 3) - Gray
   - On Hold (Priority 4) - Purple

2. **Task Management**
   - Add, edit, complete, archive, restore tasks
   - 200 character limit per task title
   - Unlimited-length notes field per task (ideal for full Todoist migrations)
   - Drag-and-drop reordering within and across priorities
   - Sample tasks for new users

3. **Engagement Features**
   - Milestone celebrations (5, 10, 15 tasks/day)
   - Weekly backup reminders
   - PWA installation prompts
   - Welcome screen with terms of use
   - Social sharing widget in footer (X, Facebook, LinkedIn, Email)

4. **Data Management**
   - JSON export/import for backup
   - All data stored in browser localStorage
   - Project structure preserved in backups
   - **Todoist Import Wizard**: 3-step CSV import — upload, map projects, confirm

5. **Advanced Features (v1.1)**
   - **Project Layer**: Custom project tabs with color coding
   - **Live Search**: Instant filtering across all tasks
   - **Mobile Optimization**: High-positioned modals and scaled UI for accessibility

## Architecture
```
123todo-react/
├── public/
│   ├── 123-logo-500px.jpg    # Main logo
│   └── ...
├── src/
│   ├── components/            # Modularized UI components
│   │   ├── layout/            # Header, Footer, Social, Notifications
│   │   ├── tasks/             # TaskItem, PrioritySection, AddTask, Search
│   │   ├── projects/          # ProjectTabs (New v1.1)
│   │   └── modals/            # Edit, Welcome, Congrats
│   ├── hooks/                 # Business logic & state management
│   │   ├── useTasks.js        # Core task & project logic
│   │   └── useAppSystem.js    # Milestones & PWA logic
│   ├── utils/                 # Shared constants & global styles
│   ├── App.js                 # Orchestration component (Cleaned)
│   └── index.js               # Entry point
└── package.json               # v2.1.0
```

## Automated Deployment & Git Commit Workflow (CI/CD)

The application features fully automated deployment via GitHub Actions (`.github/workflows/deploy.yml`).

### Automated Workflow Rules for Assistant:
Whenever the user requests to "commit to git" or "commit":
1. **Stage files**: `git add <files>`
2. **Commit**: `git commit -m "<descriptive message>"`
3. **Push to Remote (CRITICAL)**: Always execute `git push origin main` with `BypassSandbox: true` (network bypass enabled). This ensures the push to GitHub succeeds despite sandbox restrictions, automatically triggering the `.github/workflows/deploy.yml` pipeline on GitHub Actions to build, transfer, and restart the Docker container on the VPS (`51.195.136.55`).

### Primary & Legacy Live URLs:
- **Primary**: https://app.123todo.com (Subdomain deployment)
- **Legacy**: https://123todo.com (Original deployment)

### VPS Architecture (Discovered 2025-10-10)

**Docker Setup:**
- Traefik reverse proxy (separate compose project at `/srv/traefik/`)
- WordPress + 123todo apps (compose project at `/home/debian/wordpress-docker/`)
- Networks: `traefik_proxy` (connects all services)

**Key Directories:**
- **Primary app files**: `/home/debian/wordpress-docker/app-123todo/`
- **Legacy app files**: `/home/debian/wordpress-docker/todo-app/`
- Traefik config: `/srv/traefik/docker-compose.yml`
- Dynamic routing (primary): `/etc/traefik/dynamic/app-123todo.yaml`
- Dynamic routing (legacy): `/etc/traefik/dynamic/123todo.yaml`
- Compose file: `/home/debian/wordpress-docker/docker-compose.yml`
- Dockerfiles: `/home/debian/wordpress-docker/Dockerfile.app` and `Dockerfile.todo`

**Container Details:**
- **Primary Container**: `app-123todo` → https://app.123todo.com
  - Built from: `Dockerfile.app`
  - Upload to: `/home/debian/wordpress-docker/app-123todo/`
  - Network: `traefik_proxy`
- **Legacy Container**: `todo-app` → https://123todo.com
  - Built from: `Dockerfile.todo`
  - Upload to: `/home/debian/wordpress-docker/todo-app/`
  - Network: `traefik_proxy`
- Base image: `nginx:alpine` serving static files
- Routing: Traefik handles SSL via Let's Encrypt (certResolver: letsencrypt)
- **Important**: Containers use built images, so changes require rebuild

---

**Last Updated**: 2026-07-12 (v2.2.1 — Unlimited Notes & Todoist Import Wizard)
**Project Owner**: Darron Hartas
**License**: © Darron Hartas 2026
**Live URLs**:
- **Primary**: https://app.123todo.com
- **Legacy**: https://123todo.com

## Version History

### v2.4.12 (2026-08-01)
- **UX**: Streamlined update notification panel to a single top banner (`UpdateReadyPrompt`). Removed redundant bottom banner and removed alarming pre-update backup warning text for a clean, reassuring user experience.

### v2.4.11 (2026-08-01)
- **UX**: Permanently disabled redundant weekly backup reminder popups in `useAppSystem.js` since real-time Google Drive sync, 24h internal shadow backups, and the browser persistent storage API safeguard user data automatically.

### v2.4.10 (2026-08-01)
- **Fix**: Memoized `availableProjects` in `App.js` and added `hasOpenedRef` flag in `AddTask.js` to prevent `inputRef.focus()` from firing repeatedly on re-renders, resolving the mobile issue where the native project select dropdown contracted prematurely.

### v2.4.9 (2026-08-01)
- **UX**: Removed automatic `SKIP_WAITING` postMessage from `serviceWorkerRegistration.js` so background PWA updates no longer auto-reload unexpectedly. Users now explicitly choose when to apply updates via the "🚀 New 123 ToDo update is ready! [Update Now]" button.

### v2.4.8 (2026-08-01)
- **Perf**: Added instant mobile touch event listeners (`touchend` & `touchcancel`) to trigger 50ms Google Drive sync pushes on touch release, resolving mobile Safari/Chrome touch timer throttling on reorders & swipes.

### v2.4.7 (2026-08-01)
- **UI**: Compacted Manage Projects list layout in Settings (padding reduced to 6px 12px, margin-bottom to 4px, action buttons to 28px) fitting 13+ projects directly into view without scrolling.

### v2.4.6 (2026-08-01)
- **UI**: Added a prominent, high-contrast ON/OFF status banner card at the top of the Swipe Settings tab.
- **UX**: Removed unused P1, P2, and P3 priority swipe options to keep swipe action configuration concise.

### v2.4.5 (2026-08-01)
- **Fix**: Resolved JSX closing tag syntax error in `SettingsModal.js` to ensure clean production builds on GitHub Actions.

### v2.4.4 (2026-08-01)
- **Fix**: Added PWA Service Worker auto-update (`SKIP_WAITING` & `controllerchange` auto-reload) so mobile devices and laptops automatically receive new app releases upon launch without manual cache clearing.
- **UI**: Added a floating "🚀 New 123 ToDo update is ready!" banner in `App.js` when an update is available.

### v2.4.3 (2026-08-01)
- **Perf**: Ultra-fast Google Drive sync — reduced local push debounce to 300ms and active tab polling frequency to 4s.
- **Fix**: Added concurrency guard `isSyncingRef` to guarantee network requests never race or overlap during ultra-fast sync.
- **Feature**: Added `pointerenter` listener to check Google Drive metadata instantly when mouse returns to the window.

### v2.4.2 (2026-08-01)
- **Perf**: Accelerated Google Drive local change push debounce from 3.0s down to 800ms for near-instant upload.
- **Perf**: Increased active tab polling frequency from 60s down to 15s to pull cross-device updates rapidly without heavy data usage.
- **Feature**: Added network reconnection listener (`online` event) to sync Google Drive instantly upon device reconnect.

### v2.4.1 (2026-08-01)
- **Perf**: Shortened task item completion/archiving delay from 1.5s down to 600ms for faster, punchier user interaction feedback.
- **UX**: Removed the full-screen background blur and dark overlay from the completion toast notification to prevent screen distraction when completing tasks.

### v2.4.0 (2026-08-01)
- **Feature**: Added customizable **Task Swipe Gestures**. Users can swipe left or right on task cards to quickly complete, delete, edit, or re-prioritize tasks (P1, P2, P3, P4).
- **Feature**: Added a new **Swipe Settings** tab in Settings with Enable/Disable toggle, action pickers, and a live interactive demo card.
- **UI**: Streamlined Settings modal sidebar and tab navigation for expandable future settings tabs, including horizontal scrollable pill tabs on mobile.
- **UI**: Expanded Manage Projects list view container height and turned "Create New Project" into a collapsible button to maximize project visibility without scrolling.

### v2.3.9 (2026-08-01)
- **Feature**: Reduced task item completion/archiving delay from 2.0s to 1.5s for faster, punchier user interaction.
- **Feature**: Defaulted newly added task project to the last entered project to save user entry time.
- **Feature**: Expanded task description input field in Add Task drawer with auto-resizing height up to 140px.
- **Fix**: Prevented unprompted Google Sign-In popups on app startup and token expiration, enabling silent background token refresh (`prompt: 'none'`).
- **Feature**: Added focus blur to Search and Project sections when Add Task is open while keeping header close toggle clear.
- **Feature**: Added Move Up (▲) and Move Down (▼) project reordering controls in Settings.

### v2.3.8 (2026-07-16)
- **Fix**: Replaced hardcoded light-mode `rgba(37, 99, 235, 0.05)` inactive background on the 📅 Schedule and 📋 Subtasks toggle buttons in both `EditModal.js` and `AddTask.js` with `transparent` background and a `1px solid var(--accent-color)` border, ensuring the buttons are clearly visible in dark mode.
- **Fix**: Updated the "Clear Date" button in `EditModal.js` to use `var(--border-color)` and `var(--text-color)` instead of hardcoded `#e5e7eb` / `#333`, preventing it from being invisible on dark backgrounds.

### v2.3.7 (2026-07-16)
- **Feature**: Styled the webkit-calendar-picker-indicator globally in `index.css` to invert and increase brightness when dark theme is active, making browser-native date input calendar drop triggers clearly visible.

### v2.3.6 (2026-07-16)
- **Feature**: Re-styled and brightened the calendar icon button on task cards in dark mode. Shifted `--accent-color` in dark mode from steel blue (`#5289b4`) to a vibrant, high-contrast light blue (`#60a5fa`).
- **Feature**: Styled the calendar button border and background dynamically based on CSS theme variables with 1.0 opacity, guaranteeing high-contrast visibility.

### v2.3.5 (2026-07-16)
- **Feature**: Removed the restriction requiring a start date to be set before enabling recurrence scheduling. Users can check "Repeat this task" immediately. Checking it automatically defaults the start date to today's date if empty.
- **Feature**: Added weekday date snapping. When selecting specific recurrence weekdays (e.g. repeat every Monday), the start date automatically snaps in real time to the next upcoming selected weekday in both `AddTask.js` and `EditModal.js` forms, reducing scheduling steps and friction.

### v2.3.4 (2026-07-16)
- **Feature**: Hid calendar details text badges (scheduled date, recurrence text, and deferral counts) in the primary active list views (Must, Should, Could, On Hold lists) to keep task cards completely clean and uncluttered. Pushed these details to render only inside the Scheduled Tasks list drawer using a dynamic `showFullDetails` toggle prop.

### v2.3.3 (2026-07-16)
- **Feature**: Removed the inline subtask checklists from task cards to conserve dashboard screen real-estate. The progress bar indicator and step count (`Steps: 1/3 (33%)`) remain on the card to indicate progress, while detailed checking off/editing of steps is accessed by clicking on the task (which opens the Edit Modal).

### v2.3.2 (2026-07-16)
- **Feature**: Hid the calendar Quick Defer button on the task card by default. The calendar icon button is now only shown on the list page if the task already has a scheduled date attached to it.
- **Feature**: Refactored the calendar icon button styling on cards (border and subtle background accent color) to ensure clear contrast in dark mode.
- **Feature**: Enlarged the font sizes for Notes, Subtask checklist items/inputs/buttons, and Scheduling recurrence options in both `AddTask.js` and `EditModal.js` to improve readability.

### v2.3.1 (2026-07-16)
- **Feature**: Added a background blur filter container around active lists, on hold, scheduled drawer, and archive drawers. When the Add Task section is expanded, the rest of the application list page blurs and dims dynamically for absolute focus.
- **Feature**: Added a quick calendar button on the task item list card which opens an inline browser-native calendar date picker for quick deferral/rescheduling.
- **Feature**: Displayed option buttons (Notes, Subtasks, Schedule) in `AddTask.js` immediately when the Add Task drawer is opened, allowing users to pre-schedule, add recurrence, or write checklists before typing task content.

### v2.3.0 (2026-07-16)
- **Feature**: Added **Subtasks & Checklist** capability. Users can break down large tasks into smaller steps inside Add/Edit forms, track progress via visual cards indicators/progress bars, and check off steps directly from the main view card.
- **Feature**: Added a **Scheduled & Recurring Tasks** system. Users can schedule tasks for future dates and configure detailed recurrence rules (e.g. daily, weekly on specific days, every N weeks/months/years). Added a new collapsible drawer for future-scheduled tasks placed between On Hold and Archive sections.
- **Behavioral Nudge**: Implemented an automated anti-procrastination popup nudge suggesting task division when an active task is deferred to the future more than twice.

### v2.2.8 (2026-07-16)
- **Fix**: Updated sample task instructions in `useTasks.js` to state that tasks can be dragged to reorder them and move them between priority lists (now that drag-and-drop between priority lists is supported).

### v2.2.7 (2026-07-16)
- **Feature**: Replaced the shared file extension with `.txt` and mime-type with `text/plain` for file sharing options to resolve restrictions on Android/iOS where raw `.json` files are blocked in sharing targets.
- **Feature**: Updated file import input `accept` parameters to allow uploading `.txt` text files in addition to `.json` files.

### v2.2.6 (2026-07-16)
- **Fix**: Refined the `ExportModal` sharing logic. When direct file sharing throws an error (e.g. desktop Chrome on macOS where `navigator.canShare` is supported but the browser cannot execute sharing due to missing OS/browser hooks), it now automatically falls back to copying the JSON to the clipboard and launching the user's default email client with clear guidance.

### v2.2.5 (2026-07-16)
- **Feature**: Added a new `ExportModal` that opens when exporting data manually.
- **Feature**: Integrated the File System Access API (`showSaveFilePicker`) for desktop Chrome/Edge users, allowing them to choose a custom folder location and save the backup directly, which is remembered for subsequent exports.
- **Feature**: Integrated the Web Share API (`navigator.share`) for mobile and Safari/macOS users to directly share or email their backup file as an attachment. Added email clipboard copy fallback for other browsers.

### v2.2.4 (2026-07-16)
- **Feature**: Added a dedicated post-update verification modal (`UpdatedModal`) showing the old vs new version number upon successful update.
- **Fix**: Synchronized service worker update activation with page reload by listening to the `controllerchange` event to guarantee immediate assets refresh and correct footer version rendering.

### v2.2.3 (2026-07-16)
- **Feature**: Added a "Shortcuts" tab to SettingsModal to display keyboard shortcuts list for users.
- **Fix**: Prevented global keyboard shortcuts from firing if command, control, or alt modifier keys are active, preventing conflicts with browser shortcuts (e.g. Cmd+Q).

### v2.2.2 (2026-07-16)
- **Feature**: Reduced Google Drive sync authorization prompt frequency by caching the access token and its expiration in `localStorage`.
- **Feature**: Stored exact local JS timestamps in Google Drive file `description` metadata to prevent redundant sync operations and clock skew issues.
- **Feature**: Disabled weekly backup reminder banner when Google Drive Sync is active and authenticated.
- **Fix**: Implemented robust task ID validation and auto-sanitization on storage load and import to prevent duplicate tasks after editing.

### v2.2.1 (2026-07-12)
- **Feature**: Removed the 2,048-character cap on task notes — notes are now unlimited length, ensuring large Todoist descriptions import and display without truncation or breakage in the Edit modal.
- **Feature**: Complete Todoist import wizard (3-step: Upload → Map Projects → Confirm).
  - Drag-and-drop on upload zone now works correctly.
  - `TYPE=section` and `TYPE=note` rows filtered out at parse time (no more ghost tasks).
  - `DATE` column appended to task notes as `📅 Due: …`
  - `INDENT` column respected — sub-tasks prefixed with `↳`.
  - Fuzzy project name matching pre-selects best existing project per CSV file.
  - Case-insensitive duplicate project guard before creating new projects.
  - `handleTodoistImportData` updated to use `targetProjectId` from mapping step.

### v2.2.0 (2026-07-08)
- **Feature**: Added Todoist CSV import wizard supporting project mapping (Phase 1 + 2).

### v2.1.13 (2026-07-07)
- **Feature**: Added `purpose: "any maskable"` to PWA icons in `manifest.json` to prevent Android/Pixel devices from displaying the launcher icon inside a double-padded white circle badge (enabling full-bleed adaptive icons).

### v2.1.12 (2026-07-07)
- **Fix**: Added cache-busting parameter to `manifest.json` link in `index.html` to force Google WebAPK server to pull the updated icon paths.

### v2.1.11 (2026-07-07)
- **UX**: Removed the dark logo preview file from public directory after verification to clean up production static assets.

### v2.1.10 (2026-07-07)
- **UX**: Refined the dark theme logo so that both the text and the checkmark/tick icon (ring and stroke) are rendered in solid white on a completely transparent background.

### v2.1.9 (2026-07-07)
- **Fix**: Added cache-busting query parameter `?v=2.1.8` to icon paths in `index.html` and `manifest.json` to force browser and PWA system launcher icon updates.

### v2.1.8 (2026-07-07)
- **Feature**: Cropped excess white margins (60px-150px) around favicons and PWA system app icons (`logo512.png`, `logo192.png`, `favicon.ico`, `favicon.png`, and `icon.jpg`), maximizing their screen space and visual size on mobile devices.

### v2.1.7 (2026-07-07)
- **Feature**: Added transparent light and dark theme logo variants (`123-logo-500px-light.png` and `123-logo-500px-dark.png`) generated dynamically from the original.
- **UX**: Hooked up logo to dynamic theme changes, rendering the dark theme white-text logo when dark mode is active.
- **Testing**: Fixed Jest test suite execution by adding polyfills for `TextEncoder`, `TextDecoder`, and `window.matchMedia` in `setupTests.js`.

### v2.1.6 (2026-07-07)
- **Fix**: Resolved parameter mismatch bug in SettingsModal project creation where dynamic onAddProject was passed an object instead of separate name and color parameters.

### v2.1.5 (2026-07-07)
- **UX**: Cleaned up the projects list debug print from SettingsModal after verifying state and renaming.

### v2.1.4 (2026-07-07)
- **UX**: Added dynamic project listing debug print in SettingsModal under "Manage Projects" to verify state loading.

### v2.1.3 (2026-07-07)
- **Feature**: Switched font-size scaling to points (`pt`), setting a slider range of `8pt` to `20pt` with `12pt` default (equivalent to `16px`). Added auto-migration to map previous `px` values.
- **Feature**: Rescaled layout widths: set the smallest option to `480px` (matching mobile phone dimensions) and removed the oversized `1200px` option. Added auto-migration to map previous widths.

### v2.1.2 (2026-07-07)
- **UX**: Shifted the fallback "General" project from a hardcoded default constant to a dynamic project in the database. This allows it to show up in the Settings modal, enabling users to rename it (e.g., to "In Box") and change its color.
- **Fix**: Added dynamic data migration to automatically inject the "General" project into the user's project list on load or sync import if it is missing.

### v2.1.1 (2026-07-07)
- **Fix**: Added legacy migration layer to automatically transfer custom `categories` from older local storage data or Google Drive sync payloads to new `projects` storage.
- **Fix**: Resolved casing and name discrepancies in project lookups, making matches case-insensitive.
- **Fix**: Resolved Todoist CSV import bug where tasks under pre-existing projects defaulted to "General" (returned `undefined` instead of ID).
- **Fix**: Restructured CSS rendering order in `TaskItem` so shorthand `border` properties do not overwrite the color-coding of `borderLeft`.
- **UI**: Widened vertical color border on tasks from 4px to 6px for improved readability.
- **UI**: Enlarged and spaced out edit/delete buttons in settings modal to prevent accidental project deletions.
- **UI**: Expanded the default project color palette to 18 premium options.

### v2.1.0 (2026-07-07)
- **Feature**: Added custom **Appearance Preferences** (font size slider, cozy vs. compact density, theme overrides).
- **Feature**: Added dynamic **Desktop Kanban Board** layout supporting multi-column priority lists.
- **UX**: Built a comprehensive, tabbed settings dialog replacing the simple project modal.
- **UX**: Integrated inline project details editor (name & color dot picker) directly within settings.

### v2.0.2 (2026-07-06)
- **Feature**: Implemented **Google Drive Sync** for seamless, free, cross-device synchronization.
- **Security**: Added zero-knowledge AES-256-GCM client-side encryption for user data before upload.
- **Integration**: Utilized Google Identity Services for OAuth and Google Drive v3 REST API (appDataFolder).
- **UX**: Persistent authentication state across sessions with silent sign-in.
- **UX**: Dynamic sync button in footer (green for active, red for inactive, invisible background syncing).

### v1.4.3 (2026-07-06)
- **UI**: Enlarged social share footer icons by another 20% (to 31px).
- **UI**: Changed header active task counter text from "tasks" to "active" (e.g. "5 active") for clean mobile spacing.
- **UI**: Replaced native HTML select with a custom React dropdown select, showing a vertical color band next to each category option.
- **UI**: Increased custom dropdown maxHeight constraint to 480px to display up to 12 categories without scrolling.
- **UI**: Enlarged Settings icons in category tabs and dropdowns by 20% (to 22px / 20px).
- **UI**: Enlarged task restore and delete icons in Archive list by 20% (to 20px) for easier tapping.
- **UI**: Enlarged task Notes expand/collapse button (to 36px) and Plus/Minus icons (by 50% to 21px) to prevent accidental edit triggers.
- **UX**: Implemented "Restore from Shadow Backup" button in Import options with confirmation/review modal showing data details and active task list preview.

### v1.4.2 (2026-07-06)
- **UI**: Scaled up all text sizes by 1pt globally via base HTML font-size of 17px.
- **UI**: Widened edit task modal to 500px (max-width 95% on mobile) for better screen utilization.
- **UI**: Enlarged header add task toggle button by 15% (to 28px) and colored it brand red (#dc2626).
- **UI**: Enlarged social share footer icons by 20% (to 26px) and restructured footer spacing/margins.
- **UX**: Replaced completion circle with checkbox; added 2s archive delay with cancel capability.
- **UX**: Added centered modal confirmation toast ("Moved to Archive") displaying for 2 seconds.

### v1.1.0 (2026-02-21)
- **Feature**: Implemented **Project Layer** with custom names and 7-color palette
- **Feature**: Added **Horizontal Tab Navigation** for project filtering
- **Feature**: Integrated **Live Search** bar for instant task discovery
- **UI**: Increased all text sizes by ~10% for improved premium feel and readability
- **UI**: Moved modals to top of screen (20px padding) for better mobile accessibility
- **UI**: Enlarged social icons (18px) and added significant spacing in footer
- **Architecture**: Complete refactoring from a single fat component to modular architecture
- **Clean Code**: Extracted `useTasks` and `useAppSystem` hooks
- **DEX**: Configured Git hooks for automatic backup and remote synchronization
- **Maintenance**: Automated copyright year in footer (now dynamic)

### v1.0.7 (2025-10-12)
- Fixed favicon display issues (now using proper favicon.ico)
- Updated all app icons (192px, 512px) with new design without whitespace padding
- Improved Archive section scrolling (now expands like On Hold)
- Reduced social share footer height by 50% (more compact design)
- Auto-focus on task input when + button clicked
- Redesigned task entry buttons to fit on single row on mobile
- Changed "Add Task" button text to "ADD" with bolder styling
- Updated social share message to "Keep this App free - please SHARE!"
- Changed all social share URLs from app.123todo.com to 123todo.com
- Smaller icon sizes (14x14) and reduced padding throughout share footer
