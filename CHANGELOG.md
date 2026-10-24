# 123 To Do — Complete Version Changelog & Release History

> **The comprehensive build record and release notes for 123 To Do from v1.0.0 to present.**  
> *Last Updated: September 2026* | [app.123todo.com](https://app.123todo.com) | [www.123todo.com](https://www.123todo.com)

---

## 🧭 Major Milestone Eras

- [Phase 5: Modern Era & Photo Attachments (v3.5.0 – Present)](#-phase-5-modern-era--photo-attachments-v350--present)
- [Phase 4: Dual-Skin OS & Multi-App Migration (v3.0.0 – v3.4.2)](#-phase-4-dual-skin-os--multi-app-migration-v300--v342)
- [Phase 3: Voice Dictation & E2EE Cloud Sync (v2.5.0 – v2.9.0)](#-phase-3-voice-dictation--e2ee-cloud-sync-v250--v290)
- [Phase 2: Desktop Kanban, Subtasks & Swipe Gestures (v2.0.0 – v2.4.17)](#-phase-2-desktop-kanban-subtasks--swipe-gestures-v200--v2417)
- [Phase 1: Foundations & Offline Core (v1.0.0 – v1.4.3)](#-phase-1-foundations--offline-core-v100--v143)

---

## 🚀 Phase 5: Modern Era & Photo Attachments (v3.5.0 – Present)

### v3.8.10

- **🎨 Customizable Priority Label Colors in Settings:** Added priority color customization in Settings under Tasks. Users can now choose distinct colors for Must Do, Should Do, Could Do, and On Hold from a 24-color curated palette or custom color picker, with options to reset individual or all priorities back to default colors. This feature was kindly suggested by user 'Fae'.
- **🔄 Dynamic Priority Color Theming Throughout App:** Custom priority colors dynamically update across all task sections, modal editors, dropdowns, drag-and-drop hover zones, note priority tags, and restore modals while preserving default colors as the baseline.

### v3.8.9

- **✕ Permanent Dismiss for Rescheduled (Deferred 5x) Alert:** Added a dedicated dismiss (✕) button to the 5x deferred warning message in both the task editor and task item badge, allowing users to remove the notification for good once acknowledged.
- **📝 Intuitive Mode Toggle Icons (Task Organising & Note Taking):** Replaced the confusing microphone toggle icon at the top of the app with a dedicated notebook and pen icon for Notes mode, and updated the Tasks icon to an organized checklist icon depicting clear task management.

### v3.8.8

- **📝 Dynamic Subtask Text & Checkbox Scaling in Notes Mode:** Subtask checklists, step descriptions, and checkboxes in Notes view mode now dynamically scale with the user's Notes Text Size setting in both view and edit modes, ensuring high readability and comfortable touch targets on mobile.

### v3.8.7

- **📱 Centered Archive & Undo Notification on Mobile:** Fixed bottom horizontal centering for the "Moved to Archive" and task completion Undo snackbar, ensuring it stays perfectly centered on mobile viewports with native safe-area-inset support without clipping off-screen to the right.
- **⚙️ Settings Access in Notes View Mode:** Added the Settings icon button into the top action toolbar in Notes view mode right next to the Add Note button, mirroring the top layout in Tasks view for seamless cross-mode configuration.
- **🔍 Expanded Notes Text Size Range (Up to 36pt):** Extended the Notes View Text Size slider up to 36pt with dynamic scaling across note card titles, note details, Quick Add, and active note editing textareas for ultra-clear legibility on high-resolution mobile screens.

### v3.8.6

- **✨ Smart Natural Language Quick Add (Phase 4):** Introduced intelligent natural language parsing in Add Task. Automatically detects due dates (today, tomorrow, friday, in 3 days, 25th Oct), scheduled times (2pm, 14:30, morning, evening), priorities (!1, !2, !3, !4, p1, !must), project hashtags (#Work, #Personal), and recurrence rules (daily, weekly, every 2 weeks, every weekday) with real-time interactive preview chips and 1-tap removal.
- **↩️ Interactive Quick Undo Toast Snackbar:** Added a bottom-anchored, 5-second interactive Undo snackbar when tasks are completed or moved to archive. Users can effortlessly reverse accidental actions with 1 tap, elevating confidence especially with touch swipe gestures on mobile.
- **⚡ Power-User Command Palette (Cmd+K / Ctrl+K):** Added a spotlight command palette accessible from anywhere via Cmd+K (Mac) or Ctrl+K (Windows/Linux) or via Search. Features keyboard navigation for quick actions, instant mode and theme toggling, project switching, and live global search across all active tasks and notes.

### v3.8.5

- **🎛️ Settings Architecture Modularization (Phase 3):** Decomposed the monolithic SettingsModal (2,592 lines) into 8 dedicated domain subcomponents (SettingsProjectsTab, SettingsAppearanceTab, SettingsTasksTab, SettingsSwipeTab, SettingsVoiceTab, SettingsShortcutsTab, SettingsSyncTab, SettingsAboutTab) under src/components/modals/settings/.
- **🧪 Comprehensive Critical Modal Test Suites:** Added dedicated test suites for SettingsModal, ExportModal, SyncModal, UniversalImportModal, and photoStorage, expanding automated test coverage past 400 unit tests across 48 test suites with 100% pass rate.

### v3.8.4

- **🧩 Task Editor Architecture Deduplication (Phase 2):** Extracted shared task editing domain logic into modular micro-components (ProjectPicker, PrioritySelector, SchedulePicker, RecurrencePicker, SubtasksEditor) under src/components/tasks/editor/.
- **📉 Codebase Streamlining & Unified Behaviors:** Eliminated over 1,740 lines of duplicated code across AddTask and EditModal, standardizing subtask drag-and-drop, circular clock scheduling, external calendar sync, and project picking while ensuring 100% UI consistency and test coverage.

### v3.8.3

- **⚡ Zero-Allocation Drag Handlers & Restored Memoization (Phase 1):** Refactored drag-and-drop event handlers across TaskItem, PrioritySection, ProjectColumn, and On Hold task lists to pass stable memoized callbacks, eliminating inline closure and object allocations inside .map() loops and restoring full React.memo prop equality.
- **🚀 Progressive Batch Rendering in Archive:** Introduced 30-item progressive batch rendering with instant Load More controls in ArchiveModal. Replaced linear project array scans with O(1) indexed Map lookups, enabling instantaneous archive opening even with thousands of completed tasks.

### v3.8.2

- **🔐 Dynamic Per-Payload PBKDF2 Salt (SEC-01):** Upgraded zero-knowledge end-to-end encryption to generate a unique 16-byte cryptographically random salt per payload, neutralizing rainbow table attacks while preserving 100% backward compatibility for existing encrypted backups.
- **🛡️ Single-Use Device Pairing Codes (SEC-02):** Cloudflare Worker now atomically consumes and purges 6-digit device pairing codes immediately upon successful connection, closing the replay window entirely.
- **🔒 Hardened CSP & CORS Policies (SEC-03):** Tightened Content Security Policy connect-src directive specifically to the official sync worker domain and restricted Cloudflare Worker CORS headers to authorized application origins.
- **🔑 Cryptographic SHA-256 Admin Authentication (SEC-06):** Upgraded admin passcode verification from polynomial hashing to FIPS 180-4 standard SHA-256 with automatic, seamless in-place migration of existing legacy credentials.

### v3.8.1

- **⚡ O(N) Project Task Counting & Fast Tabs Rendering (Phase 5):** Replaced quadratic nested task counting loops in ProjectTabs with a single memoized O(N) lookup pass and wrapped ProjectTabs in React.memo, eliminating 20+ redundant array traversals on every state change and making project switching instantaneous.
- **🎯 Memoized Task Pipeline & Zero-Allocation Lookups:** Memoized active, scheduled, and filtered task pipelines in App.js to eliminate redundant multi-key date/time sorting and search re-filtering during typing. Replaced inline project array allocations with indexed map lookups (O(1)) for On Hold and Scheduled sections.
- **🖐️ Smooth 60fps Drag-and-Drop & UI Control Memoization:** Added target ID equality guards to drag-over handlers and stabilized all drag handlers in useCallback to prevent rapid state churn during drag gestures. Wrapped Header, Footer, and SearchBar in React.memo and unified telemetry storage keys into STORAGE_KEYS.

### v3.8.0

- **📥 Dedicated Photo Download vs. Share Actions:** The Download button in the photo Lightbox viewer now strictly triggers direct file downloads to your Downloads folder on all devices, keeping it distinct from the Share button which opens the system share sheet (AirDrop, Messages, Mail, WhatsApp).
- **⏱️ Extended Download Reliability:** Extended file blob download lifetime to ensure smooth, uncorrupted downloads for high-resolution images across all mobile and desktop browsers.

### v3.7.59

- **📥 Full-Resolution Photo Download & Native Save:** Fixed photo Download in the Lightbox viewer. Desktop users get instant file downloads to their Downloads folder, while mobile users on iOS and Android can 1-tap "Save Image" to their Camera Roll, save to Files, or attach directly to emails.
- **⚡ Cloud Sync Payload Optimization:** Cloudflare and Google Drive sync payloads now strictly transmit lightweight metadata and compact thumbnails, keeping background sync fast, data-friendly, and well within Cloudflare Worker limits.

### v3.7.58

- **🛡️ Zero Photo Loss & Storage Protection:** Note photos are permanently preserved in IndexedDB with browser Persistent Storage protection, completely safeguarding photos from eviction or 5MB quota errors.
- **📦 1-Click Physical Photo ZIP Export:** New "Export All Photos (.ZIP)" tool in Data Backup & Settings exports all high-resolution note photos across active and archived tasks into a single physical ZIP file.
- **🖼️ Permanent Photo Retention in Archive:** Completed tasks in the Archive now retain their photo attachments and thumbnails, viewable and downloadable anytime in read-only mode.
- **⚡ Asynchronous Thumbnail Hydration:** Gallery thumbnails hydrate smoothly from IndexedDB without blocking the UI or causing memory bloat.

### v3.7.57

- **📋 Top-Prepend for New Subtasks:** When adding new subtasks in Add Task, Edit Task, Task Item, or Notes, newly added steps are now placed immediately at the top of the list for instant visibility and fast multi-step entry.
- **✅ Smart Subtask Auto-Sort on Completion:** When a subtask is checked off as completed, it automatically moves to just below the remaining uncompleted subtasks, keeping active items prioritized at the top while maintaining completed items cleanly grouped below.
- **⏎ Multi-Line Carriage Return Support in Task Creation:** Fixed Enter / Carriage Return key handling in the Add Task textarea so pressing Return naturally inserts new lines across all mobile keyboards (including OnePlus and Android virtual keyboards) and desktop browsers, allowing itemized list creation. Power users can submit with Cmd+Enter or Ctrl+Enter.

### v3.7.56

- **🔄 Unified Subtask Reorder Hook & Modular Architecture (Phase 4):** Extracted duplicated touch, boundary collision, and drag-and-drop gesture handlers across TaskItem, AddTask, and EditModal into a reusable useSubtaskReorder hook, eliminating redundant reordering logic and ensuring unified vibration feedback.
- **🗄️ Storage Keys Centralization & Orphan Section Key Pruning:** Centralized all local storage identifiers into the STORAGE_KEYS registry, resolving fragmented key usage. Added automated pruning of orphaned task section keys on app startup and task deletion to prevent storage leaks.
- **🛡️ Safe Silent Background Service Worker Activation:** Enhanced silent background service worker update transitions to safeguard against reloading while any modal dialog or active input editing is open, safely deferring reloads until the app is backgrounded.

### v3.7.55

- **🔒 Security Hardening & Content Security Policy (Phase 3):** Introduced strict Content-Security-Policy (CSP) headers restricting script execution, network endpoints, and frame embeddings to authenticated origins.
- **🛡️ Cloudflare Worker Hardening & Dynamic Google GSI Loading:** Upgraded device pairing codes to cryptographically secure random values (crypto.getRandomValues) and enforced a 2MB maximum payload limit on cloud sync pushes. Replaced unconditional Google Identity Services script loading with on-demand dynamic script injection only when Google Drive sync is active.

### v3.7.54

- **⚡ Performance & Rendering Optimization (Phase 2):** Memoized TaskItem, NoteCard, PrioritySection, and ProjectColumn components to eliminate unnecessary re-renders across task and note lists. Replaced linear project lookups with O(1) indexed maps for smoother dragging and list interactions.
- **💾 Granular Storage Persistence & Bounded Photo Caching:** Optimized local storage persistence to only synchronize modified state slices instead of re-serializing the entire archive and active datasets on every state change. Added a bounded 25-item LRU cache and persistent connection pooling for IndexedDB photo storage.

### v3.7.53

- **⚡ Performance & Bundle Optimization (Phase 1):** Introduced intelligent dynamic code-splitting with React.lazy and Suspense for all modal dialogs and secondary views. Cut initial production entry bundle size by 25% (saving ~65kB gzipped) for faster initial app load and snappy responsiveness on mobile devices.
- **🧹 Asset & Storage Streamlining:** Purged over 3.5MB of unused legacy assets, duplicate share images, and unreferenced screenshots from repository and build artifacts, streamlining clean deployments.

### v3.7.52

- **📋 Streamlined Subtasks & Right-Aligned Completion:** Streamlined subtask items across Add Task, Edit Task, Task Item, and Notes. Moved the completed checkbox from the left to replace the old delete button on the right side. Re-isolated and enlarged the drag handle with dedicated touch and selection safeguards so reordering subtasks never accidentally triggers text selection or focus in the text area.
- **🔘 Action Buttons Row Reorganization (Expand & Voice Repositioned):** Moved the Expand focus editor and Voice (Talk) dictation buttons from the top of the task description title down to the far right of the unified action buttons line (alongside Notes, Subtasks, and Schedule) with generous spacing.
- **🏷️ Evidentiary Stamp Icon for Notes Timestamps:** Updated the "+ Timestamp" button icon in task notes and the full-screen focus editor to a crisp official stamp icon, replacing the clock face for greater clarity.
- **✍️ Dynamic Notes Placeholder on Focus:** The holding placeholder text in the notes entry box now vanishes cleanly as soon as the user clicks or focuses into the text field, providing an uncluttered writing space.

### v3.7.51

- **✨ Streamlined Add Task Controls & Space Optimization:** Removed the redundant Cancel button from the bottom priority button row in the Add Task form, reclaiming valuable horizontal space for priority tier buttons and the Add Task action. Task creation can still be cleanly cancelled at any time via the prominent close cross (✕) in the top right or by pressing the Escape key.

### v3.7.50

- **👁️ Active Text Viewport Visibility & Cursor Tracking in Notes and Tasks:** When editing a note attached to a task or typing task descriptions in Add Task and Edit Task modals, the active cursor and newly added text now remain visible inside the viewport at all times. Resolved mobile and desktop issues where adding text to the end of a long note pushed the editing line outside the visible pane or behind the virtual keyboard.
- **📐 Precision Soft-Wrap Line Measuring & Container Auto-Scroll:** Upgraded the internal cursor position tracker with an off-screen typographic measuring mirror that accurately accounts for soft-wrapped sentences without hard returns. Both the internal textarea scroll and the modal container auto-scroll in real time with frame-synchronized alignment during both keyboard typing and voice transcription.

### v3.7.49

- **🎙️ Voice Dictation Viewport Visibility & Cursor Tracking:** When using voice dictation to insert text at the beginning or middle of a task description or note, newly transcribed text now remains smoothly visible inside the viewing pane instead of forcing the textarea to scroll all the way to the bottom.
- **🔍 Search Results Auto-Expansion & Unified Search Close:** When searching for tasks, priority sections (Must Do, Should Do, Could Do, On Hold, and Scheduled) with matching tasks now automatically expand so search results are immediately visible. Streamlined search controls with a single, clear close button on the search bar while keeping the toolbar magnifying glass persistent.
- **❌ Instant Cancel for New Tasks & Notes:** Added an intuitive, unambiguous way to cancel or dismiss task and note creation at any point. You can now tap the header close "X" button, the dedicated Cancel button next to ADD / Save, or press the Escape key to cleanly discard pending input.

### v3.7.48

- **🏷️ Uniform "On Hold" Section Heading:** Standardized the On Hold tasks header in the main task list from "ON HOLD TASKS" to simply "ON HOLD", establishing full visual and typographic uniformity alongside Must Do, Should Do, and Could Do sections.
- **🧹 Streamlined Archive Row Action Buttons:** Removed the redundant secondary permanent delete button that appeared alongside the Restore button on each archived task row, preserving the dedicated delete button on the left of each task for a cleaner, uncluttered interface.

### v3.7.47

- **🖼️ Clarified Lightbox Actions, Generous Touch Targets & Spacing:** Simplified and clarified the photo viewer controls by streamlining the "Save to Photos / Share" button to a clear "Share" button for standard system sharing, with generous 38px touch targets, comfortable 12px spacing between action buttons, and clear interactive feedback badges.
- **💾 Reliable Photo Download & Expansive Desktop Lightbox View:** Fixed the photo Download button to reliably export full-resolution images across all desktop and mobile browsers via Blob URLs and IndexedDB hydration. Also resolved images displaying small on desktop monitors by expanding the Lightbox container to up to 1400px wide with aspect-ratio-preserving viewport fitting, and bumped preview thumbnail generation to 480px for sharp previews on high-DPI displays.

### v3.7.46

- **⏱️ Inline Time Lozenge Wrapping & Clean Section Headings:** When a scheduled time is set on a task, the time lozenge is now rendered inline with the task description, allowing text lines to cleanly wrap directly underneath the lozenge to eliminate awkward gaps and maximize usable space. Also standardized priority list headers by removing the redundant "Show" and "Hide" prefixes from On Hold and Scheduled sections for complete visual uniformity.
- **📦 Modernized Archive Listing, 2-Line Clamping & Safe Edit Flow:** Refined the Archive modal with modernized theme-consistent styling. Archived tasks are now neatly clamped to 2 lines of description for rapid scanning, and clicking an archived task now presents an intuitive confirmation popup prompting to restore it into the live system before opening it in the task editor.

### v3.7.45

- **📸 5 Photo Attachments, Cursor Viewport Scrolling & Collapsible Sections:** Increased maximum image attachments per task or note from 3 to 5. Improved task description editing by ensuring the active cursor and lines being edited (including the start of the task) remain smoothly visible in the viewport instead of scrolling out of view. In Task Edit, added persistent collapsible sections for Notes, Subtasks, and Schedule with toggle memory across view and edit sessions, and removed redundant edit icon buttons above the description and notes boxes for direct, frictionless typing.
- **🎙️ Smart Voice Dictation Newlines & Instant Save Commands:** When appending transcribed voice dictation to existing tasks or notes, new speech now cleanly begins on a new line automatically unless the cursor is positioned elsewhere. Saying "save task" or "save note" now immediately and reliably persists newly transcribed text and closes the modal.

### v3.7.44

- **📅 Concise Calendar Event Titles & Full Details Preservation:** When adding scheduled tasks to Google Calendar or Apple Calendar (.ics), the event title is now cleanly formatted to a concise headline (up to 40 characters) on natural word boundaries without trailing ellipses, allowing you to immediately tap and edit or expand the title in your calendar. The complete original task text and any associated task notes are safely preserved in the calendar event description field so no context is ever lost.

### v3.7.43

- **📘 First-Time User "Getting Started" Guide & Disappearing Helper:** Added an intuitive Getting Started function tailored for first-time visitors that links to the beginner-friendly quick-start guide on the website, addressing core concerns about offline data safety, 1-2-3 priorities, and zero-knowledge device syncing. The Getting Started button in the header and welcome banner automatically disappears once the user begins actively adding, completing, or organizing tasks. Added permanent links to both the Beginner's Guide and the new in-depth Feature Mastery Guide in Settings under App & Updates.

### v3.7.42

- **🌟 Frictionless First-Time User Experience & 1-2-3 Starter Onboarding:** Transformed the initial user experience for first-time visitors by eliminating screen-blocking welcome modals and aggressive installation popups. First-time users now land directly into a clean, inviting workspace with a sleek, non-blocking In-Line Welcome Banner introducing the 1-2-3 methodology. Streamlined default sample tasks down to 3 interactive starter tasks demonstrating the Must Do, Should Do, and Could Do tiers. Softened install prompts with consumer-friendly "Add to Home Screen" language and prevented early pop-up interruptions until users have meaningfully engaged with the app.

### v3.7.41

- **🔁 Streamlined Recurrence Icon on Schedule Row & Right-Aligned Add Note:** Replaced the textual "Repeat this task" label with a clean Repeat icon toggle, unified directly onto the same line as the schedule time icon to maximize vertical screen space in both Add Task and Edit Task modals. In Notes mode, relocated the Add Note button to the right side of the header bar with generous touch targets for rapid, thumb-friendly note capture.

### v3.7.40

- **🕒 Streamlined Timestamp & Time Icons, Optional Creation Timestamp:** Replaced textual timestamp buttons in task notes and fullscreen focus editor with a clean Clock icon to match adjacent tool buttons. Streamlined the time adder in Date & Recurrence scheduling with a minimal clock face and plus icon, removing redundant "(optional)" text. Hid the task creation date and time stamp by default for a cleaner, decluttered task editing view, while adding a new "Task Creation Date & Time" toggle in Settings (Tasks & Workflow) for users who prefer displaying creation timestamps.

### v3.7.39

- **✨ UI Decluttering, Button Display Mode Setting & Compact Footer:** Introduced a cleaner, distraction-free interface by replacing redundant dual icon-and-text labels with streamlined icons by default, spaced with ample touch-safe padding to prevent mis-clicks. Added a new "Feature Buttons & Labels" setting under Appearance & Styling in Settings to toggle between Icons (Clean), Icons & Text, and Text Only across the top bar, task forms, and notes view. Also streamlined the footer by combining the copyright notice and version number into a single compact line.

### v3.7.38

- **🏆 Streamlined Footer & Top Bar Achievements:** Removed the achievements trophy badge/link from the footer since it is already readily accessible near the top of the lists view in Tasks mode, giving the footer a cleaner, minimal presentation.

### v3.7.37

- **🔗 Direct In-Box Actionable Links & Clean Task View:** Removed the separate cluttered Actionable section when viewing tasks. Phone numbers, email addresses, and web links are now directly linked and interactive inside the task description and notes boxes. Clicking any link immediately calls, emails, or opens the URL without entering edit mode, while clicking anywhere else in the box or tapping the Edit/Done button smoothly transitions into the full text editor.

### v3.7.36

- **⏱️ Concise Scheduled Time Badge at Start of Tasks:** Tasks with an associated scheduled time now display a small, concise time badge (e.g. 09:00, 2:30 PM) right at the start of the task in the list view across both Pro and Lite views. Provides an instant daily timeline view while keeping the interface clean and space-efficient.

### v3.7.35

- **📊 Complete Active Task Counts in Projects Dropdown:** Audited and refined the active task counts displayed in the Projects dropdown trigger and menu. Project badges now accurately reflect all active tasks across Must Do, Should Do, Could Do, On Hold, and Scheduled & Recurring tasks (including future scheduled dates).

### v3.7.34

- **📐 Full-Width Real-Estate for On Hold & Scheduled Tasks:** Removed the heavy grey box border, background fill, and recessed padding from the On Hold and Scheduled & Recurring task lists. Tasks now render full-width edge-to-edge seamlessly matching the primary priority sections, maximizing visible screen real-estate while maintaining clean collapsible headers with chevron indicators and drop-target responsiveness.

### v3.7.33

- **⏱️ Chronological Time Ordering & Time Visibility Setting:** Tasks with a scheduled time now automatically appear in chronological time order with the earliest time first, allowing 123ToDo to function like a daily calendar schedule while fully preserving custom drag-and-drop manual reordering. Added a new "Scheduled Task Times" toggle in Settings (Tasks & Workflow) to easily show or hide time selectors and time badges for an even simpler, distraction-free interface.

### v3.7.32

- **🕒 Universal Custom Circular Clock Face Time Picker:** Introduced a unified, custom circular clock face time picker across desktop and mobile. Features an intuitive two-step interactive clock dial (hours then minutes), digital time display with direct hour/minute switching, AM/PM toggle, and dial-tap selection for a seamless, consistent experience on all platforms.

### v3.7.31

- **✨ Clean Priority Section Headers:** Removed the redundant "Collapsed" text label from priority section headers in the main task list. Sections maintain clean, uncluttered visual headers with intuitive chevron toggle icons indicating collapse and expansion states.

### v3.7.30

- **⏰ Simple Clock Face Time Picker:** Simplified the scheduling time picker to a clean, minimal interface. Clicking the time input opens the intuitive native clock face to easily pick the hour then minutes, eliminating visual clutter while preserving quick Google Calendar and Apple Calendar integration.

### v3.7.29

- **⚡ Fast 1-Tap Time Presets & Clean Dropdown Picker:** Upgraded the time picker to make scheduling tasks effortless on both mobile and desktop. Added 1-tap quick preset chips for Morning (09:00), Midday (12:00), Afternoon (14:00), and Evening (18:00), alongside a clean common times dropdown and exact time input, while seamlessly retaining calendar integration.

### v3.7.28

- **📅 Google & Apple Calendar Integration & Automated Reminders:** Added seamless 1-click "Add to Google Calendar" and "Add to Apple Calendar" (.ics) buttons when scheduling tasks, pre-configured with reminders. Also introduced automated in-app and PWA reminders for due scheduled tasks on desktop and mobile devices, with a preference toggle in Settings.

### v3.7.27

- **⏰ Optional Time for Scheduled Tasks:** Added an optional scheduled time alongside the scheduled date. Designed to be visually minimalist and unobtrusive so it does not clutter the interface for users who only schedule by date, with a subtle "+ Add time" option, clear controls, and chronological date and time ordering.

### v3.7.26

- **🖐️ Drag-and-Drop Reordering for Due Scheduled Tasks:** Scheduled tasks continue to appear at the top of their priority list when their set due date arrives, but now fully respect custom drag-and-drop reordering without snapping back to the top, allowing users to freely move them anywhere in the list or place other tasks above them.

### v3.7.25

- **📝 Streamlined & Clutter-Free Notes View:** Simplified the Notes view header by removing the achievements badge and settings cog (accessible anytime in Tasks view), neatly aligning the red new note icon on the header row next to projects, and eliminating the redundant Add New Note button below for a cleaner, distraction-free writing experience.

### v3.7.24

- **🎙️ Continuous Voice Dictation & Word Repetition Elimination:** Resolved speech transcription word duplication and engine stutters during continuous dictation. Added intelligent multi-word and single-word deduplication, seamless interim segment boundary overlap merging, and clean pause recovery across all Talk buttons in Tasks and Notes modes.

### v3.7.23

- **🔝 Top Priority Placement for Scheduled Tasks Due Today:** When a scheduled task reaches its set day (or is due today), it is now automatically placed at the top of its priority list, ensuring it is immediately visible and never overlooked even in long lists.

### v3.7.22

- **📅 Chronological Scheduled Tasks Sorting:** Scheduled and recurring tasks in the Scheduled section are now automatically sorted in ascending date order with tasks due the soonest displayed at the top of the list.

### v3.7.21

- **🏢 Commercial White-Labeling & Multi-Tenant Branding (Phase 1):** Introduced an extensible configuration architecture allowing custom branded editions for commercial clients while preserving seamless core app updates for everyone. Supports custom partner footer branding, partner logos, client-specific support/portal links, and client feature flags with instant activation via URL (?brand=pilot) and device persistence.

### v3.7.20

- **🎨 Styled Projects Dropdown in Notes Mode:** Upgraded the Notes view project dropdown to match the custom styled dropdown in Tasks mode, featuring vibrant project color borders, colored indicator bands, accurate note counts, and active highlighting.

### v3.7.19

- **✨ Streamlined Notes Toolbar:** Removed the redundant Pro/Lite toggle switch from the Notes view toolbar to match Tasks mode. Interface Profile selection remains fully available and configurable under Settings > Appearance.

### v3.7.18

- **🎙️ Clean Voice Dictation & Echo Prevention:** Resolved speech recognition text duplication across pauses in Notes mode. Cleaned up recognition instance recycling during natural pauses and pauses between sentences, preventing repeated words, duplicated sentences, and overlapping speech buffers.

### v3.7.17

- **🔄 Drag-and-Drop Reordering for On Hold Tasks:** Added full drag-and-drop support to the On Hold tasks section. Users can now reorder tasks within the On Hold section as well as drag tasks into and out of On Hold from any priority tier or project column with responsive visual drop indicators.

### v3.7.16

- **✨ Streamlined Main List Toolbar:** Removed the Pro/Lite interface toggle switch from the main task list toolbar, freeing up valuable space for project names and essential action buttons on smaller mobile screens. Interface Profile selection remains fully available and configurable under Settings > Appearance.

### v3.7.15

- **🔄 Restored Drag-and-Drop Task Reordering in Lite Mode:** Restored draggable handlers and reordering capability across tasks in Lite mode. Users can seamlessly click and drag tasks to reorder them within or between priority sections and project columns in both Lite and Pro interface profiles, with safeguards ensuring smooth drops without unintended edit modal triggers.

### v3.7.14

- **📱 Adaptive Resolution & Compact Phone Scaling:** Added automatic device screen resolution and viewport detection. For older and compact phones (such as iPhone SE, iPhone 5/6/7/8, Galaxy A-series, and screens ≤375px or ≤640px high), the app automatically adjusts base typography, header logo width, modal paddings, and touch targets to maintain optimal proportion and eliminate cramped layouts. Includes a manual override in Settings > Appearance (Auto, Compact, Standard).

### v3.7.13

- **🛡️ Safe & Clean Lite Notes View:** Removed the expand chevron icon adjacent to the archive checkbox in Lite notes view to eliminate accidental completions. Users can effortlessly expand and view full note details and edit mode by clicking directly on the note card or text.

### v3.7.12

- **🛡️ Safe & Clean Lite Tasks View:** Removed the expand chevron icon adjacent to the archive checkbox in Lite tasks view to prevent accidental taps. Users can effortlessly view and edit complete task details and subtasks by clicking directly on the task item to open the full edit modal.

### v3.7.11

- **🔒 Truthful & Evidentiary Timestamps Integrity:** Audited timestamp handling across tasks, notes, and archives. Removed legacy fallback to IDs to eliminate false or ancient timestamps (e.g. 1970). Tasks and notes created prior to timestamp tracking strictly omit timestamp badges unless a genuine creation date was recorded. Added strict validation ensuring only truthful, modern timestamps are formatted and displayed.

### v3.7.10

- **🎯 Unified Expanded Edit Card Across Views:** Clicking any task in Lite view now directly launches the exact same full Pro Task Edit Card as Pro view, providing identical editing capabilities, voice dictation, priority selectors, subtasks checklist, notes editor, and date scheduling across both modes. Tapping the expand chevron reveals the full in-card Pro layout.

### v3.7.9

- **✨ Enhanced Pro Details & Seamless Toggle in Lite Mode:** In Tasks mode Lite view, clicking any task card or expand button now seamlessly expands it to reveal complete Pro details (priority badge with color indicator, project badge, scheduled/due date with recurrence, full description, interactive subtasks checklist, notes, and photos). Clicking anywhere on an expanded task toggles collapse back to 2 lines, while clicking the title or Edit Details directly launches the full Pro Edit Modal.

### v3.7.8

- **🔍 Full Pro Details in Lite View & Footer Achievements Badge:** In Tasks mode Lite view, clicking any task now expands it to reveal complete Pro details (project tag, full unclamped text, schedule and recurrence, subtasks checklist, full notes, and photo attachments). Cleaned the Lite toolbar by hiding the achievements badge, and added the achievements badge next to the version number in the footer for instant access in both Pro and Lite modes.

### v3.7.7

- **🍃 Streamlined Lite Mode & Layout Harmonization:** Restored the full-size header logo and moved the Pro/Lite toggle to the action toolbar between the Projects dropdown and Achievements badge. In Lite mode, tasks and notes now display up to 2 lines of description only with zero metadata clutter, retaining the archive checkbox. Clicking any card expands it with full Pro-level details. Notes mode now starts with a clean notes timeline and an Add New Note button.

### v3.7.6

- **🍃 Dual Interface Profiles (Pro / Lite):** Introduced a persistent Pro / Lite view toggle for both Tasks and Notes modes. In Lite mode (default for new users), Tasks present a distraction-free 2-line view with Must Do front and center, and Notes display in a clean 2-line timeline with 1-click progressive disclosure to expand full details.

### v3.7.5

- **🔄 Automated Master Changelog Sync:** Integrated automatic synchronization between in-app release notes, repository CHANGELOG.md, and the public marketing website changelog during the build process.

### v3.7.4

- **📜 Public Web Changelog & Master Version History:** Added direct access to the complete, unbroken release changelog from v1.0.0 to present on 123todo.com and in-repo CHANGELOG.md.

### v3.7.3

- **🔝 Top-Level Version Info Modal & Close Button:** Elevated the Latest Update Info modal to always display on top of Settings with dedicated Close buttons (top-right X and bottom button), and expanded release history to display the last 5 versions.

### v3.7.2

- **📢 Social Share Call-to-Action:** Updated the lowest footer social sharing section with a clearer call-to-action: "Share this App and keep it FREE!".

### v3.7.1

- **🔄 Silent Background Updates:** App updates now install automatically and silently in the background without intrusive update bars or interruption to your work.
- **⚙️ Compact Settings Sync & Version History:** Moved the sync status indicator into Settings with a clean, compact design, and added a Latest Update Info modal in App & Updates to view recent release highlights.

### v3.7.0

- **🕒 1-Click Timestamped Notes & Updates:** Added a 1-click + Timestamp button in the task notes editor (and full-screen focus overlay). Automatically appends the current date & time so you can maintain progressive activity logs, phone call updates, and running client journals without clunky multi-note bloat.
- **📅 Visible Creation Timestamps in Task Edit:** Displays the exact evidentiary date and time when the task or note was originally created at the bottom of the edit modal, matching evidentiary logs in Notes mode.
- **📐 Harmonized Top Bar Spacing & Compact Footer:** Standardized top bar button spacing to a uniform 12px grid with 32px circular touch targets, and streamlined the footer by removing redundant import/export buttons to maximize vertical task viewing space.

### v3.6.21

- **🎙️ Continuous Voice Dictation & Pause Resilience:** Resolved premature 4-second dictation cutoffs. Enabled true continuous recognition across Mac and mobile devices with seamless auto-restart across natural thinking pauses, keeping the mic active until you tap to finish.

### v3.6.20

- **🎯 Task-Style Archive Checkbox in Notes Mode:** Moved the archive checkbox to the top-right header on each note card with smooth square-to-check animation and 300ms completion delay, identical to Task mode.
- **🎨 Cohesive Notes Mode Iconography:** Aligned priority flag icons, subtask checklist icons, and circular 32px header action buttons across Notes mode for visual consistency.

### v3.6.19

- **⏱️ Configurable Notes Auto-Save Delay:** Balanced 1-minute (60s) real-world default delay for on-site measuring and quoting, with customizable tiers (30s, 1m, 2m, 5m, or manual) in Settings > Tasks & Workflow.

### v3.6.18

- **⚡ Redesigned Fast Notes Mode:** Prominent Save button at the top right alongside Talk button, single note field with "Add New Note..." placeholder, photo attachments at the note-taking stage, and discard protection.

### v3.6.17

- **📲 Streamlined PWA Experience:** Intelligent frequency for install prompts based on active app usage without disruptive footer links.

### v3.6.16

- **📝 Simplified Notes Editing:** Dynamically hides empty note details fields during quick note editing, reserving full view for notes that contain text.

### v3.6.15

- **🛡️ Brand & Copy Modernization:** Refined app wording and terms to support ongoing feature enhancements.

### v3.6.14

- **📸 Human-Friendly Photo Names & Zero-Bleed Lightbox:** Transformed long machine-generated photo filenames into clean, human-friendly titles and eliminated action bar bleed in the photo Lightbox.

### v3.6.13

- **👋 Streamlined Welcome Modal:** App-first onboarding with clean collapsible accordion drawers for how to install, features, and privacy without overwhelming walls of text.

### v3.6.12

- **⚡ Fast Notes Mode & Top Save Buttons:** Redesigned Notes mode for lightning-fast capture. Added prominent, large Save Note buttons right at the top of both Quick Add and Note Edit cards, alongside Cmd+Enter keyboard shortcut support.
- **📅 Bottom Evidentiary Timestamps & 1-Tap Copy:** Added full date and time timestamps at the bottom of all note and task cards with a 1-tap Copy Evidence button for official job logs, client proof, and invoices.
- **📸 Native Phone Photo Export & Capture Evidence:** Added 1-tap Save to Photos / Share via native Web Share API so iPhone and Android users can save photos directly to their Apple Photos Camera Roll, plus exact capture timestamps in the Lightbox.

### v3.6.11

- **⚙️ Reorganized Settings Hub:** Restructured Settings into 8 intuitive, priority-ordered tabs (Appearance, Tasks, Projects, Swipe, Cloud Sync, Voice, Shortcuts, App & Updates) for lightning-fast configuration.
- **📋 Dedicated Tasks & Workflow Preferences:** Grouped list view modes (compact vs full-length), date formats, character limits, and preferred email clients into a dedicated Tasks settings panel.
- **🎙️ Dedicated Voice Dictation Guide:** Created an uncluttered, standalone reference for speech-to-text, device-tailored voice features, punctuation, and editing commands.
- **📦 Consolidated App & Updates Center:** Unified the version checker, 1-click PWA installer, and platform installation guides into an all-in-one App & Updates section.

### v3.6.10

- **⏩ Sleek Professional Schedule Controls:** Replaced calendar icons and full text with streamlined FastForward quick-schedule buttons (Day & Week), providing cleaner visual hierarchy and extra breathing room in Add and Edit task panels.
- **🔗 Unified Actionable Entity Detection:** Consolidated detected phone numbers, email addresses, and URLs into a single, clean actionable item panel beneath tasks in Edit and Add modes.
- **📦 Quick-Access Task Edit Archiving:** Added an instant Archive button right beside the Close button in the Task Edit header for power users.

### v3.6.9

- **🎙️ Clean Zero-Drop Mobile Voice Capture & Desktop Continuous Dictation:** Tailored dictation by device: zero-drop clean phrase capture on mobile phones (stopping operating-system bleep loops and audio interruptions), unbroken continuous dictation across thinking pauses on desktop computers, and integrated guidance for native keyboard dictation.

### v3.6.8

- **🎙️ Continuous Natural Dictation Across Thinking Pauses:** Refined speech recognition engine to seamlessly remain listening across 2-3 second thinking pauses (up to 20 seconds of silence) without cutting off or requiring you to tap the record button again.

### v3.6.7

- **🎙️ Reliable Mobile Dictation without Chime Interruptions:** Prevented audio interruption cycles and hardware chime loops on mobile phones when speech ends, ensuring words are captured completely without dropping spoken text during system tones.

### v3.6.6

- **🎙️ Continuous Voice Dictation & Natural Pauses:** Enabled true continuous recognition and an extended 20-second pause window so your phone mic stays open and listening through your thoughts without cutting out or chiming off prematurely.
- **🔤 Natural Spoken Editing & Letter-by-Letter Spelling:** Refined deletion commands ("delete last 2 words", "delete last sentence") and added intuitive spelling commands ("spell out...", "letter by letter...") for unusual names and words.

### v3.6.5

- **🎙️ User-Friendly Mobile Voice Dictation:** Eliminated aggressive auto-restart loops on mobile phones, stopping repeated system confirmation beeps and chimes during natural speech pauses.
- **🔴 Clear Visual Recording Indicators:** Replaced confusing muted/strikethrough mic icons with live glowing recording indicators, clear "Listening... (Tap to finish)" tooltips, and reassuring captured feedback.

### v3.6.4

- **📁 Full Project List in Task Edit:** Task Edit modal dynamically elevates overflow when opening the projects dropdown, ensuring the complete project list displays without being cut off by the modal dialog boundary.
- **📅 Single-Row Schedule Controls in Task Edit:** Auto-sized scheduled date picker and aligned Next Day and Next Week quick buttons onto a single neat row without line-wrapping.

### v3.6.3

- **🎨 Spectrum Project Palette & Auto-Migration:** Reorganized project color palette into a 20-color natural spectrum across 2 lines of 10, avoiding master priority colors, with seamless auto-migration for existing projects and tasks.
- **📅 Single-Row Schedule Date Controls:** Optimized date picker width in Add Task and aligned Next Day and Next Week quick-schedule buttons onto a single neat row.
- **📁 Full-Height Project Dropdown in Add Task:** Expanded Add Task projects dropdown to display full project list cleanly above the blurred background without container clipping.

### v3.6.2

- **✉️ Preferred Email Service Picker:** Clicking an actionable email link now prompts you to choose your preferred email app or web service (Apple Mail / System, Gmail, Outlook.com, or Yahoo Mail). It remembers your choice once and can be changed anytime in Settings.

### v3.6.1

- **📞 Actionable Email Addresses & Phone Numbers:** Email addresses (mailto:) and phone numbers (tel:) in tasks, task notes, and notes are now automatically actionable and clickable on all devices with direct dialing, emailing, and browsing.
- **📲 PWA Installation Guide & Awareness:** Added dedicated Progressive Web App (PWA) installation guide modal with device auto-detection (iOS, Android, Desktop), 1-click install prompt support, and a comprehensive beginner guide article.

### v3.6.0

- **📸 Photo Attachments in Notes & Tasks:** Attach up to 3 photos or screenshots per note! Features native camera capture on mobile, file upload, drag-and-drop, direct clipboard pasting (Cmd+V / Ctrl+V) for screen grabs, ultra-fast client-side compression to preserve crisp receipts and 4K text, local IndexedDB caching, and a full-screen Lightbox viewer with zoom.
- **🖐️ Smooth Drag-and-Drop Task Reordering:** Eliminated drag-and-drop snapback issues with stabilized pointer tracking and immediate local state settlement.
- **📱 Responsive Project Name Line-Wrapping:** Long project names now wrap smoothly on mobile and compact desktop windows, ensuring the Add Task button and settings icons remain perfectly aligned and fully visible.
- **🔒 Enhanced Session & Setting Persistence:** Core app preferences and user session settings now persist safely across version upgrades.
- **🎙️ Clean Voice Dictation & Redesigned Note Controls:** Resolved dictation sentence duplication, moved the bold Voice button to the right, renamed Focus Editor to Expand, and collapsed notes on recurring and scheduled tasks by default for a decluttered view.

### v3.5.2

- **🛡️ Sync Engine Startup Guard & Efficiency:** Sync checks on launch and background polling now only run for your actively selected sync engine, ensuring zero unwanted Google Drive checks when syncing via Cloud Sync (Cloudflare / VPS).
- **📡 Dynamic Provider-Aware Offline Alerts:** Offline status notifications now dynamically detect and display your chosen sync engine (Cloud Sync or Google Drive).
- **🖐️ Enhanced Swipe Action Range & Damping:** Refined swipe gestures with extended travel range and smoother gesture triggers to prevent accidental action cancellation during rapid list management.
- **📂 Expanded Project Dropdown Selectors:** Significantly widened project selectors in Add Task and Edit Modal views with dynamic viewport height bounds for long project lists.
- **🛡️ Project Deletion Safety Spacing:** Separated confirmation and delete buttons in project management settings to prevent accidental project removal.

### v3.5.1

- **🎨 10-Tier Level Roadmap & Color-Coded Progress Ladder:** Added an interactive progression guide in the Achievements Hub detailing all 10 ranks from Focused Starter to 123 Immortal, complete with custom color themes, level descriptions, and point requirements.
- **📖 Featured Streaks & Milestones Blog Guide:** Linked our comprehensive illustrated guide on "The Psychology of Productivity Streaks & Milestones" directly from the Achievements Hub.

### v3.5.0

- **🏆 Productivity Achievements & Stats Hub:** Added an achievement trophy badge in the header opening a house-styled modal with 10-tier level progression, Productivity Points, 6-card productivity insights, daily streaks, 1-2-3 rule balance ratios, and unlockable milestone badges.
- **↕️ Subtasks Line Wrapping & Drag-and-Drop Reordering:** Checklist subtasks now automatically wrap lines onto multiple rows and can be rearranged via drag-and-drop handles across Add Task, Edit Modal, and Task List views.
- **🔍 Space-Efficient Note Preview:** Tasks with notes now display a clean, single-line preview of the note directly underneath the task title for quick scanning without eating screen real estate.
- **🎨 Add Task Project Dropdown Styling:** Restyled project selector in the Add Task form with project color pills, clean borders, and matching elevated dropdown popovers.
- **📚 123todo.com Knowledge & Blog Hub:** Embedded direct links in the Achievements hub to official 123todo.com blog articles covering time management, micro-steps, and daily habit consistency.

---

## 🎙️ Phase 4: Dual-Skin OS & Multi-App Migration (v3.0.0 – v3.4.2)

### v3.4.2

- **⚡ Accelerated Background Sync Intervals:** Enhanced background polling speed across standard adaptive sync tiers: 30s for default background sync, 60s for moderate editing, and 120s for heavy usage.

### v3.4.1

- **🖐️ Drag-and-Drop Project Preservation Fix:** Fixed task reordering logic to preserve task project assignments when dragging and dropping tasks to new positions in priority lists.
- **⚡ Cloudflare Sync Optimization & Adaptive Rate Budgeting:** Optimized cloud sync request volume with conditional pulls, automatic CORS caching, and intelligent client-side adaptive rate budgeting that protects battery, bandwidth, and zero-cost quotas.

### v3.4.0

- **📊 Project Columns View in Wide Mode:** Added a new setting option to view wide-screen Kanban columns grouped by Projects instead of Priorities, with horizontal scrolling and full browser width expansion.
- **🖐️ Precision Drag-and-Drop Drop Line Alignment:** Fixed task insertion position during drag-and-drop to align precisely with the target drop indicator line.

### v3.3.3

- **📝 Real-Time Textarea Auto-Expansion & Dictation Viewport Scroll:** Removed restrictive height caps across all Notes mode textareas, enabling unlimited dynamic height expansion and smooth viewport auto-scrolling so newly spoken lines remain 100% visible at all times.

### v3.3.2

- **🎙️ Voice Command Refinements & Expanded Focus Modal:** Refined voice dictation punctuation processing, enhanced "add note" and "add task" voice submission sensitivity, aligned On Hold tasks list layout, and expanded focus editor overlay modal to maximum viewport size.

### v3.3.1

- **🔒 Dual-Engine Encrypted Cloud Sync & Documentation Update:** Expanded sync documentation covering 123ToDo Zero-Knowledge Cloud Sync (Cloudflare D1 E2EE) alongside Google Drive AppData Sync, and published switching & migration guides.

### v3.3.0

- **🔄 Multi-Competitor Migration Wizard & 1-Click Import from Other Apps:** Introduced a unified "Import from Other Apps" wizard supporting seamless data migration from Todoist, TickTick, Google Keep, Google Tasks, and Microsoft To Do with zero text truncation and multi-file drag-and-drop support.

### v3.2.0

- **🌐 Multi-Platform Social Sharing & Native Graphic Image Share:** Added social share links for Reddit, Telegram, Threads, Bluesky, and Pinterest alongside X, WhatsApp, Facebook, LinkedIn, and Email, enabled native device image file sharing via Web Share API, and deployed a custom 1200x630 123 ToDo preview card.

### v3.1.6

- **📝 14pt Tasks Default, Task-First Notes & Inline Subtask Editing:** Bumped default Tasks mode text size to 14pt with responsive button layout scaling, routed Notes View entry directly to Task text field with Must Do (P1) priority, added inline subtask text editing across all views, and fixed completion checkbox archiving.

### v3.1.5

- **⚡ Multi-Stage Search Auto-Focus:** Enhanced search input auto-focus with multi-stage timers (0ms, 50ms, 150ms) ensuring the cursor immediately focuses inside the text box across all mobile and desktop browsers.

### v3.1.4

- **🎯 Instant Search Input Auto-Focus:** Tapping the search magnifying glass icon in either Tasks or Notes mode automatically focuses the expanded search text box and places the cursor inside for instant typing.

### v3.1.3

- **🔍 Search Bar Collapse & Unstacked Single-Row Header Layout:** Clicking X on the expanded Search bar now clears search query and collapses the bar back to magnifying glass only, and guaranteed non-stacking single row header layout in Notes view.

### v3.1.2

- **🎨 Notes Control Bar Layout & Settings Label Formatting:** Aligned Search icon, Projects dropdown, and Settings icon on the exact same row in order, and updated Notes View Text Size settings label formatting to (Default), (Smaller), or (Larger).

### v3.1.1

- **📱 Mobile Header & Expanding Search Bar:** Fixed mobile header layout overflow with responsive logo scaling, larger switcher font size (15px), expandable search icon toggle in Notes view matching Tasks view, and "Add New Note" placeholder.

### v3.1.0

- **🛡️ Safe Note Archiving & Multi-Field Search:** Removed direct card deletion icon to prevent accidental data loss (items are safely archived via completion), enabled full multi-field search across titles and notes in Tasks view, added Settings cog to Notes view, and introduced independent Notes View text size scaling.

### v3.0.2

- **🎨 Header & Notes Layout Refinements:** Removed duplicated header Add Task button, single-row Search and Project Filter dropdown alignment, Add Note holding placeholder text, expanded button spacing for glove-friendly use, and renamed card action button to "Priority".

### v3.0.1

- **🎙️ Voice Notes UI Refinements & Bug Fixes:** Deeper mode toggle buttons, relocated + Add Task button to subheader, red tape-recorder Talk dictation button, simplified single note entry, and descending chronological note ordering.

### v3.0.0

- **🎙️ Dual Skin Operating System & Simple Voice Notes Mode:** Introduced a second skin for 123 ToDo! Switch between structured Task Manager Mode (P1-P4 matrix) and Simple Voice Notes Mode featuring extra large builder-friendly text, hands-free continuous dictation, unassigned inbox capture, deferred project assignment, and 1-tap task conversion — all backed by the same unified dataset and zero-knowledge sync engine.

---

## 🔒 Phase 3: Voice Dictation & E2EE Cloud Sync (v2.5.0 – v2.9.0)

### v2.9.0

- **📂 Collapsible Priority Sections & Streamlined Toolbar Controls:** Added expand/contract toggles with state persistence to priority sections, provider-agnostic Synced status indicator, collapsible notes for scheduled tasks, and streamlined Edit Task modal controls.

### v2.8.0

- **🔒 123ToDo Set & Forget Cloud Sync & Dual Provider Engine:** Introduced 123ToDo Cloud Sync powered by Cloudflare D1 Serverless E2E Zero-Knowledge Encryption (AES-256-GCM). Eliminates 1-hour Google OAuth drops, fully supports iOS Safari PWAs, and adds 5-second 6-digit device pairing.

### v2.7.4

- **🎙️ Advanced Voice Commands & Auto-Scroll Viewport Tracking:** Hands-free task creation ("add task"), live spoken deletion ("delete last word", "scratch that", "clear all"), real-time auto-scroll tracking, steady Google Sync indicator dot, and a Voice-to-Text guide in Settings.

### v2.7.3

- **🎙️ Spoken Voice Commands & Dictation Settings Guide:** Added spoken deletion commands ("delete last word", "scratch that", "clear all"), hands-free auto-submission when saying "add task", and a detailed Voice-to-Text guide in Settings.

### v2.7.2

- **🏆 Minimalist Milestone Congratulations Modal:** Redesigned the task completion milestone modal to align perfectly with the clean, modern aesthetic of the application, featuring theme variables, Framer Motion entry animations, and sharp stat cards.

### v2.7.1

- **📜 Live Dictation Auto-Scroll & Viewport Tracking:** Added auto-expanding height and scrollTop tracking so newly spoken words/lines are always clearly visible at the bottom of the input canvas during voice dictation.

### v2.7.0

- **🟢 Refined Google Sync Status Indicator:** Kept Google Drive Sync button text and background completely steady during sync operations, adding a pulsing green status dot to indicate active background syncing smoothly.

### v2.6.9

- **🔘 Unified Action Toolbar in Edit Modal:** Aligned Notes, Subtasks, and Schedule toggle buttons onto a single flex row when editing tasks, matching the Add Task layout.

### v2.6.8

- **🎙️ Smart Voice Transcript Deduplication:** Added word-level suffix and prefix overlap detection algorithm (mergeBaseAndTranscript) to guarantee zero text duplication across all voice dictation sessions.

### v2.6.7

- **📝 Compact Empty Notes & Refined Selector Styling:** Compacted empty Notes field to a clean toggle button when editing tasks, and removed background color fills from Priority & Project dropdown triggers and options.

### v2.6.6

- **🎙️ Voice Input Fix & Selective Character Count:** Fixed text duplication when dictating via voice, and hidden character count indicators when Unlimited Characters mode is enabled.

### v2.6.5

- **🎨 Color-Coded Priority & Project Selectors:** Enhanced Edit Modal dropdowns with custom color-coded indicators, priority dot badges, and project accent color bands.

### v2.6.4

- **📐 Significantly Expanded Modal Viewing Canvas:** Expanded in-modal textarea height up to 480px and widened edit modal container to 580px when Expand mode is activated.

### v2.6.3

- **📏 Expanded Task Text Width:** Reduced check box padding and right action margins to maximize horizontal text space on each task item.

### v2.6.2

- **🔍 Expanded Focus & Notes Editor:** Added inline height expansion controls and a spacious full-screen Focus Canvas Overlay with word, character, and line count metrics for reviewing and editing large task descriptions and notes.

### v2.6.1

- **📝 Task Text Editing & Todoist Import Fix:** Fixed character limit blocking when editing imported or long tasks, ensuring full text editing freedom without browser input locks.

### v2.6.0

- **✨ 123 ToDo v2.6.0 Milestone Release:** Major release featuring refined compact task layouts, 440px redesigned Edit/Note Modal, 1-click Next Week scheduling, drag-and-drop & completion persistence fixes, default Muted theme, full-height Projects menu, and glassmorphic update notifications.

### v2.5.32

- **📁 Full-Height Projects Dropdown:** Expanded the main Projects dropdown popup to display all projects down to the last item without forced scrollbars.

### v2.5.31

- **✨ Refined Update Notification Card:** Redesigned the new version update prompt into a clean, glassmorphic card with Framer Motion entry animations and subtle accent typography.

### v2.5.30

- **🎨 Default Muted Light Theme:** Set Muted tone (Subdued Cozy Grey with Zero Glare) as the default light theme mode for new users.

### v2.5.29

- **✅ Task Completion Persistence & Sync Conflict Fix:** Fixed active vs archived conflict resolution during dataset merges and unmount cleanup in task completion timer so completed tasks never re-appear in active lists.

### v2.5.28

- **🔤 Standard Font Weight Adjustment:** Adjusted standard font weight to regular 400 for crisp, non-bold text when Bold Typography mode is disabled.

### v2.5.27

- **📅 Quick "Next Week" Scheduling Button:** Added 1-click "Next Week" quick scheduling buttons across Edit Modal, Add Task, and Quick Defer controls.

### v2.5.26

- **🖐️ Drag-and-Drop & Task Edit Persistence Fix:** Fixed downward task reordering index calculations, task updatedAt timestamp tracking, and LocalStorage state synchronization dependencies.
- **📝 Refined Edit & Note Modal Layout:** Redesigned the edit modal with a compact 440px width, Priority and Project selectors above title, and Notes directly below title.

### v2.5.25

- **⚡ Cache-Busted PWA Update Engine:** Added direct cache-busted version checking via version.json so desktops and mobiles never get stuck on stale cached PWA builds.

### v2.5.24

- **🖐️ Smooth Drag & Drop Drop Position Fix:** Aligned task reordering insertion to target drop indicator line and disabled Framer Motion layout spring-back interference.

### v2.5.23

- **🖐️ Cross-Priority Drag & Drop Fix:** Fixed a type-coercion bug in task ID comparisons during HTML5 drag and drop, ensuring tasks stay locked in place after reordering across priorities.

### v2.5.22

- **⚡ App Health & Silent Error Tracking:** Added 100% anonymous browser error and sync drop monitoring to detect friction in the wild.
- **🛠️ Feature Adoption Metrics:** Added privacy-preserving feature adoption metrics for Voice Dictation, Cloud Sync, Todoist Imports, and Search.

### v2.5.21

- **💻 OS Platform Breakdown:** Added 100% privacy-preserving OS & platform classification (macOS, iOS, Windows, Android, Linux).
- **🌐 Geographic Region Breakdown:** Added privacy-safe approximate region metrics (United Kingdom, Europe, North America, Australasia, Asia).

### v2.5.20

- **⏱️ Active Session Usage Tracking:** Added 100% privacy-preserving active usage session time tracking (heartbeat active minutes while app is in focus).
- **✅ Aggregate Task Completion Counter:** Added privacy-safe aggregate task completion count metric.

### v2.5.19

- **⚡ Deployment Trigger Optimization:** Optimized GitHub Actions automated deployment workflow trigger for seamless VPS deployments.

### v2.5.18

- **⚙️ VPS Deployment Automation Fix:** Refreshed deployment trigger sequence to guarantee clean VPS container builds.

### v2.5.17

- **🛡️ 100% Privacy-Preserving Telemetry:** Zero cookies used, no IP addresses or personal data logged, fully GDPR/CCPA compliant out of the box.

### v2.5.16

- **🛡️ Archive Deletion 2-Stage Approval:** Added prominent visual warning banner and 2-step confirmation buttons before clearing archived tasks.
- **🖐️ Drag & Drop Task Reordering:** Restored smooth HTML5 drag-and-drop task reordering across list sections and On Hold tasks.
- **📌 Top Placement for New Tasks:** Newly created tasks now automatically appear at the top of their respective item list section.
- **🧹 Todoist CSV Import Metadata Filter:** Automatically filters out Todoist CSV export metadata rows (such as view_style=list).
- **📊 Projects Dropdown Task Badges:** Displays active task count badges (e.g. All (12), Work (5)) in the projects drop-down selector and option list.
- **🎨 Configurable Light Mode Tones:** Introduced 3 light mode background tones (Bright, Soft, Muted) under Settings ➔ Appearance to reduce eye strain.
- **📐 Streamlined Task List Layout:** Removed leading + note toggle symbol button to save space and enhance task list appearance.

### v2.5.15

- **📐 Open Archive Range-Left Alignment:** Aligned Open Archive section button range-left to match On Hold and Scheduled headings.

### v2.5.14

- **🎯 Task Drag & Drop Position Persistence Fix:** Guarantees custom reordered task positions stay permanently saved during 2-way background Google Drive sync.

### v2.5.13

- **📐 Single-Row Header Bar Alignment:** Search icon, project dropdown (dynamically sized to project text), and Settings cog are now cleanly aligned on a single row.

### v2.5.12

- **🗑️ Archive Deletion 2-Way Sync Fix:** Guarantees deleted items from the Archive remain permanently deleted across all connected devices during 2-way Google Drive sync.

### v2.5.11

- **📦 Simplified Archive Trigger:** Shortened archive button label to "Open Archive" for a cleaner visual layout.
- **📐 Refined Header Typography:** Reduced section header font size on Archive, Scheduled, and On Hold titles for clean visual proportions.

### v2.5.10

- **🗑️ Project Deletion Sync Fix:** Guarantees deleted custom projects remain permanently deleted across all connected devices during 2-way Google Drive sync.

### v2.5.9

- **🔤 Font Settings Persistence:** Guarantees text size and typography settings remain saved across page reloads and version updates.
- **📦 Full-Screen Archive Search:** Spacious full-screen Archive modal with instant keyword search, project filters, and sorting.
- **🔄 Sync Restoration Fix:** Restored tasks stay active permanently across devices without falling back into the Archive.

### v2.5.8

- **🔒 Pull-to-Refresh Gesture Lock:** Prevents vertical pull-to-refresh motions from accidentally triggering swipe-to-archive task actions.
- **📦 Complete Archive Visibility:** Guarantees that all archived tasks are stored and rendered reliably in the Archive section.

### v2.5.7

- **🗑️ Project Deletion Overlay Fix:** Fixed Delete Project confirmation modal layer so deletion prompts render cleanly on top of Settings.
- **📐 Header Bar Space Optimization:** Streamlined the projects bar by placing search icon directly next to the project selector.

### v2.5.6

- **🔤 Bold Text Typography Setting:** Added a Bold Text checkbox under Settings ➔ Appearance for high-contrast typography.
- **📐 Compact View Spacing Refinement:** New default compact density for new users with extra padding between text rows and divider lines.
- **💻 System Default Theme Mode:** Theme Mode defaults to System preference automatically for new users.

### v2.5.5

- **✍️ Spoken Punctuation Recognition:** Speak "full stop", "comma", "question mark", "exclamation mark", "colon", "semi colon", or "new line" to insert punctuation naturally.
- **🛡️ Overwrite-Proof Voice Buffer:** Uses a locked speech buffer so pauses or thinking breaks never overwrite or delete previously spoken text.

### v2.5.4

- **🎙️ Voice Task & Notes Dictation:** Tap the Voice button on task titles or notes to speak naturally. Speech automatically appends to text so you can pause to think.
- **🔄 Seamless 2-Way Multi-Device Sync:** Guarantees that new tasks or projects added offline across multiple devices are merged seamlessly without data loss.
- **📏 Custom Task Description Length:** Set your preferred task description length under Settings ➔ Appearance (250 characters default or Unlimited).

### v2.5.3

- **🎙️ Voice Notes Dictation:** Dictate long descriptions, instructions, or links directly into the task Notes section using voice.
- **⭐ Streamlined Voice Task Creation:** All voice tasks automatically default to Top Priority (P1) and your selected project for effortless 1-tap task entry.

### v2.5.2

- **🔄 Seamless 2-Way Multi-Device Sync:** Guarantees that new tasks or projects added offline across multiple devices (e.g. laptop & phone) are merged seamlessly without data loss.
- **🛡️ Data Preservation Engine:** Prevents sync overwrites so tasks created offline on one device are merged into all connected devices.

### v2.5.1

- **🎙️ Voice Task Input (Speech-to-Task):** Tap the Voice button to speak tasks naturally with automatic priority and project detection.
- **⚡ Smart Natural Language Parsing:** Automatically parses priority (P1-P4) and project keywords from spoken phrases, defaulting to Priority 1 (Must Do).
- **💡 Voice Command Guidance:** Interactive voice command examples and tips available under Settings ➔ Appearance.

### v2.5.0

- **📏 Custom Task Description Length:** Set your preferred task description length under Settings ➔ Appearance (250 characters default or Unlimited).
- **👈 Compact Swipe Reveal Visuals:** Sleeker, faster visual swipe reveal hints that appear immediately upon starting a swipe gesture.
- **✨ Streamlined Task Notes UI:** Optimized Notes field layout for a clean, distraction-free editing experience.

---

## 📊 Phase 2: Desktop Kanban, Subtasks & Swipe Gestures (v2.0.0 – v2.4.17)

### v2.4.17

- **👉 Todoist-Style Swipe Gestures:** Dual-stage visual feedback with solid color fills, spring action icons, and physical rubber-band damping.
- **📅 Date Format Order Preference:** Choose UK (DD/MM/YYYY), US (MM/DD/YYYY), ISO (YYYY-MM-DD), or Short Text date styles under Settings ➔ Appearance.
- **🔄 Prominent Check for Updates:** 1-click update checks in the main app footer and Settings title bar for desktop and mobile.
- **✨ Streamlined Notes UI:** Cleaned up placeholder text and character counters for a distraction-free, spacious editing experience.

### v2.4.16

- **📖 Todoist Migration Guide:** Interactive step-by-step export & import guide modal linked directly from import dialogs.
- **🔍 Complete SEO Overhaul:** Schema.org JSON-LD structured data, high-intent titles, meta descriptions, and search indexing optimizations.
- **📝 Unlimited Notes & Subtask Guidance:** Refined User Guide and landing page copy highlighting subtask checklists and unlimited notes.
- **🐛 Modernized Help & Troubleshooting:** Updated troubleshooting guide with Google Drive sync, Shadow Backup recovery, and PWA updates.

### v2.4.15

- **🔄 Manual Update Check:** Check for updates anytime under Settings ➔ Appearance.
- **🖐️ Drag & Drop Projects:** Reorder your projects by dragging grip handles in Settings.
- **🔔 Sync Alert Popup:** Automatic prompt if Google Drive session disconnects so you can re-auth in 1 tap.
- **📐 Compact Layout:** Optimized project selector dropdown and trimmed header/footer margins.

### v2.4.14

- **🔄 Manual Update Check:** Check for updates anytime under Settings ➔ Appearance.
- **🖐️ Drag & Drop Projects:** Reorder your projects by dragging grip handles in Settings.
- **🔔 Sync Alert Popup:** Automatic prompt if Google Drive session disconnects so you can re-auth in 1 tap.
- **📐 Compact Layout:** Optimized project selector dropdown and trimmed header/footer margins.

### v2.4.13

- **🖐️ Drag & Drop Projects:** Reorder your projects by dragging grip handles in Settings.
- **🔔 Sync Alert Popup:** Automatic prompt if Google Drive session disconnects so you can re-auth in 1 tap.
- **📐 Compact Layout:** Optimized project selector dropdown and trimmed header/footer margins.

### v2.4.12

- **Streamlined Update Notifications:** Refined the service worker update prompt into a clean, minimalist card without intimidating warnings.

### v2.4.11

- **Smarter Backup Prompting:** Optimized the weekly backup reminder prompt to stay silent when cloud sync is already actively protecting data.

### v2.4.10

- **Mobile Project Select Focus Fix:** Prevented mobile browser auto-focus stealing when opening project selector dropdowns.

### v2.4.9

- **Controlled PWA Updates:** Separated service worker installation from automatic reload, allowing users to apply updates smoothly.

### v2.4.8

- **Instant Mobile Touch-Release Sync Flush:** Flushes pending task changes immediately upon lifting your finger on touchscreens.

### v2.4.7

- **Compact Project Spacing:** Compacted project item spacing in Settings for better vertical overview.

### v2.4.6

- **Customizable Task Swipe Gestures:** Introduced the dedicated Swipe settings tab with left and right customizable actions.

### v2.4.5

- **Settings Stability Patch:** Resolved JSX layout boundary issues on compact mobile screens.

### v2.4.4

- **PWA Service Worker Automation:** Enabled automatic service worker skip-waiting for instant cache freshening.

### v2.4.3

- **Accelerated Google Drive Sync:** Enabled ultra-fast 300ms push with concurrency locking for conflict-free multi-device sync.

### v2.4.2

- **Background Polling Engine:** Accelerated Google Drive background polling frequency across active browser tabs.

### v2.4.1

- **Sync Engine Stabilization:** Resolved token expiration edge cases when running as an installed PWA.

### v2.4.0

- **Custom Swipe Gestures Engine:** Added physical swipe-to-complete, swipe-to-delete, and swipe-to-hold actions with rubber-band physics.

### v2.3.9

- **Project Reordering in Settings:** Added drag-and-drop handles in Settings to reorder custom project priorities.

### v2.3.8

- **Dark Mode Calendar Contrast Fix:** Fixed dark mode visibility of schedule toggles and calendar icons.

### v2.3.7

- **Global Calendar Inversion:** Inverted native calendar picker icon in CSS for high contrast in dark mode.

### v2.3.5

- **Unconstrained Recurrence Scheduling:** Decoupled recurring task frequency from start dates and added weekday auto-snapping.

### v2.3.0

- **Subtasks, Recurrence & Scheduled Drawer:** Introduced checklist subtasks (↳), recurring tasks (daily/weekly/monthly), and collapsible Scheduled drawer.

### v2.2.5

- **Export Modal & Web Share API:** Added native export dialog with File System Access API and plain-text file sharing for iOS/Android.

### v2.2.3

- **Keyboard Shortcuts Hub:** Added Shortcuts settings tab with standard desktop hotkeys (N for new task, / for search, Esc to close).

### v2.2.0

- **Todoist Import Wizard (Phase 1 & 2):** Introduced direct CSV import from Todoist with project mapping and unlimited note preservation.

### v2.1.0

- **Wide Desktop Kanban Board:** Added responsive Kanban board view on wide desktop monitors with drag-and-drop columns.

### v2.0.0

- **Zero-Knowledge Google Drive Sync:** First encrypted cloud sync release storing client-side encrypted AES-256 backups directly in personal Google Drive AppData.

---

## 🧱 Phase 1: Foundations & Offline Core (v1.0.0 – v1.4.3)

### v1.4.3

- **Shadow Backup Recovery & Social Share 2.0:** Added 24-hour automatic shadow backup recovery modal and enlarged touch-friendly social share icons.

### v1.4.0

- **Todoist CSV Import & Task Notes:** Added initial CSV import parser and multi-line task description notes.

### v1.3.0

- **Safety-First Backup Workflow:** Added 1-click JSON backup export/import and offline persistence protection.

### v1.2.0

- **Dynamic Category / Project Tabs:** Added Category tabs with line-wrapping, Manage Categories modal, and hollow-circle tap feedback.

### v1.1.0

- **Componentized Architecture & Dark Mode:** Major refactor with modular components, Dark Mode toggle, real-time search, and project color coding.

### v1.0.0

- **Initial Release:** Initial launch of 123 To Do progressive web app with core 1-2-3 priority matrix, offline localStorage, and responsive mobile layout.

---

*Built with pride by Unforgettable Management Ltd / Darron Hartas.*  
*All software releases are verified with continuous automated testing and zero-knowledge encryption.*  
