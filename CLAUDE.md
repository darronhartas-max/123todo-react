# 123 ToDo - Project Overview & Deployment Plan

## Project Summary
**123 ToDo** is a React-based Progressive Web App (PWA) for task management with offline support, priority-based organization, and achievement tracking.

## Current Status
- **Version**: v1.0.6
- **Tech Stack**: React 19.1.1, Create React App, lucide-react
- **State**: Production deployed (2025-10-11)
- **Data Storage**: Browser localStorage (client-side only)
- **Git**: All changes committed to `main` branch
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
   - No backend/database required

## Architecture
```
123todo-react/
├── public/
│   ├── 123-logo-500px.jpg    # Main logo
│   ├── favicon.png            # Browser favicon
│   ├── icon.jpg               # App icon
│   ├── logo192.png            # PWA icon 192x192
│   ├── logo512.png            # PWA icon 512x512
│   ├── manifest.json          # PWA manifest
│   └── index.html             # HTML template
├── src/
│   ├── App.js                 # Main application component (1100+ lines)
│   ├── index.js               # Entry point
│   └── ...
└── package.json               # Dependencies & scripts
```

## Deployment Process - VERIFIED WORKING (2025-10-10)

### Current Deployments
- **Primary (NEW)**: https://app.123todo.com - Subdomain deployment
- **Legacy**: https://123todo.com - Original deployment (kept for backward compatibility)

### Quick Deploy to app.123todo.com (Primary)

**IMPORTANT:** The app uses Docker with a build step. Files must be uploaded, then the Docker image rebuilt.

1. **Build locally:**
   ```bash
   cd /Users/darronhartas/Desktop/123todo-react
   npm run build
   ```

2. **Transfer via SFTP (FileZilla):**
   - Host: `51.195.136.55`
   - Port: `9947`
   - Protocol: `SFTP - SSH File Transfer Protocol`
   - Username: `debian`
   - Password: [your password]
   - **IMPORTANT**: Turn off VPN if connection refused
   - **Local path**: `/Users/darronhartas/Desktop/123todo-react/build/`
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

### Deploy to 123todo.com (Legacy - Optional)

Follow the same steps but use:
- **Remote path**: `/home/debian/wordpress-docker/todo-app/`
- **Container name**: `todo-app` (instead of `app-123todo`)
- **URL**: https://123todo.com

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

### Troubleshooting

**Connection refused from FileZilla:**
- Check if VPN is enabled (turn off)
- Unban IP on VPS: `sudo fail2ban-client set sshd unbanip YOUR_IP`
- Allow in firewall: `sudo ufw allow from YOUR_IP to any port 9947`

**Site shows 404 or old version after deploy:**
- Verify files uploaded to correct path: `/home/debian/wordpress-docker/todo-app/`
- **Rebuild Docker image**: `cd /home/debian/wordpress-docker && docker compose build --no-cache todo-app`
- Restart all containers: `docker compose up -d`
- Check container logs: `docker logs todo-app`
- Verify correct files in container: `docker exec todo-app ls -la /usr/share/nginx/html/static/js/`
- Verify which JS file is served: `curl -s https://123todo.com | grep "main.*\.js"`

**Site shows 502/504 gateway timeout:**
- Check if containers are running: `docker ps | grep "todo-app\|traefik"`
- Verify both containers on same network: `docker network inspect traefik_proxy`
- Reconnect if needed: `docker network connect traefik_proxy traefik`
- Check Traefik logs: `docker logs traefik 2>&1 | tail -20`

**Permission denied during upload:**
```bash
sudo chown -R debian:debian /home/debian/wordpress-docker/todo-app/
sudo chmod -R 755 /home/debian/wordpress-docker/todo-app/
```

### Initial Setup (Already Complete)

The following was completed on 2025-10-10:

1. ✅ Created `/etc/traefik/dynamic/123todo.yaml` for routing
2. ✅ Connected todo-app to traefik_proxy network
3. ✅ Connected traefik to traefik_proxy network (critical!)
4. ✅ Configured SSL via Let's Encrypt (certResolver: letsencrypt)
5. ✅ Set up Docker Compose labels in wordpress-docker project
6. ✅ DNS configured: 123todo.com → 51.195.136.55
7. ✅ Created **Dockerfile.todo** at `/home/debian/wordpress-docker/Dockerfile.todo` (OUTSIDE upload directory)
8. ✅ Updated docker-compose.yml with:
   ```yaml
   build:
     context: ./todo-app
     dockerfile: ../Dockerfile.todo
   ```
9. ✅ Whitelisted home IP (84.9.20.193) in firewall and Fail2Ban

### Critical Configuration Details

**Dockerfile.todo location:**
- Path: `/home/debian/wordpress-docker/Dockerfile.todo`
- **Important:** Must stay OUTSIDE `todo-app/` directory
- Reason: FileZilla uploads would delete it if inside todo-app/

**Dockerfile.todo contents:**
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Copy/paste warning:**
When pasting commands into terminal, remove leading spaces to avoid syntax errors. Use a text editor to clean formatting first.

## VPS Requirements
- **Web Server**: nginx (recommended) or Apache
- **SSL**: Required for PWA features
- **Storage**: ~5MB for static files
- **Node.js**: Not required for serving (only for building)
- **Domain**: Custom domain recommended for professional appearance

## Build Commands
```bash
# Install dependencies
npm install

# Development server
npm start

# Production build
npm run build

# Test build
npm test
```

## Configuration Needed
1. **Domain Configuration**
   - Domain name: 123todo.com
   - DNS A record pointing to VPS IP

2. **Server Details**
   - VPS IP: 51.195.136.55
   - SSH Port: 9947
   - SSH User: debian
   - SSH Command: `ssh -p 9947 debian@51.195.136.55`
   - Deploy Path: `/home/debian/wordpress-docker/todo-app/`
   - Server OS: Debian 12 (Docker-based deployment)

3. **URLs to Update**
   - Logo link: https://www.123todo.com (line 669 in App.js)
   - Terms link: https://www.123todo.com/terms (line 1012 in App.js)

## Known Considerations
- **No backend**: All data is client-side only
- **Privacy**: No data collection or tracking
- **Data loss risk**: Users must backup manually (JSON export)
- **Browser storage limits**: ~5-10MB localStorage limit
- **HTTPS required**: PWA features won't work over HTTP

## Deployment Process Notes

**Standard deployment workflow:**
- `deploy.sh` provides an interactive checklist that builds locally
- Manual FileZilla upload is the standard process (SSH key auth not configured)
- SSH commands for Docker rebuild require password entry
- Run with: `./deploy.sh`

**Current process is intentionally manual:**
- FileZilla upload provides visual confirmation of file transfer
- Password-protected SSH ensures security
- Process is reliable and well-documented

## Notes
- App works 100% client-side (no API calls)
- Can be deployed as static files to any web server
- No database or backend server needed
- Consider CDN for global performance (optional)
- Current branding links to www.123todo.com

---

**Last Updated**: 2025-10-11 (v1.0.6 deployed - Mobile-optimized social sharing)
**Project Owner**: Darron Hartas
**License**: © Darron Hartas 2025
**Live URLs**:
- **Primary**: https://app.123todo.com
- **Legacy**: https://123todo.com

## Version History

### v1.0.6 (2025-10-11)
- Mobile-optimized social sharing footer
- Icon-only buttons (removed text labels for compact display)
- All 4 social buttons fit on one row on mobile
- Text stacks above buttons on mobile (< 768px)
- Increased footer padding on mobile (100px) to prevent content hiding
- Larger icons (18x18) with square padding (8px) for better touch targets
- Buttons no longer wrap to multiple lines on narrow screens

### v1.0.5 (2025-10-11)
- Added Terms of Service and Privacy Policy links to footer
- Updated meta tags to emphasize "FREE" for social sharing
- Added social-share.svg (1200x630px) for optimal LinkedIn/Facebook display
- Improved Open Graph and Twitter Card metadata
- All social share text now clearly states "FREE"

### v1.0.4 (2025-10-11)
- Added social sharing widget to sticky footer panel
- Replaced "EasiPanel" placeholder with share buttons
- Share platforms: X (Twitter), Facebook, LinkedIn, Email
- Message: "Please SHARE this FREE app if you like it"
- Semi-transparent button styling with hover effects
- All share links point to https://app.123todo.com

### v1.0.3 (2025-10-10)
- Finalized deployment process and documentation
- Established working deployment workflow with Docker and Traefik

### v1.0.2 (2025-10-06)
- Improved mobile UX with increased font sizes
- Added sticky footer advertisement panel
- Enhanced edit modal with auto-expanding textarea

### v1.0.1 (2025-10-06)
- Initial production release
- Complete 123 ToDo task management application

## Deployment Lessons Learned (2025-10-10)

1. **Dockerfile must be outside upload directory** - FileZilla deletes it otherwise
2. **Docker-compose uses context + dockerfile** - References external Dockerfile
3. **Network connectivity critical** - Both traefik AND todo-app must be on traefik_proxy
4. **Leading spaces break Dockerfiles** - Clean formatting before pasting commands
5. **Docker caching aggressive** - Use `--no-cache` flag to force fresh builds
6. **Always verify container contents** - Check files inside container match uploaded files
