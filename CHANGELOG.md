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
