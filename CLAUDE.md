# 123 ToDo — AI Assistant Guide & Architecture

## Overview
**123 ToDo** is a React Progressive Web App (PWA) for task management featuring drag-and-drop, customizable swipe gestures, Google Drive end-to-end encrypted sync, subtasks/recurrence, and Todoist CSV imports.

- **Version**: v2.5.11
- **Tech Stack**: React 19.x, Create React App, lucide-react, framer-motion
- **Live URLs**:
  - Primary: https://app.123todo.com
  - Legacy: https://123todo.com

## Architecture
```
src/
├── components/          # Modular UI components (layout, tasks, projects, modals)
│   ├── modals/          # SettingsModal, SyncModal, SyncDroppedModal, TodoistGuideModal, EditModal, etc.
│   ├── projects/        # ProjectTabs
│   ├── tasks/           # TaskItem, PrioritySection, AddTask, SearchBar
│   └── layout/          # Header, Footer, NotificationBar, SocialShare
├── hooks/               # State & business logic
│   ├── useTasks.js      # Tasks, archived, projects, shadow backups, local storage
│   ├── useGoogleDriveSync.js # Encrypted Google Drive sync, token drop detection
│   └── useAppSystem.js  # Milestones, PWA update detection, persistent storage
└── utils/               # Constants, crypto, date utilities, syncUtils, voiceUtils
```

## Automated CI/CD & Git Commit Workflow

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`).

### Assistant Rule for Git Commits & Deployment Verification:
Whenever the user asks to "commit to git" or "commit":
1. **Stage & Commit**:
   ```bash
   git add <files>
   git commit -m "<descriptive message>"
   ```
2. **Push to Remote (CRITICAL)**: Always execute `git push origin main` with `BypassSandbox: true` (network bypass enabled).
3. **Automated Deployment Verification (MANDATORY)**: Immediately after pushing, check the GitHub Actions workflow run status via GitHub REST API:
   ```bash
   curl -s "https://api.github.com/repos/darronhartas-max/123todo-react/actions/runs?per_page=1"
   ```
   - Verify `status` reaches `"completed"` and `conclusion` is `"success"`.
   - Confirm `head_sha` matches the pushed commit.
   - If the build fails (`conclusion: "failure"`), fetch log details, fix the root cause immediately, and push the fix.

### Assistant Rule for Version Bumps & Release Changelog:
Whenever bumping the application version (`APP_VERSION`):
1. Update `APP_VERSION` in `src/utils/constants.js`, `package.json`, `package-lock.json`, and `CLAUDE.md`.
2. Add the release highlights to `RELEASE_CHANGELOG` in `src/utils/constants.js`. This ensures the post-update modal (`UpdatedModal.js`) dynamically presents accurate "What's New" highlights for the user's specific version update.

## Core Features & Systems
- **Priority System**: P1 Must Do (#dc2626), P2 Should Do (#f59e0b), P3 Could Do (#6b7280), P4 On Hold (#9333ea).
- **Google Drive Sync**: Client-side AES-256-GCM encryption (`crypto.js`), 2-way multi-device dataset merge engine (`syncUtils.js`), auto-token drop detection (`isSyncDropped`), single-tap re-auth popup modal (`SyncDroppedModal.js`).
- **Projects**: Custom project tabs with color bands, HTML5 drag-and-drop project reordering in Settings (`GripVertical`).
- **Updates**: Persistent version upgrade tracking (`123Todo_Last_Seen_Version`), automatic PWA update banner + 1-click "Check for Updates" control in Footer & Settings header (`v2.5.8`).
- **Voice Task & Voice Notes**: Web Speech API continuous dictation with spoken punctuation recognition ("full stop", "comma", "question mark", etc.) & overwrite-proof speech buffer (`v2.5.5`).
- **Archive Button & Section Typography Refinement**: Simplified trigger label to "Open Archive" and reduced section title font sizes for Archive, Scheduled, and On Hold sections (`v2.5.11`).
- **Project Deletion Sync Fix**: Permanent tombstone tracking for deleted projects during 2-way Google Drive sync (`v2.5.10`).
- **Font Persistence & Full-Screen Archive Modal**: Font size setting persistence across reloads, full-screen responsive `ArchiveModal` with real-time search & project filters, and 2-way sync task restoration fix (`v2.5.9`).
- **Gesture Lock & Archive Fix**: Vertical scroll/pull-to-refresh gesture lockout & 100% complete archive visibility (`v2.5.8`).
- **Date Format Preference**: User configurable date ordering (`UK`, `US`, `ISO`, `UK Text`, `US Text`) under Settings ➔ Appearance (`v2.4.17`).
- **Task Description Length Preference**: User customizable task description length (`250` chars default or `Unlimited`) under Settings ➔ Appearance (`v2.5.0`).
- **Voice Task Input**: Web Speech API dictation with smart priority (P1-P4) & project keyword parsing (`v2.5.1`).
- **Todoist Migration**: Multi-project CSV import wizard + interactive `TodoistGuideModal` step-by-step guide (`v2.4.16`).
- **SEO & Schema.org**: JSON-LD `SoftwareApplication` structured data, Open Graph, Twitter Cards, canonical URL tags (`v2.5.0`).
- **Swipe Gestures**: Touch & trackpad swipe gestures with Todoist-style dual-stage visual activation, spring icon animation, and compact action hints (`v2.5.0`).
