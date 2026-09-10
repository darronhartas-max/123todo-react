import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NoteCard from './NoteCard';

describe('NoteCard', () => {
  const sampleNote = {
    id: 101,
    text: 'Call plumber on 07123 456789 or visit https://plumbing.co.uk',
    notes: 'Send quote to quote@plumbing.co.uk by Friday',
    projectId: 'general',
    subtasks: []
  };

  const sampleProjects = [
    { id: 'general', name: 'General', color: '#6b7280' }
  ];

  test('renders actionable contact links in view mode', () => {
    render(
      <NoteCard
        note={sampleNote}
        projects={sampleProjects}
        onUpdateNote={jest.fn()}
      />
    );

    const callLink = screen.getByRole('link', { name: '07123 456789' });
    expect(callLink).toBeInTheDocument();
    expect(callLink).toHaveAttribute('href', 'tel:07123456789');

    const webLink = screen.getByRole('link', { name: 'https://plumbing.co.uk' });
    expect(webLink).toBeInTheDocument();
    expect(webLink).toHaveAttribute('href', 'https://plumbing.co.uk');

    const emailLink = screen.getByRole('link', { name: 'quote@plumbing.co.uk' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:quote@plumbing.co.uk');
  });

  test('renders actionable contact chips when card enters edit mode', () => {
    render(
      <NoteCard
        note={sampleNote}
        projects={sampleProjects}
        onUpdateNote={jest.fn()}
      />
    );

    // Click anywhere on note text to enter edit mode
    fireEvent.click(screen.getByText(/Send quote to/i));

    // Inputs should now be visible
    expect(screen.getByPlaceholderText('Note Title...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write note details or dictation...')).toBeInTheDocument();

    // Actionable contact chips should be rendered in edit mode
    const callChip = screen.getByRole('link', { name: /Call 07123 456789/i });
    expect(callChip).toBeInTheDocument();
    expect(callChip).toHaveAttribute('href', 'tel:07123456789');

    const webChip = screen.getByRole('link', { name: /Open plumbing.co.uk/i });
    expect(webChip).toBeInTheDocument();
    expect(webChip).toHaveAttribute('href', 'https://plumbing.co.uk');

    const emailChip = screen.getByRole('link', { name: /Email quote@plumbing.co.uk/i });
    expect(emailChip).toBeInTheDocument();
    expect(emailChip).toHaveAttribute('href', 'mailto:quote@plumbing.co.uk');
  });

  test('displays note text in multi-line textarea and shows prominent Dictate at End button in edit mode', () => {
    render(
      <NoteCard
        note={sampleNote}
        projects={sampleProjects}
        onUpdateNote={jest.fn()}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText(/Send quote to/i));

    // Note title/content must be a textarea (not a single-line input) so it is not truncated
    const titleTextarea = screen.getByPlaceholderText('Note Title...');
    expect(titleTextarea).toBeInTheDocument();
    expect(titleTextarea.tagName).toBe('TEXTAREA');

    // Prominent "Dictate at End" button should be easily located in edit mode
    const dictateBtn = screen.getByRole('button', { name: /Dictate at End/i });
    expect(dictateBtn).toBeInTheDocument();
  });

  test('displays prominent Save Note buttons at top and bottom in edit mode, saving changes on click', () => {
    const onUpdateMock = jest.fn();
    render(
      <NoteCard
        note={sampleNote}
        projects={sampleProjects}
        onUpdateNote={onUpdateMock}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText(/Send quote to/i));

    // There should be Save Note buttons (top and bottom)
    const saveButtons = screen.getAllByRole('button', { name: /Save Note/i });
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);

    // The top save button should be prominent
    expect(saveButtons[0]).toBeInTheDocument();

    // Click Save Note
    fireEvent.click(saveButtons[0]);
    expect(onUpdateMock).toHaveBeenCalledWith(sampleNote.id, expect.objectContaining({
      text: sampleNote.text,
      notes: sampleNote.notes
    }));
  });

  test('displays evidentiary timestamp at the bottom and copies proof to clipboard when clicked', async () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = jest.fn().mockResolvedValue();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    const noteWithTimestamp = {
      ...sampleNote,
      createdAt: new Date(2026, 8, 10, 14, 20, 0).getTime(),
      updatedAt: new Date(2026, 8, 10, 14, 25, 0).getTime()
    };

    render(
      <NoteCard
        note={noteWithTimestamp}
        projects={sampleProjects}
        onUpdateNote={jest.fn()}
      />
    );

    // Evidentiary timestamp should be present at the bottom
    expect(screen.getByText(/10 Sep 2026/i)).toBeInTheDocument();

    // Copy evidence button should be present
    const copyButton = screen.getByTitle(/Copy evidentiary timestamp/i);
    expect(copyButton).toBeInTheDocument();

    // Click copy button
    await act(async () => {
      fireEvent.click(copyButton);
    });
    expect(writeTextMock).toHaveBeenCalled();
    expect(writeTextMock.mock.calls[0][0]).toContain('123 ToDo Entry Log');
    expect(writeTextMock.mock.calls[0][0]).toContain('10 Sep 2026');

    // Restore clipboard
    Object.assign(navigator, { clipboard: originalClipboard });
  });

  test('hides note details field in edit mode and omits placeholder in view mode when note has no associated notes', () => {
    const noteWithoutNotes = {
      id: 102,
      text: 'Simple quick note without details',
      notes: '',
      projectId: 'general',
      subtasks: []
    };

    const { rerender } = render(
      <NoteCard
        note={noteWithoutNotes}
        projects={sampleProjects}
        onUpdateNote={jest.fn()}
      />
    );

    // In view mode: title text is visible, but placeholder "Tap to add details..." is NOT shown
    expect(screen.getByText('Simple quick note without details')).toBeInTheDocument();
    expect(screen.queryByText(/Tap to add details or record voice/i)).not.toBeInTheDocument();

    // Enter edit mode
    fireEvent.click(screen.getByText('Simple quick note without details'));

    // In edit mode: Title textarea is visible, but notes textarea is hidden
    expect(screen.getByPlaceholderText('Note Title...')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Write note details or dictation...')).not.toBeInTheDocument();
  });

  test('displays note details in both view mode and edit mode when note has associated notes', () => {
    const noteWithNotes = {
      id: 103,
      text: 'Note with extra information',
      notes: 'Detailed specifications for client approval',
      projectId: 'general',
      subtasks: []
    };

    render(
      <NoteCard
        note={noteWithNotes}
        projects={sampleProjects}
        onUpdateNote={jest.fn()}
      />
    );

    // In view mode: both title and note details are visible
    expect(screen.getByText('Note with extra information')).toBeInTheDocument();
    expect(screen.getByText('Detailed specifications for client approval')).toBeInTheDocument();

    // Enter edit mode
    fireEvent.click(screen.getByText('Detailed specifications for client approval'));

    // In edit mode: both textareas are visible
    expect(screen.getByPlaceholderText('Note Title...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write note details or dictation...')).toBeInTheDocument();
  });

  test('prompts confirmation when cancelling edits with unsaved changes', () => {
    const confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockReturnValue(false); // User clicks Cancel on prompt

    render(
      <NoteCard
        note={sampleNote}
        projects={sampleProjects}
        onUpdateNote={jest.fn()}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText(/Send quote to/i));

    const titleTextarea = screen.getByPlaceholderText('Note Title...');
    fireEvent.change(titleTextarea, { target: { value: 'Modified note text on site' } });

    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith('Discard unsaved changes to this note?');
    // Still in edit mode because user declined discard
    expect(screen.getByPlaceholderText('Note Title...')).toBeInTheDocument();

    // Now user confirms discard
    confirmSpy.mockReturnValue(true);
    fireEvent.click(cancelButtons[0]);
    // Back to view mode
    expect(screen.queryByPlaceholderText('Note Title...')).not.toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test('auto-saves existing note edits after 5 seconds of idle time', () => {
    jest.useFakeTimers();
    const onUpdateMock = jest.fn();

    render(
      <NoteCard
        note={sampleNote}
        projects={sampleProjects}
        onUpdateNote={onUpdateMock}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText(/Send quote to/i));

    const titleTextarea = screen.getByPlaceholderText('Note Title...');
    fireEvent.change(titleTextarea, { target: { value: 'Site note updated hurriedly' } });

    expect(onUpdateMock).not.toHaveBeenCalled();

    // After 30 seconds, still not saved (giving time to think or inspect)
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(onUpdateMock).not.toHaveBeenCalled();

    // Advance to 60 seconds total (default auto-save)
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(onUpdateMock).toHaveBeenCalledWith(
      sampleNote.id,
      expect.objectContaining({
        text: 'Site note updated hurriedly'
      })
    );

    jest.useRealTimers();
  });

  test('renders archive checkbox in Task mode style on right-hand side and triggers completion after 300ms', () => {
    jest.useFakeTimers();
    const onCompleteMock = jest.fn();

    render(
      <NoteCard
        note={sampleNote}
        projects={sampleProjects}
        onUpdateNote={jest.fn()}
        onCompleteNote={onCompleteMock}
      />
    );

    // Archive checkbox should be present with label
    const archiveBtn = screen.getByRole('button', { name: /Complete \/ Archive Note/i });
    expect(archiveBtn).toBeInTheDocument();

    // Click checkbox
    fireEvent.click(archiveBtn);

    // Should not fire immediately due to 300ms animation delay
    expect(onCompleteMock).not.toHaveBeenCalled();

    // Fast-forward 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onCompleteMock).toHaveBeenCalledWith(sampleNote.id);
    jest.useRealTimers();
  });

  test('allows converting note to prioritized task from bottom Priority popover', () => {
    const onConvertMock = jest.fn();

    render(
      <NoteCard
        note={sampleNote}
        projects={sampleProjects}
        onUpdateNote={jest.fn()}
        onConvertNoteToTask={onConvertMock}
      />
    );

    // Click Priority button in bottom toolbar
    const priorityBtn = screen.getByRole('button', { name: /Priority/i });
    expect(priorityBtn).toBeInTheDocument();
    fireEvent.click(priorityBtn);

    // Popover options P1, P2, P3 should appear
    const p1Option = screen.getByText(/P1 \(Must do\)/i);
    expect(p1Option).toBeInTheDocument();

    fireEvent.click(p1Option);
    expect(onConvertMock).toHaveBeenCalledWith(sampleNote.id, 1);
  });
});

