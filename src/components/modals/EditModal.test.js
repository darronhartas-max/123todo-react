import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

    const callLink = screen.getByRole('link', { name: /Call 07123 456789/i });
    expect(callLink).toBeInTheDocument();
    expect(callLink).toHaveAttribute('href', 'tel:07123456789');

    const emailLink = screen.getByRole('link', { name: /Email client@example.com/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:client@example.com');

    const webLink = screen.getByRole('link', { name: /Open 123todo.com/i });
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

    test('renders a single consolidated actionable panel under the Tasks section', () => {
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

        // There should be exactly ONE actionable bar in the entire modal
        const actionableBars = container.querySelectorAll('.actionable-entities-bar');
        expect(actionableBars).toHaveLength(1);

        // It should contain all entities deduplicated (1 url, 1 phone, 1 email)
        expect(screen.getByRole('link', { name: /Open example.com/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Call 07123456789/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Email boss@example.com/i })).toBeInTheDocument();
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
        const notesTextarea = screen.getByPlaceholderText('Add notes or extra details...');
        expect(notesTextarea.value).toMatch(/\[\d{1,2} [A-Za-z]{3} \d{4}, \d{2}:\d{2}\]/);
    });
});


