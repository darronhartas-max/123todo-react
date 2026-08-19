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
});
