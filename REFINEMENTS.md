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

## Future Ideas
- [ ] Native haptic feedback for mobile touch gestures (where supported).
- [ ] Bulk action helpers (e.g. clear archived items).
