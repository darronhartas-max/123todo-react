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

test('successfully completes a task even after vertical touch scroll interactions on mobile', () => {
  const onCompleteMock = jest.fn();
  const task = {
    id: 105,
    text: 'Task tested during mobile scroll',
    priority: 1,
    projectId: 'general'
  };

  render(
    <TaskItem
      task={task}
      onComplete={onCompleteMock}
      swipeSettings={{ enabled: true, swipeRight: 'complete', swipeLeft: 'delete' }}
    />
  );

  const listItem = screen.getByRole('listitem');

  // Simulate user scrolling vertically down the task list
  fireEvent.touchStart(listItem, { touches: [{ clientX: 100, clientY: 100 }] });
  fireEvent.touchMove(listItem, { touches: [{ clientX: 102, clientY: 150 }] });
  fireEvent.touchEnd(listItem);

  // Now user taps complete button
  const completeBtn = screen.getByTitle('Complete Task');
  fireEvent.touchStart(completeBtn, { touches: [{ clientX: 200, clientY: 100 }] });
  fireEvent.touchEnd(completeBtn);
  fireEvent.click(completeBtn);

  act(() => {
    jest.advanceTimersByTime(400);
  });

  expect(onCompleteMock).toHaveBeenCalledWith(105);
});

test('does NOT trigger swipe action during diagonal or vertical list scrolling', () => {
  const onSwipeActionMock = jest.fn();
  const task = {
    id: 1051,
    text: 'Task during diagonal scroll',
    priority: 1,
    projectId: 'general'
  };

  render(
    <TaskItem
      task={task}
      onSwipeAction={onSwipeActionMock}
      swipeSettings={{ enabled: true, swipeRight: 'complete', swipeLeft: 'delete' }}
    />
  );

  const listItem = screen.getByRole('listitem');

  // Simulate diagonal scrolling motion with early vertical movement (e.g., thumb flick down and right)
  fireEvent.touchStart(listItem, { touches: [{ clientX: 100, clientY: 100 }] });
  fireEvent.touchMove(listItem, { touches: [{ clientX: 120, clientY: 118 }] });
  fireEvent.touchMove(listItem, { touches: [{ clientX: 180, clientY: 180 }] });
  fireEvent.touchEnd(listItem);

  // Should NOT have triggered any swipe action because vertical scrolling intent dominated
  expect(onSwipeActionMock).not.toHaveBeenCalled();
});

test('triggers swipe action only on intentional horizontal swipe exceeding 95px threshold', () => {
  const onSwipeActionMock = jest.fn();
  const task = {
    id: 1052,
    text: 'Task with intentional swipe',
    priority: 1,
    projectId: 'general'
  };

  const { rerender } = render(
    <TaskItem
      task={task}
      onSwipeAction={onSwipeActionMock}
      swipeSettings={{ enabled: true, swipeRight: 'complete', swipeLeft: 'delete' }}
    />
  );

  const listItem = screen.getByRole('listitem');

  // 1. Short swipe (50px right, below 95px threshold) -> should not trigger
  fireEvent.touchStart(listItem, { touches: [{ clientX: 100, clientY: 100 }] });
  fireEvent.touchMove(listItem, { touches: [{ clientX: 150, clientY: 101 }] });
  fireEvent.touchEnd(listItem);

  expect(onSwipeActionMock).not.toHaveBeenCalled();

  // 2. Deliberate long swipe (120px right, exceeding 95px threshold) -> triggers complete
  fireEvent.touchStart(listItem, { touches: [{ clientX: 100, clientY: 100 }] });
  fireEvent.touchMove(listItem, { touches: [{ clientX: 220, clientY: 101 }] });
  fireEvent.touchEnd(listItem);

  expect(onSwipeActionMock).toHaveBeenCalledWith(task, 'complete');
});

test('successfully completes and archives a task with multiple photo attachments', () => {
  const onCompleteMock = jest.fn();
  const taskWithPhotos = {
    id: 106,
    text: 'Task with 3 photos',
    priority: 1,
    projectId: 'general',
    notes: 'Receipt attached',
    photos: [
      { id: 'img_1', name: 'photo1.jpg', thumbnail: 'data:image/webp;base64,abc' },
      { id: 'img_2', name: 'photo2.jpg', thumbnail: 'data:image/webp;base64,def' },
      { id: 'img_3', name: 'photo3.jpg', thumbnail: 'data:image/webp;base64,ghi' }
    ]
  };

  render(
    <TaskItem
      task={taskWithPhotos}
      onComplete={onCompleteMock}
    />
  );

  // Auto-updating photo badge should be present
  expect(screen.getByTitle(/3 photos attached/i)).toBeInTheDocument();

  const completeBtn = screen.getByTitle('Complete Task');
  fireEvent.click(completeBtn);

  act(() => {
    jest.advanceTimersByTime(400);
  });

  expect(onCompleteMock).toHaveBeenCalledWith(106);
});

test('applies compact 2-line clamp class and title tooltip by default, but displays full text in full mode', () => {
  const longTask = {
    id: 107,
    text: 'This is a very long task description that spans across multiple lines so that we can verify compact 2-line mode truncation versus full length mode.',
    priority: 1,
    projectId: 'general'
  };

  const { rerender } = render(<TaskItem task={longTask} />);
  const textElement = screen.getByText(longTask.text);
  
  // By default (compact mode), should have task-text-compact class and title attribute
  expect(textElement).toHaveClass('task-text-compact');
  expect(textElement).toHaveAttribute('title', longTask.text);

  // When taskViewMode is set to 'full', should NOT have task-text-compact class or title attribute
  rerender(<TaskItem task={longTask} taskViewMode="full" />);
  expect(textElement).not.toHaveClass('task-text-compact');
  expect(textElement).not.toHaveAttribute('title');
});

