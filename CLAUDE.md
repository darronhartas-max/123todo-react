# 123 ToDo - Project Overview & Deployment Plan

## Project Summary
**123 ToDo** is a React-based Progressive Web App (PWA) for task management with offline support, priority-based organization, and achievement tracking.

## Current Status
- **Version**: v2.1.13
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
   - 200 character limit per task
   - Drag-and-drop reordering within priorities
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
   - Project structure preserved in backups (New v1.1)

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

## Deployment Process - VERIFIED WORKING (2025-10-10)

### Current Deployments
- **Primary (NEW)**: https://app.123todo.com - Subdomain deployment
- **Legacy**: https://123todo.com - Original deployment (kept for backward compatibility)

### Quick Deploy to app.123todo.com (Primary)

**IMPORTANT:** The app uses Docker with a build step. Files must be uploaded, then the Docker image rebuilt.

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Transfer via SFTP (FileZilla):**
   - Host: `51.195.136.55`
   - Port: `9947`
   - Protocol: `SFTP - SSH File Transfer Protocol`
   - Username: `debian`
   - Password: [your password]
   - **IMPORTANT**: Turn off VPN if connection refused
   - **Local path**: `./build/`
   - **Remote path**: `/home/debian/wordpress-docker/app-123todo/`
   - Action: Delete all old files, upload all new files (including static/ folder)

3. **Rebuild and restart container (via SSH):**
   ```bash
   ssh -p 9947 debian@51.195.136.55
   cd /home/debian/wordpress-docker
   docker compose build app-123todo
   docker compose up -d app-123todo
   ```

   **Note:** Container is already on traefik_proxy network

4. **Verify deployment:**
   - Visit: https://app.123todo.com in Incognito mode (to bypass cache)
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Check browser console for errors
   - Test PWA functionality

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

**Last Updated**: 2026-07-07 (v2.1.0 - Layout & Appearance Settings)
**Project Owner**: Darron Hartas
**License**: © Darron Hartas 2026
**Live URLs**:
- **Primary**: https://app.123todo.com
- **Legacy**: https://123todo.com

## Version History

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
