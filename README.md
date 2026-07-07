# 123 ToDo - User Guide

**A sophisticated task management Progressive Web App with offline support**

Version 2.1.13 | © Darron Hartas 2026

---

## 🚀 Quick Start

### For End Users

1. **Access the App**: Visit https://www.123todo.com in your web browser
2. **Install on Mobile** (Optional but Recommended):
   - **iPhone/iPad**: Tap Share → "Add to Home Screen" → "Add"
   - **Android**: Tap Menu (⋮) → "Add to Home screen" or "Install app" → "Install"
3. **Start Managing Tasks**: Add your first task using the ➕ button!

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

### Task Management
- **4 Priority Levels**: Must Do, Should Do, Could Do, On Hold
- **Quick Actions**: Complete (✓), Edit, Archive, Delete, Restore
- **Drag & Drop**: Reorder tasks within each priority level
- **Character Limit**: 200 characters per task for concise task descriptions
- **Auto-Expanding Editor**: Task editor automatically adjusts to show all text
- **Search System**: Powerful search bar to filter tasks by text across any category
- **Category Management**: Create, edit, and delete custom categories with color coding
- **Consolidated "Manage" Hub**: Centralized modal for all category maintenance tasks
- **Note Management**: Add detailed descriptions to tasks (up to 2,048 characters)
- **Compact View**: Notes are hidden by default with a `+` toggle to save space

### Priority System
1. **Must Do** (Red) - Critical, urgent tasks
2. **Should Do** (Orange) - Important but not critical
3. **Could Do** (Gray) - Nice to have, lower priority
4. **On Hold** (Purple) - Paused or waiting tasks

### Data Management
- **Local Storage**: All data stored in your browser (no server required)
- **Export/Import**: JSON backup and restore functionality
- **Todoist Import**: Direct CSV import support for Todoist projects (multi-file)
- **Archive System**: Completed tasks saved with timestamps
- **Restore Feature**: Bring archived tasks back with new priority

### Achievement System
- **Milestone Celebrations**: Unlock achievements at 5, 10, and 15 daily completed tasks
- **Daily Tracking**: Resets each day to encourage consistent productivity
- **Motivational Messages**: Encouraging feedback on achievements

### PWA Features
- **Offline Support**: Works without internet connection
- **Home Screen Install**: Add to mobile home screen like a native app
- **Fast Loading**: Cached resources for quick startup
- **Auto-Updates**: Service worker automatically updates the app

### Smart Reminders
- **Weekly Backup Reminder**: Prompts you to export data every 7 days
- **Install Prompts**: Gentle reminders to install as PWA (dismissible)
- **Welcome Screen**: First-time user guide with installation instructions

---

## 🎯 How to Use

### Adding Tasks
1. Click the ➕ button in the header
2. Type your task (max 200 characters)
3. Select priority: Must Do, Should Do, or Could Do
4. Click "ADD TASK" or press Enter

### Managing Tasks
- **Complete**: Click the ✓ button to move task to archive
- **Edit**: Click anywhere on the task text to edit content or change priority
- **Reorder**: Drag and drop tasks within the same priority section
- **View Archive**: Click "Show Archive" at the bottom to see completed tasks

### Editing Tasks
1. Click on any task to open the edit modal
2. Text area auto-expands to show all content
3. Change the task text (auto-saves as you type)
4. Change priority using the dropdown
5. Click "Save" to apply changes or "Cancel" to discard

### Archive Management
- **View**: Toggle "Show/Hide Archive" button to see completed tasks
- **Restore**: Click the ↻ button and select a new priority
- **Delete**: Click the 🗑️ button to permanently remove

### Backup & Restore
- **Export**: Click "Export" in the footer to download a JSON file
- **Import**: Click "Import" and select a previously exported JSON file
- **Frequency**: Recommended to backup weekly (app will remind you)

---

## 💡 Tips & Best Practices

1. **Use Priorities Wisely**
   - Must Do: Only for truly urgent tasks (keeps list focused)
   - Should Do: Important tasks you'll do today/this week
   - Could Do: Future tasks or low-priority items
   - On Hold: Tasks waiting on external factors

2. **Keep Tasks Concise**
   - Use the 200-character limit to stay focused
   - One task = one action
   - Break large projects into smaller tasks

3. **Regular Backups**
   - Export your data weekly (the app will remind you)
   - Store backups in cloud storage (Dropbox, Google Drive, etc.)
   - Use descriptive filenames: `123todo-2026-02-28.json`

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

### Data Responsibility
- **You are responsible for backing up your data**
- Data stored only in your browser's localStorage
- Can be lost if:
  - Browser cache/data is cleared
  - Browser is uninstalled
  - Device is reset/reformatted
  - Browser updates cause issues

### Terms of Use
- This app is provided "as is" without warranties
- Use entirely at your own risk
- No data is collected or transmitted to servers
- Full terms: https://www.123todo.com/terms

### Browser Storage Warnings
- Do not clear browser data/cache if you want to keep tasks
- Add browser to "don't clear" exceptions if possible
- Export data regularly as a safety measure

---

## 🐛 Troubleshooting

### Tasks Not Saving
- Check browser localStorage is enabled
- Ensure you're not in Private/Incognito mode
- Try refreshing the page
- Export and re-import data if issues persist

### App Not Loading
- Clear browser cache and refresh
- Check internet connection (for first load)
- Try a different browser
- Disable browser extensions temporarily

### Lost Data
- Check if you have a backup JSON file
- Use Import feature to restore from backup
- If no backup exists, data cannot be recovered

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

### v2.1.13 (Current)
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
- **Todoist CSV Import**: New robust importer for Todoist projects with multi-file support and automatic mapping.
- **Task Notes & Descriptions**: Added support for long-form task notes (up to 2,048 chars) with a toggleable UI.
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
