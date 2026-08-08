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
  DELETED_TASKS: '123TodoDeletedTasks'
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
  '#285a82', // Ocean Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Orange
  '#ec4899', // Sweet Pink
  '#8b5cf6', // Royal Violet
  '#06b6d4', // Bright Cyan
  '#f43f5e', // Ruby Rose
  '#14b8a6', // Teal Green
  '#3b82f6', // Sky Blue
  '#eab308', // Sunflower Yellow
  '#d946ef', // Fuchsia Purple
  '#84cc16', // Lime Green
  '#f97316', // Mandarin Orange
  '#6366f1', // Indigo Blue
  '#a855f7', // Amethyst Purple
  '#065f46', // Forest Green
  '#b91c1c', // Crimson Red
  '#78716c', // Slate Gray
];

export const DEFAULT_PROJECTS = [
  { id: 'all', name: 'All', color: '#6b7280' }
];

export const MAX_TASK_LENGTH = 250;
export const DEFAULT_TASK_LENGTH_LIMIT = '250';
export const DEFAULT_LIGHT_MODE_TONE = 'muted';
// Notes length is intentionally unlimited to support full Todoist migration and rich task descriptions.
export const BACKUP_REMINDER_DAYS = 7;
export const INSTALL_PROMPT_DAYS = 3;
export const APP_VERSION = '2.7.0';

export const RELEASE_CHANGELOG = {
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
    { title: '🔒 Secret URL Admin Portal Access:', desc: 'Restricted Admin Analytics Portal access exclusively to secret URL parameter (?admin=1) with zero public UI footprint.' },
    { title: '🚀 VPS Deployment Automation Fix:', desc: 'Refreshed deployment trigger sequence to guarantee clean VPS container builds.' }
  ],
  '2.5.17': [
    { title: '🔒 Private Admin Analytics Portal:', desc: 'Added a password-protected private Admin Analytics Portal with visual trend charts for website visits, PWA downloads, and standalone app opens.' },
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
