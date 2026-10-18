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
  const addTimeBtn = screen.getByRole('button', { name: /add time/i });
  expect(addTimeBtn).toBeInTheDocument();
  fireEvent.click(addTimeBtn);

  // Set time via clock picker modal
  fireEvent.click(screen.getByRole('button', { name: /^PM$/i }));
  fireEvent.click(screen.getByRole('button', { name: /^Set Time$/i }));

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
      scheduledTime: '21:00'
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

  // Click "+ Add time (optional)" to open circular clock picker
  fireEvent.click(screen.getByRole('button', { name: /add time/i }));

  // In modal, click Set Time
  fireEvent.click(screen.getByRole('button', { name: /set time/i }));

  // Time is set and Remove button appears
  const removeBtn = screen.getByRole('button', { name: /remove/i });
  expect(removeBtn).toBeInTheDocument();
  fireEvent.click(removeBtn);

  // Reverts back to "+ Add time (optional)"
  expect(screen.getByRole('button', { name: /add time/i })).toBeInTheDocument();
});

test('renders Google Cal and Apple Cal buttons when scheduled date is set', () => {
  const { fireEvent } = require('@testing-library/react');
  const calendarUtils = require('../../utils/calendarUtils');
  jest.spyOn(calendarUtils, 'openGoogleCalendar').mockImplementation(() => {});
  jest.spyOn(calendarUtils, 'downloadAppleCalendarIcs').mockImplementation(() => {});

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

  // Before date is set, calendar buttons are not rendered
  expect(screen.queryByRole('button', { name: /google cal/i })).not.toBeInTheDocument();

  // Set date using +1 Day button
  fireEvent.click(screen.getByRole('button', { name: /day/i }));

  // Now buttons appear
  const googleBtn = screen.getByRole('button', { name: /google cal/i });
  const appleBtn = screen.getByRole('button', { name: /apple cal/i });
  expect(googleBtn).toBeInTheDocument();
  expect(appleBtn).toBeInTheDocument();

  fireEvent.click(googleBtn);
  expect(calendarUtils.openGoogleCalendar).toHaveBeenCalled();

  fireEvent.click(appleBtn);
  expect(calendarUtils.downloadAppleCalendarIcs).toHaveBeenCalled();
});

test('allows setting time via circular clock picker in AddTask', () => {
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

  // Type title and open schedule
  fireEvent.change(screen.getByPlaceholderText(/what needs to be done/i), { target: { value: 'Morning meeting' } });
  fireEvent.click(screen.getByRole('button', { name: /schedule/i }));

  // Click "+ Add time (optional)" to open clock face modal
  fireEvent.click(screen.getByRole('button', { name: /add time/i }));

  // Clock picker dialog is open
  expect(screen.getByRole('dialog', { name: /select time/i })).toBeInTheDocument();

  // Click Set Time (defaults to 09:00 AM)
  fireEvent.click(screen.getByRole('button', { name: /set time/i }));

  // Add task
  fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

  expect(onAddMock).toHaveBeenCalledWith(
    'Morning meeting',
    1,
    'general',
    '',
    expect.objectContaining({
      scheduledDate: expect.any(String),
      scheduledTime: '09:00'
    })
  );
});

test('hides time selection button when timeSchedulingEnabled is false', () => {
  const { fireEvent } = require('@testing-library/react');
  render(
    <AddTask
      isOpen={true}
      onAdd={jest.fn()}
      onClose={jest.fn()}
      projects={[{ id: 'general', name: 'General' }]}
      timeSchedulingEnabled={false}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: /schedule/i }));

  // Date controls are present
  expect(screen.getByLabelText(/start\/scheduled date/i)).toBeInTheDocument();

  // Time controls must NOT be present
  expect(screen.queryByRole('button', { name: /\+ add time/i })).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/time:/i)).not.toBeInTheDocument();
});

test('top right close cross closes and cancels AddTask without a redundant bottom cancel button', () => {
  const { fireEvent } = require('@testing-library/react');
  const onCloseMock = jest.fn();

  render(
    <AddTask
      isOpen={true}
      onAdd={jest.fn()}
      onClose={onCloseMock}
      projects={[{ id: 'general', name: 'General' }]}
    />
  );

  // Close cross exists in top right
  const closeCrossBtn = screen.getByRole('button', { name: /cancel and close/i });
  expect(closeCrossBtn).toBeInTheDocument();

  // No redundant bottom cancel button
  expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();

  // Clicking close cross triggers onClose
  fireEvent.click(closeCrossBtn);
  expect(onCloseMock).toHaveBeenCalledTimes(1);
});

test('pressing Enter in task input does not prematurely submit, while Cmd+Enter / Ctrl+Enter submits', () => {
  const { fireEvent } = require('@testing-library/react');
  const onAddMock = jest.fn();
  const onCloseMock = jest.fn();

  render(
    <AddTask
      isOpen={true}
      onAdd={onAddMock}
      onClose={onCloseMock}
      projects={[{ id: 'general', name: 'General' }]}
    />
  );

  const input = screen.getByPlaceholderText('What needs to be done?');
  fireEvent.change(input, { target: { value: 'Line 1\nLine 2' } });

  // Plain Enter should NOT trigger onAdd or onClose (allowing multi-line list input)
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  expect(onAddMock).not.toHaveBeenCalled();
  expect(onCloseMock).not.toHaveBeenCalled();

  // Cmd+Enter triggers submit
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', metaKey: true });
  expect(onAddMock).toHaveBeenCalledTimes(1);
  expect(onCloseMock).toHaveBeenCalledTimes(1);
});

test('adding new subtasks prepends them to the top of the list and completing a subtask moves it below uncompleted subtasks', () => {
  const { fireEvent } = require('@testing-library/react');

  render(
    <AddTask
      isOpen={true}
      onAdd={jest.fn()}
      onClose={jest.fn()}
      projects={[{ id: 'general', name: 'General' }]}
    />
  );

  // Open subtasks section
  const subtasksToggle = screen.getByRole('button', { name: /subtasks/i });
  fireEvent.click(subtasksToggle);

  const stepInput = screen.getByPlaceholderText('Add subtask step...');
  const addStepBtn = stepInput.parentElement.querySelector('button');

  // Add first step
  fireEvent.change(stepInput, { target: { value: 'Step 1' } });
  fireEvent.click(addStepBtn);

  // Add second step
  fireEvent.change(stepInput, { target: { value: 'Step 2' } });
  fireEvent.click(addStepBtn);

  // Add third step
  fireEvent.change(stepInput, { target: { value: 'Step 3' } });
  fireEvent.click(addStepBtn);

  // Steps should be in reverse order because new subtasks are added to the top: Step 3, Step 2, Step 1
  const renderedSteps = screen.getAllByPlaceholderText('Subtask step...');
  expect(renderedSteps.map(el => el.value)).toEqual(['Step 3', 'Step 2', 'Step 1']);

  // Complete Step 2 (middle item)
  const checkboxes = screen.getAllByRole('checkbox');
  // Checkboxes correspond to Step 3, Step 2, Step 1
  fireEvent.click(checkboxes[1]); // Step 2

  // After completion, Step 2 moves to just below uncompleted subtasks (Step 3, Step 1, Step 2)
  const updatedSteps = screen.getAllByPlaceholderText('Subtask step...');
  expect(updatedSteps.map(el => el.value)).toEqual(['Step 3', 'Step 1', 'Step 2']);
});

test('detects natural language quick add entities and populates task attributes on submit', () => {
  const { fireEvent } = require('@testing-library/react');
  const mockOnAdd = jest.fn();
  const sampleProjects = [
    { id: 'general', name: 'General', color: '#285a82' },
    { id: 'work', name: 'Work', color: '#b91c1c' }
  ];

  render(
    <AddTask
      isOpen={true}
      onAdd={mockOnAdd}
      onClose={jest.fn()}
      projects={sampleProjects}
      defaultProjectId="general"
    />
  );

  const input = screen.getByPlaceholderText('What needs to be done?');
  fireEvent.change(input, { target: { value: 'Submit quarterly VAT return tomorrow at 2pm #Work !1' } });

  // Quick Add preview chips should appear
  const preview = screen.getByTestId('quick-add-preview');
  const { within } = require('@testing-library/react');
  expect(within(preview).getByText('Quick Add:')).toBeInTheDocument();
  expect(within(preview).getByText('Must Do')).toBeInTheDocument();
  expect(within(preview).getByText('Work')).toBeInTheDocument();
  expect(within(preview).getByText('14:00')).toBeInTheDocument();

  // Submit the task
  const addBtn = screen.getByRole('button', { name: /add/i });
  fireEvent.click(addBtn);

  expect(mockOnAdd).toHaveBeenCalledWith(
    'Submit quarterly VAT return',
    1,
    'work',
    '',
    expect.objectContaining({
      scheduledTime: '14:00'
    })
  );
});

test('allows removing a quick add entity token by clicking its close cross', () => {
  const { fireEvent, within } = require('@testing-library/react');
  const sampleProjects = [
    { id: 'general', name: 'General', color: '#285a82' },
    { id: 'work', name: 'Work', color: '#b91c1c' }
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

  const input = screen.getByPlaceholderText('What needs to be done?');
  fireEvent.change(input, { target: { value: 'Book hotel room tomorrow !2' } });

  const preview = screen.getByTestId('quick-add-preview');
  expect(within(preview).getByText('Should Do')).toBeInTheDocument();

  // Remove the !2 token by clicking remove button
  const removePriorityBtn = within(preview).getByLabelText('Remove Should Do');
  fireEvent.click(removePriorityBtn);

  // Input should now have !2 stripped
  expect(input.value).toBe('Book hotel room tomorrow');
  expect(within(preview).queryByText('Should Do')).not.toBeInTheDocument();
});






