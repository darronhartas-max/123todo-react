# 123 ToDo — User & Architecture Guide

> **A fast, free, private Progressive Web App (PWA) for tasks, projects, and voice notes.**  
> Version **3.5.0** | © Unforgettable Management Ltd 2026 | [app.123todo.com](https://app.123todo.com)

---

## 🌟 Highlights & Key Advantages

- **100% Free & Uncapped**: Priority matrix (P1–P4), recurring tasks, subtasks, unlimited projects, and unlimited notes without subscription paywalls.
- **Productivity & Achievements Hub**: Top header trophy badge opening an interactive house-styled modal with XP progression, 6-card productivity insights, daily streaks, 1-2-3 rule balance ratios, unlockable milestone badges, and official 123todo.com blog guides.
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

- Continuous listening with speech accumulation buffers (no truncation during thinking pauses).
- Natural language spoken commands: _"delete last word"_, _"scratch that"_, _"add task"_, _"save note"_.
- Automatic punctuation conversion (_"comma"_, _"full stop"_, _"question mark"_, _"new line"_).

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

1. **Lint & Prettier Compliance**: Ensure zero linter errors or Prettier violations before pushing.
2. **Push to Origin**:
   - App: `darronhartas-max/123todo-react`
   - Website: `darronhartas-max/123todo-website`
3. **Automated CI Verification**: Check deployment status via GitHub REST API:
   ```bash
   curl -s "https://api.github.com/repos/darronhartas-max/123todo-react/actions/runs?per_page=1"
   curl -s "https://api.github.com/repos/darronhartas-max/123todo-website/actions/runs?per_page=1"
   ```
   Confirm `status: "completed"` and `conclusion: "success"`.

### Version Bumping Protocol:

When releasing a new version:

1. Update `APP_VERSION` across `src/utils/constants.js`, `package.json`, `package-lock.json`, and `README.md`.
2. Add the release highlights to `RELEASE_CHANGELOG` in `src/utils/constants.js` to ensure the dynamic in-app "What's New" modal updates accurately.

---

## 🔒 Privacy, Security & Data Protection

- **Local-First Storage**: Tasks and notes reside in browser `localStorage` protected with Persistent Storage API.
- **Zero Third-Party Tracking**: No cookies, no IP logging, zero personal identification data collected.
- **On-Device Voice Processing**: Web Speech API processes audio entirely in-browser; zero sound data is recorded or transmitted.
- **Recovery Protection**: Daily automated 24-hour Shadow Backups and 1-click JSON backup export/restore.

---

## 🔄 Recent Release Highlights

### v3.5.0 (Current)

- **Productivity & Achievements Hub**: New trophy badge opening a house-styled modal with XP progression (Levels 1–6), 6-card productivity insights, daily streaks, 1-2-3 rule balance ratios, unlockable milestone badges, and official 123todo.com blog guides.
- **Drag-and-Drop Subtasks & Line Wrapping**: Multi-line auto-wrapping textareas for subtasks with draggable reordering handles across Add Task, Edit Task, and Task list views.
- **Space-Efficient Note Previews**: Displays the first line of task notes under task titles in a compact, unobtrusive font with 1-tap expansion.
- **Add Task Project Dropdown Styling**: Upgraded native select in Add Task form to match the custom color-accented dropdown from Edit Modal.
- **100% Cross-Platform Synced Metrics**: Streaks, XP, and milestone metrics synchronize automatically across all devices via Cloudflare Sync.

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
