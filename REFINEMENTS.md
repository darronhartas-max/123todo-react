# 123 ToDo - Refinement Roadmap

This document outlines the planned refinements for the 123 ToDo application to improve maintainability, UI/UX, and features.

## 🏗️ Phase 1: Architecture & Refactoring
*Objective: Improve code health and modularity by breaking down the "Fat Component" (App.js).*

- [x] **Componentization**
    - [x] Create `src/components/` directory.
    - [x] Extract `TaskItem` component.
    - [x] Extract `PrioritySection` component.
    - [x] Extract `ActionModals` (Edit, Achievements).
    - [x] Extract `FooterControls` (Backup, Social Share).
- [x] **State & Logic Extraction**
    - [x] Create `src/hooks/useTasks.js` to manage task state and localStorage persistence.
    - [x] Create `src/utils/constants.js` for priorities, colors, and limits.

## 🎨 Phase 2: UI/UX Excellence
*Objective: Elevate the "premium" feel of the application.*

- [x] **Animations**
    - [x] Add smooth transitions for completing tasks.
    - [x] Add micro-animations for priority changes.
- [x] **Dark Mode**
    - [x] Implement system-aware dark mode support.
    - [x] Define a refined dark color palette.
- [ ] **Improved Feedback**
    - [ ] Better visual cues during Drag & Drop operations.
    - [ ] Haptic feedback (where supported on mobile).

## 🚀 Phase 3: Enhanced Functionality
*Objective: Add features that improve productivity without adding bloat.*

- [x] **Search & Filter**
    - [x] Add a quick search bar to find tasks in large lists.
- [ ] **Bulk Actions**
    - [ ] "Clear All Archived" button.
    - [ ] "Move all On Hold to Must Do" (or similar).
- [ ] **Multi-Category (Optional)**
    - [ ] Allow users to switch between "Personal" and "Work" lists.

---
*Created: 2026-02-21*
