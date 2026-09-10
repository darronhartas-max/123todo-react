import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NotesView from './NotesView';

describe('NotesView', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const sampleTasks = [
    { id: 1, text: 'First existing note', notes: 'Details', projectId: 'general' }
  ];

  const sampleProjects = [
    { id: 'general', name: 'Unassigned Inbox', color: '#6b7280' },
    { id: 'proj1', name: 'Work', color: '#2563eb' }
  ];

  test('renders Save button on left and Talk button on top right with correct placeholder', () => {
    render(
      <NotesView
        tasks={sampleTasks}
        projects={sampleProjects}
        onAddNote={jest.fn()}
      />
    );

    // Save button should say "Save" (not "Save Note")
    const saveButton = screen.getByRole('button', { name: /^Save$/i });
    expect(saveButton).toBeInTheDocument();

    // Talk button should say "Talk"
    const talkButton = screen.getByRole('button', { name: /Talk/i });
    expect(talkButton).toBeInTheDocument();

    // Textarea placeholder should only say "Add New Note..."
    const textarea = screen.getByPlaceholderText('Add New Note...');
    expect(textarea).toBeInTheDocument();

    // Photo attachments component should be present in the Quick Add card
    expect(screen.getByText(/Camera|Add Photos/i)).toBeInTheDocument();
  });

  test('saves note manually when clicking Save button', () => {
    const onAddNoteMock = jest.fn();
    render(
      <NotesView
        tasks={sampleTasks}
        projects={sampleProjects}
        onAddNote={onAddNoteMock}
      />
    );

    const textarea = screen.getByPlaceholderText('Add New Note...');
    fireEvent.change(textarea, { target: { value: 'Urgent site inspection notes' } });

    const saveButton = screen.getByRole('button', { name: /^Save$/i });
    fireEvent.click(saveButton);

    expect(onAddNoteMock).toHaveBeenCalledWith(
      'Urgent site inspection notes',
      '',
      'general',
      expect.objectContaining({ photos: [] })
    );

    // Textarea is reset
    expect(textarea.value).toBe('');
  });

  test('auto-saves draft after default 60 seconds (1 min) of idle time without premature interruption', () => {
    const onAddNoteMock = jest.fn();
    render(
      <NotesView
        tasks={sampleTasks}
        projects={sampleProjects}
        onAddNote={onAddNoteMock}
      />
    );

    const textarea = screen.getByPlaceholderText('Add New Note...');
    fireEvent.change(textarea, { target: { value: 'Site note estimating electrical wiring' } });

    // Should NOT save at 4 seconds or 30 seconds when thinking or taking measurements
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(onAddNoteMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(26000); // 30s total
    });
    expect(onAddNoteMock).not.toHaveBeenCalled();

    // Advance to 60 seconds total
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(onAddNoteMock).toHaveBeenCalledWith(
      'Site note estimating electrical wiring',
      '',
      'general',
      expect.objectContaining({ photos: [] })
    );
  });

  test('respects configurable notesAutosaveDelay prop (e.g. 30s)', () => {
    const onAddNoteMock = jest.fn();
    render(
      <NotesView
        tasks={sampleTasks}
        projects={sampleProjects}
        onAddNote={onAddNoteMock}
        notesAutosaveDelay="30s"
      />
    );

    const textarea = screen.getByPlaceholderText('Add New Note...');
    fireEvent.change(textarea, { target: { value: 'Quick notes 30s test' } });

    act(() => {
      jest.advanceTimersByTime(29000);
    });
    expect(onAddNoteMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(onAddNoteMock).toHaveBeenCalledWith(
      'Quick notes 30s test',
      '',
      'general',
      expect.objectContaining({ photos: [] })
    );
  });

  test('disables idle auto-save when notesAutosaveDelay is set to off', () => {
    const onAddNoteMock = jest.fn();
    render(
      <NotesView
        tasks={sampleTasks}
        projects={sampleProjects}
        onAddNote={onAddNoteMock}
        notesAutosaveDelay="off"
      />
    );

    const textarea = screen.getByPlaceholderText('Add New Note...');
    fireEvent.change(textarea, { target: { value: 'Manual only note' } });

    act(() => {
      jest.advanceTimersByTime(300000); // 5 minutes
    });
    expect(onAddNoteMock).not.toHaveBeenCalled();
  });

  test('auto-saves draft on document visibilitychange when user switches app or locks phone', () => {
    const onAddNoteMock = jest.fn();
    render(
      <NotesView
        tasks={sampleTasks}
        projects={sampleProjects}
        onAddNote={onAddNoteMock}
      />
    );

    const textarea = screen.getByPlaceholderText('Add New Note...');
    fireEvent.change(textarea, { target: { value: 'Note before locking phone' } });

    // Simulate tab switch / screen lock
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden'
    });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(onAddNoteMock).toHaveBeenCalledWith(
      'Note before locking phone',
      '',
      'general',
      expect.objectContaining({ photos: [] })
    );
  });
});
