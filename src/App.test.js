import { render, screen, act } from '@testing-library/react';
import App from './App';
import { APP_VERSION } from './utils/constants';

test('renders app logo', () => {
  render(<App />);
  const logoElement = screen.getByAltText(/123 ToDo logo/i);
  expect(logoElement).toBeInTheDocument();
});

test('preserves user font size and bold font settings from localStorage', () => {
  localStorage.setItem('123TodoFontSize', '16');
  localStorage.setItem('123TodoBoldFont', 'true');

  render(<App />);

  expect(document.documentElement.style.fontSize).toBe('16pt');
  expect(document.documentElement.classList.contains('bold-font-active')).toBe(true);
});

test('applies light mode background tone class to document root from localStorage', () => {
  localStorage.setItem('123TodoLightModeTone', 'muted');

  render(<App />);

  expect(document.documentElement.classList.contains('light-tone-muted')).toBe(true);
});

test('defaults to muted light mode tone for new users when no localStorage setting exists', () => {
  localStorage.removeItem('123TodoLightModeTone');

  render(<App />);

  expect(document.documentElement.classList.contains('light-tone-muted')).toBe(true);
});

test('defaults to 14pt font size on mobile when no localStorage setting exists', () => {
  localStorage.removeItem('123TodoFontSize');
  window.innerWidth = 500;

  render(<App />);

  expect(document.documentElement.style.fontSize).toBe('14pt');
});

test('defaults to 11pt font size on desktop when no localStorage setting exists', () => {
  localStorage.removeItem('123TodoFontSize');
  window.innerWidth = 1024;

  render(<App />);

  expect(document.documentElement.style.fontSize).toBe('11pt');
});

test('displays UpdatedModal with recent versions when clicking Latest Update Info in Settings', () => {
  render(<App />);

  // Open settings
  const settingsBtn = screen.getByTitle('Settings');
  act(() => {
    settingsBtn.click();
  });

  // Navigate to App & Updates tab
  const appTab = screen.getByRole('button', { name: /App & Updates/i });
  act(() => {
    appTab.click();
  });

  // Click Latest Update Info button
  const updateInfoBtn = screen.getByRole('button', { name: /Latest Update Info/i });
  act(() => {
    updateInfoBtn.click();
  });

  expect(screen.getByText('123 To Do Updated!')).toBeInTheDocument();
  expect(screen.getAllByText(new RegExp(`v${APP_VERSION}`)).length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText(/✨ What's New in v/i).length).toBeGreaterThanOrEqual(2);

  // Closing modal
  const goBtn = screen.getByRole('button', { name: /Awesome, Let's Go!/i });
  act(() => {
    goBtn.click();
  });

  expect(screen.queryByText('123 To Do Updated!')).not.toBeInTheDocument();
});

test('renders On Hold tasks with draggable attribute and drag support', () => {
  const tasks = [
    { id: 401, text: 'On Hold Task 1', priority: 4, projectId: 'general', completed: false, createdDate: '2026-09-16' },
    { id: 402, text: 'On Hold Task 2', priority: 4, projectId: 'general', completed: false, createdDate: '2026-09-16' }
  ];
  localStorage.setItem('123TodoTasks', JSON.stringify(tasks));

  render(<App />);

  // Click on "Show On Hold Tasks"
  const toggleBtn = screen.getByRole('button', { name: /Show On Hold Tasks \(2\)/i });
  act(() => {
    toggleBtn.click();
  });

  expect(screen.getByText('On Hold Task 1')).toBeInTheDocument();
  expect(screen.getByText('On Hold Task 2')).toBeInTheDocument();

  // Tasks should have draggable attributes
  const task1 = screen.getByText('On Hold Task 1').closest('li');
  expect(task1).toHaveAttribute('draggable', 'true');
});

test('activates commercial client branding via URL query and renders branded footer', () => {
  const originalLocation = window.location;
  delete window.location;
  window.location = new URL('https://www.123todo.com/?brand=pilot');

  render(<App />);

  expect(screen.getByText('Custom Edition prepared for Commercial Pilot')).toBeInTheDocument();
  expect(screen.getByText('Client Support')).toBeInTheDocument();
  expect(localStorage.getItem('123Todo_Tenant')).toBe('pilot');

  window.location = originalLocation;
});
