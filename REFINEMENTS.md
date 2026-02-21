# 123 ToDo - Refinement Roadmap

This document outlines the planned refinements for the 123 ToDo application to improve maintainability, UI/UX, and features.

## 🏗️ Phase 1: Architecture & Refactoring
*Objective: Improve code health and modularity by breaking down the "Fat Component" (App.js).*

- [ ] **Componentization**
    - [ ] Create `src/components/` directory.
    - [ ] Extract `TaskItem` component.
    - [ ] Extract `PrioritySection` component.
    - [ ] Extract `ActionModals` (Edit, Achievements).
    - [ ] Extract `FooterControls` (Backup, Social Share).
- [ ] **State & Logic Extraction**
    - [ ] Create `src/hooks/useTasks.js` to manage task state and localStorage persistence.
    - [ ] Create `src/utils/constants.js` for priorities, colors, and limits.

## 🎨 Phase 2: UI/UX Excellence
*Objective: Elevate the "premium" feel of the application.*

- [ ] **Animations**
    - [ ] Add smooth transitions for completing tasks.
    - [ ] Add micro-animations for priority changes.
- [ ] **Dark Mode**
    - [ ] Implement system-aware dark mode support.
    - [ ] Define a refined dark color palette.
- [ ] **Improved Feedback**
    - [ ] Better visual cues during Drag & Drop operations.
    - [ ] Haptic feedback (where supported on mobile).

## 🚀 Phase 3: Enhanced Functionality
*Objective: Add features that improve productivity without adding bloat.*

- [ ] **Search & Filter**
    - [ ] Add a quick search bar to find tasks in large lists.
- [ ] **Bulk Actions**
    - [ ] "Clear All Archived" button.
    - [ ] "Move all On Hold to Must Do" (or similar).
- [ ] **Multi-Category (Optional)**
    - [ ] Allow users to switch between "Personal" and "Work" lists.

---
*Created: 2026-02-21*
