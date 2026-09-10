import { render, screen, act } from '@testing-library/react';
import App from './App';

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

test('displays UpdatedModal when previous version in localStorage is older than APP_VERSION', () => {
  localStorage.setItem('123Todo_Last_Seen_Version', '3.6.12');

  render(<App />);

  expect(screen.getByText('123 To Do Updated!')).toBeInTheDocument();
  expect(screen.getByText('v3.6.12')).toBeInTheDocument();
  expect(screen.getAllByText('v3.6.20').length).toBeGreaterThanOrEqual(1);

  // Closing modal sets last seen version to current version
  const goBtn = screen.getByRole('button', { name: /Awesome, Let's Go!/i });
  act(() => {
    goBtn.click();
  });

  expect(localStorage.getItem('123Todo_Last_Seen_Version')).toBe('3.6.20');
});


