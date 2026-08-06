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

