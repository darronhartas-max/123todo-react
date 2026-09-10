import { renderHook, act } from '@testing-library/react';
import { useAppSystem } from './useAppSystem';
import { STORAGE_KEYS } from '../utils/constants';

describe('useAppSystem install reminders', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('records dismiss and snoozes install reminders after dismissal', () => {
    // User with 3 tasks and 1 completed task
    const { result } = renderHook(() => useAppSystem(1, 3, false));

    // Initially can trigger prompt or modal
    expect(result.current.isStandalone).toBe(false);

    // Dismiss install prompt
    act(() => {
      result.current.dismissInstallPrompt();
    });

    expect(result.current.showInstallPrompt).toBe(false);
    expect(result.current.showInstallModal).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.INSTALL_DISMISS_COUNT)).toBe('1');
    expect(localStorage.getItem(STORAGE_KEYS.LAST_INSTALL_DISMISSED)).toBeTruthy();
    expect(localStorage.getItem(STORAGE_KEYS.INSTALL_ACTIONS_COUNT)).toBe('0');
  });

  test('does not show install reminder immediately within 24h snooze window', () => {
    localStorage.setItem(STORAGE_KEYS.INSTALL_DISMISS_COUNT, '1');
    localStorage.setItem(STORAGE_KEYS.LAST_INSTALL_DISMISSED, Date.now().toString());
    localStorage.setItem(STORAGE_KEYS.INSTALL_ACTIONS_COUNT, '0');

    const { result } = renderHook(() => useAppSystem(1, 3, false));

    act(() => {
      result.current.recordAppUsageAction('complete');
      jest.advanceTimersByTime(2000);
    });

    // Should NOT trigger install modal because within 24h snooze window
    expect(result.current.showInstallModal).toBe(false);
  });

  test('shows install reminder modal when user is actively using the app after snooze has elapsed', () => {
    // Dismissed 25 hours ago, 1 previous dismissal
    const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.INSTALL_DISMISS_COUNT, '1');
    localStorage.setItem(STORAGE_KEYS.LAST_INSTALL_DISMISSED, twentyFiveHoursAgo.toString());
    localStorage.setItem(STORAGE_KEYS.INSTALL_ACTIONS_COUNT, '1'); // 1 prior action
    localStorage.setItem(STORAGE_KEYS.WELCOME_SEEN, 'true');

    const { result } = renderHook(() => useAppSystem(1, 3, false));

    act(() => {
      // User completes another task (2nd action since dismiss)
      result.current.recordAppUsageAction('complete');
      jest.advanceTimersByTime(2000);
    });

    // Now eligible and should trigger modal!
    expect(result.current.showInstallModal).toBe(true);
  });

  test('stops showing install reminder modals after 4 declines', () => {
    const fortyEightHoursAgo = Date.now() - (48 * 60 * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.INSTALL_DISMISS_COUNT, '4');
    localStorage.setItem(STORAGE_KEYS.LAST_INSTALL_DISMISSED, fortyEightHoursAgo.toString());
    localStorage.setItem(STORAGE_KEYS.INSTALL_ACTIONS_COUNT, '10');

    const { result } = renderHook(() => useAppSystem(2, 5, false));

    act(() => {
      result.current.recordAppUsageAction('complete');
      jest.advanceTimersByTime(2000);
    });

    // Capped at 4 declines
    expect(result.current.showInstallModal).toBe(false);
  });
});
