import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, DEFAULT_SCREEN_SCALING_MODE } from '../utils/constants';

const getInitialScalingMode = () => {
  if (typeof window === 'undefined') return DEFAULT_SCREEN_SCALING_MODE;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SCREEN_SCALING_MODE);
    if (saved && ['auto', 'compact', 'standard'].includes(saved)) {
      return saved;
    }
  } catch (err) {
    console.error('Error reading screen scaling mode:', err);
  }
  return DEFAULT_SCREEN_SCALING_MODE;
};

const getViewportDimensions = () => {
  if (typeof window === 'undefined') {
    return {
      width: 1024,
      height: 768,
      dpr: 1
    };
  }
  return {
    width: window.innerWidth || document.documentElement.clientWidth || 360,
    height: window.innerHeight || document.documentElement.clientHeight || 640,
    dpr: window.devicePixelRatio || 1
  };
};

export const useDeviceResolution = () => {
  const [scalingMode, setScalingModeState] = useState(getInitialScalingMode);
  const [dimensions, setDimensions] = useState(getViewportDimensions);

  const updateDimensions = useCallback(() => {
    setDimensions(getViewportDimensions());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateDimensions();
      }, 80);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [updateDimensions]);

  const setScreenScalingMode = useCallback((newMode) => {
    if (!['auto', 'compact', 'standard'].includes(newMode)) return;
    setScalingModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEYS.SCREEN_SCALING_MODE, newMode);
    } catch (err) {
      console.error('Error saving screen scaling mode:', err);
    }
  }, []);

  const { width, height, dpr } = dimensions;
  const isShortScreen = height <= 640;
  const isMobile = width < 768;
  const isLowDpr = dpr < 2;
  const orientation = width >= height ? 'landscape' : 'portrait';

  // Determine effective tier based on mode & dimensions
  let tier = 'standard';
  if (scalingMode === 'compact') {
    tier = width <= 340 ? 'compact-ultra' : 'compact';
  } else if (scalingMode === 'standard') {
    tier = 'standard';
  } else {
    // Auto detection
    if (width <= 340) {
      tier = 'compact-ultra';
    } else if (width <= 380 || (width <= 480 && isShortScreen)) {
      tier = 'compact';
    } else {
      tier = 'standard';
    }
  }

  const density = isLowDpr ? 'low-dpr' : 'high-dpr';
  const isCompact = tier === 'compact' || tier === 'compact-ultra';
  const isUltraCompact = tier === 'compact-ultra';

  // Apply data-attributes to html root element
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-screen-tier', tier);
    root.setAttribute('data-screen-density', density);
    root.setAttribute('data-screen-scaling', scalingMode);
    root.setAttribute('data-orientation', orientation);
  }, [tier, density, scalingMode, orientation]);

  return {
    width,
    height,
    devicePixelRatio: dpr,
    tier,
    density,
    orientation,
    isCompact,
    isUltraCompact,
    isLowDpr,
    isShortScreen,
    isMobile,
    screenScalingMode: scalingMode,
    setScreenScalingMode
  };
};

export default useDeviceResolution;
