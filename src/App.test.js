import { render, screen } from '@testing-library/react';
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


