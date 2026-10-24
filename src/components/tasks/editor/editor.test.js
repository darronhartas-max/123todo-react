import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectPicker, PrioritySelector, RecurrencePicker, SchedulePicker, SubtasksEditor } from './index';

describe('Task Editor Micro-Components', () => {
    describe('ProjectPicker', () => {
        const sampleProjects = [
            { id: 'p1', name: 'General', color: '#6b7280' },
            { id: 'p2', name: 'Work', color: '#3b82f6' }
        ];

        test('renders active project and selects new project from dropdown', () => {
            const onSelect = jest.fn();
            render(
                <ProjectPicker
                    projects={sampleProjects}
                    selectedProjectId="p1"
                    onSelectProject={onSelect}
                    label="Project"
                />
            );

            expect(screen.getByText('Project')).toBeInTheDocument();
            const button = screen.getByRole('button', { name: /General/i });
            expect(button).toBeInTheDocument();

            fireEvent.click(button);
            const workOption = screen.getByText('Work');
            expect(workOption).toBeInTheDocument();

            fireEvent.click(workOption);
            expect(onSelect).toHaveBeenCalledWith('p2');
        });
    });

    describe('PrioritySelector', () => {
        test('renders in buttons mode and handles priority click', () => {
            const onChange = jest.fn();
            render(
                <PrioritySelector
                    priority={1}
                    onChangePriority={onChange}
                    mode="buttons"
                />
            );

            expect(screen.getByRole('button', { name: 'Must Do' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Should Do' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Could Do' })).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'Should Do' }));
            expect(onChange).toHaveBeenCalledWith(2);
        });

        test('renders in dropdown mode and handles option selection', () => {
            const onChange = jest.fn();
            render(
                <PrioritySelector
                    priority={1}
                    onChangePriority={onChange}
                    mode="dropdown"
                    label="Priority"
                />
            );

            expect(screen.getByText('Priority')).toBeInTheDocument();
            const button = screen.getByRole('button', { name: /Must Do/i });
            fireEvent.click(button);

            const couldDoOption = screen.getByText('Could Do');
            fireEvent.click(couldDoOption);
            expect(onChange).toHaveBeenCalledWith(3);
        });

        test('applies custom priority colors to buttons', () => {
            const onChange = jest.fn();
            render(
                <PrioritySelector
                    priority={1}
                    onChangePriority={onChange}
                    mode="buttons"
                    priorityColors={{
                        1: '#3b82f6', // Custom Blue for Must Do
                        2: '#10b981', // Custom Green for Should Do
                        3: '#8b5cf6',
                        4: '#ec4899'
                    }}
                />
            );

            const mustDoBtn = screen.getByRole('button', { name: 'Must Do' });
            expect(mustDoBtn.style.borderColor).toBe('#3b82f6');
            expect(mustDoBtn.style.backgroundColor).toBe('rgb(59, 130, 246)');
        });
    });

    describe('RecurrencePicker', () => {
        test('renders nothing when isRecurring is false', () => {
            const { container } = render(
                <RecurrencePicker isRecurring={false} />
            );
            expect(container).toBeEmptyDOMElement();
        });

        test('renders frequency, interval and day toggles when interval is weeks', () => {
            const onFreq = jest.fn();
            const onInterval = jest.fn();
            const onDays = jest.fn();

            render(
                <RecurrencePicker
                    isRecurring={true}
                    frequency={2}
                    onChangeFrequency={onFreq}
                    interval="weeks"
                    onChangeInterval={onInterval}
                    daysOfWeek={[1]} // Mon
                    onChangeDaysOfWeek={onDays}
                />
            );

            expect(screen.getByText('Every')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2')).toBeInTheDocument();
            expect(screen.getByText('Repeat on specific days:')).toBeInTheDocument();

            // Toggle Fri (index 5)
            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[5]); // Friday
            expect(onDays).toHaveBeenCalledWith([1, 5]);
        });
    });

    describe('SchedulePicker', () => {
        test('renders date controls, Day and Week buttons, and handles clearing', () => {
            const onDate = jest.fn();
            const onTime = jest.fn();
            const onToggleRepeat = jest.fn();

            render(
                <SchedulePicker
                    scheduledDate="2026-10-25"
                    onChangeScheduledDate={onDate}
                    scheduledTime="14:00"
                    onChangeScheduledTime={onTime}
                    onToggleRecurring={onToggleRepeat}
                    timeSchedulingEnabled={true}
                />
            );

            expect(screen.getByLabelText(/start\/scheduled date/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /day/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument();

            const clearBtn = screen.getByRole('button', { name: /clear/i });
            fireEvent.click(clearBtn);

            expect(onDate).toHaveBeenCalledWith(null);
            expect(onTime).toHaveBeenCalledWith(null);
            expect(onToggleRepeat).toHaveBeenCalledWith(false);
        });
    });

    describe('SubtasksEditor', () => {
        test('renders subtasks, toggles completion and adds new items', () => {
            const onChange = jest.fn();
            const initialSubtasks = [
                { id: 1, text: 'First task', completed: false }
            ];

            render(
                <SubtasksEditor
                    subtasks={initialSubtasks}
                    onChangeSubtasks={onChange}
                />
            );

            expect(screen.getByDisplayValue('First task')).toBeInTheDocument();

            // Toggle checkbox
            const checkbox = screen.getByRole('checkbox', { name: /mark subtask completed/i });
            fireEvent.click(checkbox);
            expect(onChange).toHaveBeenCalledWith([
                expect.objectContaining({ id: 1, completed: true })
            ]);

            // Add new subtask
            const input = screen.getByPlaceholderText('Add subtask step...');
            fireEvent.change(input, { target: { value: 'New item' } });
            fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

            expect(onChange).toHaveBeenCalledWith([
                expect.objectContaining({ text: 'New item', completed: false }),
                ...initialSubtasks
            ]);
        });
    });
});
