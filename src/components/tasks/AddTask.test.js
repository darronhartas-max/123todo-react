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

  expect(screen.getByText(/next day/i)).toBeInTheDocument();
  expect(screen.getByText(/next week/i)).toBeInTheDocument();
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

test('renders Voice Task button and activates listening indicator on click', () => {
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

  const voiceBtn = screen.getByRole('button', { name: /voice task/i });
  expect(voiceBtn).toBeInTheDocument();
  fireEvent.click(voiceBtn);

  // When listening, should display Listening... without MicOff confusion
  expect(screen.getByText(/listening\.\.\./i)).toBeInTheDocument();

  delete window.SpeechRecognition;
});


