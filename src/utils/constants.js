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
  SWIPE_SETTINGS: '123TodoSwipeSettings'
};

export const SWIPE_ACTIONS = {
  complete: { label: 'Complete Task', icon: 'CheckSquare', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  delete: { label: 'Delete Task', icon: 'Trash2', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  priority_4: { label: 'On Hold (P4)', icon: 'PauseCircle', color: '#9333ea', bg: 'rgba(147, 51, 234, 0.15)' },
  edit: { label: 'Edit Task', icon: 'Edit2', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)' },
  none: { label: 'None (Disabled)', icon: 'Slash', color: '#9ca3af', bg: 'transparent' }
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
export const APP_VERSION = '2.4.11';
