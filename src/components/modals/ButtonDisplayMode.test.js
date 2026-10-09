import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsModal from './SettingsModal';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

describe('Button Display Mode & Decluttering', () => {
    test('SettingsModal renders Feature Buttons & Labels setting and allows toggling', () => {
        const setButtonDisplayModeMock = jest.fn();
        render(
            <SettingsModal
                isOpen={true}
                onClose={jest.fn()}
                initialTab="appearance"
                buttonDisplayMode="icons"
                setButtonDisplayMode={setButtonDisplayModeMock}
            />
        );

        expect(screen.getByText('Feature Buttons & Labels')).toBeInTheDocument();
        const iconsBtn = screen.getByRole('button', { name: /Icons \(Clean\)/i });
        const bothBtn = screen.getByRole('button', { name: /Icons & Text/i });
        const textBtn = screen.getByRole('button', { name: /Text Only/i });

        expect(iconsBtn).toBeInTheDocument();
        expect(bothBtn).toBeInTheDocument();
        expect(textBtn).toBeInTheDocument();

        fireEvent.click(bothBtn);
        expect(setButtonDisplayModeMock).toHaveBeenCalledWith('both');

        fireEvent.click(textBtn);
        expect(setButtonDisplayModeMock).toHaveBeenCalledWith('text');
    });

    test('Header respects buttonDisplayMode for clean icons vs text labels', () => {
        const { rerender } = render(
            <Header
                buttonDisplayMode="icons"
                onOpenInstall={jest.fn()}
                appMode="tasks"
            />
        );

        // In icons mode, Tasks button has aria-label="Tasks" and does not display the trailing span text
        const tasksBtn = screen.getByRole('button', { name: 'Tasks' });
        expect(tasksBtn).toBeInTheDocument();
        expect(tasksBtn.querySelector('span')).toBeNull();

        // Rerender with 'both' mode
        rerender(
            <Header
                buttonDisplayMode="both"
                onOpenInstall={jest.fn()}
                appMode="tasks"
            />
        );
        expect(screen.getByText('Tasks')).toBeInTheDocument();

        // Rerender with 'text' mode
        rerender(
            <Header
                buttonDisplayMode="text"
                onOpenInstall={jest.fn()}
                appMode="tasks"
            />
        );
        expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    test('Footer renders copyright and version on the same line with compact styling', () => {
        render(<Footer version="3.7.39" />);

        expect(screen.getByText(/Copyright © Unforgettable Management/i)).toBeInTheDocument();
        expect(screen.getByText('v3.7.39')).toBeInTheDocument();
        // Dot separator between copyright and version
        expect(screen.getByText('·')).toBeInTheDocument();
    });

    test('SettingsModal renders Task Creation Date & Time setting and allows toggling', () => {
        const setShowTaskCreationDateMock = jest.fn();
        render(
            <SettingsModal
                isOpen={true}
                onClose={jest.fn()}
                initialTab="tasks"
                showTaskCreationDate={false}
                setShowTaskCreationDate={setShowTaskCreationDateMock}
            />
        );

        expect(screen.getByText('Task Creation Date & Time')).toBeInTheDocument();
        const hiddenBtn = screen.getByRole('button', { name: /Hidden \(Default\)/i });
        const shownBtn = screen.getByRole('button', { name: /^Shown$/i });

        expect(hiddenBtn).toBeInTheDocument();
        expect(shownBtn).toBeInTheDocument();

        fireEvent.click(shownBtn);
        expect(setShowTaskCreationDateMock).toHaveBeenCalledWith(true);

        fireEvent.click(hiddenBtn);
        expect(setShowTaskCreationDateMock).toHaveBeenCalledWith(false);
    });

    test('AddTask renders Repeat icon button on same scheduling row and toggles recurrence', () => {
        const { default: AddTask } = require('../tasks/AddTask');
        render(
            <AddTask
                isOpen={true}
                onAdd={jest.fn()}
                onClose={jest.fn()}
                projects={[{ id: 'general', name: 'General', color: '#6b7280' }]}
            />
        );

        // Open Schedule section
        fireEvent.click(screen.getByRole('button', { name: /schedule/i }));

        // Both Add time and Repeat buttons exist
        const addTimeBtn = screen.getByRole('button', { name: /add time/i });
        const repeatBtn = screen.getByRole('checkbox', { name: /repeat this task/i });
        expect(addTimeBtn).toBeInTheDocument();
        expect(repeatBtn).toBeInTheDocument();

        // Initially recurrence interval settings are not displayed
        expect(screen.queryByText(/Every/i)).not.toBeInTheDocument();

        // Click Repeat icon button to enable recurrence
        fireEvent.click(repeatBtn);
        expect(screen.getByText(/Every/i)).toBeInTheDocument();

        // Click again to turn off
        fireEvent.click(repeatBtn);
        expect(screen.queryByText(/Every/i)).not.toBeInTheDocument();
    });

    test('NotesView positions Add Note button on the right side with marginLeft auto', () => {
        const { default: NotesView } = require('../notes/NotesView');
        render(
            <NotesView
                tasks={[]}
                projects={[{ id: 'general', name: 'General', color: '#6b7280' }]}
                onAddNote={jest.fn()}
            />
        );

        const addNoteBtn = screen.getByRole('button', { name: /add new note/i });
        expect(addNoteBtn).toBeInTheDocument();
        expect(addNoteBtn.style.marginLeft).toBe('auto');
    });
});
