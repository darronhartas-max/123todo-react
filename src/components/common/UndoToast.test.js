import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import UndoToast from './UndoToast';

describe('UndoToast', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('returns null when toast is null', () => {
        const { container } = render(<UndoToast toast={null} onUndo={jest.fn()} onDismiss={jest.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders completion toast with task title and countdown timer', () => {
        const mockToast = {
            id: 'toast-1',
            actionType: 'complete',
            message: 'Moved to Archive',
            task: { id: 'task-10', text: 'Prepare weekly agenda', priority: 1 }
        };

        render(<UndoToast toast={mockToast} onUndo={jest.fn()} onDismiss={jest.fn()} duration={5000} />);

        expect(screen.getByText('Moved to Archive')).toBeInTheDocument();
        expect(screen.getByText('"Prepare weekly agenda"')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /undo action/i })).toBeInTheDocument();
        expect(screen.getByText(/undo \(5s\)/i)).toBeInTheDocument();
    });

    test('clicking Undo triggers onUndo callback with toast object', () => {
        const mockOnUndo = jest.fn();
        const mockToast = {
            id: 'toast-2',
            actionType: 'complete',
            task: { id: 'task-11', text: 'Submit timesheet', priority: 2 }
        };

        render(<UndoToast toast={mockToast} onUndo={mockOnUndo} onDismiss={jest.fn()} duration={5000} />);

        const undoBtn = screen.getByRole('button', { name: /undo action/i });
        fireEvent.click(undoBtn);

        expect(mockOnUndo).toHaveBeenCalledWith(mockToast);
    });

    test('clicking dismiss cross triggers onDismiss', () => {
        const mockOnDismiss = jest.fn();
        const mockToast = {
            id: 'toast-3',
            actionType: 'complete',
            task: { id: 'task-12', text: 'Order groceries', priority: 3 }
        };

        render(<UndoToast toast={mockToast} onUndo={jest.fn()} onDismiss={mockOnDismiss} duration={5000} />);

        const dismissBtn = screen.getByLabelText('Dismiss notification');
        fireEvent.click(dismissBtn);

        expect(mockOnDismiss).toHaveBeenCalled();
    });

    test('auto-dismisses after duration elapses', () => {
        const mockOnDismiss = jest.fn();
        const mockToast = {
            id: 'toast-4',
            actionType: 'complete',
            task: { id: 'task-13', text: 'Call electrician', priority: 1 }
        };

        render(<UndoToast toast={mockToast} onUndo={jest.fn()} onDismiss={mockOnDismiss} duration={3000} />);

        expect(mockOnDismiss).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(3100);
        });

        expect(mockOnDismiss).toHaveBeenCalled();
    });

    test('renders delete message for deleted task action', () => {
        const mockToast = {
            id: 'toast-5',
            actionType: 'delete',
            message: 'Task deleted',
            task: { id: 'task-14', text: 'Old duplicate task', priority: 4 }
        };

        render(<UndoToast toast={mockToast} onUndo={jest.fn()} onDismiss={jest.fn()} />);

        expect(screen.getByText('Task deleted')).toBeInTheDocument();
        expect(screen.getByText('"Old duplicate task"')).toBeInTheDocument();
    });
});
