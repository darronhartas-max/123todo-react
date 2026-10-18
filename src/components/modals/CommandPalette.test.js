import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommandPalette from './CommandPalette';

describe('CommandPalette', () => {
    const mockProjects = [
        { id: 'work', name: 'Work', color: '#b91c1c' },
        { id: 'personal', name: 'Personal', color: '#10b981' }
    ];

    const mockTasks = [
        { id: '1', text: 'Prepare quarterly review', priority: 1, projectId: 'work' },
        { id: '2', text: 'Buy groceries for the week', priority: 2, projectId: 'personal' }
    ];

    test('does not render when isOpen is false', () => {
        const { container } = render(
            <CommandPalette isOpen={false} onClose={jest.fn()} />
        );
        expect(container.firstChild).toBeNull();
    });

    test('renders search input and core actions when isOpen is true', () => {
        render(
            <CommandPalette
                isOpen={true}
                onClose={jest.fn()}
                projects={mockProjects}
                tasks={mockTasks}
            />
        );

        expect(screen.getByPlaceholderText(/type a command or search tasks/i)).toBeInTheDocument();
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
        expect(screen.getByText('Capture Voice Note')).toBeInTheDocument();
        expect(screen.getByText('Open App Settings')).toBeInTheDocument();
    });

    test('filters commands and live tasks based on user search query', () => {
        render(
            <CommandPalette
                isOpen={true}
                onClose={jest.fn()}
                projects={mockProjects}
                tasks={mockTasks}
            />
        );

        const input = screen.getByPlaceholderText(/type a command or search tasks/i);
        fireEvent.change(input, { target: { value: 'quarterly' } });

        // Should find matching task
        expect(screen.getByText('Prepare quarterly review')).toBeInTheDocument();
        // Unrelated command should not appear
        expect(screen.queryByText('Capture Voice Note')).not.toBeInTheDocument();
    });

    test('clicking an action triggers its callback and closes the palette', () => {
        const mockOnClose = jest.fn();
        const mockOnAddTask = jest.fn();

        render(
            <CommandPalette
                isOpen={true}
                onClose={mockOnClose}
                onAddTask={mockOnAddTask}
            />
        );

        const addTaskBtn = screen.getByText('Create New Task');
        fireEvent.click(addTaskBtn);

        expect(mockOnClose).toHaveBeenCalled();
        expect(mockOnAddTask).toHaveBeenCalled();
    });

    test('keyboard navigation ArrowDown and Enter executes active command', () => {
        const mockOnClose = jest.fn();
        const mockOnAddNote = jest.fn();

        render(
            <CommandPalette
                isOpen={true}
                onClose={mockOnClose}
                onAddNote={mockOnAddNote}
            />
        );

        const input = screen.getByPlaceholderText(/type a command or search tasks/i);
        // Move from index 0 ('Create New Task') to index 1 ('Capture Voice Note')
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(mockOnClose).toHaveBeenCalled();
        expect(mockOnAddNote).toHaveBeenCalled();
    });

    test('pressing Escape closes the command palette', () => {
        const mockOnClose = jest.fn();

        render(
            <CommandPalette
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const input = screen.getByPlaceholderText(/type a command or search tasks/i);
        fireEvent.keyDown(input, { key: 'Escape' });

        expect(mockOnClose).toHaveBeenCalled();
    });

    test('clicking backdrop closes palette', () => {
        const mockOnClose = jest.fn();

        render(
            <CommandPalette
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const backdrop = screen.getByTestId('command-palette-backdrop');
        fireEvent.click(backdrop);

        expect(mockOnClose).toHaveBeenCalled();
    });
});
