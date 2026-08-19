# 123 ToDo — Refinement Roadmap

## Completed Core Features
- [x] Componentized architecture & hooks (`useTasks`, `useGoogleDriveSync`, `useAppSystem`).
- [x] Encrypted Google Drive Sync & session drop auto-recovery modal.
- [x] Project Layer: Custom colors, project tabs, and drag-and-drop project reordering.
- [x] Customizable Task Swipe Gestures & Swipe Settings tab.
- [x] Subtasks, checklists, recurrence scheduling, and Todoist CSV import wizard.
- [x] Interactive Todoist Migration Guide modal (`TodoistGuideModal.js`) & guide links.
- [x] Schema.org `SoftwareApplication` JSON-LD structured data, Open Graph & Twitter SEO overhaul.
- [x] User-controlled PWA update notifications & manual "Check for Updates" control in Settings.
- [x] Automated CI/CD deployment pipeline via GitHub Actions (`.github/workflows/deploy.yml`).
- [x] Voice Dictation & Voice Notes overhaul: Continuous speech recognition across silence pauses, spoken auto-submit commands ("Add Task", "Add Note"), regional language accent support, and auto-derived task titles from voice notes.
- [x] Wide Mode Column View: Option to group wide-screen Kanban columns by Projects or Priorities with horizontal scroll support and full browser width expansion.
- [x] Productivity Achievements & Gamification Hub: Header trophy badge opening house-styled modal with XP levels, daily streaks, 1-2-3 rule balance tracking, milestone badges, and official 123todo.com blog guides.
- [x] Subtasks Drag-and-Drop & Multi-Line Wrapping across Add Task, Edit Modal, and Task List.
- [x] Space-Efficient Note Previews: Compact single-line previews of task notes directly under titles with 1-click expansion.
- [x] Zero-Knowledge Cloudflare Sync: Client-side AES-256 encrypted multi-device sync with shared cross-platform statistics.

## Future Ideas
- [ ] Native haptic feedback for mobile touch gestures (where supported).
- [ ] Bulk action helpers (e.g. clear archived items).
