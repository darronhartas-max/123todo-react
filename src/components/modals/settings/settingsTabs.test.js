import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
    SettingsProjectsTab,
    SettingsAppearanceTab,
    SettingsTasksTab,
    SettingsSwipeTab,
    SwipeDemoCard,
    SettingsVoiceTab,
    SettingsShortcutsTab,
    SettingsSyncTab,
    SettingsAboutTab,
    SettingsPriorityColors
} from './index';

describe('Settings Tabs Micro-Components', () => {
    const mockStyles = {
        sectionTitle: {},
        projectItem: {},
        projectInfo: {},
        colorDot: () => ({}),
        actions: {},
        actionBtn: {},
        addSection: {},
        input: {},
        colorGrid: {},
        colorBtn: () => ({}),
        submitBtn: {},
        settingRow: {},
        settingLabel: {},
        segmentContainer: {},
        segmentBtn: () => ({}),
        sliderContainer: {},
        slider: {},
        shortcutItem: {},
        kbdBadge: {},
        voiceGuideTag: {},
        voiceGuideRow: {}
    };

    describe('SettingsProjectsTab', () => {
        const mockProjects = [
            { id: 'p1', name: 'Alpha', color: '#3b82f6' },
            { id: 'p2', name: 'Beta', color: '#10b981' }
        ];

        test('renders project items and handles edit mode', () => {
            const onEditProject = jest.fn();
            render(
                <SettingsProjectsTab
                    projects={mockProjects}
                    onEditProject={onEditProject}
                    styles={mockStyles}
                />
            );

            expect(screen.getByText('Alpha')).toBeInTheDocument();
            expect(screen.getByText('Beta')).toBeInTheDocument();

            // Click edit on first project
            const editButtons = screen.getAllByTitle('Edit project name & color');
            fireEvent.click(editButtons[0]);

            const input = screen.getByPlaceholderText('Project name...');
            expect(input.value).toBe('Alpha');

            fireEvent.change(input, { target: { value: 'Alpha Updated' } });
            const saveBtn = screen.getByTitle('Save changes');
            fireEvent.click(saveBtn);

            expect(onEditProject).toHaveBeenCalledWith('p1', { name: 'Alpha Updated', color: '#3b82f6' });
        });

        test('prevents deleting the last remaining project', () => {
            window.alert = jest.fn();
            const onDeleteProject = jest.fn();
            render(
                <SettingsProjectsTab
                    projects={[{ id: 'p1', name: 'Only One', color: '#3b82f6' }]}
                    onDeleteProject={onDeleteProject}
                    styles={mockStyles}
                />
            );

            const deleteBtn = screen.getByTitle('Delete project');
            fireEvent.click(deleteBtn);

            expect(window.alert).toHaveBeenCalledWith("You must have at least one project remaining.");
            expect(onDeleteProject).not.toHaveBeenCalled();
        });

        test('allows deleting when multiple projects exist', () => {
            const onDeleteProject = jest.fn();
            render(
                <SettingsProjectsTab
                    projects={mockProjects}
                    onDeleteProject={onDeleteProject}
                    styles={mockStyles}
                />
            );

            const deleteButtons = screen.getAllByTitle('Delete project');
            fireEvent.click(deleteButtons[1]);

            expect(onDeleteProject).toHaveBeenCalledWith('p2');
        });
    });

    describe('SettingsAppearanceTab', () => {
        test('toggles skin mode, view profile, and button display mode', () => {
            const onSwitchMode = jest.fn();
            const setViewProfile = jest.fn();
            const setButtonDisplayMode = jest.fn();
            const setIsBoldFont = jest.fn();

            render(
                <SettingsAppearanceTab
                    appMode="tasks"
                    onSwitchMode={onSwitchMode}
                    viewProfile="lite"
                    setViewProfile={setViewProfile}
                    buttonDisplayMode="icons"
                    setButtonDisplayMode={setButtonDisplayMode}
                    fontSize={14}
                    notesFontSize={18}
                    themeMode="system"
                    isBoldFont={false}
                    setIsBoldFont={setIsBoldFont}
                    layoutWidth="480px"
                    styles={mockStyles}
                />
            );

            fireEvent.click(screen.getByRole('button', { name: /voice notes/i }));
            expect(onSwitchMode).toHaveBeenCalledWith('notes');

            fireEvent.click(screen.getByRole('button', { name: /pro \(full power\)/i }));
            expect(setViewProfile).toHaveBeenCalledWith('pro');

            fireEvent.click(screen.getByRole('button', { name: /icons & text/i }));
            expect(setButtonDisplayMode).toHaveBeenCalledWith('both');

            const boldCheckbox = screen.getByRole('checkbox', { name: /enable bold text/i });
            fireEvent.click(boldCheckbox);
            expect(setIsBoldFont).toHaveBeenCalledWith(true);
        });

        test('renders kanban column view toggle when layoutWidth is not 480px', () => {
            const setWideColumnView = jest.fn();
            render(
                <SettingsAppearanceTab
                    layoutWidth="1000px"
                    wideColumnView="priorities"
                    setWideColumnView={setWideColumnView}
                    fontSize={14}
                    styles={mockStyles}
                />
            );

            expect(screen.getByText('Wide Mode Column View')).toBeInTheDocument();
            fireEvent.click(screen.getByRole('button', { name: 'By Projects' }));
            expect(setWideColumnView).toHaveBeenCalledWith('projects');
        });
    });

    describe('SettingsTasksTab', () => {
        test('toggles date format, scheduled times, creation date, and task limits', () => {
            const setDateFormat = jest.fn();
            const setTimeSchedulingEnabled = jest.fn();
            const setShowTaskCreationDate = jest.fn();
            const setTaskLengthLimit = jest.fn();
            const setNotesAutosaveDelay = jest.fn();

            render(
                <SettingsTasksTab
                    dateFormat="UK"
                    setDateFormat={setDateFormat}
                    timeSchedulingEnabled={true}
                    setTimeSchedulingEnabled={setTimeSchedulingEnabled}
                    showTaskCreationDate={false}
                    setShowTaskCreationDate={setShowTaskCreationDate}
                    taskLengthLimit="250"
                    setTaskLengthLimit={setTaskLengthLimit}
                    notesAutosaveDelay="60s"
                    setNotesAutosaveDelay={setNotesAutosaveDelay}
                    styles={mockStyles}
                />
            );

            fireEvent.click(screen.getByText('US Style'));
            expect(setDateFormat).toHaveBeenCalledWith('US');

            fireEvent.click(screen.getByRole('button', { name: 'Hidden' }));
            expect(setTimeSchedulingEnabled).toHaveBeenCalledWith(false);

            fireEvent.click(screen.getByRole('button', { name: 'Shown' }));
            expect(setShowTaskCreationDate).toHaveBeenCalledWith(true);

            fireEvent.click(screen.getByText('Unlimited'));
            expect(setTaskLengthLimit).toHaveBeenCalledWith('unlimited');

            fireEvent.click(screen.getByText('30 Seconds'));
            expect(setNotesAutosaveDelay).toHaveBeenCalledWith('30s');
        });
    });

    describe('SettingsSwipeTab & SwipeDemoCard', () => {
        test('renders SwipeDemoCard with disabled message when swipe is turned off', () => {
            render(<SwipeDemoCard swipeSettings={{ enabled: false }} />);
            expect(screen.getByText(/swipe gestures are currently disabled/i)).toBeInTheDocument();
        });

        test('renders SwipeDemoCard interactive card when swipe is enabled', () => {
            render(<SwipeDemoCard swipeSettings={{ enabled: true, swipeRight: 'complete', swipeLeft: 'delete' }} />);
            expect(screen.getByText(/drag me ↔/i)).toBeInTheDocument();
        });

        test('allows picking right and left swipe actions', () => {
            const onUpdateSwipeSettings = jest.fn();
            render(
                <SettingsSwipeTab
                    swipeSettings={{ enabled: true, swipeRight: 'complete', swipeLeft: 'delete' }}
                    onUpdateSwipeSettings={onUpdateSwipeSettings}
                    styles={mockStyles}
                />
            );

            const deleteButtons = screen.getAllByText('Delete Task');
            fireEvent.click(deleteButtons[0]);
            expect(onUpdateSwipeSettings).toHaveBeenCalled();
        });
    });

    describe('SettingsShortcutsTab & SettingsVoiceTab', () => {
        test('renders shortcuts list', () => {
            render(<SettingsShortcutsTab styles={mockStyles} />);
            expect(screen.getByText('Focus Search Bar')).toBeInTheDocument();
            expect(screen.getByText('Open Settings')).toBeInTheDocument();
        });

        test('renders voice guides and editing commands', () => {
            render(<SettingsVoiceTab styles={mockStyles} />);
            expect(screen.getByText(/desktop dictation/i)).toBeInTheDocument();
            expect(screen.getByText(/auto-submit command/i)).toBeInTheDocument();
        });
    });

    describe('SettingsPriorityColors', () => {
        test('renders all 4 priority tiers and allows selecting colors', () => {
            const setPriorityColors = jest.fn();
            render(
                <SettingsPriorityColors
                    priorityColors={{
                        1: '#dc2626',
                        2: '#f59e0b',
                        3: '#6b7280',
                        4: '#9333ea'
                    }}
                    setPriorityColors={setPriorityColors}
                    styles={mockStyles}
                />
            );

            expect(screen.getByText('Priority Label Colors')).toBeInTheDocument();
            expect(screen.getAllByText('Must Do').length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText('Should Do')).toBeInTheDocument();
            expect(screen.getByText('Could Do')).toBeInTheDocument();
            expect(screen.getByText('On Hold')).toBeInTheDocument();

            // Click a swatch from the palette (e.g. #3b82f6 - Vivid Blue)
            const blueSwatch = screen.getByTitle('#3b82f6');
            fireEvent.click(blueSwatch);

            expect(setPriorityColors).toHaveBeenCalledWith(expect.objectContaining({
                1: '#3b82f6'
            }));
        });

        test('allows resetting individual and all modified priority colors', () => {
            const setPriorityColors = jest.fn();
            render(
                <SettingsPriorityColors
                    priorityColors={{
                        1: '#3b82f6', // Modified Must Do
                        2: '#f59e0b',
                        3: '#6b7280',
                        4: '#9333ea'
                    }}
                    setPriorityColors={setPriorityColors}
                    styles={mockStyles}
                />
            );

            // "Reset to Default" should be visible for modified Must Do
            const resetSingleBtn = screen.getByRole('button', { name: /reset to default/i });
            fireEvent.click(resetSingleBtn);
            expect(setPriorityColors).toHaveBeenCalledWith(expect.objectContaining({
                1: '#dc2626'
            }));

            // "Reset All Defaults" should also be visible
            const resetAllBtn = screen.getByRole('button', { name: /reset all defaults/i });
            fireEvent.click(resetAllBtn);
            expect(setPriorityColors).toHaveBeenCalledWith({
                1: '#dc2626',
                2: '#f59e0b',
                3: '#6b7280',
                4: '#9333ea'
            });
        });

        test('switches active priority and selects color for that priority', () => {
            const setPriorityColors = jest.fn();
            render(
                <SettingsPriorityColors
                    priorityColors={{
                        1: '#dc2626',
                        2: '#f59e0b',
                        3: '#6b7280',
                        4: '#9333ea'
                    }}
                    setPriorityColors={setPriorityColors}
                    styles={mockStyles}
                />
            );

            // Switch to "On Hold" (P4)
            const onHoldBtn = screen.getByText('On Hold').closest('button');
            fireEvent.click(onHoldBtn);

            // Select green swatch
            const greenSwatch = screen.getByTitle('#10b981');
            fireEvent.click(greenSwatch);

            expect(setPriorityColors).toHaveBeenCalledWith(expect.objectContaining({
                4: '#10b981'
            }));
        });
    });

    describe('SettingsAboutTab', () => {
        test('renders update check button and guides', () => {
            const onCheckForUpdates = jest.fn();
            render(
                <SettingsAboutTab
                    updateCheckStatus="idle"
                    onCheckForUpdates={onCheckForUpdates}
                    styles={mockStyles}
                />
            );

            const checkBtn = screen.getByRole('button', { name: /check for updates/i });
            fireEvent.click(checkBtn);
            expect(onCheckForUpdates).toHaveBeenCalled();
            expect(screen.getByText(/getting started: 3-minute beginner's guide/i)).toBeInTheDocument();
        });
    });
});
