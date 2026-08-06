// This optional code is used to register a service worker.
// register() is not called by default.

import { APP_VERSION } from './utils/constants';

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
    if ('serviceWorker' in navigator) {
        const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
        if (publicUrl.origin !== window.location.origin) {
            return;
        }

        // Auto reload when a new service worker takes control
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });

        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

            if (isLocalhost) {
                checkValidServiceWorker(swUrl, config);
                navigator.serviceWorker.ready.then(() => {
                    console.log('This web app is being served cache-first by a service worker.');
                });
            } else {
                registerValidSW(swUrl, config);
            }
        });

        // Check for updates every time the app is launched/focused
        window.addEventListener('focus', () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.update();
                });
            }
        });
    }
}

function registerValidSW(swUrl, config) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            // Immediate check if a Service Worker is ALREADY waiting to activate
            if (registration.waiting && navigator.serviceWorker.controller) {
                console.log('Service Worker is already waiting to activate.');
                const event = new CustomEvent('swUpdateAvailable', { detail: registration });
                window.dispatchEvent(event);
            }

            // Force update check on registration
            registration.update().catch(err => console.log('SW update check info:', err));

            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker == null) {
                    return;
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // New content found! Notify UI so user can choose when to update
                            console.log('New content available, notify user to update...');

                            if (config && config.onUpdate) {
                                config.onUpdate(registration);
                            } else {
                                // Dispatch custom event so App.js can display update banner
                                const event = new CustomEvent('swUpdateAvailable', { detail: registration });
                                window.dispatchEvent(event);
                            }
                        } else {
                            if (config && config.onSuccess) {
                                config.onSuccess(registration);
                            }
                        }
                    }
                };
            };
        })
        .catch((error) => {
            console.error('Error during service worker registration:', error);
        });
}

function checkValidServiceWorker(swUrl, config) {
    fetch(swUrl, {
        headers: { 'Service-Worker': 'script' },
    })
        .then((response) => {
            const contentType = response.headers.get('content-type');
            if (
                response.status === 404 ||
                (contentType != null && contentType.indexOf('javascript') === -1)
            ) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                registerValidSW(swUrl, config);
            }
        })
        .catch(() => {
            console.log('No internet connection found. App is running in offline mode.');
        });
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}

export async function checkForUpdates(forceSimulate = false) {
    if (forceSimulate) {
        console.log('Simulating Service Worker update for testing...');
        const event = new CustomEvent('swUpdateAvailable', { detail: null });
        window.dispatchEvent(event);
        return { success: true, updated: true, simulated: true };
    }

    try {
        let remoteVersion = null;
        try {
            // Direct cache-busted request to version.json bypassing browser/SW cache
            const res = await fetch(`/version.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
            });
            if (res.ok) {
                const data = await res.json();
                remoteVersion = data.version;
            }
        } catch (e) {
            console.warn('Could not fetch version.json:', e);
        }

        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            if (registration) {
                await registration.update();

                if (registration.waiting && navigator.serviceWorker.controller) {
                    const event = new CustomEvent('swUpdateAvailable', { detail: registration });
                    window.dispatchEvent(event);
                    return { success: true, updated: true, registration, remoteVersion };
                }

                if (registration.installing) {
                    return new Promise((resolve) => {
                        registration.installing.onstatechange = function() {
                            if (this.state === 'installed' && navigator.serviceWorker.controller) {
                                const event = new CustomEvent('swUpdateAvailable', { detail: registration });
                                window.dispatchEvent(event);
                                resolve({ success: true, updated: true, registration, remoteVersion });
                            }
                        };
                        setTimeout(() => resolve({ success: true, updated: remoteVersion ? remoteVersion !== APP_VERSION : false, registration, remoteVersion }), 3000);
                    });
                }

                // If remote version exists and is newer than APP_VERSION, notify UI that an update is available!
                if (remoteVersion && remoteVersion !== APP_VERSION) {
                    const event = new CustomEvent('swUpdateAvailable', { detail: registration });
                    window.dispatchEvent(event);
                    return { success: true, updated: true, registration, remoteVersion };
                }

                return { success: true, updated: false, registration, remoteVersion };
            }
        }

        if (remoteVersion && remoteVersion !== APP_VERSION) {
            const event = new CustomEvent('swUpdateAvailable', { detail: null });
            window.dispatchEvent(event);
            return { success: true, updated: true, remoteVersion };
        }
    } catch (error) {
        console.error('Failed to check for service worker updates:', error);
        return { success: false, error };
    }
    return { success: false, error: 'No Service Worker' };
}
