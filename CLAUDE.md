# 123 ToDo - Project Overview & Deployment Plan

## Project Summary
**123 ToDo** is a React-based Progressive Web App (PWA) for task management with offline support, priority-based organization, and achievement tracking.

## Current Status
- **Version**: v1.4.2
- **Tech Stack**: React 19.x, Create React App, lucide-react, framer-motion
- **State**: Production Refactor Complete (2026-02-21)
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
└── package.json               # v1.4.2
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

**Last Updated**: 2026-07-06 (v1.4.2 - Global Text Scale, Delayed Completion & Wider Modal)
**Project Owner**: Darron Hartas
**License**: © Darron Hartas 2026
**Live URLs**:
- **Primary**: https://app.123todo.com
- **Legacy**: https://123todo.com

## Version History

### v1.4.2 (2026-07-06)
- **UI**: Scaled up all text sizes by 1pt globally via base HTML font-size of 17px.
- **UI**: Widened edit task modal to 500px (max-width 95% on mobile) for better screen utilization.
- **UI**: Enlarged social share footer icons by 20% (to 22px) and added line break spacing.
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
