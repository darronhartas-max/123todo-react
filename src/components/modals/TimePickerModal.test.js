import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimePickerModal from './TimePickerModal';

describe('TimePickerModal', () => {
    test('does not render when isOpen is false', () => {
        render(
            <TimePickerModal
                isOpen={false}
                value="09:00"
                onSave={jest.fn()}
                onClose={jest.fn()}
            />
        );
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('renders when isOpen is true and parses existing 24h value', () => {
        render(
            <TimePickerModal
                isOpen={true}
                value="14:30"
                onSave={jest.fn()}
                onClose={jest.fn()}
            />
        );

        expect(screen.getByRole('dialog', { name: /select time/i })).toBeInTheDocument();
        // 14:30 is 02:30 PM
        expect(screen.getByRole('button', { name: /02/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /30/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^PM$/i })).toBeInTheDocument();
    });

    test('clicking an hour advances to minute mode and Set Time returns 24h string', () => {
        const onSaveMock = jest.fn();
        const onCloseMock = jest.fn();

        render(
            <TimePickerModal
                isOpen={true}
                value="09:00"
                onSave={onSaveMock}
                onClose={onCloseMock}
            />
        );

        // Initially in hour mode
        expect(screen.getByText(/tap an hour on the clock/i)).toBeInTheDocument();

        // Switch to PM
        fireEvent.click(screen.getByRole('button', { name: /^PM$/i }));

        // Click Set Time
        fireEvent.click(screen.getByRole('button', { name: /set time/i }));

        expect(onSaveMock).toHaveBeenCalledWith('21:00');
        expect(onCloseMock).toHaveBeenCalled();
    });

    test('clicking Clear calls onSave with null', () => {
        const onSaveMock = jest.fn();
        const onCloseMock = jest.fn();

        render(
            <TimePickerModal
                isOpen={true}
                value="09:00"
                onSave={onSaveMock}
                onClose={onCloseMock}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /clear/i }));

        expect(onSaveMock).toHaveBeenCalledWith(null);
        expect(onCloseMock).toHaveBeenCalled();
    });

    test('clicking Cancel calls onClose without onSave', () => {
        const onSaveMock = jest.fn();
        const onCloseMock = jest.fn();

        render(
            <TimePickerModal
                isOpen={true}
                value="09:00"
                onSave={onSaveMock}
                onClose={onCloseMock}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

        expect(onSaveMock).not.toHaveBeenCalled();
        expect(onCloseMock).toHaveBeenCalled();
    });

    test('clicking digital minute button switches mode to minute', () => {
        render(
            <TimePickerModal
                isOpen={true}
                value="09:00"
                onSave={jest.fn()}
                onClose={jest.fn()}
            />
        );

        const minuteBtn = screen.getByRole('button', { name: /00/i });
        fireEvent.click(minuteBtn);

        expect(screen.getByText(/tap minutes on the clock/i)).toBeInTheDocument();
    });
});
