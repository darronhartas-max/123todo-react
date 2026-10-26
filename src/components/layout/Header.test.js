import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { formatDisplayDate, getTodayDateString } from '../../utils/dateUtils';

describe('Header Component', () => {
    test('renders today date formatted with user date format preference', () => {
        const todayUK = formatDisplayDate(getTodayDateString(), 'UK');
        render(
            <Header
                dateFormat="UK"
                appMode="tasks"
            />
        );

        expect(screen.getByText(todayUK)).toBeInTheDocument();
    });

    test('renders today date formatted with US date format', () => {
        const todayUS = formatDisplayDate(getTodayDateString(), 'US');
        render(
            <Header
                dateFormat="US"
                appMode="tasks"
            />
        );

        expect(screen.getByText(todayUS)).toBeInTheDocument();
    });

    test('switches mode between tasks and notes', () => {
        const onSwitchModeMock = jest.fn();
        render(
            <Header
                appMode="tasks"
                onSwitchMode={onSwitchModeMock}
                buttonDisplayMode="both"
            />
        );

        const notesBtn = screen.getByRole('button', { name: 'Notes' });
        fireEvent.click(notesBtn);
        expect(onSwitchModeMock).toHaveBeenCalledWith('notes');
    });
});
