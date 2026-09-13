import { renderHook, act } from '@testing-library/react';
import { useDeviceResolution } from './useDeviceResolution';
import { STORAGE_KEYS } from '../utils/constants';

describe('useDeviceResolution', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  const originalDpr = window.devicePixelRatio;

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    document.documentElement.removeAttribute('data-screen-tier');
    document.documentElement.removeAttribute('data-screen-density');
    document.documentElement.removeAttribute('data-screen-scaling');
    document.documentElement.removeAttribute('data-orientation');
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: originalInnerHeight });
    Object.defineProperty(window, 'devicePixelRatio', { writable: true, configurable: true, value: originalDpr });
  });

  const setViewport = (width, height, dpr = 2) => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
    Object.defineProperty(window, 'devicePixelRatio', { writable: true, configurable: true, value: dpr });
  };

  test('auto detects standard viewport for modern large phone or desktop', () => {
    setViewport(414, 896, 3);
    const { result } = renderHook(() => useDeviceResolution());

    expect(result.current.tier).toBe('standard');
    expect(result.current.isCompact).toBe(false);
    expect(result.current.density).toBe('high-dpr');
    expect(document.documentElement.getAttribute('data-screen-tier')).toBe('standard');
    expect(document.documentElement.getAttribute('data-screen-density')).toBe('high-dpr');
  });

  test('auto detects compact tier for smaller phone (e.g. 375px width)', () => {
    setViewport(375, 667, 2);
    const { result } = renderHook(() => useDeviceResolution());

    expect(result.current.tier).toBe('compact');
    expect(result.current.isCompact).toBe(true);
    expect(result.current.isUltraCompact).toBe(false);
    expect(document.documentElement.getAttribute('data-screen-tier')).toBe('compact');
  });

  test('auto detects compact-ultra tier for very narrow screens (<= 340px width)', () => {
    setViewport(320, 568, 2);
    const { result } = renderHook(() => useDeviceResolution());

    expect(result.current.tier).toBe('compact-ultra');
    expect(result.current.isCompact).toBe(true);
    expect(result.current.isUltraCompact).toBe(true);
    expect(result.current.isShortScreen).toBe(true);
    expect(document.documentElement.getAttribute('data-screen-tier')).toBe('compact-ultra');
  });

  test('detects low DPR displays (< 2.0 DPR)', () => {
    setViewport(360, 640, 1);
    const { result } = renderHook(() => useDeviceResolution());

    expect(result.current.density).toBe('low-dpr');
    expect(result.current.isLowDpr).toBe(true);
    expect(document.documentElement.getAttribute('data-screen-density')).toBe('low-dpr');
  });

  test('allows manual override to compact mode regardless of viewport width', () => {
    setViewport(1024, 768, 2);
    const { result } = renderHook(() => useDeviceResolution());

    expect(result.current.tier).toBe('standard');

    act(() => {
      result.current.setScreenScalingMode('compact');
    });

    expect(result.current.screenScalingMode).toBe('compact');
    expect(result.current.tier).toBe('compact');
    expect(result.current.isCompact).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.SCREEN_SCALING_MODE)).toBe('compact');
    expect(document.documentElement.getAttribute('data-screen-scaling')).toBe('compact');
  });

  test('allows manual override to standard mode even on narrow viewports', () => {
    setViewport(320, 568, 2);
    const { result } = renderHook(() => useDeviceResolution());

    expect(result.current.tier).toBe('compact-ultra');

    act(() => {
      result.current.setScreenScalingMode('standard');
    });

    expect(result.current.screenScalingMode).toBe('standard');
    expect(result.current.tier).toBe('standard');
    expect(result.current.isCompact).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.SCREEN_SCALING_MODE)).toBe('standard');
    expect(document.documentElement.getAttribute('data-screen-tier')).toBe('standard');
  });

  test('reacts to window resize events after debounce', () => {
    setViewport(800, 600, 2);
    const { result } = renderHook(() => useDeviceResolution());

    expect(result.current.isCompact).toBe(false);

    act(() => {
      setViewport(360, 640, 2);
      window.dispatchEvent(new Event('resize'));
      jest.advanceTimersByTime(100);
    });

    expect(result.current.isCompact).toBe(true);
    expect(result.current.tier).toBe('compact');
  });
});
