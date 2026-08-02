# 123 ToDo — AI Assistant Guide & Architecture

## Overview
**123 ToDo** is a React Progressive Web App (PWA) for task management featuring drag-and-drop, customizable swipe gestures, Google Drive end-to-end encrypted sync, subtasks/recurrence, and Todoist CSV imports.

- **Version**: v2.4.15
- **Tech Stack**: React 19.x, Create React App, lucide-react, framer-motion
- **Live URLs**:
  - Primary: https://app.123todo.com
  - Legacy: https://123todo.com

## Architecture
```
src/
├── components/          # Modular UI components (layout, tasks, projects, modals)
│   ├── modals/          # SettingsModal, SyncModal, SyncDroppedModal, EditModal, etc.
│   ├── projects/        # ProjectTabs
│   ├── tasks/           # TaskItem, PrioritySection, AddTask, SearchBar
│   └── layout/          # Header, Footer, NotificationBar, SocialShare
├── hooks/               # State & business logic
│   ├── useTasks.js      # Tasks, archived, projects, shadow backups, local storage
│   ├── useGoogleDriveSync.js # Encrypted Google Drive sync, token drop detection
│   └── useAppSystem.js  # Milestones, PWA update detection, persistent storage
└── utils/               # Constants, crypto, date utilities
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

## Core Features & Systems
- **Priority System**: P1 Must Do (#dc2626), P2 Should Do (#f59e0b), P3 Could Do (#6b7280), P4 On Hold (#9333ea).
- **Google Drive Sync**: Client-side AES-256-GCM encryption (`crypto.js`), auto-token drop detection (`isSyncDropped`), single-tap re-auth popup modal (`SyncDroppedModal.js`).
- **Projects**: Custom project tabs with color bands, HTML5 drag-and-drop project reordering in Settings (`GripVertical`).
- **Updates**: User-controlled PWA update notifications (`UpdateReadyPrompt`) + manual "Check for Updates" control in Settings (`v2.4.14`).
- **Swipe Gestures**: Touch/drag left & right gestures with customizable actions in Settings.
