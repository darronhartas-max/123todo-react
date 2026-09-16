import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { TenantProvider, useTenant, resolveTenantId } from './TenantContext';
import { STORAGE_KEYS } from '../utils/constants';
import { DEFAULT_TENANT_ID } from '../config/tenants';

const TestConsumer = () => {
  const { tenantId, tenantConfig, isCustomTenant, setTenant, resetTenant } = useTenant();
  return (
    <div>
      <span data-testid="tenant-id">{tenantId}</span>
      <span data-testid="brand-name">{tenantConfig.brandName}</span>
      <span data-testid="is-custom">{isCustomTenant ? 'true' : 'false'}</span>
      <button onClick={() => setTenant('pilot')}>Set Pilot</button>
      <button onClick={resetTenant}>Reset Tenant</button>
    </div>
  );
};

describe('TenantContext & Resolver', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    delete window.location;
    window.location = new URL('https://www.123todo.com');
  });

  afterEach(() => {
    window.location = originalLocation;
    localStorage.clear();
  });

  test('resolves default tenant when no query or storage is present', () => {
    expect(resolveTenantId()).toBe(DEFAULT_TENANT_ID);
  });

  test('resolves and persists tenant from URL query param ?brand=pilot', () => {
    window.location = new URL('https://www.123todo.com/?brand=pilot');
    const resolved = resolveTenantId();
    expect(resolved).toBe('pilot');
    expect(localStorage.getItem(STORAGE_KEYS.TENANT)).toBe('pilot');
  });

  test('resolves and persists tenant from URL query param ?tenant=pilot', () => {
    window.location = new URL('https://www.123todo.com/?tenant=pilot');
    const resolved = resolveTenantId();
    expect(resolved).toBe('pilot');
    expect(localStorage.getItem(STORAGE_KEYS.TENANT)).toBe('pilot');
  });

  test('clears stored tenant and returns default when ?brand=reset is passed', () => {
    localStorage.setItem(STORAGE_KEYS.TENANT, 'pilot');
    window.location = new URL('https://www.123todo.com/?brand=reset');
    const resolved = resolveTenantId();
    expect(resolved).toBe(DEFAULT_TENANT_ID);
    expect(localStorage.getItem(STORAGE_KEYS.TENANT)).toBeNull();
  });

  test('resolves tenant from localStorage if valid', () => {
    localStorage.setItem(STORAGE_KEYS.TENANT, 'pilot');
    expect(resolveTenantId()).toBe('pilot');
  });

  test('provides tenant config to consumers via TenantProvider', () => {
    render(
      <TenantProvider initialTenantId="pilot">
        <TestConsumer />
      </TenantProvider>
    );

    expect(screen.getByTestId('tenant-id')).toHaveTextContent('pilot');
    expect(screen.getByTestId('brand-name')).toHaveTextContent('Commercial Pilot');
    expect(screen.getByTestId('is-custom')).toHaveTextContent('true');
  });

  test('allows dynamically switching and resetting tenants', () => {
    render(
      <TenantProvider initialTenantId="default">
        <TestConsumer />
      </TenantProvider>
    );

    expect(screen.getByTestId('tenant-id')).toHaveTextContent('default');
    expect(screen.getByTestId('is-custom')).toHaveTextContent('false');

    act(() => {
      screen.getByText('Set Pilot').click();
    });

    expect(screen.getByTestId('tenant-id')).toHaveTextContent('pilot');
    expect(localStorage.getItem(STORAGE_KEYS.TENANT)).toBe('pilot');

    act(() => {
      screen.getByText('Reset Tenant').click();
    });

    expect(screen.getByTestId('tenant-id')).toHaveTextContent('default');
    expect(localStorage.getItem(STORAGE_KEYS.TENANT)).toBeNull();
  });

  test('gracefully returns default tenant when useTenant is called outside provider', () => {
    render(<TestConsumer />);
    expect(screen.getByTestId('tenant-id')).toHaveTextContent(DEFAULT_TENANT_ID);
    expect(screen.getByTestId('brand-name')).toHaveTextContent('123 To Do');
    expect(screen.getByTestId('is-custom')).toHaveTextContent('false');
  });
});
