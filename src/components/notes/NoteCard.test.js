import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
