export const PRIORITIES = {
  1: { label: 'Must Do', color: '#dc2626', dotColor: '#dc2626' },
  2: { label: 'Should Do', color: '#f59e0b', dotColor: '#f59e0b' },
  3: { label: 'Could Do', color: '#6b7280', dotColor: '#6b7280' },
  4: { label: 'On Hold', color: '#9333ea', dotColor: '#9333ea' }
};

export const STORAGE_KEYS = {
  TASKS: '123TodoTasks',
  ARCHIVE: '123TodoArchive',
  COUNTER: '123TodoCounter',
  MILESTONES: '123TodoMilestones',
  WELCOME_SEEN: '123TodoWelcomeSeen',
  LAST_BACKUP: '123TodoLastBackup',
  REMINDER_DISMISSED: '123TodoReminderDismissed',
  INSTALL_DISMISSED: '123TodoInstallDismissed',
  LAST_INSTALL_PROMPT: '123TodoLastInstallPrompt',
  PROJECTS: '123TodoProjects',
  LAST_PROJECT: '123TodoLastProject',
  SHADOW_BACKUP: '123TodoShadowBackup',
  LAST_SHADOW_TIME: '123TodoLastShadowTime',
  TIMESTAMP: '123TodoTimestamp',
  SWIPE_SETTINGS: '123TodoSwipeSettings',
  DATE_FORMAT: '123TodoDateFormat',
  TASK_LENGTH_LIMIT: '123TodoTaskLengthLimit',
  DELETED_PROJECTS: '123TodoDeletedProjects',
  DELETED_TASKS: '123TodoDeletedTasks',
  SYNC_PROVIDER: '123Todo_SyncProvider',
  CF_SYNC_ID: '123Todo_CF_SyncId',
  CF_DEVICE_TOKEN: '123Todo_CF_DeviceToken',
  APP_MODE: '123TodoAppMode',
  MODE_DISCOVERY_COUNT: '123TodoModeDiscoveryCount',
  NOTES_FONT_SIZE: '123TodoNotesFontSize',
  TASK_VIEW_MODE: '123TodoTaskViewMode',
  EMAIL_CLIENT_PREFERENCE: '123TodoEmailClientPreference'
};

export const DATE_FORMAT_OPTIONS = [
  { id: 'UK', label: 'UK / International', format: 'DD/MM/YYYY', example: '15/08/2026' },
  { id: 'US', label: 'US Style', format: 'MM/DD/YYYY', example: '08/15/2026' },
  { id: 'ISO', label: 'ISO Standard', format: 'YYYY-MM-DD', example: '2026-08-15' },
  { id: 'UK_TEXT', label: 'UK Text', format: '15 Aug 2026', example: '15 Aug 2026' },
  { id: 'US_TEXT', label: 'US Text', format: 'Aug 15, 2026', example: 'Aug 15, 2026' }
];

export const DEFAULT_DATE_FORMAT = 'UK';

export const SWIPE_ACTIONS = {
  complete: { label: 'Complete Task', actionHint: 'Complete', icon: 'CheckSquare', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', activeBg: '#10b981', activeColor: '#ffffff' },
  delete: { label: 'Delete Task', actionHint: 'Delete', icon: 'Trash2', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', activeBg: '#ef4444', activeColor: '#ffffff' },
  priority_4: { label: 'On Hold (P4)', actionHint: 'Hold (P4)', icon: 'PauseCircle', color: '#9333ea', bg: 'rgba(147, 51, 234, 0.15)', activeBg: '#9333ea', activeColor: '#ffffff' },
  edit: { label: 'Edit Task', actionHint: 'Edit', icon: 'Edit2', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)', activeBg: '#2563eb', activeColor: '#ffffff' },
  none: { label: 'None (Disabled)', actionHint: '', icon: 'Slash', color: '#9ca3af', bg: 'transparent', activeBg: 'transparent', activeColor: '#9ca3af' }
};

export const DEFAULT_SWIPE_SETTINGS = {
  enabled: true,
  swipeRight: 'complete',
  swipeLeft: 'delete'
};

export const PROJECT_COLORS = [
  // Line 1: Warm & Green spectrum
  '#b91c1c', // 1. Crimson Red
  '#ea580c', // 2. Burnt Orange / Coral
  '#f97316', // 3. Mandarin Orange
  '#d97706', // 4. Warm Amber
  '#eab308', // 5. Sunflower Yellow
  '#84cc16', // 6. Lime Green
  '#22c55e', // 7. Leaf Green
  '#065f46', // 8. Forest Green
  '#10b981', // 9. Emerald Green
  '#14b8a6', // 10. Teal Green
  // Line 2: Cool, Purple & Pink spectrum
  '#06b6d4', // 11. Bright Cyan
  '#0ea5e9', // 12. Cerulean Sky Blue
  '#3b82f6', // 13. Vivid Blue
  '#285a82', // 14. Ocean Blue
  '#6366f1', // 15. Indigo Blue
  '#8b5cf6', // 16. Royal Violet
  '#a855f7', // 17. Amethyst Purple
  '#d946ef', // 18. Fuchsia Purple
  '#ec4899', // 19. Sweet Pink
  '#f43f5e', // 20. Ruby Rose
];

export const PROJECT_COLOR_MIGRATION = {
  '#f59e0b': '#d97706', // Old Amber (matched P2) -> new Warm Amber
  '#78716c': '#285a82', // Old Slate Gray -> Ocean Blue
  '#dc2626': '#b91c1c', // Master Priority 1 Red -> Crimson Red
  '#6b7280': '#285a82', // Master Priority 3 Slate -> Ocean Blue
  '#9333ea': '#a855f7', // Master Priority 4 Purple -> Amethyst Purple
};

export const migrateProjectColor = (color) => {
  if (!color || typeof color !== 'string') return color;
  const normalized = color.trim().toLowerCase();
  return PROJECT_COLOR_MIGRATION[normalized] || color;
};


export const DEFAULT_PROJECTS = [
  { id: 'all', name: 'All', color: '#6b7280' }
];

export const MAX_TASK_LENGTH = 250;
export const DEFAULT_TASK_LENGTH_LIMIT = '250';
export const DEFAULT_LIGHT_MODE_TONE = 'muted';
export const DEFAULT_TASK_VIEW_MODE = 'compact';
// Notes length is intentionally unlimited to support full Todoist migration and rich task descriptions.
export const BACKUP_REMINDER_DAYS = 7;
export const INSTALL_PROMPT_DAYS = 3;
export const APP_VERSION = '3.6.10';

export const RELEASE_CHANGELOG = {
  '3.6.10': [
    { title: '⏩ Sleek Professional Schedule Controls:', desc: 'Replaced calendar icons and full text with streamlined FastForward quick-schedule buttons (Day & Week), providing cleaner visual hierarchy and extra breathing room in Add and Edit task panels.' },
    { title: '🔗 Unified Actionable Entity Detection:', desc: 'Consolidated detected phone numbers, email addresses, and URLs into a single, clean actionable item panel beneath tasks in Edit and Add modes.' },
    { title: '📦 Quick-Access Task Edit Archiving:', desc: 'Added an instant Archive button right beside the Close button in the Task Edit header for power users.' }
  ],
  '3.6.9': [
    { title: '🎙️ Clean Zero-Drop Mobile Voice Capture & Desktop Continuous Dictation:', desc: 'Tailored dictation by device: zero-drop clean phrase capture on mobile phones (stopping operating-system bleep loops and audio interruptions), unbroken continuous dictation across thinking pauses on desktop computers, and integrated guidance for native keyboard dictation.' }
  ],
  '3.6.8': [
    { title: '🎙️ Continuous Natural Dictation Across Thinking Pauses:', desc: 'Refined speech recognition engine to seamlessly remain listening across 2-3 second thinking pauses (up to 20 seconds of silence) without cutting off or requiring you to tap the record button again.' }
  ],
  '3.6.7': [
    { title: '🎙️ Reliable Mobile Dictation without Chime Interruptions:', desc: 'Prevented audio interruption cycles and hardware chime loops on mobile phones when speech ends, ensuring words are captured completely without dropping spoken text during system tones.' }
  ],
  '3.6.6': [
    { title: '🎙️ Continuous Voice Dictation & Natural Pauses:', desc: 'Enabled true continuous recognition and an extended 20-second pause window so your phone mic stays open and listening through your thoughts without cutting out or chiming off prematurely.' },
    { title: '🔤 Natural Spoken Editing & Letter-by-Letter Spelling:', desc: 'Refined deletion commands ("delete last 2 words", "delete last sentence") and added intuitive spelling commands ("spell out...", "letter by letter...") for unusual names and words.' }
  ],
  '3.6.5': [
    { title: '🎙️ User-Friendly Mobile Voice Dictation:', desc: 'Eliminated aggressive auto-restart loops on mobile phones, stopping repeated system confirmation beeps and chimes during natural speech pauses.' },
    { title: '🔴 Clear Visual Recording Indicators:', desc: 'Replaced confusing muted/strikethrough mic icons with live glowing recording indicators, clear "Listening... (Tap to finish)" tooltips, and reassuring captured feedback.' }
  ],
  '3.6.4': [
    { title: '📁 Full Project List in Task Edit:', desc: 'Task Edit modal dynamically elevates overflow when opening the projects dropdown, ensuring the complete project list displays without being cut off by the modal dialog boundary.' },
    { title: '📅 Single-Row Schedule Controls in Task Edit:', desc: 'Auto-sized scheduled date picker and aligned Next Day and Next Week quick buttons onto a single neat row without line-wrapping.' }
  ],
  '3.6.3': [
    { title: '🎨 Spectrum Project Palette & Auto-Migration:', desc: 'Reorganized project color palette into a 20-color natural spectrum across 2 lines of 10, avoiding master priority colors, with seamless auto-migration for existing projects and tasks.' },
    { title: '📅 Single-Row Schedule Date Controls:', desc: 'Optimized date picker width in Add Task and aligned Next Day and Next Week quick-schedule buttons onto a single neat row.' },
    { title: '📁 Full-Height Project Dropdown in Add Task:', desc: 'Expanded Add Task projects dropdown to display full project list cleanly above the blurred background without container clipping.' }
  ],
  '3.6.2': [
    { title: '✉️ Preferred Email Service Picker:', desc: 'Clicking an actionable email link now prompts you to choose your preferred email app or web service (Apple Mail / System, Gmail, Outlook.com, or Yahoo Mail). It remembers your choice once and can be changed anytime in Settings.' }
  ],
  '3.6.1': [
    { title: '📞 Actionable Email Addresses & Phone Numbers:', desc: 'Email addresses (mailto:) and phone numbers (tel:) in tasks, task notes, and notes are now automatically actionable and clickable on all devices with direct dialing, emailing, and browsing.' },
    { title: '📲 PWA Installation Guide & Awareness:', desc: 'Added dedicated Progressive Web App (PWA) installation guide modal with device auto-detection (iOS, Android, Desktop), 1-click install prompt support, and a comprehensive beginner guide article.' }
  ],
  '3.6.0': [
    { title: '📸 Photo Attachments in Notes & Tasks:', desc: 'Attach up to 3 photos or screenshots per note! Features native camera capture on mobile, file upload, drag-and-drop, direct clipboard pasting (Cmd+V / Ctrl+V) for screen grabs, ultra-fast client-side compression to preserve crisp receipts and 4K text, local IndexedDB caching, and a full-screen Lightbox viewer with zoom.' },
    { title: '🖐️ Smooth Drag-and-Drop Task Reordering:', desc: 'Eliminated drag-and-drop snapback issues with stabilized pointer tracking and immediate local state settlement.' },
    { title: '📱 Responsive Project Name Line-Wrapping:', desc: 'Long project names now wrap smoothly on mobile and compact desktop windows, ensuring the Add Task button and settings icons remain perfectly aligned and fully visible.' },
    { title: '🔒 Enhanced Session & Setting Persistence:', desc: 'Core app preferences and user session settings now persist safely across version upgrades.' },
    { title: '🎙️ Clean Voice Dictation & Redesigned Note Controls:', desc: 'Resolved dictation sentence duplication, moved the bold Voice button to the right, renamed Focus Editor to Expand, and collapsed notes on recurring and scheduled tasks by default for a decluttered view.' }
  ],
  '3.5.2': [
    { title: '🛡️ Sync Engine Startup Guard & Efficiency:', desc: 'Sync checks on launch and background polling now only run for your actively selected sync engine, ensuring zero unwanted Google Drive checks when syncing via Cloud Sync (Cloudflare / VPS).' },
    { title: '📡 Dynamic Provider-Aware Offline Alerts:', desc: 'Offline status notifications now dynamically detect and display your chosen sync engine (Cloud Sync or Google Drive).' },
    { title: '🖐️ Enhanced Swipe Action Range & Damping:', desc: 'Refined swipe gestures with extended travel range and smoother gesture triggers to prevent accidental action cancellation during rapid list management.' },
    { title: '📂 Expanded Project Dropdown Selectors:', desc: 'Significantly widened project selectors in Add Task and Edit Modal views with dynamic viewport height bounds for long project lists.' },
    { title: '🛡️ Project Deletion Safety Spacing:', desc: 'Separated confirmation and delete buttons in project management settings to prevent accidental project removal.' }
  ],
  '3.5.1': [
    { title: '🎨 10-Tier Level Roadmap & Color-Coded Progress Ladder:', desc: 'Added an interactive progression guide in the Achievements Hub detailing all 10 ranks from Focused Starter to 123 Immortal, complete with custom color themes, level descriptions, and point requirements.' },
    { title: '📖 Featured Streaks & Milestones Blog Guide:', desc: 'Linked our comprehensive illustrated guide on "The Psychology of Productivity Streaks & Milestones" directly from the Achievements Hub.' }
  ],
  '3.5.0': [
    { title: '🏆 Productivity Achievements & Stats Hub:', desc: 'Added an achievement trophy badge in the header opening a house-styled modal with 10-tier level progression, Productivity Points, 6-card productivity insights, daily streaks, 1-2-3 rule balance ratios, and unlockable milestone badges.' },
    { title: '↕️ Subtasks Line Wrapping & Drag-and-Drop Reordering:', desc: 'Checklist subtasks now automatically wrap lines onto multiple rows and can be rearranged via drag-and-drop handles across Add Task, Edit Modal, and Task List views.' },
    { title: '🔍 Space-Efficient Note Preview:', desc: 'Tasks with notes now display a clean, single-line preview of the note directly underneath the task title for quick scanning without eating screen real estate.' },
    { title: '🎨 Add Task Project Dropdown Styling:', desc: 'Restyled project selector in the Add Task form with project color pills, clean borders, and matching elevated dropdown popovers.' },
    { title: '📚 123todo.com Knowledge & Blog Hub:', desc: 'Embedded direct links in the Achievements hub to official 123todo.com blog articles covering time management, micro-steps, and daily habit consistency.' }
  ],
  '3.4.2': [
    { title: '⚡ Accelerated Background Sync Intervals:', desc: 'Enhanced background polling speed across standard adaptive sync tiers: 30s for default background sync, 60s for moderate editing, and 120s for heavy usage.' }
  ],
  '3.4.1': [
    { title: '🖐️ Drag-and-Drop Project Preservation Fix:', desc: 'Fixed task reordering logic to preserve task project assignments when dragging and dropping tasks to new positions in priority lists.' },
    { title: '⚡ Cloudflare Sync Optimization & Adaptive Rate Budgeting:', desc: 'Optimized cloud sync request volume with conditional pulls, automatic CORS caching, and intelligent client-side adaptive rate budgeting that protects battery, bandwidth, and zero-cost quotas.' }
  ],
  '3.4.0': [
    { title: '📊 Project Columns View in Wide Mode:', desc: 'Added a new setting option to view wide-screen Kanban columns grouped by Projects instead of Priorities, with horizontal scrolling and full browser width expansion.' },
    { title: '🖐️ Precision Drag-and-Drop Drop Line Alignment:', desc: 'Fixed task insertion position during drag-and-drop to align precisely with the target drop indicator line.' }
  ],
  '3.3.3': [
    { title: '📝 Real-Time Textarea Auto-Expansion & Dictation Viewport Scroll:', desc: 'Removed restrictive height caps across all Notes mode textareas, enabling unlimited dynamic height expansion and smooth viewport auto-scrolling so newly spoken lines remain 100% visible at all times.' }
  ],
  '3.3.2': [
    { title: '🎙️ Voice Command Refinements & Expanded Focus Modal:', desc: 'Refined voice dictation punctuation processing, enhanced "add note" and "add task" voice submission sensitivity, aligned On Hold tasks list layout, and expanded focus editor overlay modal to maximum viewport size.' }
  ],
  '3.3.1': [
    { title: '🔒 Dual-Engine Encrypted Cloud Sync & Documentation Update:', desc: 'Expanded sync documentation covering 123ToDo Zero-Knowledge Cloud Sync (Cloudflare D1 E2EE) alongside Google Drive AppData Sync, and published switching & migration guides.' }
  ],
  '3.3.0': [
    { title: '🚀 Multi-Competitor Migration Wizard & 1-Click Import from Other Apps:', desc: 'Introduced a unified "Import from Other Apps" wizard supporting seamless data migration from Todoist, TickTick, Google Keep, Google Tasks, and Microsoft To Do with zero text truncation and multi-file drag-and-drop support.' }
  ],
  '3.2.0': [
    { title: '🌐 Multi-Platform Social Sharing & Native Graphic Image Share:', desc: 'Added social share links for Reddit, Telegram, Threads, Bluesky, and Pinterest alongside X, WhatsApp, Facebook, LinkedIn, and Email, enabled native device image file sharing via Web Share API, and deployed a custom 1200x630 123 ToDo preview card.' }
  ],
  '3.1.6': [
    { title: '📝 14pt Tasks Default, Task-First Notes & Inline Subtask Editing:', desc: 'Bumped default Tasks mode text size to 14pt with responsive button layout scaling, routed Notes View entry directly to Task text field with Must Do (P1) priority, added inline subtask text editing across all views, and fixed completion checkbox archiving.' }
  ],
  '3.1.5': [
    { title: '⚡ Multi-Stage Search Auto-Focus:', desc: 'Enhanced search input auto-focus with multi-stage timers (0ms, 50ms, 150ms) ensuring the cursor immediately focuses inside the text box across all mobile and desktop browsers.' }
  ],
  '3.1.4': [
    { title: '🎯 Instant Search Input Auto-Focus:', desc: 'Tapping the search magnifying glass icon in either Tasks or Notes mode automatically focuses the expanded search text box and places the cursor inside for instant typing.' }
  ],
  '3.1.3': [
    { title: '🔍 Search Bar Collapse & Unstacked Single-Row Header Layout:', desc: 'Clicking X on the expanded Search bar now clears search query and collapses the bar back to magnifying glass only, and guaranteed non-stacking single row header layout in Notes view.' }
  ],
  '3.1.2': [
    { title: '🎨 Notes Control Bar Layout & Settings Label Formatting:', desc: 'Aligned Search icon, Projects dropdown, and Settings icon on the exact same row in order, and updated Notes View Text Size settings label formatting to (Default), (Smaller), or (Larger).' }
  ],
  '3.1.1': [
    { title: '📱 Mobile Header & Expanding Search Bar:', desc: 'Fixed mobile header layout overflow with responsive logo scaling, larger switcher font size (15px), expandable search icon toggle in Notes view matching Tasks view, and "Add New Note" placeholder.' }
  ],
  '3.1.0': [
    { title: '🛡️ Safe Note Archiving & Multi-Field Search:', desc: 'Removed direct card deletion icon to prevent accidental data loss (items are safely archived via completion), enabled full multi-field search across titles and notes in Tasks view, added Settings cog to Notes view, and introduced independent Notes View text size scaling.' }
  ],
  '3.0.2': [
    { title: '🎨 Header & Notes Layout Refinements:', desc: 'Removed duplicated header Add Task button, single-row Search and Project Filter dropdown alignment, Add Note holding placeholder text, expanded button spacing for glove-friendly use, and renamed card action button to "Priority".' }
  ],
  '3.0.1': [
    { title: '🎙️ Voice Notes UI Refinements & Bug Fixes:', desc: 'Deeper mode toggle buttons, relocated + Add Task button to subheader, red tape-recorder Talk dictation button, simplified single note entry, and descending chronological note ordering.' }
  ],
  '3.0.0': [
    { title: '🎙️ Dual Skin Operating System & Simple Voice Notes Mode:', desc: 'Introduced a second skin for 123 ToDo! Switch between structured Task Manager Mode (P1-P4 matrix) and Simple Voice Notes Mode featuring extra large builder-friendly text, hands-free continuous dictation, unassigned inbox capture, deferred project assignment, and 1-tap task conversion — all backed by the same unified dataset and zero-knowledge sync engine.' }
  ],
  '2.9.0': [
    { title: '📂 Collapsible Priority Sections & Streamlined Toolbar Controls:', desc: 'Added expand/contract toggles with state persistence to priority sections, provider-agnostic Synced status indicator, collapsible notes for scheduled tasks, and streamlined Edit Task modal controls.' }
  ],
  '2.8.0': [
    { title: '🔒 123ToDo Set & Forget Cloud Sync & Dual Provider Engine:', desc: 'Introduced 123ToDo Cloud Sync powered by Cloudflare D1 Serverless E2E Zero-Knowledge Encryption (AES-256-GCM). Eliminates 1-hour Google OAuth drops, fully supports iOS Safari PWAs, and adds 5-second 6-digit device pairing.' }
  ],
  '2.7.4': [
    { title: '🎙️ Advanced Voice Commands & Auto-Scroll Viewport Tracking:', desc: 'Hands-free task creation ("add task"), live spoken deletion ("delete last word", "scratch that", "clear all"), real-time auto-scroll tracking, steady Google Sync indicator dot, and a Voice-to-Text guide in Settings.' }
  ],
  '2.7.3': [
    { title: '🎙️ Spoken Voice Commands & Dictation Settings Guide:', desc: 'Added spoken deletion commands ("delete last word", "scratch that", "clear all"), hands-free auto-submission when saying "add task", and a detailed Voice-to-Text guide in Settings.' }
  ],
  '2.7.2': [
    { title: '🏆 Minimalist Milestone Congratulations Modal:', desc: 'Redesigned the task completion milestone modal to align perfectly with the clean, modern aesthetic of the application, featuring theme variables, Framer Motion entry animations, and sharp stat cards.' }
  ],
  '2.7.1': [
    { title: '📜 Live Dictation Auto-Scroll & Viewport Tracking:', desc: 'Added auto-expanding height and scrollTop tracking so newly spoken words/lines are always clearly visible at the bottom of the input canvas during voice dictation.' }
  ],
  '2.7.0': [
    { title: '🟢 Refined Google Sync Status Indicator:', desc: 'Kept Google Drive Sync button text and background completely steady during sync operations, adding a pulsing green status dot to indicate active background syncing smoothly.' }
  ],
  '2.6.9': [
    { title: '🔘 Unified Action Toolbar in Edit Modal:', desc: 'Aligned Notes, Subtasks, and Schedule toggle buttons onto a single flex row when editing tasks, matching the Add Task layout.' }
  ],
  '2.6.8': [
    { title: '🎙️ Smart Voice Transcript Deduplication:', desc: 'Added word-level suffix and prefix overlap detection algorithm (mergeBaseAndTranscript) to guarantee zero text duplication across all voice dictation sessions.' }
  ],
  '2.6.7': [
    { title: '📝 Compact Empty Notes & Refined Selector Styling:', desc: 'Compacted empty Notes field to a clean toggle button when editing tasks, and removed background color fills from Priority & Project dropdown triggers and options.' }
  ],
  '2.6.6': [
    { title: '🎙️ Voice Input Fix & Selective Character Count:', desc: 'Fixed text duplication when dictating via voice, and hidden character count indicators when Unlimited Characters mode is enabled.' }
  ],
  '2.6.5': [
    { title: '🎨 Color-Coded Priority & Project Selectors:', desc: 'Enhanced Edit Modal dropdowns with custom color-coded indicators, priority dot badges, and project accent color bands.' }
  ],
  '2.6.4': [
    { title: '📐 Significantly Expanded Modal Viewing Canvas:', desc: 'Expanded in-modal textarea height up to 480px and widened edit modal container to 580px when Expand mode is activated.' }
  ],
  '2.6.3': [
    { title: '📏 Expanded Task Text Width:', desc: 'Reduced check box padding and right action margins to maximize horizontal text space on each task item.' }
  ],
  '2.6.2': [
    { title: '🔍 Expanded Focus & Notes Editor:', desc: 'Added inline height expansion controls and a spacious full-screen Focus Canvas Overlay with word, character, and line count metrics for reviewing and editing large task descriptions and notes.' }
  ],
  '2.6.1': [
    { title: '📝 Task Text Editing & Todoist Import Fix:', desc: 'Fixed character limit blocking when editing imported or long tasks, ensuring full text editing freedom without browser input locks.' }
  ],
  '2.6.0': [
    { title: '🚀 123 ToDo v2.6.0 Milestone Release:', desc: 'Major release featuring refined compact task layouts, 440px redesigned Edit/Note Modal, 1-click Next Week scheduling, drag-and-drop & completion persistence fixes, default Muted theme, full-height Projects menu, and glassmorphic update notifications.' }
  ],
  '2.5.32': [
    { title: '📁 Full-Height Projects Dropdown:', desc: 'Expanded the main Projects dropdown popup to display all projects down to the last item without forced scrollbars.' }
  ],
  '2.5.31': [
    { title: '✨ Refined Update Notification Card:', desc: 'Redesigned the new version update prompt into a clean, glassmorphic card with Framer Motion entry animations and subtle accent typography.' }
  ],
  '2.5.30': [
    { title: '🎨 Default Muted Light Theme:', desc: 'Set Muted tone (Subdued Cozy Grey with Zero Glare) as the default light theme mode for new users.' }
  ],
  '2.5.29': [
    { title: '✅ Task Completion Persistence & Sync Conflict Fix:', desc: 'Fixed active vs archived conflict resolution during dataset merges and unmount cleanup in task completion timer so completed tasks never re-appear in active lists.' }
  ],
  '2.5.28': [
    { title: '🔤 Standard Font Weight Adjustment:', desc: 'Adjusted standard font weight to regular 400 for crisp, non-bold text when Bold Typography mode is disabled.' }
  ],
  '2.5.27': [
    { title: '📅 Quick "Next Week" Scheduling Button:', desc: 'Added 1-click "Next Week" quick scheduling buttons across Edit Modal, Add Task, and Quick Defer controls.' }
  ],
  '2.5.26': [
    { title: '🖐️ Drag-and-Drop & Task Edit Persistence Fix:', desc: 'Fixed downward task reordering index calculations, task updatedAt timestamp tracking, and LocalStorage state synchronization dependencies.' },
    { title: '📝 Refined Edit & Note Modal Layout:', desc: 'Redesigned the edit modal with a compact 440px width, Priority and Project selectors above title, and Notes directly below title.' }
  ],
  '2.5.25': [
    { title: '⚡ Cache-Busted PWA Update Engine:', desc: 'Added direct cache-busted version checking via version.json so desktops and mobiles never get stuck on stale cached PWA builds.' }
  ],
  '2.5.24': [
    { title: '🖐️ Smooth Drag & Drop Drop Position Fix:', desc: 'Aligned task reordering insertion to target drop indicator line and disabled Framer Motion layout spring-back interference.' }
  ],
  '2.5.23': [
    { title: '🖐️ Cross-Priority Drag & Drop Fix:', desc: 'Fixed a type-coercion bug in task ID comparisons during HTML5 drag and drop, ensuring tasks stay locked in place after reordering across priorities.' }
  ],
  '2.5.22': [
    { title: '⚡ App Health & Silent Error Tracking:', desc: 'Added 100% anonymous browser error and sync drop monitoring to detect friction in the wild.' },
    { title: '🛠️ Feature Adoption Metrics:', desc: 'Added privacy-preserving feature adoption metrics for Voice Dictation, Cloud Sync, Todoist Imports, and Search.' }
  ],
  '2.5.21': [
    { title: '💻 OS Platform Breakdown:', desc: 'Added 100% privacy-preserving OS & platform classification (macOS, iOS, Windows, Android, Linux).' },
    { title: '🌐 Geographic Region Breakdown:', desc: 'Added privacy-safe approximate region metrics (United Kingdom, Europe, North America, Australasia, Asia).' }
  ],
  '2.5.20': [
    { title: '⏱️ Active Session Usage Tracking:', desc: 'Added 100% privacy-preserving active usage session time tracking (heartbeat active minutes while app is in focus).' },
    { title: '✅ Aggregate Task Completion Counter:', desc: 'Added privacy-safe aggregate task completion count metric.' }
  ],
  '2.5.19': [
    { title: '⚡ Deployment Trigger Optimization:', desc: 'Optimized GitHub Actions automated deployment workflow trigger for seamless VPS deployments.' }
  ],
  '2.5.18': [
    { title: '🚀 VPS Deployment Automation Fix:', desc: 'Refreshed deployment trigger sequence to guarantee clean VPS container builds.' }
  ],
  '2.5.17': [
    { title: '🛡️ 100% Privacy-Preserving Telemetry:', desc: 'Zero cookies used, no IP addresses or personal data logged, fully GDPR/CCPA compliant out of the box.' }
  ],
  '2.5.16': [
    { title: '🛡️ Archive Deletion 2-Stage Approval:', desc: 'Added prominent visual warning banner and 2-step confirmation buttons before clearing archived tasks.' },
    { title: '🖐️ Drag & Drop Task Reordering:', desc: 'Restored smooth HTML5 drag-and-drop task reordering across list sections and On Hold tasks.' },
    { title: '📌 Top Placement for New Tasks:', desc: 'Newly created tasks now automatically appear at the top of their respective item list section.' },
    { title: '🧹 Todoist CSV Import Metadata Filter:', desc: 'Automatically filters out Todoist CSV export metadata rows (such as view_style=list).' },
    { title: '📊 Projects Dropdown Task Badges:', desc: 'Displays active task count badges (e.g. All (12), Work (5)) in the projects drop-down selector and option list.' },
    { title: '🎨 Configurable Light Mode Tones:', desc: 'Introduced 3 light mode background tones (Bright, Soft, Muted) under Settings ➔ Appearance to reduce eye strain.' },
    { title: '📐 Streamlined Task List Layout:', desc: 'Removed leading + note toggle symbol button to save space and enhance task list appearance.' }
  ],
  '2.5.15': [
    { title: '📐 Open Archive Range-Left Alignment:', desc: 'Aligned Open Archive section button range-left to match On Hold and Scheduled headings.' }
  ],
  '2.5.14': [
    { title: '🎯 Task Drag & Drop Position Persistence Fix:', desc: 'Guarantees custom reordered task positions stay permanently saved during 2-way background Google Drive sync.' }
  ],
  '2.5.13': [
    { title: '📐 Single-Row Header Bar Alignment:', desc: 'Search icon, project dropdown (dynamically sized to project text), and Settings cog are now cleanly aligned on a single row.' }
  ],
  '2.5.12': [
    { title: '🗑️ Archive Deletion 2-Way Sync Fix:', desc: 'Guarantees deleted items from the Archive remain permanently deleted across all connected devices during 2-way Google Drive sync.' }
  ],
  '2.5.11': [
    { title: '📦 Simplified Archive Trigger:', desc: 'Shortened archive button label to "Open Archive" for a cleaner visual layout.' },
    { title: '📐 Refined Header Typography:', desc: 'Reduced section header font size on Archive, Scheduled, and On Hold titles for clean visual proportions.' }
  ],
  '2.5.10': [
    { title: '🗑️ Project Deletion Sync Fix:', desc: 'Guarantees deleted custom projects remain permanently deleted across all connected devices during 2-way Google Drive sync.' }
  ],
  '2.5.9': [
    { title: '🔤 Font Settings Persistence:', desc: 'Guarantees text size and typography settings remain saved across page reloads and version updates.' },
    { title: '📦 Full-Screen Archive Search:', desc: 'Spacious full-screen Archive modal with instant keyword search, project filters, and sorting.' },
    { title: '🔄 Sync Restoration Fix:', desc: 'Restored tasks stay active permanently across devices without falling back into the Archive.' }
  ],
  '2.5.8': [
    { title: '🔒 Pull-to-Refresh Gesture Lock:', desc: 'Prevents vertical pull-to-refresh motions from accidentally triggering swipe-to-archive task actions.' },
    { title: '📦 Complete Archive Visibility:', desc: 'Guarantees that all archived tasks are stored and rendered reliably in the Archive section.' }
  ],
  '2.5.7': [
    { title: '🗑️ Project Deletion Overlay Fix:', desc: 'Fixed Delete Project confirmation modal layer so deletion prompts render cleanly on top of Settings.' },
    { title: '📐 Header Bar Space Optimization:', desc: 'Streamlined the projects bar by placing search icon directly next to the project selector.' }
  ],
  '2.5.6': [
    { title: '🔤 Bold Text Typography Setting:', desc: 'Added a Bold Text checkbox under Settings ➔ Appearance for high-contrast typography.' },
    { title: '📐 Compact View Spacing Refinement:', desc: 'New default compact density for new users with extra padding between text rows and divider lines.' },
    { title: '💻 System Default Theme Mode:', desc: 'Theme Mode defaults to System preference automatically for new users.' }
  ],
  '2.5.5': [
    { title: '✍️ Spoken Punctuation Recognition:', desc: 'Speak "full stop", "comma", "question mark", "exclamation mark", "colon", "semi colon", or "new line" to insert punctuation naturally.' },
    { title: '🛡️ Overwrite-Proof Voice Buffer:', desc: 'Uses a locked speech buffer so pauses or thinking breaks never overwrite or delete previously spoken text.' }
  ],
  '2.5.4': [
    { title: '🎙️ Voice Task & Notes Dictation:', desc: 'Tap the Voice button on task titles or notes to speak naturally. Speech automatically appends to text so you can pause to think.' },
    { title: '🔄 Seamless 2-Way Multi-Device Sync:', desc: 'Guarantees that new tasks or projects added offline across multiple devices are merged seamlessly without data loss.' },
    { title: '📏 Custom Task Description Length:', desc: 'Set your preferred task description length under Settings ➔ Appearance (250 characters default or Unlimited).' }
  ],
  '2.5.3': [
    { title: '🎙️ Voice Notes Dictation:', desc: 'Dictate long descriptions, instructions, or links directly into the task Notes section using voice.' },
    { title: '🔄 Continuous Speech & Appending:', desc: 'Speech recognition automatically appends newly spoken words to existing text so pauses while thinking won\'t cut you off.' },
    { title: '⭐ Streamlined Voice Task Creation:', desc: 'All voice tasks automatically default to Top Priority (P1) and your selected project for effortless 1-tap task entry.' }
  ],
  '2.5.2': [
    { title: '🔄 Seamless 2-Way Multi-Device Sync:', desc: 'Guarantees that new tasks or projects added offline across multiple devices (e.g. laptop & phone) are merged seamlessly without data loss.' },
    { title: '🛡️ Data Preservation Engine:', desc: 'Prevents sync overwrites so tasks created offline on one device are merged into all connected devices.' }
  ],
  '2.5.1': [
    { title: '🎙️ Voice Task Input (Speech-to-Task):', desc: 'Tap the Voice button to speak tasks naturally with automatic priority and project detection.' },
    { title: '⚡ Smart Natural Language Parsing:', desc: 'Automatically parses priority (P1-P4) and project keywords from spoken phrases, defaulting to Priority 1 (Must Do).' },
    { title: '💡 Voice Command Guidance:', desc: 'Interactive voice command examples and tips available under Settings ➔ Appearance.' }
  ],
  '2.5.0': [
    { title: '📏 Custom Task Description Length:', desc: 'Set your preferred task description length under Settings ➔ Appearance (250 characters default or Unlimited).' },
    { title: '👈 Compact Swipe Reveal Visuals:', desc: 'Sleeker, faster visual swipe reveal hints that appear immediately upon starting a swipe gesture.' },
    { title: '✨ Streamlined Task Notes UI:', desc: 'Optimized Notes field layout for a clean, distraction-free editing experience.' }
  ],
  '2.4.17': [
    { title: '👉 Todoist-Style Swipe Gestures:', desc: 'Dual-stage visual feedback with solid color fills, spring action icons, and physical rubber-band damping.' },
    { title: '📅 Date Format Order Preference:', desc: 'Choose UK (DD/MM/YYYY), US (MM/DD/YYYY), ISO (YYYY-MM-DD), or Short Text date styles under Settings ➔ Appearance.' },
    { title: '🔄 Prominent Check for Updates:', desc: '1-click update checks in the main app footer and Settings title bar for desktop and mobile.' },
    { title: '✨ Streamlined Notes UI:', desc: 'Cleaned up placeholder text and character counters for a distraction-free, spacious editing experience.' }
  ],
  '2.4.16': [
    { title: '📖 Todoist Migration Guide:', desc: 'Interactive step-by-step export & import guide modal linked directly from import dialogs.' },
    { title: '🔍 Complete SEO Overhaul:', desc: 'Schema.org JSON-LD structured data, high-intent titles, meta descriptions, and search indexing optimizations.' },
    { title: '📝 Unlimited Notes & Subtask Guidance:', desc: 'Refined User Guide and landing page copy highlighting subtask checklists and unlimited notes.' },
    { title: '🐛 Modernized Help & Troubleshooting:', desc: 'Updated troubleshooting guide with Google Drive sync, Shadow Backup recovery, and PWA updates.' }
  ],
  '2.4.15': [
    { title: '🔄 Manual Update Check:', desc: 'Check for updates anytime under Settings ➔ Appearance.' },
    { title: '🖐️ Drag & Drop Projects:', desc: 'Reorder your projects by dragging grip handles in Settings.' },
    { title: '🔔 Sync Alert Popup:', desc: 'Automatic prompt if Google Drive session disconnects so you can re-auth in 1 tap.' },
    { title: '📐 Compact Layout:', desc: 'Optimized project selector dropdown and trimmed header/footer margins.' }
  ],
  '2.4.14': [
    { title: '🔄 Manual Update Check:', desc: 'Check for updates anytime under Settings ➔ Appearance.' },
    { title: '🖐️ Drag & Drop Projects:', desc: 'Reorder your projects by dragging grip handles in Settings.' },
    { title: '🔔 Sync Alert Popup:', desc: 'Automatic prompt if Google Drive session disconnects so you can re-auth in 1 tap.' },
    { title: '📐 Compact Layout:', desc: 'Optimized project selector dropdown and trimmed header/footer margins.' }
  ],
  '2.4.13': [
    { title: '🖐️ Drag & Drop Projects:', desc: 'Reorder your projects by dragging grip handles in Settings.' },
    { title: '🔔 Sync Alert Popup:', desc: 'Automatic prompt if Google Drive session disconnects so you can re-auth in 1 tap.' },
    { title: '📐 Compact Layout:', desc: 'Optimized project selector dropdown and trimmed header/footer margins.' }
  ]
};
