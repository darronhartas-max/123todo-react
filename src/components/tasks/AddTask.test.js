import { render, screen } from '@testing-library/react';
import AddTask from './AddTask';

test('renders priority buttons and Add button with proper labels', () => {
  render(
    <AddTask
      isOpen={true}
      onAdd={jest.fn()}
      onClose={jest.fn()}
      projects={[{ id: 'general', name: 'General' }]}
    />
  );

  expect(screen.getByText('Must Do')).toBeInTheDocument();
  expect(screen.getByText('Should Do')).toBeInTheDocument();
  expect(screen.getByText('Could Do')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
});

test('renders Next Day and Next Week buttons when schedule is toggled open', () => {
  const { fireEvent } = require('@testing-library/react');
  render(
    <AddTask
      isOpen={true}
      onAdd={jest.fn()}
      onClose={jest.fn()}
      projects={[{ id: 'general', name: 'General' }]}
    />
  );

  const scheduleToggle = screen.getByRole('button', { name: /schedule/i });
  fireEvent.click(scheduleToggle);

  expect(screen.getByRole('button', { name: /day/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/start\/scheduled date/i)).toBeInTheDocument();
});

test('displays full list of projects when project dropdown is opened', () => {
  const { fireEvent } = require('@testing-library/react');
  const sampleProjects = [
    { id: 'general', name: 'General', color: '#285a82' },
    { id: 'work', name: 'Work Project', color: '#b91c1c' },
    { id: 'home', name: 'Home Renovations', color: '#10b981' },
    { id: 'fitness', name: 'Fitness & Health', color: '#3b82f6' }
  ];

  render(
    <AddTask
      isOpen={true}
      onAdd={jest.fn()}
      onClose={jest.fn()}
      projects={sampleProjects}
      defaultProjectId="general"
    />
  );

  // Click on the active project trigger button
  const triggerBtn = screen.getByText('General').closest('button');
  fireEvent.click(triggerBtn);

  // All 4 projects should be visible in the dropdown
  expect(screen.getByText('Work Project')).toBeInTheDocument();
  expect(screen.getByText('Home Renovations')).toBeInTheDocument();
  expect(screen.getByText('Fitness & Health')).toBeInTheDocument();
});

test('renders Talk button and activates listening indicator on click', () => {
  const { fireEvent } = require('@testing-library/react');
  // Mock SpeechRecognition in window
  class MockSpeechRecognition {
    constructor() {
      this.start = jest.fn();
      this.stop = jest.fn();
      this.abort = jest.fn();
    }
  }
  window.SpeechRecognition = MockSpeechRecognition;

  render(
    <AddTask
      isOpen={true}
      onAdd={jest.fn()}
      onClose={jest.fn()}
      projects={[{ id: 'general', name: 'General', color: '#6b7280' }]}
    />
  );

  const voiceBtn = screen.getByRole('button', { name: /talk/i });
  expect(voiceBtn).toBeInTheDocument();
  fireEvent.click(voiceBtn);

  // When listening, should display Listening... without MicOff confusion
  expect(screen.getByText(/listening\.\.\./i)).toBeInTheDocument();

  delete window.SpeechRecognition;
});

test('allows adding and removing time when scheduling a task in AddTask', () => {
  const { fireEvent } = require('@testing-library/react');
  const onAddMock = jest.fn();

  render(
    <AddTask
      isOpen={true}
      onAdd={onAddMock}
      onClose={jest.fn()}
      projects={[{ id: 'general', name: 'General', color: '#6b7280' }]}
    />
  );

  // Type title
  const input = screen.getByPlaceholderText(/what needs to be done/i);
  fireEvent.change(input, { target: { value: 'Dentist appointment' } });

  // Open schedule section
  const scheduleToggle = screen.getByRole('button', { name: /schedule/i });
  fireEvent.click(scheduleToggle);

  // Set date to tomorrow
  const dayButton = screen.getByRole('button', { name: /day/i });
  fireEvent.click(dayButton);

  // Initially minimalist "+ Add time (optional)" is shown
  const addTimeBtn = screen.getByRole('button', { name: /\+ add time \(optional\)/i });
  expect(addTimeBtn).toBeInTheDocument();
  fireEvent.click(addTimeBtn);

  // Time input is now revealed
  const timeInput = screen.getByLabelText(/time:/i);
  expect(timeInput).toBeInTheDocument();
  fireEvent.change(timeInput, { target: { value: '14:30' } });

  // Add the task
  const addBtn = screen.getByRole('button', { name: /^add$/i });
  fireEvent.click(addBtn);

  expect(onAddMock).toHaveBeenCalledWith(
    'Dentist appointment',
    1,
    'general',
    '',
    expect.objectContaining({
      scheduledDate: expect.any(String),
      scheduledTime: '14:30'
    })
  );
});

test('removing scheduled time reverts back to + Add time button in AddTask', () => {
  const { fireEvent } = require('@testing-library/react');

  render(
    <AddTask
      isOpen={true}
      onAdd={jest.fn()}
      onClose={jest.fn()}
      projects={[{ id: 'general', name: 'General', color: '#6b7280' }]}
    />
  );

  // Open schedule section
  fireEvent.click(screen.getByRole('button', { name: /schedule/i }));

  // Click "+ Add time (optional)"
  fireEvent.click(screen.getByRole('button', { name: /\+ add time \(optional\)/i }));

  // Set time and then click Remove
  const timeInput = screen.getByLabelText(/time:/i);
  fireEvent.change(timeInput, { target: { value: '10:00' } });

  const removeBtn = screen.getByRole('button', { name: /remove/i });
  fireEvent.click(removeBtn);

  // Reverts back to "+ Add time (optional)"
  expect(screen.getByRole('button', { name: /\+ add time \(optional\)/i })).toBeInTheDocument();
  expect(screen.queryByLabelText(/time:/i)).not.toBeInTheDocument();
});


