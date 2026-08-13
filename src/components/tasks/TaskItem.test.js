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
