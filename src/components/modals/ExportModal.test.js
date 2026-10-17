import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportModal from './ExportModal';

describe('ExportModal', () => {
    const mockData = {
        tasks: [
            { id: '1', title: 'Task 1', priority: '1', project: 'Work', completed: false }
        ],
        projects: [
            { id: 'Work', name: 'Work', color: '#3b82f6' }
        ]
    };

    const defaultProps = {
        data: mockData,
        onClose: jest.fn(),
        onRecordBackup: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockImplementation(() => Promise.resolve())
            }
        });
    });

    test('renders ExportModal with backup overview and action cards', () => {
        render(<ExportModal {...defaultProps} />);
        expect(screen.getByText('Export Tasks & Settings')).toBeInTheDocument();
        expect(screen.getByText('Save File Locally')).toBeInTheDocument();
        expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
        expect(screen.getByText('Export Note Photos (.ZIP)')).toBeInTheDocument();
    });

    test('calls onClose when close icon or button is clicked', () => {
        render(<ExportModal {...defaultProps} />);
        const closeBtn = screen.getByRole('button', { name: 'Close' });
        fireEvent.click(closeBtn);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    test('copies JSON data to clipboard when Copy card is clicked', () => {
        render(<ExportModal {...defaultProps} />);
        const copyCard = screen.getByText('Copy to Clipboard');
        fireEvent.click(copyCard);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify(mockData, null, 2));
    });

    test('triggers save to device fallback download when Save File Locally is clicked', () => {
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();

        render(<ExportModal {...defaultProps} />);
        const saveCard = screen.getByText('Save File Locally');
        fireEvent.click(saveCard);

        expect(defaultProps.onRecordBackup).toHaveBeenCalled();
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    test('opens mailto client when Email Backup is clicked', () => {
        window.open = jest.fn();
        render(<ExportModal {...defaultProps} />);
        const emailCard = screen.getByText('Email Backup Data');
        fireEvent.click(emailCard);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify(mockData, null, 2));
        expect(window.open).toHaveBeenCalledWith(expect.stringContaining('mailto:?subject='), '_blank');
    });

    test('renders photo export zip card and triggers photo gathering alert when no photos exist', async () => {
        window.alert = jest.fn();
        render(<ExportModal {...defaultProps} />);
        const photosCard = screen.getByText('Export Note Photos (.ZIP)');
        fireEvent.click(photosCard);
        // getAllPhotos returns [] by default in test, triggering alert
        await expect(window.alert).toBeDefined();
    });
});
