import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import EditModal from './EditModal';

describe('EditModal', () => {
  const sampleTaskWithNotes = {
    id: 1,
    text: 'Test task with note',
    priority: 1,
    projectId: 'general',
    notes: 'Initial multi-line note content',
    subtasks: [
      { id: 101, text: 'First long subtask that wraps onto multiple lines cleanly', completed: false }
    ],
    deferCount: 0
  };

  const sampleProjects = [
    { id: 'general', name: 'General', color: '#6b7280' },
    { id: 'work', name: 'Work', color: '#3b82f6' }
  ];

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('contracts and expands notes when Notes button is clicked', () => {
    render(
      <EditModal
        task={sampleTaskWithNotes}
        onSave={jest.fn()}
        onClose={jest.fn()}
        projects={sampleProjects}
      />
    );

    // Initial state: notes are visible
    expect(screen.getByPlaceholderText('Add notes or extra details...')).toBeInTheDocument();

    // Click Notes button to contract
    const notesButton = screen.getByRole('button', { name: /^Notes/i });
    fireEvent.click(notesButton);

    // Notes textarea should be hidden/contracted
    expect(screen.queryByPlaceholderText('Add notes or extra details...')).not.toBeInTheDocument();

    // Click Notes button again to re-expand
    fireEvent.click(notesButton);
    expect(screen.getByPlaceholderText('Add notes or extra details...')).toBeInTheDocument();
  });

  test('subtask textarea renders with full text and handles multi-line edits', () => {
    const onSaveMock = jest.fn();
    render(
      <EditModal
        task={sampleTaskWithNotes}
        onSave={onSaveMock}
        onClose={jest.fn()}
        projects={sampleProjects}
      />
    );

    const subtaskInput = screen.getByDisplayValue('First long subtask that wraps onto multiple lines cleanly');
    expect(subtaskInput).toBeInTheDocument();

    // Modify subtask text
    fireEvent.change(subtaskInput, { target: { value: 'Updated multi-line subtask text\nwith second line' } });
    expect(subtaskInput.value).toBe('Updated multi-line subtask text\nwith second line');

    // Trigger Save
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));
    expect(onSaveMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        subtasks: expect.arrayContaining([
          expect.objectContaining({ text: 'Updated multi-line subtask text\nwith second line' })
        ])
      })
    );
  });

  test('only shows defer alert when deferCount is 5 or greater', () => {
    const { rerender } = render(
      <EditModal
        task={{ ...sampleTaskWithNotes, deferCount: 4 }}
        onSave={jest.fn()}
        onClose={jest.fn()}
        projects={sampleProjects}
      />
    );

    expect(screen.queryByText(/Consider breaking into/i)).not.toBeInTheDocument();

    rerender(
      <EditModal
        task={{ ...sampleTaskWithNotes, deferCount: 5 }}
        onSave={jest.fn()}
        onClose={jest.fn()}
        projects={sampleProjects}
      />
    );

    expect(screen.getByText(/Consider breaking into/i)).toBeInTheDocument();
    expect(screen.getByText(/Deferred 5x/i)).toBeInTheDocument();
  });

  test('sets scheduled date to tomorrow when Next Day button is clicked', () => {
    const onSaveMock = jest.fn();
    render(
      <EditModal
        task={sampleTaskWithNotes}
        onSave={onSaveMock}
        onClose={jest.fn()}
        projects={sampleProjects}
      />
    );

    // Open schedule section by clicking Schedule button
    const scheduleToggle = screen.getByRole('button', { name: /Schedule/i });
    fireEvent.click(scheduleToggle);

    // Click Day (Next Day) button
    const nextDayButton = screen.getByRole('button', { name: /Day/i });
    expect(nextDayButton).toBeInTheDocument();
    fireEvent.click(nextDayButton);

    // Save and verify scheduledDate is set
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));
    expect(onSaveMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        scheduledDate: expect.any(String)
      })
    );
  });

  test('renders actionable contact links for phone, email, and web address in edit mode', () => {
    const taskWithLinks = {
      id: 2,
      text: 'Call client on 07123 456789 or visit https://123todo.com',
      notes: 'Email them at client@example.com for quote',
      priority: 1,
      projectId: 'general',
      subtasks: []
    };

    render(
      <EditModal
        task={taskWithLinks}
        onSave={jest.fn()}
        onClose={jest.fn()}
        projects={sampleProjects}
      />
    );

    const callLink = screen.getByRole('link', { name: /07123 456789/i });
    expect(callLink).toBeInTheDocument();
    expect(callLink).toHaveAttribute('href', 'tel:07123456789');

    const emailLink = screen.getByRole('link', { name: /client@example\.com/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:client@example.com');

    const webLink = screen.getByRole('link', { name: /123todo\.com/i });
    expect(webLink).toBeInTheDocument();
    expect(webLink).toHaveAttribute('href', 'https://123todo.com');
  });

  test('sets scheduled date to next week when Next Week button is clicked', () => {
    const onSaveMock = jest.fn();
    render(
      <EditModal
        task={sampleTaskWithNotes}
        onSave={onSaveMock}
        onClose={jest.fn()}
        projects={sampleProjects}
      />
    );

    // Open schedule section by clicking Schedule button
    const scheduleToggle = screen.getByRole('button', { name: /Schedule/i });
    fireEvent.click(scheduleToggle);

    // Week (Next Week) button should be present on the same line
    const nextWeekButton = screen.getByRole('button', { name: /Week/i });
    expect(nextWeekButton).toBeInTheDocument();
    fireEvent.click(nextWeekButton);

    // Save and verify scheduledDate is set
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));
    expect(onSaveMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        scheduledDate: expect.any(String)
      })
    );
  });

  test('allows setting and clearing scheduled time in EditModal', () => {
    const onSaveMock = jest.fn();
    const taskWithDate = {
      ...sampleTaskWithNotes,
      scheduledDate: '2026-10-15',
      scheduledTime: null
    };

    render(
      <EditModal
        task={taskWithDate}
        onSave={onSaveMock}
        onClose={jest.fn()}
        projects={sampleProjects}
      />
    );

    // Schedule section is already open because task has scheduledDate
    const addTimeBtn = screen.getByRole('button', { name: /add time/i });
    expect(addTimeBtn).toBeInTheDocument();
    fireEvent.click(addTimeBtn);

    // Clock picker modal is open
    expect(screen.getByRole('dialog', { name: /select time/i })).toBeInTheDocument();

    // Click Set Time (09:00 AM)
    fireEvent.click(screen.getByRole('button', { name: /set time/i }));

    // Save
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));
    expect(onSaveMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        scheduledDate: '2026-10-15',
        scheduledTime: '09:00'
      })
    );
  });

  test('allows setting time via circular clock picker in EditModal', () => {
    const onSaveMock = jest.fn();
    const taskWithDate = {
      ...sampleTaskWithNotes,
      scheduledDate: '2026-10-15',
      scheduledTime: null
    };

    render(
      <EditModal
        task={taskWithDate}
        onSave={onSaveMock}
        onClose={jest.fn()}
        projects={sampleProjects}
      />
    );

    // Click "+ Add time"
    fireEvent.click(screen.getByRole('button', { name: /add time/i }));

    // Clock picker modal is open
    expect(screen.getByRole('dialog', { name: /select time/i })).toBeInTheDocument();

    // Click PM
    fireEvent.click(screen.getByRole('button', { name: /^PM$/i }));

    // Click Set Time
    fireEvent.click(screen.getByRole('button', { name: /set time/i }));

    // Save
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));
    expect(onSaveMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        scheduledDate: '2026-10-15',
        scheduledTime: '21:00'
      })
    );
  });

  test('displays all project options when opening project dropdown in edit modal', () => {
    const manyProjects = [
      { id: 'general', name: 'General', color: '#6b7280' },
      { id: 'work', name: 'Work', color: '#3b82f6' },
      { id: 'p3', name: 'Project 3', color: '#10b981' },
      { id: 'p4', name: 'Project 4', color: '#f59e0b' },
      { id: 'p5', name: 'Project 5', color: '#8b5cf6' }
    ];

    render(
      <EditModal
        task={sampleTaskWithNotes}
        onSave={jest.fn()}
        onClose={jest.fn()}
        projects={manyProjects}
      />
    );

    // Click project dropdown button to open
    const projectButton = screen.getByRole('button', { name: /General/i });
    fireEvent.click(projectButton);

    // All projects should be visible and rendered in the dropdown
    expect(screen.getByText('Project 3')).toBeInTheDocument();
    expect(screen.getByText('Project 4')).toBeInTheDocument();
    expect(screen.getByText('Project 5')).toBeInTheDocument();
  });

  test('calls onArchive when Archive button near the top is clicked', () => {
        const onArchiveMock = jest.fn();
        render(
            <EditModal
                task={sampleTaskWithNotes}
                onSave={jest.fn()}
                onClose={jest.fn()}
                onArchive={onArchiveMock}
                projects={sampleProjects}
            />
        );

        const archiveButton = screen.getByRole('button', { name: /^Archive$/i });
        expect(archiveButton).toBeInTheDocument();
        fireEvent.click(archiveButton);
        expect(onArchiveMock).toHaveBeenCalledTimes(1);
        expect(onArchiveMock).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    test('renders actionable links directly in description and notes boxes and removes separate actionable panel', () => {
        const taskWithMultipleActionables = {
            id: 3,
            text: 'Meeting notes from https://example.com and call 07123456789',
            notes: 'Follow up at boss@example.com or visit https://example.com',
            priority: 2,
            projectId: 'general',
            subtasks: []
        };

        const { container } = render(
            <EditModal
                task={taskWithMultipleActionables}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        // There should be NO separate actionable bar in the entire modal
        const actionableBars = container.querySelectorAll('.actionable-entities-bar');
        expect(actionableBars).toHaveLength(0);

        // All entities are rendered directly inside description and notes boxes
        expect(screen.getAllByRole('link', { name: /example\.com/i }).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByRole('link', { name: /07123456789/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /boss@example\.com/i })).toBeInTheDocument();
    });

    test('renders timestamp button and places expand button at the bottom right in place of photos counter', () => {
        render(
            <EditModal
                task={sampleTaskWithNotes}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        // Verify + Timestamp button is present
        const timestampBtn = screen.getByRole('button', { name: /\+ Timestamp/i });
        expect(timestampBtn).toBeInTheDocument();

        // Verify Expand button for notes is present
        const expandBtn = screen.getByTitle('Open Full Screen Focus Editor for Notes');
        expect(expandBtn).toBeInTheDocument();

        // Photos counter text is replaced by rightAction and not rendered in notes section
        expect(screen.queryByText(/Photos: 0\//i)).not.toBeInTheDocument();

        // Clicking timestamp button appends a timestamp tag to notes
        fireEvent.click(timestampBtn);
        const notesTextarea = screen.getByDisplayValue(/\[\d{1,2} [A-Za-z]{3} \d{4}, \d{2}:\d{2}\]/);
        expect(notesTextarea).toBeInTheDocument();
    });

    test('reorders subtasks using drag and drop events', () => {
        const onSaveMock = jest.fn();
        const taskWithMultipleSubtasks = {
            ...sampleTaskWithNotes,
            subtasks: [
                { id: 101, text: 'Subtask 1', completed: false },
                { id: 102, text: 'Subtask 2', completed: false },
                { id: 103, text: 'Subtask 3', completed: false }
            ]
        };

        const { container } = render(
            <EditModal
                task={taskWithMultipleSubtasks}
                onSave={onSaveMock}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        const subtaskItems = container.querySelectorAll('li[data-subtask-index]');
        expect(subtaskItems).toHaveLength(3);

        // Drag subtask 0 over subtask 2 with position 'after'
        fireEvent.dragStart(subtaskItems[0], {
            dataTransfer: { setData: jest.fn(), effectAllowed: 'move' }
        });

        // Mock bounding rect on subtask 2 to simulate dropping in the bottom half ('after')
        subtaskItems[2].getBoundingClientRect = () => ({
            top: 100,
            bottom: 140,
            height: 40,
            left: 0,
            right: 200,
            width: 200
        });

        fireEvent.dragOver(subtaskItems[2], {
            clientY: 130, // bottom half (> 120)
            dataTransfer: { dropEffect: 'move' }
        });

        fireEvent.drop(subtaskItems[2], {
            clientY: 130,
            dataTransfer: { getData: () => '0' }
        });

        // Save and verify subtasks order: [Subtask 2, Subtask 3, Subtask 1]
        fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));
        expect(onSaveMock).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                subtasks: [
                    expect.objectContaining({ text: 'Subtask 2' }),
                    expect.objectContaining({ text: 'Subtask 3' }),
                    expect.objectContaining({ text: 'Subtask 1' })
                ]
            })
        );
    });

    test('reorders subtasks using keyboard Alt+Down shortcut', () => {
        const onSaveMock = jest.fn();
        const taskWithMultipleSubtasks = {
            ...sampleTaskWithNotes,
            subtasks: [
                { id: 101, text: 'Alpha Subtask', completed: false },
                { id: 102, text: 'Beta Subtask', completed: false }
            ]
        };

        render(
            <EditModal
                task={taskWithMultipleSubtasks}
                onSave={onSaveMock}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        const firstSubtaskTextarea = screen.getByDisplayValue('Alpha Subtask');
        // Press Alt+ArrowDown on Alpha Subtask
        fireEvent.keyDown(firstSubtaskTextarea, { key: 'ArrowDown', altKey: true });

        // Save and verify Alpha Subtask is now second
        fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));
        expect(onSaveMock).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                subtasks: [
                    expect.objectContaining({ text: 'Beta Subtask' }),
                    expect.objectContaining({ text: 'Alpha Subtask' })
                ]
            })
        );
    });

    test('does not include a timestamp if task was created prior to feature implementation without createdAt', () => {
        const legacyTask = {
            id: 42,
            text: 'Legacy task created before timestamp feature',
            priority: 1,
            projectId: 'general'
            // no createdAt
        };

        render(
            <EditModal
                task={legacyTask}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        // Must NOT render any fake or 1970 timestamp
        expect(screen.queryByText(/Created:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/1970/i)).not.toBeInTheDocument();
    });

    test('displays truthful creation timestamp when valid createdAt is present and setting is enabled', () => {
        const timestampedTask = {
            id: 43,
            text: 'Task with genuine timestamp',
            priority: 1,
            projectId: 'general',
            createdAt: new Date(2026, 8, 12, 14, 30, 0).getTime()
        };

        const { rerender } = render(
            <EditModal
                task={timestampedTask}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
                showTaskCreationDate={false}
            />
        );

        // Hidden by default
        expect(screen.queryByText(/Created:/i)).not.toBeInTheDocument();

        // Shown when setting is enabled
        rerender(
            <EditModal
                task={timestampedTask}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
                showTaskCreationDate={true}
            />
        );

        expect(screen.getByText(/Created:/i)).toBeInTheDocument();
        expect(screen.getByText(/12 Sep 2026, 14:30:00/i)).toBeInTheDocument();
    });

    test('renders Google Cal and Apple Cal buttons when task has scheduled date', () => {
        const calendarUtils = require('../../utils/calendarUtils');
        jest.spyOn(calendarUtils, 'openGoogleCalendar').mockImplementation(() => {});
        jest.spyOn(calendarUtils, 'downloadAppleCalendarIcs').mockImplementation(() => {});

        const scheduledTask = {
            id: 99,
            text: 'Meeting with dentist',
            priority: 1,
            projectId: 'general',
            scheduledDate: '2026-10-15',
            scheduledTime: '10:00'
        };

        render(
            <EditModal
                task={scheduledTask}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        const googleBtn = screen.getByRole('button', { name: /google cal/i });
        const appleBtn = screen.getByRole('button', { name: /apple cal/i });
        expect(googleBtn).toBeInTheDocument();
        expect(appleBtn).toBeInTheDocument();

        fireEvent.click(googleBtn);
        expect(calendarUtils.openGoogleCalendar).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Meeting with dentist',
                scheduledDate: '2026-10-15',
                scheduledTime: '10:00'
            })
        );

        fireEvent.click(appleBtn);
        expect(calendarUtils.downloadAppleCalendarIcs).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Meeting with dentist',
                scheduledDate: '2026-10-15',
                scheduledTime: '10:00'
            })
        );
    });

    test('hides time selection input when timeSchedulingEnabled is false', () => {
        const scheduledTask = {
            id: 202,
            text: 'Meeting with accountant',
            priority: 1,
            projectId: 'general',
            scheduledDate: '2026-10-15',
            scheduledTime: '10:00'
        };

        render(
            <EditModal
                task={scheduledTask}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
                timeSchedulingEnabled={false}
            />
        );

        // Date controls should still be visible
        expect(document.getElementById('edit-scheduled-date')).toBeInTheDocument();

        // Time controls should be hidden
        expect(screen.queryByLabelText(/time:/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /\+ add time/i })).not.toBeInTheDocument();
    });

    test('toggles edit mode in description and notes by clicking inside boxes and blurring', () => {
        const taskWithEntities = {
            id: 203,
            text: 'Call client on 07123456789 directly',
            notes: 'Contact info at client@example.com',
            priority: 1,
            projectId: 'general',
            subtasks: []
        };

        render(
            <EditModal
                task={taskWithEntities}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        // Initially in view mode with rendered actionable links
        const callLink = screen.getByRole('link', { name: /07123456789/i });
        expect(callLink).toBeInTheDocument();

        // Clicking the link does NOT trigger editing
        fireEvent.click(callLink);
        expect(callLink).toBeInTheDocument();

        // Clicking the description textbox switches into edit mode
        const descBox = screen.getByTitle('Click to edit task description');
        fireEvent.click(descBox);

        // Description is now in edit mode with textarea
        const titleTextarea = screen.getByPlaceholderText('Enter task description...');
        expect(titleTextarea).toBeInTheDocument();

        // Blurring the textarea returns to view mode with actionable links
        fireEvent.blur(titleTextarea);
        expect(screen.getByRole('link', { name: /07123456789/i })).toBeInTheDocument();
    });

    test('remembers collapsed section position in localStorage across opens', () => {
        const taskWithAllSections = {
            id: 301,
            text: 'Task with everything',
            notes: 'Detailed notes here',
            subtasks: [{ id: 1, text: 'Sub 1', completed: false }],
            scheduledDate: '2026-10-20',
            priority: 1,
            projectId: 'general'
        };

        const { unmount } = render(
            <EditModal
                task={taskWithAllSections}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        // Sections initially shown because content is present
        expect(screen.getByText('Notes & Details')).toBeInTheDocument();
        expect(screen.getByText(/Subtasks \(0\/1\)/i)).toBeInTheDocument();
        expect(screen.getByText('Date & Recurrence')).toBeInTheDocument();

        // Contract Subtasks via contract button
        fireEvent.click(screen.getByTitle('Contract subtasks'));
        expect(screen.queryByText(/Subtasks \(0\/1\)/i)).not.toBeInTheDocument();

        // Verify stored in localStorage
        const stored = JSON.parse(localStorage.getItem('123todo_task_sections_301') || '{}');
        expect(stored.subtasks).toBe(false);

        unmount();

        // Reopen task modal - subtasks should remain hidden as remembered!
        render(
            <EditModal
                task={taskWithAllSections}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        expect(screen.queryByText(/Subtasks \(0\/1\)/i)).not.toBeInTheDocument();
        expect(screen.getByText('Notes & Details')).toBeInTheDocument();
    });

    test('saves newly transcribed text when save task voice command is spoken', () => {
        const onSaveMock = jest.fn();
        const onCloseMock = jest.fn();

        const taskToVoiceEdit = {
            id: 401,
            text: 'Original task description',
            notes: 'Existing note',
            priority: 1,
            projectId: 'general'
        };

        const voiceUtils = require('../../utils/voiceUtils');
        jest.spyOn(voiceUtils, 'isSpeechRecognitionSupported').mockReturnValue(true);
        let transcriptCallback = null;
        jest.spyOn(voiceUtils, 'startVoiceDictation').mockImplementation(({ onTranscript }) => {
            transcriptCallback = onTranscript;
            return { stop: jest.fn() };
        });

        render(
            <EditModal
                task={taskToVoiceEdit}
                onSave={onSaveMock}
                onClose={onCloseMock}
                projects={sampleProjects}
            />
        );

        // Trigger voice input on notes
        const talkButtons = screen.getAllByRole('button', { name: /Talk/i });
        // The second talk button is for notes
        fireEvent.click(talkButtons[talkButtons.length - 1]);

        expect(voiceUtils.startVoiceDictation).toHaveBeenCalled();

        // Simulate voice transcription saying "Added important info" and then "save note"
        expect(transcriptCallback).toBeTruthy();
        act(() => {
            transcriptCallback('Existing note\nAdded important info.', true);
        });

        // Should immediately save the newly transcribed text and close the modal
        expect(onSaveMock).toHaveBeenCalledWith(
            401,
            expect.objectContaining({
                notes: 'Existing note\nAdded important info.'
            })
        );
        expect(onCloseMock).toHaveBeenCalled();
    });

    test('streamlines subtask items: checkbox on the right, delete button removed, and robust drag handle', () => {
        const { container } = render(
            <EditModal
                task={{
                    ...sampleTaskWithNotes,
                    subtasks: [
                        { id: 201, text: 'Streamlined subtask item', completed: false }
                    ]
                }}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        // Subtask item exists
        const subtaskLi = container.querySelector('li[data-subtask-index="0"]');
        expect(subtaskLi).toBeInTheDocument();

        // No Delete button
        expect(screen.queryByTitle(/delete step/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

        // Checkbox is present and located after the textarea
        const checkbox = screen.getByRole('checkbox', { name: /mark subtask completed/i });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox.checked).toBe(false);

        // Drag handle exists with clear drag target styling
        const dragHandle = container.querySelector('.subtask-drag-handle');
        expect(dragHandle).toBeInTheDocument();

        // Mousedown clears document selection to prevent text highlight interference
        const removeAllRangesMock = jest.fn();
        window.getSelection = jest.fn().mockReturnValue({ removeAllRanges: removeAllRangesMock });
        fireEvent.mouseDown(dragHandle);
        expect(removeAllRangesMock).toHaveBeenCalled();

        // Toggle completion
        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);
    });

    test('clears holding placeholder text in notes textarea when clicked or focused', () => {
        render(
            <EditModal
                task={{
                    id: 99,
                    text: 'Task with blank notes',
                    priority: 1,
                    projectId: 'general',
                    notes: '',
                    subtasks: []
                }}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        // Open notes section
        const notesToggle = screen.getByRole('button', { name: /^Notes/i });
        fireEvent.click(notesToggle);

        // When not yet editing, display placeholder text is shown
        const placeholderDiv = screen.getByText('Add notes or extra details...');
        expect(placeholderDiv).toBeInTheDocument();

        // Click to enter editing mode
        fireEvent.click(placeholderDiv);

        // Active textarea is rendered
        const notesTextarea = screen.getByRole('textbox', { name: '' });
        expect(notesTextarea).toBeInTheDocument();

        // When focused, placeholder is cleared
        fireEvent.focus(notesTextarea);
        expect(notesTextarea.getAttribute('placeholder')).toBe('');

        // When blurred, returns to inactive display showing placeholder
        fireEvent.blur(notesTextarea);
        expect(screen.getByText('Add notes or extra details...')).toBeInTheDocument();
    });

    test('adds new subtasks to the top of the list and auto-moves completed subtask below uncompleted subtasks', () => {
        render(
            <EditModal
                task={{
                    id: 100,
                    text: 'Task with subtasks',
                    priority: 1,
                    projectId: 'general',
                    notes: '',
                    subtasks: [
                        { id: 1, text: 'Existing Step 1', completed: false }
                    ]
                }}
                onSave={jest.fn()}
                onClose={jest.fn()}
                projects={sampleProjects}
            />
        );

        // Subtasks are already open when task has subtasks
        const newStepInput = screen.getByPlaceholderText('Add step...');
        const addBtn = newStepInput.parentElement.querySelector('button');

        // Add New Step 2
        fireEvent.change(newStepInput, { target: { value: 'New Step 2' } });
        fireEvent.click(addBtn);

        // Subtasks should now be: New Step 2 (top), Existing Step 1 (bottom)
        const subtaskInputs = screen.getAllByPlaceholderText('Subtask description...');
        expect(subtaskInputs.map(input => input.value)).toEqual(['New Step 2', 'Existing Step 1']);

        // Complete New Step 2 (checkbox 0)
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);

        // After completing New Step 2, it moves below uncompleted subtasks: Existing Step 1, New Step 2
        const updatedInputs = screen.getAllByPlaceholderText('Subtask description...');
        expect(updatedInputs.map(input => input.value)).toEqual(['Existing Step 1', 'New Step 2']);
    });
});



