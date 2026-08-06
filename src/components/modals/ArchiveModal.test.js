import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ArchiveModal from './ArchiveModal';

jest.mock('framer-motion', () => {
    const actual = jest.requireActual('framer-motion');
    return {
        ...actual,
        AnimatePresence: ({ children }) => <>{children}</>,
        motion: {
            ...actual.motion,
            div: ({ children, layout, ...props }) => <div {...props}>{children}</div>,
            li: ({ children, layout, ...props }) => <li {...props}>{children}</li>,
            span: ({ children, layout, ...props }) => <span {...props}>{children}</span>,
            button: ({ children, layout, ...props }) => <button {...props}>{children}</button>
        }
    };
});

const sampleArchivedTasks = [
    { id: 101, text: 'Fix navigation bar bug', priority: 1, projectId: 'general', completedAt: 1690000000000 },
    { id: 102, text: 'Update privacy policy', priority: 2, projectId: 'work', completedAt: 1691000000000, notes: 'Legal compliance' }
];

const sampleProjects = [
    { id: 'work', name: 'Work', color: '#10b981' }
];

test('renders ArchiveModal with archived tasks count and list', () => {
    render(
        <ArchiveModal
            archived={sampleArchivedTasks}
            projects={sampleProjects}
            onRestore={jest.fn()}
            onDelete={jest.fn()}
            onUpdate={jest.fn()}
            onClose={jest.fn()}
        />
    );

    expect(screen.getByText('Archive Search')).toBeInTheDocument();
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
    expect(screen.getByText('Fix navigation bar bug')).toBeInTheDocument();
    expect(screen.getByText('Update privacy policy')).toBeInTheDocument();
});

test('filters tasks by search query inside ArchiveModal', () => {
    render(
        <ArchiveModal
            archived={sampleArchivedTasks}
            projects={sampleProjects}
            onRestore={jest.fn()}
            onDelete={jest.fn()}
            onUpdate={jest.fn()}
            onClose={jest.fn()}
        />
    );

    const searchInput = screen.getByPlaceholderText(/Search archived tasks/i);
    fireEvent.change(searchInput, { target: { value: 'navigation' } });

    expect(screen.getByText('Fix navigation bar bug')).toBeInTheDocument();
    expect(screen.queryByText('Update privacy policy')).not.toBeInTheDocument();
});

test('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
        <ArchiveModal
            archived={sampleArchivedTasks}
            projects={sampleProjects}
            onRestore={jest.fn()}
            onDelete={jest.fn()}
            onUpdate={jest.fn()}
            onClose={handleClose}
        />
    );

    const closeBtn = screen.getByTitle(/Close Archive/i);
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
});
