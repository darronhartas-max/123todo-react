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

test('renders Delete ALL Archived Tasks button', () => {
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

    const clearBtn = screen.getByRole('button', { name: /Delete ALL Archived Tasks/i });
    expect(clearBtn).toBeInTheDocument();
});

test('requires 2 approval steps with BIG warning before clearing archive', () => {
    const handleDelete = jest.fn();
    render(
        <ArchiveModal
            archived={sampleArchivedTasks}
            projects={sampleProjects}
            onRestore={jest.fn()}
            onDelete={handleDelete}
            onUpdate={jest.fn()}
            onClose={jest.fn()}
        />
    );

    // Initial state: Delete ALL Archived Tasks button present, no onDelete call
    const initialBtn = screen.getByRole('button', { name: /Delete ALL Archived Tasks/i });
    fireEvent.click(initialBtn);

    // Step 1: BIG Warning Banner and Step 1 approval button should be displayed
    expect(screen.getByText(/BIG WARNING: PERMANENT DELETION/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();
    const approvalBtn1 = screen.getByRole('button', { name: /Yes, Proceed to Final Approval \(1\/2\)/i });
    expect(approvalBtn1).toBeInTheDocument();
    expect(handleDelete).not.toHaveBeenCalled();

    // Click Approval 1 -> advances to Step 2
    fireEvent.click(approvalBtn1);

    // Step 2: Final Warning and Step 2 approval button should be displayed
    expect(screen.getByText(/FINAL WARNING: ARE YOU 100% SURE\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 2 of 2 \(FINAL\)/i)).toBeInTheDocument();
    const approvalBtn2 = screen.getByRole('button', { name: /FINAL APPROVAL: Delete ALL Archived Tasks \(2\/2\)/i });
    expect(approvalBtn2).toBeInTheDocument();
    expect(handleDelete).not.toHaveBeenCalled();

    // Click Approval 2 -> triggers clear
    fireEvent.click(approvalBtn2);

    expect(handleDelete).toHaveBeenCalledTimes(2);
    expect(handleDelete).toHaveBeenNthCalledWith(1, 102);
    expect(handleDelete).toHaveBeenNthCalledWith(2, 101);
});

test('allows canceling archive deletion at step 1 or step 2', () => {
    const handleDelete = jest.fn();
    render(
        <ArchiveModal
            archived={sampleArchivedTasks}
            projects={sampleProjects}
            onRestore={jest.fn()}
            onDelete={handleDelete}
            onUpdate={jest.fn()}
            onClose={jest.fn()}
        />
    );

    // Click initial button -> Step 1
    fireEvent.click(screen.getByRole('button', { name: /Delete ALL Archived Tasks/i }));
    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();

    // Click Cancel -> reverts to step 0
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByText(/Step 1 of 2/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete ALL Archived Tasks/i })).toBeInTheDocument();
    expect(handleDelete).not.toHaveBeenCalled();
});

