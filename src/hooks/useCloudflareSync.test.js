import { renderHook, act } from '@testing-library/react';
import {
    useCloudflareSync,
    getDailySyncCount,
    incrementDailySyncCount,
    getAdaptivePollingInterval,
    getAdaptiveDebounceDelay
} from './useCloudflareSync';

describe('useCloudflareSync hook', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    test('initializes with default unauthenticated state when no local storage tokens exist', () => {
        const dummyData = { tasks: [], timestamp: Date.now() };
        const dummyImport = jest.fn();
        const { result } = renderHook(() => useCloudflareSync(dummyData, dummyImport));

        expect(result.current.isAuthed).toBe(false);
        expect(result.current.syncStatus).toBe('offline');
        expect(result.current.syncId).toBe('');
    });

    test('initializes as authed if valid syncId and deviceToken exist in localStorage', () => {
        localStorage.setItem('123Todo_CF_SyncId', 'sync-123');
        localStorage.setItem('123Todo_CF_DeviceToken', 'token-abc');
        localStorage.setItem('123Todo_Sync_Passphrase', 'pass123');

        const dummyData = { tasks: [], timestamp: Date.now() };
        const dummyImport = jest.fn();
        const { result } = renderHook(() => useCloudflareSync(dummyData, dummyImport));

        expect(result.current.isAuthed).toBe(true);
        expect(result.current.syncId).toBe('sync-123');
        expect(result.current.passphrase).toBe('pass123');
    });

    test('connectSync initializes a new account successfully', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ syncId: 'new-sync-789', deviceToken: 'new-token-456' })
        });

        const dummyData = { tasks: [], timestamp: Date.now() };
        const dummyImport = jest.fn();
        const { result } = renderHook(() => useCloudflareSync(dummyData, dummyImport));

        let res;
        await act(async () => {
            res = await result.current.connectSync('MySecretPassphrase');
        });

        expect(res.success).toBe(true);
        expect(result.current.isAuthed).toBe(true);
        expect(result.current.syncId).toBe('new-sync-789');
        expect(localStorage.getItem('123Todo_CF_SyncId')).toBe('new-sync-789');
    });

    test('disconnectSync clears credentials and resets authed state', async () => {
        localStorage.setItem('123Todo_CF_SyncId', 'sync-123');
        localStorage.setItem('123Todo_CF_DeviceToken', 'token-abc');

        const dummyData = { tasks: [], timestamp: Date.now() };
        const dummyImport = jest.fn();
        const { result } = renderHook(() => useCloudflareSync(dummyData, dummyImport));

        act(() => {
            result.current.disconnectSync();
        });

        expect(result.current.isAuthed).toBe(false);
        expect(result.current.syncId).toBe('');
        expect(localStorage.getItem('123Todo_CF_SyncId')).toBeNull();
    });

    test('daily sync tracking and adaptive interval calculation', () => {
        expect(getDailySyncCount()).toBe(0);
        expect(getAdaptivePollingInterval()).toBe(30000); // 30 seconds
        expect(getAdaptiveDebounceDelay()).toBe(800);

        incrementDailySyncCount();
        expect(getDailySyncCount()).toBe(1);

        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`123Todo_CF_SyncCount_${today}`, '150');
        expect(getAdaptivePollingInterval()).toBe(60000); // 1 minute
        expect(getAdaptiveDebounceDelay()).toBe(1500);

        localStorage.setItem(`123Todo_CF_SyncCount_${today}`, '350');
        expect(getAdaptivePollingInterval()).toBe(120000); // 2 minutes
        expect(getAdaptiveDebounceDelay()).toBe(3000);

        // Instant Sync Mode (Chief Programmer Mode)
        localStorage.setItem('123Todo_ChiefProgrammer', 'true');
        expect(getAdaptivePollingInterval()).toBe(8000); // 8 seconds rate-limit safe polling
        expect(getAdaptiveDebounceDelay()).toBe(150);    // 150ms instant push delay
    });

    test('performSync handles HTTP 429 Too Many Requests gracefully without throwing', async () => {
        localStorage.setItem('123Todo_CF_SyncId', 'sync-123');
        localStorage.setItem('123Todo_CF_DeviceToken', 'token-abc');
        localStorage.setItem('123Todo_Sync_Passphrase', 'pass123');

        global.fetch.mockResolvedValueOnce({
            status: 429,
            ok: false,
            json: async () => ({ error: 'Rate limit exceeded' })
        });

        const dummyData = { tasks: [], timestamp: Date.now() };
        const dummyImport = jest.fn();
        const { result } = renderHook(() => useCloudflareSync(dummyData, dummyImport));

        await act(async () => {
            await result.current.performSync(false, false, false);
        });

        expect(result.current.syncStatus).toBe('synced');
    });
});

