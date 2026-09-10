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
});
