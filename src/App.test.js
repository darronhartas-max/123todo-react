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


