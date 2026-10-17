import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UniversalImportModal from './UniversalImportModal';

describe('UniversalImportModal', () => {
    const defaultProps = {
        onClose: jest.fn(),
        onImport: jest.fn(),
        onOpenGuide: jest.fn(),
        existingProjects: [
            { id: 'Work', name: 'Work', color: '#3b82f6' },
            { id: 'Personal', name: 'Personal', color: '#10b981' }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders UniversalImportModal with competitor apps', () => {
        render(<UniversalImportModal {...defaultProps} />);
        expect(screen.getByText('Import from Other Apps')).toBeInTheDocument();
        expect(screen.getByText('Todoist')).toBeInTheDocument();
        expect(screen.getByText('TickTick')).toBeInTheDocument();
        expect(screen.getByText('Google Keep')).toBeInTheDocument();
        expect(screen.getByText('Google Tasks')).toBeInTheDocument();
        expect(screen.getByText('Microsoft To Do')).toBeInTheDocument();
    });

    test('switches selected app when tab is clicked', () => {
        render(<UniversalImportModal {...defaultProps} />);
        const tickTickTab = screen.getByText('TickTick');
        fireEvent.click(tickTickTab);
        expect(screen.getByText(/ticktick backup csv/i)).toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', () => {
        render(<UniversalImportModal {...defaultProps} />);
        const closeBtn = screen.getByRole('button', { name: '' });
        fireEvent.click(closeBtn);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    test('processes uploaded JSON file and previews tasks', async () => {
        const mockTasksJSON = JSON.stringify({
            items: [
                { id: '1', title: 'Buy groceries', status: 'needsAction' }
            ]
        });

        const file = new File([mockTasksJSON], 'Tasks.json', { type: 'application/json' });
        // Polyfill file.text() for jsdom
        file.text = jest.fn().mockResolvedValue(mockTasksJSON);

        render(<UniversalImportModal {...defaultProps} />);

        // Switch to Google Tasks
        fireEvent.click(screen.getByText('Google Tasks'));

        const input = document.querySelector('input[type="file"]');
        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(/ready to import/i)).toBeInTheDocument();
            expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        });

        // Click Import button
        const importBtn = screen.getByRole('button', { name: /confirm & import/i });
        fireEvent.click(importBtn);

        expect(defaultProps.onImport).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ text: 'Buy groceries' })
            ]),
            'General'
        );
    });
});
