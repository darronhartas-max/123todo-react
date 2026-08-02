# 123 ToDo - User Guide

**A sophisticated task management Progressive Web App with offline support**

Version 2.4.15 | © Darron Hartas 2026

---

## 🚀 Quick Start

### For End Users

1. **Access the App**: Visit https://app.123todo.com in your web browser
2. **Install on Mobile** (Optional but Recommended):
   - **iPhone/iPad**: Tap Share → "Add to Home Screen" → "Add"
   - **Android**: Tap Menu (⋮) → "Add to Home screen" or "Install app" → "Install"
3. **Start Managing Tasks**: Add your first task using the ➕ button or swipe task cards for quick actions!

### For Developers

```bash
# Clone and install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

---

## 📱 Features

### Task Management & Swipe Gestures
- **Customizable Swipe Gestures**: Swipe task cards left or right on touch devices or desktop to quickly complete, delete, edit, or set On Hold.
- **4 Priority Levels**: Must Do, Should Do, Could Do, On Hold
- **Quick Actions**: Complete (✓), Edit, Archive, Delete, Restore, Swipe
- **Drag & Drop Reordering**: Reorder tasks within priority sections, and drag-and-drop projects using grip handles in Settings.
- **Note Management**: Add **unlimited-length notes** (no character limit) to tasks — ideal for rich Todoist migrations, checklists, or detailed instructions.
- **Auto-Expanding Editor**: Task editor automatically adjusts height to show all text seamlessly.
- **Search System**: Powerful search bar to filter tasks by text across any project.
- **Project Management**: Create, edit, drag-and-drop reorder, and delete custom projects with color coding in a compact view fitting 13+ projects at once.

### Priority System
1. **Must Do** (Red) - Critical, urgent tasks
2. **Should Do** (Orange) - Important but not critical
3. **Could Do** (Gray) - Nice to have, lower priority
4. **On Hold** (Purple) - Paused or waiting tasks

### Ultra-Fast Cross-Device Cloud Sync
- **Google Drive AppData Sync**: End-to-end encrypted backup to your personal Google Drive
- **Near Real-Time Speed**: Ultra-fast 300ms push debounce & 4s active tab polling
- **Mobile Touch Release Sync**: Instant 50ms flush on finger touch lift-off
- **Data-Efficient**: Polling uses lightweight ~300-byte metadata checks only when tab is visible
- **Concurrency Protection**: Strict lock guards against racing network requests

### Data Management
- **Local Storage & Persistent Storage**: All data stored locally in your browser with persistent storage API protection
- **Export/Import**: JSON backup and restore functionality
- **Todoist Import**: Full 3-step wizard — upload CSVs, map each to an existing or new project, confirm before writing
- **Archive System**: Completed tasks saved with timestamps and snappy 600ms transition
- **Restore Feature**: Bring archived tasks back with new priority

### Achievement System
- **Milestone Celebrations**: Unlock achievements at 5, 10, and 15 daily completed tasks
- **Daily Tracking**: Resets each day to encourage consistent productivity
- **Motivational Messages**: Encouraging feedback on achievements
### Customizable Typography & Appearance
- **Customizable Typography & Layouts**: Tailor your visual experience with custom text sizing (8pt to 20pt), spacing density modes (Cozy vs Compact), and desktop layout width controls (Single Column vs Kanban Board) for maximum readability across mobile and desktop devices.
- **Theme Modes**: Supports Light, Dark, and System Auto theme modes.

### PWA & Smart Updates
- **Offline Support**: Works without internet connection
- **Home Screen Install**: Add to mobile home screen like a native app
- **User-Controlled Updates**: Floating `🚀 New update ready! [Update Now]` banner lets you choose when to reload without unexpected restarts

### Smart Onboarding & PWA
- **Install Prompts**: Gentle reminders to install as PWA (dismissible)
- **Welcome Screen**: First-time user guide with installation instructions and feature overview

---

## 🎯 How to Use

### 👈👉 Swipe Gestures & Swipe Settings
1. Open **Settings** ➔ **Swipe** tab (`MoveHorizontal` icon).
2. Toggle **ON / OFF** using the prominent status card.
3. Custom-pick your preferred **Swipe Right** and **Swipe Left** actions (`Complete`, `Delete`, `On Hold`, `Edit`, or `None`).
4. Practice dragging the live test card right inside Settings!

### Adding Tasks & Enhanced Features
1. Click the **➕ Add Task** button in the header or priority section.
2. **Task Title**: Type a concise task title (up to 200 characters for quick dashboard scanning).
3. **Priority & Project**: Select a Priority level (*Must Do, Should Do, Could Do, On Hold*) and assign a color-coded **Project**.
4. **Unlimited Notes**: Expand **Notes** to write detailed descriptions, paste links, or store long instructions with zero length limits.
5. **Subtasks & Checklists**: Click **📋 Subtasks** to break down large tasks into smaller step-by-step checklists.
6. **Schedule & Recurrence**: Click **📅 Schedule** to set a due date and configure automated recurring rules (e.g. daily, weekly on specific days).
7. Click **ADD TASK** or press **Enter** to save!

### Managing, Scheduling & Subtasks
- **Swipe**: Drag any task left or right to trigger configured actions (Complete, Delete, On Hold, Edit).
- **Schedule & Recurrence**: Set scheduled due dates and recurring rules (daily, weekly, monthly) for any task.
- **Subtasks & Checklists**: Break down large tasks into smaller step-by-step checklists.
- **Reorder**: Drag and drop tasks within priority sections or projects.
- **Complete**: Click the checkbox or swipe right to mark tasks complete and move to archive.
- **View Archive**: Click "Show Archive" at the bottom to view completed items.

### Editing Tasks
1. Click on any task to open the edit modal
2. Text area auto-expands to show all content and unlimited notes
3. Change the task text or notes (auto-saves as you type)
4. Change priority using the dropdown
5. Click "Save" to apply changes or "Cancel" to discard

### Archive Management
- **View**: Toggle "Show/Hide Archive" button to see completed tasks
- **Restore**: Click the ↻ button and select a new priority
- **Delete**: Click the 🗑️ button to permanently remove

### Backup, Restore & Todoist Migration
- **123 ToDo Backup**: Click "Export" in the footer to download a JSON file, or "Import" to restore a backup.
- **Todoist Export & Migration**: Click "Import" in the footer, then select "Todoist Export" (or click "📖 View Guide").
  1. *Export from Todoist*: Open Todoist ➔ select a Project ➔ click **(...)** ➔ **Export as CSV**.
  2. *Upload to 123 To Do*: Drag & drop your `.csv` files into the upload zone.
  3. *Map & Confirm*: 123 To Do auto-matches project names, imports task descriptions into **unlimited text Notes**, preserves due dates (`📅 Due: ...`), and maintains subtask indentation (`↳`).

---

## 💡 Tips & Best Practices

1. **Use Priorities Wisely**
   - Must Do: Only for truly urgent tasks (keeps list focused)
   - Should Do: Important tasks you'll do today/this week
   - Could Do: Future tasks or low-priority items
   - On Hold: Tasks waiting on external factors

2. **Punchy Titles & Unlimited In-App Notes**
   - Keep task titles concise (up to 200 characters) for fast dashboard scanning
   - Attach **unlimited text Notes** to any task for rich descriptions, instructions, links, or documentation—no external note tools required!

3. **Break Down Big Tasks with Subtask Checklists**
   - Divide large projects into step-by-step checklists using **Subtasks**
   - Track progress visually (`Steps 1/3 (33%)`) right inside your task card
   - Automatically receive anti-procrastination nudges if a task is deferred multiple times

4. **Automated Data Protection & Sync**
   - Activate **Google Drive Sync** for automatic end-to-end encrypted backups across all your devices
   - **Shadow Backups** automatically save daily internal recovery snapshots in your browser
   - Perform manual JSON exports anytime from the footer whenever you want an offline copy

4. **Archive Hygiene**
   - Review archive monthly
   - Delete old completed tasks you no longer need
   - Restore tasks if they become relevant again

5. **Daily Workflow**
   - Start day by reviewing Must Do tasks
   - Move tasks from Should Do → Must Do as needed
   - Complete tasks throughout the day
   - Archive or update uncompleted tasks at day's end

---

## 🔧 Technical Details

### Browser Compatibility
- **Recommended**: Chrome, Safari, Firefox, Edge (latest versions)
- **Mobile**: iOS Safari 11+, Android Chrome 60+
- **PWA Support**: Best on Chrome/Edge and Safari

### Data Storage
- **Method**: Browser localStorage
- **Limit**: ~5-10MB (hundreds of tasks)
- **Persistence**: Data survives browser restarts
- **Privacy**: All data stays on your device (no server, no tracking)

### System Requirements
- Modern web browser with JavaScript enabled
- ~2MB available localStorage space
- Internet connection for initial load (then works offline)

---

## ⚠️ Important Notices

### Data Storage & Privacy
- **Local-First Storage**: Tasks are stored locally in your browser (`localStorage`).
- **Zero Third-Party Servers**: No task data is ever collected, tracked, or sent to vendor servers.
- **Optional Encrypted Cloud Sync**: When Google Drive Sync is enabled, data is encrypted on your device (AES-256-GCM) and synced directly to your personal Google account.
- **Safety Features**: 24-hour automatic internal Shadow Backups and Persistent Storage API protection help safeguard your data.

### Terms of Use
- This app is provided "as is" without warranties.
- Use entirely at your own risk.
- Full terms: https://www.123todo.com/terms

### Browser Storage & Protection Guidance
- **Google Drive Sync**: Enable cloud sync for automatic, zero-knowledge encrypted backups. If browser cache is ever cleared, signing back in restores all tasks instantly.
- **Persistent Storage API**: 123 To Do requests browser storage persistence to prevent browsers from clearing local data.
- **Internal Snapshots**: Daily Shadow Backups automatically save local recovery snapshots in your browser.
- **Offline Backups**: Perform a quick 1-click JSON export anytime for offline peace of mind.

### PWA Installation Issues
- Ensure you're using HTTPS (required for PWA)
- Try a different browser
- Check that browser supports PWA installation
- Dismiss and retry install prompt

---

## 📞 Support & Feedback

- **Website**: https://www.123todo.com
- **Terms**: https://www.123todo.com/terms
- **Issues**: Check browser console for error messages

---

## 🛠️ Development

### Project Structure
```
123todo-react/
├── public/              # Static assets
│   ├── 123-logo-500px.jpg
│   ├── manifest.json    # PWA configuration
│   └── index.html
├── src/
│   ├── App.js          # Main application component
│   └── index.js        # Entry point
├── CLAUDE.md           # Deployment documentation
└── README.md           # This file
```

### Available Scripts

**Development**
```bash
npm start               # Start dev server at localhost:3000
npm test                # Run tests
npm run build          # Build production bundle
```

**Deployment**
```bash
# Build generates static files in /build directory
npm run build

# Deploy /build directory to any web server
# Requires HTTPS for PWA features
```

### Environment
- **React**: 19.1.1
- **Create React App**: Latest
- **Icons**: lucide-react
- **State**: React Hooks (useState, useEffect, useCallback)
- **Storage**: localStorage API

---

## 📄 License & Credits

**Copyright © Darron Hartas 2026**

Built with [Create React App](https://github.com/facebook/create-react-app)

🤖 Developed with assistance from [Claude Code](https://claude.com/claude-code)

---

## 🔄 Version History

- **Brand Consistency**: Applied primary blue (#285a82) from the logo as the main accent color.

### v2.2.1 (Current)
- **Unlimited Task Notes**: Removed the previous 2,048-character cap on task notes. Notes fields now accept any length of text, ensuring Todoist task descriptions of any size import and display cleanly without truncation.
- **Todoist Import — Bug Fixes & Project Mapping Wizard**: Full 3-step import experience:
  - *Step 1 — Upload*: Drag-and-drop (now fully working) or click to select one or more Todoist CSV project exports at once.
  - *Step 2 — Map Projects*: Each CSV is listed with a dropdown to assign it to an existing 123todo project or create a new one. A fuzzy name matcher pre-selects the best match and displays a green "matched" badge.
  - *Step 3 — Confirm*: Summary table of all projects and task counts before any data is written.
  - Todoist `TYPE=section` and `TYPE=note` rows are now filtered out (previously imported as ghost tasks).
  - `DATE` column is mapped to task notes as `📅 Due: …`
  - `INDENT` column is respected — sub-tasks get a `↳` prefix to preserve hierarchy.
  - Case-insensitive duplicate project name guard prevents creating duplicate projects.

### v2.2.0
- **Todoist Import Wizard (initial)**: Introduced CSV parsing and column-mapping workflows to seamlessly migrate tasks and projects from Todoist.

### v2.1.13
- **Maskable PWA Icons**: Added `"purpose": "any maskable"` property to PWA icons in `manifest.json` to tell Google Pixel/Android launchers that the icon can be rendered full-bleed, preventing the launcher from automatically wrapping the icon inside an ugly double-padded white circular badge.

### v2.1.12
- **Manifest Cache-Busting**: Added the cache-busting query parameter (`?v=2.1.11`) to the `manifest.json` link inside `index.html`. This forces Chrome/Google Play's WebAPK minting server to pull the new manifest and register the fresh cropped icons without waiting for their standard 24-hour cache expiry.

### v2.1.11
- **Asset Cleanup**: Deleted the temporary verification preview logo file to clean up public assets.

### v2.1.10
- **Refined Dark Theme Logo**: Updated the dark theme logo to render both the text and the entire checkmark icon (ring and tick path) in solid white against a completely transparent background for a premium, highly legible dark mode aesthetic.

### v2.1.9
- **PWA Launcher Cache-Busting**: Added cache-busting version query parameters (`?v=2.1.8`) to the icon links in `index.html` and `manifest.json`. This forces mobile operating systems and browsers (like iOS Safari and Android Chrome) to bypass their persistent internal icon caches and fetch the newly cropped layouts immediately when re-adding to the home screen.

### v2.1.8
- **App Icons & Favicon Crop**: Cropped excess white margin padding (60px-150px) around all favicon and mobile PWA system app icon files (`logo512.png`, `logo192.png`, `favicon.ico`, `favicon.png`, and `icon.jpg`), maximizing their visual checkmark size when added to phone home screens.

### v2.1.7
- **Dynamic Dark Theme Logo**: Generated transparent light/dark logo PNG variants from the original asset, and connected the logo `src` to dynamic dark theme changes (switching text to white in dark mode for optimal contrast).
- **Test Suite Polyfills**: Added JSDOM test suite polyfills for `TextEncoder`, `TextDecoder`, and `window.matchMedia` in `setupTests.js` to restore passing status on test runs.

### v2.1.6
- **Settings Form Fix**: Corrected a parameter mismatch in the Settings modal where new project creation was passing an object instead of separate name and color parameters, preventing new project additions.

### v2.1.5
- **Production Cleanup**: Removed the settings modal projects debug printing after verification was completed.

### v2.1.4
- **Debugging Enhancements**: Added loaded projects list printing under Settings modal for state verification.

### v2.1.3
- **Point-Based Typography Scale**: Switched font-size scaling to points (`pt`), setting a slider range of `8pt` to `20pt` with `12pt` default (equivalent to standard `16px`). Included auto-migration for existing users.
- **Optimized Layout Width Constraint**: Adjusted the smallest layout width to `480px` (standard phone size) and removed the oversized `1200px` option to prevent overly stretched single-column layouts on wide monitors.

### v2.1.2
- **Fallback Project Customization**: Converted the default "General" project from a hardcoded constant into a dynamic user-owned project. It is now listed inside the Settings modal under "Manage Projects," enabling users to rename it (e.g. to "In Box") or customize its color.
- **Auto-Injection Migration**: Added code to auto-inject the "General" project on load or sync import if it is missing, preserving it as a reliable catch-all fallback.

### v2.1.1
- **Legacy Migration Safeguards**: Automatically transfers custom `categories` from older local storage data or Google Drive sync payloads to new `projects` storage key, and maps legacy `categoryId` properties to `projectId` on tasks.
- **Robust Matching**: Resolved casing and name discrepancies in project lookups, making matches case-insensitive.
- **Todoist Importer Hotfix**: Fixed a bug where tasks under pre-existing projects defaulted to "General" during Todoist CSV import.
- **CSS Render Order Polish**: Swapped the border layout evaluation order in `TaskItem` so the PWA drag-and-drop indicator's `border` property doesn't overwrite the left color bar.
- **Color Coding Visibility**: Widened vertical task color indicator strips by 50% (from 4px to 6px) to make projects easier to identify.
- **Improved Spacing & Target Sizing**: Enlarged project action buttons (Edit, Delete) in the settings modal and added a wider gap (12px) to prevent accidental project deletions.
- **Expanded Palette**: Added 11 new curated project colors, expanding the total choice list to 18 premium options.

### v2.1.0
- **Appearance & Styling Preferences**: Added base text size customization (font size slider) that scales all text proportionally.
- **Density Spacing Options**: Introduced choice of "Cozy" (comfortable spacing) vs. "Compact" (tighter list items and margins) to reduce clunkiness on desktop.
- **Desktop Kanban Columns**: Automatically transitions layout to side-by-side columns (Kanban-style) on wider view modes (1000px/1200px) on desktop, rather than a single stretched column.
- **Unified Settings Modal**: Replaced the project management modal with a unified settings panel containing both Projects and Appearance tabs.
- **Theme Selection**: Explicit theme selector (System, Light, Dark) with custom override classes on the document root.

### v2.0.2
- **Google Drive Sync**: Seamless, free, cross-device synchronization using Google Identity Services.
- **Client-Side Encryption**: Zero-knowledge AES-256-GCM encryption ensures data remains completely private.
- **Silent Authentication**: Persistent, silent sign-in means you stay logged in across sessions.
- **Invisible Syncing**: Background push/pull architecture ensures your data is always up to date without distracting visual indicators.

### v1.4.3
- **Shadow Backup Restore**: Added a "Restore from Shadow Backup" button to the Import options. Users can preview backup details (date, task count, category list, and active task preview) before confirming to overwrite the live data.
- **Footer Social Icon Enlargement**: Enlarged social share icons by another 20% to 31px for improved visibility and easy touch target selection on mobile devices.
- **Custom Dropdown Selector**: Replaced the native select component with a custom dropdown select featuring category-coded vertical color bands next to option choices, dynamic active border/text highlights, and click-away dismissal.
- **Adjusted Select Max Height**: Raised dropdown z-height limit to 480px to display up to 12 categories on-screen without requiring scrolling.
- **Scaled Touch Targets**: Increased Archive restore/delete icons by 20% (to 20px), Settings buttons by 20% (to 20px/22px), and task Notes expand/collapse button/icons by 50% (to 36px / 21px) to prevent accidental misclicks.
- **Header Label Adjustment**: Changed header active task count text from "tasks" to "active" (e.g. "5 active") for clean mobile presentation.

### v1.4.2
- **Global Text Scaling**: Increased all text sizes by 1pt globally via a base HTML font-size of 17px.
- **Wider Task Editor**: Widened the edit modal to 500px (max-width 95% on mobile) to utilize screen real estate better.
- **Checkbox Completion & Delayed Archiving**: Replaced the circle complete button with a checkbox (Square/CheckSquare), which ticks green and waits 2 seconds before archiving, giving the user a chance to undo.
- **Archive Modal Confirmation**: Shows a centered "Moved to Archive" notification toast for 2 seconds after archiving a task.
- **Header Add Task Button**: Enlarged the add task header icon by 15% (to 28px) and colored it brand red (#dc2626).
- **Social Sharing Spacing & Icon Size**: Enlarged share icons by 20% to 26px and restructured footer margins/padding to save height.

### v1.4.0
- **Todoist CSV Import**: Initial importer for Todoist projects with multi-file support (later replaced by the full wizard in v2.2.1).
- **Task Notes & Descriptions**: Added support for long-form task notes with a toggleable UI (limit later removed in v2.2.1).
- **Atomic ID Generation**: Completely refactored task ID system to be atomic, preventing collisions during bulk operations.
- **Improved Task Editor**: Notes field in the edit modal now auto-grows for better visibility.
- **Production Build Polish**: Resolved all ESLint warnings for a perfectly clean deployment bundle.
- **UI Enhancements**: Added extra breathing room in the footer for better aesthetic balance.

### v1.3.0
- **Advanced PWA Auto-Updates**: Implementation of active service worker refreshes on app launch and focus.
- **"Safety First" Update Notifications**: New backup-before-update workflow to protect user data.
- **Adaptive Mobile UI**: Synchronized status bar color with brand blue, supporting light and dark modes.
- **Refined Category Management**: Streamlined tabs with brand-tinted backgrounds and simplified icons.
- **Robust Persistence**: Fixed issues where default categories would revert names on page reload.
- **Enhanced Typography**: Improved readability with optimized font sizes in navigation components.

### v1.2.0

### v1.1.0
- Added PrioritySection component refactoring
- Enhanced mobile responsiveness
- Fixed minor layout issues in task items
- Added Framer Motion for smoother animations

### v0.1.0
- Initial release
- 4-level priority system
- Drag-and-drop task reordering
- Archive system with restore
- Export/Import JSON backup
- Milestone achievements (5, 10, 15 tasks/day)
- PWA installation support
- Offline functionality
- Weekly backup reminders
- Auto-expanding task editor
- Mobile-first responsive design
- Sticky footer advertisement panel

---

**Made with ❤️ for productivity enthusiasts**
