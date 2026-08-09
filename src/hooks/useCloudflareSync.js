import { useState, useEffect, useCallback, useRef } from 'react';
import { encryptData, decryptData } from '../utils/crypto';
import { mergeSyncDatasets } from '../utils/syncUtils';

const DEFAULT_SYNC_ENDPOINT = 'https://123todo-sync-worker.darron-hartas.workers.dev/api/sync';

export const useCloudflareSync = (localData, importDataCallback) => {
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

    const performSync = useCallback(async (isInitial = false, isUserAction = false) => {
        if (!syncId || !deviceToken || !passphrase || isSyncingRef.current) return;

        isSyncingRef.current = true;
        if (isInitial || isUserAction) {
            setSyncStatus('syncing');
        }

        try {
            const endpoint = localStorage.getItem('123Todo_CF_Endpoint') || DEFAULT_SYNC_ENDPOINT;

            // 1. Download latest remote E2E encrypted payload from Cloudflare D1
            const pullRes = await fetch(`${endpoint}/pull`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ syncId, deviceToken })
            });

            const currentLocalData = localDataRef.current;
            let remoteData = null;

            if (pullRes.ok) {
                const pullJson = await pullRes.json();
                if (pullJson && pullJson.payload) {
                    try {
                        remoteData = await decryptData(pullJson.payload, passphrase);
                    } catch (decErr) {
                        console.error('Decryption failed for remote Cloudflare sync payload:', decErr);
                    }
                }
            }

            // 2. Perform 2-Way Merge between local dataset & remote dataset
            const mergedData = remoteData ? mergeSyncDatasets(currentLocalData, remoteData) : currentLocalData;

            if (remoteData) {
                importDataCallback(mergedData);
            }

            // 3. Re-encrypt merged dataset & Push back to Cloudflare D1
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

            if (pushRes.ok) {
                setSyncStatus('synced');
            } else {
                setSyncStatus('error');
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
    }, [syncId, deviceToken, passphrase, importDataCallback]);

    // Connect / Initialize a new Cloudflare Sync Account
    const connectSync = useCallback(async (userPassphrase, pairCode = null) => {
        const endpoint = localStorage.getItem('123Todo_CF_Endpoint') || DEFAULT_SYNC_ENDPOINT;
        setSyncStatus('syncing');
        try {
            if (pairCode) {
                // Connect via 6-digit pair code from another device
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
                // Generate a brand new Cloudflare Sync ID & Device Token
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

    // Auto-sync on local data change (debounced 300ms)
    useEffect(() => {
        if (isAuthed && passphrase) {
            const timeoutId = setTimeout(() => {
                performSync(false);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [localData.timestamp, isAuthed, passphrase, performSync]);

    // Smart Sync: Focus, Pointer, Mobile TouchEnd & 25s polling
    useEffect(() => {
        if (!isAuthed || !passphrase) return;

        let intervalId;
        const startPolling = () => {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    performSync(false);
                }
            }, 25000);
        };
        startPolling();

        const handleFocusOrVisible = () => {
            if (document.visibilityState === 'visible') {
                performSync(false);
                startPolling();
            }
        };

        let touchTimeoutId;
        const handleTouchEnd = () => {
            if (document.visibilityState === 'visible') {
                if (touchTimeoutId) clearTimeout(touchTimeoutId);
                touchTimeoutId = setTimeout(() => {
                    performSync(false);
                }, 50);
            }
        };

        window.addEventListener('focus', handleFocusOrVisible);
        window.addEventListener('online', () => { setIsOffline(false); performSync(false); });
        window.addEventListener('offline', () => { setIsOffline(true); setSyncStatus('offline'); });
        window.addEventListener('pointerenter', handleFocusOrVisible);
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        document.addEventListener('visibilitychange', handleFocusOrVisible);

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (touchTimeoutId) clearTimeout(touchTimeoutId);
            window.removeEventListener('focus', handleFocusOrVisible);
            window.removeEventListener('pointerenter', handleFocusOrVisible);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
            document.removeEventListener('visibilitychange', handleFocusOrVisible);
        };
    }, [isAuthed, passphrase, performSync]);

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
