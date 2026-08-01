import { useState, useEffect, useCallback, useRef } from 'react';
import { encryptData, decryptData } from '../utils/crypto';

// The Client ID from the Google Cloud Console
const CLIENT_ID = '831861694055-fco4oka90dc7npbglscjad0prqpeu2oh.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const SYNC_FILE_NAME = '123todo_sync.json';

export const useGoogleDriveSync = (localData, importDataCallback) => {
    const [isAuthed, setIsAuthed] = useState(false);
    const [syncStatus, setSyncStatus] = useState('offline'); // 'offline', 'syncing', 'synced', 'error'
    const [passphrase, setPassphrase] = useState(localStorage.getItem('123Todo_Sync_Passphrase') || '');
    const accessTokenRef = useRef(null);
    const tokenClientRef = useRef(null);
    const syncFileIdRef = useRef(null);

    // Save passphrase to local storage so we don't ask every time
    useEffect(() => {
        if (passphrase) {
            localStorage.setItem('123Todo_Sync_Passphrase', passphrase);
        } else {
            localStorage.removeItem('123Todo_Sync_Passphrase');
        }
    }, [passphrase]);

    const localDataRef = useRef(localData);
    useEffect(() => {
        localDataRef.current = localData;
    }, [localData]);

    const handleTokenExpired = useCallback(() => {
        console.warn('Google Access Token expired or invalid.');
        localStorage.removeItem('123Todo_Google_AccessToken');
        localStorage.removeItem('123Todo_Google_TokenExpiry');
        accessTokenRef.current = null;
        setIsAuthed(false);
        setSyncStatus('offline');
    }, []);

    const performSync = useCallback(async (isInitial = false) => {
        if (!accessTokenRef.current || !passphrase) return;

        setSyncStatus('syncing');
        try {
            const headers = { 'Authorization': `Bearer ${accessTokenRef.current}` };
            
            // 1. Check if the file exists on Drive, fetching metadata description as the JS timestamp
            const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${SYNC_FILE_NAME}'&fields=files(id, modifiedTime, description)`, { headers });
            if (searchRes.status === 401) {
                handleTokenExpired();
                return;
            }
            const searchData = await searchRes.json();
            
            const remoteFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;
            let remoteTimestamp = 0;
            if (remoteFile) {
                syncFileIdRef.current = remoteFile.id;
                // Use description field (exact local timestamp), falling back to modifiedTime if not set
                remoteTimestamp = parseInt(remoteFile.description, 10) || new Date(remoteFile.modifiedTime).getTime();
            }

            const currentLocalData = localDataRef.current;
            const localTimestamp = currentLocalData.timestamp || 0;

            const uploadSyncFile = async (base64Payload, fileId = null) => {
                const metadata = { 
                    name: SYNC_FILE_NAME,
                    description: localTimestamp.toString() // Store exact local JS timestamp in metadata
                };
                if (!fileId) {
                    metadata.parents = ['appDataFolder'];
                }
                const fileContent = JSON.stringify({ payload: base64Payload });
                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', new Blob([fileContent], { type: 'application/json' }));

                let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime,description';
                let method = 'POST';
                if (fileId) {
                    url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,modifiedTime,description`;
                    method = 'PATCH';
                }

                const res = await fetch(url, { method, headers, body: form });
                if (res.status === 401) {
                    handleTokenExpired();
                    return;
                }
                if (!res.ok) throw new Error('Upload failed: ' + await res.text());
                return await res.json();
            };

            const downloadSyncFile = async (fileId) => {
                const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers });
                if (res.status === 401) {
                    handleTokenExpired();
                    return;
                }
                if (!res.ok) throw new Error('Download failed');
                return await res.json();
            };

            if (isInitial && remoteFile) {
                 const fileData = await downloadSyncFile(remoteFile.id);
                 if (!fileData) return; // 401 handled
                 if (fileData && fileData.payload) {
                     const decrypted = await decryptData(fileData.payload, passphrase);
                     if (decrypted.timestamp > localTimestamp || localTimestamp === 0) {
                         importDataCallback(decrypted);
                     } else if (localTimestamp > decrypted.timestamp) {
                         const encrypted = await encryptData(currentLocalData, passphrase);
                         await uploadSyncFile(encrypted, remoteFile.id);
                     }
                 }
            } else if (localTimestamp > remoteTimestamp) {
                // PUSH
                const encrypted = await encryptData(currentLocalData, passphrase);
                const updatedFile = await uploadSyncFile(encrypted, syncFileIdRef.current);
                if (updatedFile) {
                    syncFileIdRef.current = updatedFile.id;
                }
            } else if (remoteTimestamp > localTimestamp && remoteFile) {
                // PULL
                const fileData = await downloadSyncFile(remoteFile.id);
                if (!fileData) return; // 401 handled
                if (fileData && fileData.payload) {
                    const decrypted = await decryptData(fileData.payload, passphrase);
                    importDataCallback(decrypted);
                }
            }
            
            setSyncStatus('synced');
        } catch (error) {
            console.error('Sync failed:', error);
            setSyncStatus('error');
        }
    }, [passphrase, importDataCallback, handleTokenExpired]);

    // Initialize Google Identity Services
    useEffect(() => {
        const initGoogleClient = () => {
            if (window.google && window.google.accounts) {
                // First, check if we have a valid stored token. If so, use it immediately!
                const storedToken = localStorage.getItem('123Todo_Google_AccessToken');
                const storedExpiry = localStorage.getItem('123Todo_Google_TokenExpiry');
                let hasValidToken = false;

                if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry, 10)) {
                    accessTokenRef.current = storedToken;
                    setIsAuthed(true);
                    hasValidToken = true;
                    // Trigger an initial pull/sync
                    performSync(true);
                }

                tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    callback: (tokenResponse) => {
                        if (tokenResponse.error !== undefined) {
                            console.error('Google Auth Error:', tokenResponse);
                            setIsAuthed(false);
                            localStorage.removeItem('123Todo_Google_AccessToken');
                            localStorage.removeItem('123Todo_Google_TokenExpiry');
                            if (tokenResponse.type === 'tokenFailed') {
                                localStorage.removeItem('123Todo_Google_Authed');
                            }
                            return;
                        }
                        accessTokenRef.current = tokenResponse.access_token;
                        setIsAuthed(true);
                        localStorage.setItem('123Todo_Google_Authed', 'true');
                        // Store the token and expiry (expires_in is in seconds, e.g. 3600)
                        const expiryTime = Date.now() + (parseInt(tokenResponse.expires_in, 10) || 3600) * 1000;
                        localStorage.setItem('123Todo_Google_AccessToken', tokenResponse.access_token);
                        localStorage.setItem('123Todo_Google_TokenExpiry', expiryTime.toString());
                        // Trigger an initial pull/sync
                        performSync(true);
                    },
                });

                // Attempt silent automatic token refresh if user previously signed in AND token is expired
                if (!hasValidToken && localStorage.getItem('123Todo_Google_Authed') === 'true') {
                    try {
                        // prompt: 'none' requests token silently in background without displaying any popup/UI
                        tokenClientRef.current.requestAccessToken({ prompt: 'none' });
                    } catch (err) {
                        console.warn('Silent token refresh failed:', err);
                        setIsAuthed(false);
                        setSyncStatus('offline');
                    }
                } else if (!hasValidToken) {
                    setIsAuthed(false);
                    setSyncStatus('offline');
                }

            } else {
                // If script hasn't loaded yet, try again in 500ms
                setTimeout(initGoogleClient, 500);
            }
        };
        initGoogleClient();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [performSync]);

    const signIn = useCallback(() => {
        if (tokenClientRef.current) {
            tokenClientRef.current.requestAccessToken();
        }
    }, []);

    const signOut = useCallback(() => {
        if (accessTokenRef.current && window.google) {
            window.google.accounts.oauth2.revoke(accessTokenRef.current, () => {
                console.log('Access token revoked');
            });
        }
        accessTokenRef.current = null;
        setIsAuthed(false);
        setSyncStatus('offline');
        setPassphrase('');
        localStorage.removeItem('123Todo_Google_Authed');
        localStorage.removeItem('123Todo_Google_AccessToken');
        localStorage.removeItem('123Todo_Google_TokenExpiry');
        syncFileIdRef.current = null;
    }, []);

    // Setup an effect to auto-sync when local data changes (with debounce)
    useEffect(() => {
        if (isAuthed && passphrase) {
            const timeoutId = setTimeout(() => {
                performSync(false);
            }, 3000); // 3 second debounce
            return () => clearTimeout(timeoutId);
        }
    }, [localData.timestamp, isAuthed, passphrase, performSync]);

    // Smart Sync: Focus Listener & Gentle Polling
    useEffect(() => {
        if (!isAuthed || !passphrase) return;

        let intervalId;

        const startPolling = () => {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
                // Only poll if the tab is visible
                if (document.visibilityState === 'visible') {
                    performSync(false);
                }
            }, 60000); // 60 seconds
        };
        startPolling();

        const handleFocusOrVisible = () => {
            if (document.visibilityState === 'visible') {
                performSync(false);
                startPolling(); // Reset timer
            }
        };

        window.addEventListener('focus', handleFocusOrVisible);
        document.addEventListener('visibilitychange', handleFocusOrVisible);

        return () => {
            if (intervalId) clearInterval(intervalId);
            window.removeEventListener('focus', handleFocusOrVisible);
            document.removeEventListener('visibilitychange', handleFocusOrVisible);
        };
    }, [isAuthed, passphrase, performSync]);

    return {
        isAuthed,
        syncStatus,
        passphrase,
        setPassphrase,
        signIn,
        signOut,
        performSync
    };
};
