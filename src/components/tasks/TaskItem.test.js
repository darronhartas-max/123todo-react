import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TaskItem from './TaskItem';

jest.useFakeTimers();

test('highlights green and triggers onComplete to archive task when checkbox is clicked', () => {
  const onCompleteMock = jest.fn();
  const sampleTask = {
    id: 101,
    text: 'Test completion task',
    priority: 1,
    projectId: 'general'
  };

  render(
    <TaskItem
      task={sampleTask}
      onComplete={onCompleteMock}
    />
  );

  const completeBtn = screen.getByTitle('Complete Task');
  expect(completeBtn).toBeInTheDocument();

  fireEvent.click(completeBtn);

  // Advance timers by 600ms to trigger archiving
  act(() => {
    jest.advanceTimersByTime(600);
  });

  expect(onCompleteMock).toHaveBeenCalledWith(101);
});

test('renders Calendar action icon for simple scheduled task and Repeat action icon for recurring task', () => {
  const scheduledTask = {
    id: 102,
    text: 'Simple scheduled task',
    priority: 1,
    scheduledDate: '2026-08-20',
    isRecurring: false
  };

  const { rerender } = render(<TaskItem task={scheduledTask} />);

  expect(screen.getByTitle('Change schedule / Defer task')).toBeInTheDocument();

  const recurringTask = {
    id: 103,
    text: 'Recurring task',
    priority: 1,
    scheduledDate: '2026-08-20',
    isRecurring: true,
    recurrence: { frequency: 1, interval: 'days' }
  };

  rerender(<TaskItem task={recurringTask} />);

  expect(screen.getByTitle('Recurring schedule / Defer task')).toBeInTheDocument();
});

test('renders the first line of notes in small font and opens edit modal on click', () => {
  const onEditMock = jest.fn();
  const taskWithNotes = {
    id: 104,
    text: 'Task with multi-line notes',
    priority: 1,
    notes: 'First line of note details\nSecond line with more private info'
  };

  render(<TaskItem task={taskWithNotes} onEdit={onEditMock} />);

  // First line should be visible in task list view
  expect(screen.getByText('First line of note details')).toBeInTheDocument();
  // Second line should NOT be visible in compact list view
  expect(screen.queryByText('Second line with more private info')).not.toBeInTheDocument();

  // Clicking task opens edit modal
  fireEvent.click(screen.getByText('Task with multi-line notes'));
  expect(onEditMock).toHaveBeenCalledWith(taskWithNotes);

  // Note preview is still present
  expect(screen.getByText('First line of note details')).toBeInTheDocument();
});
