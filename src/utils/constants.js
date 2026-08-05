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
  DATE_FORMAT: '123TodoDateFormat'
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
  complete: { label: 'Complete Task', actionHint: 'Release to Complete', icon: 'CheckSquare', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', activeBg: '#10b981', activeColor: '#ffffff' },
  delete: { label: 'Delete Task', actionHint: 'Release to Delete', icon: 'Trash2', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', activeBg: '#ef4444', activeColor: '#ffffff' },
  priority_4: { label: 'On Hold (P4)', actionHint: 'Release for P4', icon: 'PauseCircle', color: '#9333ea', bg: 'rgba(147, 51, 234, 0.15)', activeBg: '#9333ea', activeColor: '#ffffff' },
  edit: { label: 'Edit Task', actionHint: 'Release to Edit', icon: 'Edit2', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)', activeBg: '#2563eb', activeColor: '#ffffff' },
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

export const MAX_TASK_LENGTH = 200;
// Notes length is intentionally unlimited to support full Todoist migration and rich task descriptions.
export const BACKUP_REMINDER_DAYS = 7;
export const INSTALL_PROMPT_DAYS = 3;
export const APP_VERSION = '2.4.17';

export const RELEASE_CHANGELOG = {
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
