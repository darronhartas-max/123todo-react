import { useState, useEffect, useCallback, useRef } from 'react';
import { encryptData, decryptData } from '../utils/crypto';
import { mergeSyncDatasets } from '../utils/syncUtils';

const DEFAULT_SYNC_ENDPOINT = 'https://123todo-sync-worker.darron-hartas.workers.dev/api/sync';

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

export function getDailySyncCount() {
    try {
        const today = getTodayKey();
        return parseInt(localStorage.getItem(`123Todo_CF_SyncCount_${today}`) || '0', 10);
    } catch {
        return 0;
    }
}

export function incrementDailySyncCount() {
    try {
        const today = getTodayKey();
        const key = `123Todo_CF_SyncCount_${today}`;
        const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
        localStorage.setItem(key, String(count));
        return count;
    } catch {
        return 0;
    }
}

export function isInstantSyncMode() {
    try {
        const isChief = localStorage.getItem('123Todo_ChiefProgrammer') === 'true';
        if (isChief) return true;

        if (typeof window !== 'undefined' && window.location) {
            const search = window.location.search || '';
            if (search.includes('chief=true') || search.includes('programmer=true')) {
                localStorage.setItem('123Todo_ChiefProgrammer', 'true');
                localStorage.setItem('123Todo_Sync_Speed', 'instant');
                return true;
            }
        }
    } catch {
        return false;
    }
    return false;
}

export function getAdaptivePollingInterval() {
    if (isInstantSyncMode()) return 8000; // 8-second rate-limit safe live polling for Instant Mode
    const count = getDailySyncCount();
    if (count > 300) return 120000; // 2 minutes for heavy usage days
    if (count > 100) return 60000;  // 1 minute for moderate usage days
    return 30000;                   // 30 seconds default background polling
}

export function getAdaptiveDebounceDelay() {
    if (isInstantSyncMode()) return 150; // 150ms instant push delay for local edits
    const count = getDailySyncCount();
    if (count > 300) return 3000;  // 3s debounce for very heavy editing days
    if (count > 100) return 1500;  // 1.5s debounce for moderate days
    return 800;                    // 800ms default debounce
}

export const useCloudflareSync = (localData, importDataCallback, enabled = true) => {
    const [isAuthed, setIsAuthed] = useState(() => {
        return Boolean(localStorage.getItem('123Todo_CF_SyncId') && localStorage.getItem('123Todo_CF_DeviceToken'));
    });
    const [syncStatus, setSyncStatus] = useState('offline'); // 'offline', 'syncing', 'synced', 'error'
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [passphrase, setPassphrase] = useState(localStorage.getItem('123Todo_Sync_Passphrase') || '');
    const [syncId, setSyncId] = useState(localStorage.getItem('123Todo_CF_SyncId') || '');
    const [deviceToken, setDeviceToken] = useState(localStorage.getItem('123Todo_CF_DeviceToken') || '');

    const isSyncingRef = useRef(false);
    const localDataRef = useRef(localData);
    const lastRemoteTimestampRef = useRef(0);
    const lastLocalSyncedTimestampRef = useRef(localData?.timestamp || 0);
    const lastSyncTimeRef = useRef(0);
    const backoffUntilRef = useRef(0);

    useEffect(() => {
        localDataRef.current = localData;
    }, [localData]);

    useEffect(() => {
        if (passphrase) {
            localStorage.setItem('123Todo_Sync_Passphrase', passphrase);
        } else {
            localStorage.removeItem('123Todo_Sync_Passphrase');
        }
    }, [passphrase]);

    useEffect(() => {
        if (syncId && deviceToken) {
            localStorage.setItem('123Todo_CF_SyncId', syncId);
            localStorage.setItem('123Todo_CF_DeviceToken', deviceToken);
            setIsAuthed(true);
        } else {
            localStorage.removeItem('123Todo_CF_SyncId');
            localStorage.removeItem('123Todo_CF_DeviceToken');
            setIsAuthed(false);
        }
    }, [syncId, deviceToken]);

    const performSync = useCallback(async (isInitial = false, isUserAction = false, isLocalDataChange = false) => {
        if (!enabled || !syncId || !deviceToken || !passphrase || isSyncingRef.current) return;

        // Check if under temporary rate-limit backoff (unless user action or local edit)
        if (Date.now() < backoffUntilRef.current && !isUserAction && !isLocalDataChange) {
            return;
        }

        isSyncingRef.current = true;
        if (isInitial || isUserAction) {
            setSyncStatus('syncing');
        }

        try {
            const endpoint = localStorage.getItem('123Todo_CF_Endpoint') || DEFAULT_SYNC_ENDPOINT;

            // 1. Pull with conditional timestamp checking
            const pullRes = await fetch(`${endpoint}/pull`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    syncId,
                    deviceToken,
                    sinceTimestamp: lastRemoteTimestampRef.current || undefined
                })
            });

            if (pullRes.status === 429) {
                // Rate limited: back off for 15 seconds
                backoffUntilRef.current = Date.now() + 15000;
                setSyncStatus('synced');
                isSyncingRef.current = false;
                return;
            }

            incrementDailySyncCount();
            lastSyncTimeRef.current = Date.now();

            const currentLocalData = localDataRef.current;
            let remoteData = null;
            let shouldPush = isLocalDataChange;

            if (pullRes.ok) {
                const pullJson = await pullRes.json();

                if (pullJson.notModified) {
                    // Remote data has not changed
                    lastRemoteTimestampRef.current = pullJson.timestamp || lastRemoteTimestampRef.current;
                } else if (pullJson.payload) {
                    // New remote payload received
                    try {
                        remoteData = await decryptData(pullJson.payload, passphrase);
                        lastRemoteTimestampRef.current = pullJson.timestamp || Date.now();
                    } catch (decErr) {
                        console.error('Decryption failed for remote Cloudflare sync payload:', decErr);
                    }
                }
            }

            // 2. Perform 2-Way Merge if remote has newer data
            let mergedData = currentLocalData;
            if (remoteData) {
                mergedData = mergeSyncDatasets(currentLocalData, remoteData);
                importDataCallback(mergedData);
                shouldPush = true;
            } else if (currentLocalData?.timestamp && currentLocalData.timestamp > lastLocalSyncedTimestampRef.current) {
                shouldPush = true;
            }

            // 3. Push to Cloudflare only if data has actually changed
            if (shouldPush) {
                const encryptedPayload = await encryptData(mergedData, passphrase);
                const pushRes = await fetch(`${endpoint}/push`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        syncId,
                        deviceToken,
                        payload: encryptedPayload,
                        timestamp: mergedData.timestamp || Date.now()
                    })
                });

                if (pushRes.status === 429) {
                    backoffUntilRef.current = Date.now() + 15000;
                    setSyncStatus('synced');
                    return;
                }

                if (pushRes.ok) {
                    const pushJson = await pushRes.json().catch(() => ({}));
                    if (pushJson && pushJson.timestamp) {
                        lastRemoteTimestampRef.current = pushJson.timestamp;
                    }
                    incrementDailySyncCount();
                    lastLocalSyncedTimestampRef.current = mergedData.timestamp || Date.now();
                    setSyncStatus('synced');
                } else {
                    setSyncStatus('error');
                }
            } else {
                setSyncStatus('synced');
            }
        } catch (err) {
            console.error('Cloudflare sync failed:', err);
            if (!navigator.onLine) {
                setIsOffline(true);
                setSyncStatus('offline');
            } else {
                setSyncStatus('error');
            }
        } finally {
            isSyncingRef.current = false;
        }
    }, [enabled, syncId, deviceToken, passphrase, importDataCallback]);

    // Connect / Initialize a new Cloudflare Sync Account
    const connectSync = useCallback(async (userPassphrase, pairCode = null) => {
        const endpoint = localStorage.getItem('123Todo_CF_Endpoint') || DEFAULT_SYNC_ENDPOINT;
        setSyncStatus('syncing');
        try {
            if (pairCode) {
                const res = await fetch(`${endpoint}/pair-connect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pairCode: pairCode.trim() })
                });
                if (!res.ok) throw new Error('Invalid or expired 6-digit pairing code');
                const data = await res.json();
                setSyncId(data.syncId);
                setDeviceToken(data.deviceToken);
                setPassphrase(userPassphrase);
                return { success: true };
            } else {
                const res = await fetch(`${endpoint}/init`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!res.ok) throw new Error('Failed to initialize Cloudflare Sync account');
                const data = await res.json();
                setSyncId(data.syncId);
                setDeviceToken(data.deviceToken);
                setPassphrase(userPassphrase);
                return { success: true };
            }
        } catch (err) {
            console.error('Cloudflare Sync Connect Error:', err);
            setSyncStatus('error');
            return { success: false, error: err.message };
        }
    }, []);

    // Generate temporary 6-digit pairing code for linking second device
    const generatePairCode = useCallback(async () => {
        if (!syncId || !deviceToken) return null;
        const endpoint = localStorage.getItem('123Todo_CF_Endpoint') || DEFAULT_SYNC_ENDPOINT;
        try {
            const res = await fetch(`${endpoint}/pair-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ syncId, deviceToken })
            });
            if (!res.ok) throw new Error('Failed to generate pairing code');
            const data = await res.json();
            return data.pairCode;
        } catch (err) {
            console.error('Failed to generate pairing code:', err);
            return null;
        }
    }, [syncId, deviceToken]);

    const disconnectSync = useCallback(() => {
        setSyncId('');
        setDeviceToken('');
        setPassphrase('');
        setIsAuthed(false);
        setSyncStatus('offline');
        localStorage.removeItem('123Todo_CF_SyncId');
        localStorage.removeItem('123Todo_CF_DeviceToken');
    }, []);

    // Initial pull on mount / when enabled and authed
    useEffect(() => {
        if (enabled && isAuthed && passphrase) {
            performSync(true, false, false);
        }
    }, [enabled, isAuthed, passphrase, performSync]);

    // Auto-sync on local data change with adaptive debounce
    useEffect(() => {
        if (enabled && isAuthed && passphrase) {
            const debounceMs = getAdaptiveDebounceDelay();
            const timeoutId = setTimeout(() => {
                performSync(false, false, true);
            }, debounceMs);
            return () => clearTimeout(timeoutId);
        }
    }, [localData.timestamp, isAuthed, passphrase, performSync, enabled]);

    // Smart Adaptive Polling & Tab Lifecycle Listeners
    useEffect(() => {
        if (!enabled || !isAuthed || !passphrase) return;

        let timeoutId;
        let isDisposed = false;

        const scheduleNextPoll = () => {
            if (isDisposed) return;
            const interval = getAdaptivePollingInterval();
            timeoutId = setTimeout(() => {
                if (document.visibilityState === 'visible' && !isDisposed) {
                    performSync(false, false, false);
                }
                scheduleNextPoll();
            }, interval);
        };

        scheduleNextPoll();

        const handleFocusOrVisible = () => {
            if (document.visibilityState === 'visible') {
                const isInstant = isInstantSyncMode();
                const minFocusInterval = isInstant ? 0 : 20000;
                if (Date.now() - lastSyncTimeRef.current > minFocusInterval) {
                    performSync(false, false, false);
                }
                if (timeoutId) clearTimeout(timeoutId);
                scheduleNextPoll();
            }
        };

        const handleOnline = () => {
            setIsOffline(false);
            performSync(false, false, false);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setSyncStatus('offline');
        };

        window.addEventListener('focus', handleFocusOrVisible);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('pointerenter', handleFocusOrVisible);
        document.addEventListener('visibilitychange', handleFocusOrVisible);

        return () => {
            isDisposed = true;
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener('focus', handleFocusOrVisible);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('pointerenter', handleFocusOrVisible);
            document.removeEventListener('visibilitychange', handleFocusOrVisible);
        };
    }, [enabled, isAuthed, passphrase, performSync]);

    return {
        isAuthed,
        syncStatus,
        isOffline,
        passphrase,
        setPassphrase,
        syncId,
        connectSync,
        disconnectSync,
        generatePairCode,
        performSync
    };
};

