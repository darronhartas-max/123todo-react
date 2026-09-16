import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { DEFAULT_TENANT_ID, TENANT_CONFIGS, getTenantConfig } from '../config/tenants';

const TenantContext = createContext(null);

/**
 * Resolves active tenant ID using priority order:
 * 1. URL search params (?brand=... or ?tenant=...)
 * 2. Subdomain of current hostname
 * 3. LocalStorage persistence
 * 4. Default fallback ('default')
 */
export const resolveTenantId = () => {
  if (typeof window === 'undefined') return DEFAULT_TENANT_ID;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const urlBrand = (searchParams.get('brand') || searchParams.get('tenant') || '').trim().toLowerCase();

    // 1. Explicit reset via URL (?brand=reset or ?brand=default)
    if (urlBrand === 'reset' || urlBrand === DEFAULT_TENANT_ID) {
      localStorage.removeItem(STORAGE_KEYS.TENANT);
      return DEFAULT_TENANT_ID;
    }

    // 2. Explicit tenant via URL if it matches a known configured tenant
    if (urlBrand && TENANT_CONFIGS[urlBrand]) {
      localStorage.setItem(STORAGE_KEYS.TENANT, urlBrand);
      return urlBrand;
    }

    // 3. Subdomain match (e.g., pilot.123todo.com)
    const hostname = window.location.hostname.toLowerCase();
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const subdomain = parts[0];
      if (TENANT_CONFIGS[subdomain]) {
        return subdomain;
      }
    }

    // 4. Saved tenant in localStorage
    const savedTenant = localStorage.getItem(STORAGE_KEYS.TENANT);
    if (savedTenant && TENANT_CONFIGS[savedTenant]) {
      return savedTenant;
    }
  } catch (err) {
    console.warn('Error resolving tenant ID:', err);
  }

  return DEFAULT_TENANT_ID;
};

export const TenantProvider = ({ children, initialTenantId }) => {
  const [tenantId, setTenantId] = useState(() => initialTenantId || resolveTenantId());

  // Deep-merged configuration based on active tenant
  const tenantConfig = useMemo(() => getTenantConfig(tenantId), [tenantId]);
  const isCustomTenant = tenantId !== DEFAULT_TENANT_ID;

  // Apply optional tenant theme overrides to CSS variables
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (tenantConfig.theme?.accentColor) {
      document.documentElement.style.setProperty('--accent-color', tenantConfig.theme.accentColor);
    }
    if (tenantConfig.theme?.accentBg) {
      document.documentElement.style.setProperty('--accent-bg', tenantConfig.theme.accentBg);
    }

    return () => {
      // Revert custom variables if tenant changes or component unmounts
      if (tenantConfig.theme?.accentColor) {
        document.documentElement.style.removeProperty('--accent-color');
      }
      if (tenantConfig.theme?.accentBg) {
        document.documentElement.style.removeProperty('--accent-bg');
      }
    };
  }, [tenantConfig]);

  const setTenant = useCallback((newTenantId) => {
    const cleanId = (newTenantId || '').trim().toLowerCase();
    if (cleanId === DEFAULT_TENANT_ID || cleanId === 'reset' || !cleanId) {
      localStorage.removeItem(STORAGE_KEYS.TENANT);
      setTenantId(DEFAULT_TENANT_ID);
    } else if (TENANT_CONFIGS[cleanId]) {
      localStorage.setItem(STORAGE_KEYS.TENANT, cleanId);
      setTenantId(cleanId);
    } else {
      console.warn(`Attempted to set unknown tenant: ${cleanId}`);
    }
  }, []);

  const resetTenant = useCallback(() => {
    setTenant(DEFAULT_TENANT_ID);
  }, [setTenant]);

  const contextValue = useMemo(() => ({
    tenantId,
    tenantConfig,
    isCustomTenant,
    setTenant,
    resetTenant
  }), [tenantId, tenantConfig, isCustomTenant, setTenant, resetTenant]);

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    // Graceful fallback for components rendered outside TenantProvider (e.g. isolated unit tests)
    const defaultConfig = getTenantConfig(DEFAULT_TENANT_ID);
    return {
      tenantId: DEFAULT_TENANT_ID,
      tenantConfig: defaultConfig,
      isCustomTenant: false,
      setTenant: () => {},
      resetTenant: () => {}
    };
  }
  return context;
};

export default TenantContext;
