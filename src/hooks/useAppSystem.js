import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { checkForUpdates as triggerSWUpdateCheck } from '../serviceWorkerRegistration';

export const useAppSystem = (archivedCount = 0, tasksCount = 0, isSyncAuthed = false) => {
    const [showWelcome, setShowWelcome] = useState(false);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
    const [isStandalone, setIsStandalone] = useState(() => {
        if (typeof window === 'undefined') return false;
        return Boolean(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
    });
    const [showBackupReminder, setShowBackupReminder] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [achievedMilestones, setAchievedMilestones] = useState([]);
    const [lastMilestoneDate, setLastMilestoneDate] = useState(null);
    const [showUpdateReady, setShowUpdateReady] = useState(false);
    const [swRegistration, setSwRegistration] = useState(null);

    // Progressive Snooze and Engagement Checker
    const canShowInstallReminder = useCallback(() => {
        if (typeof window === 'undefined') return false;
        const inStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (inStandalone) return false;

        // Migrate legacy permanent dismiss key if present
        const legacyDismissed = localStorage.getItem(STORAGE_KEYS.INSTALL_DISMISSED);
        if (legacyDismissed === 'true' && !localStorage.getItem(STORAGE_KEYS.INSTALL_DISMISS_COUNT)) {
            localStorage.setItem(STORAGE_KEYS.INSTALL_DISMISS_COUNT, '1');
            localStorage.removeItem(STORAGE_KEYS.INSTALL_DISMISSED);
        }

        const dismissCount = parseInt(localStorage.getItem(STORAGE_KEYS.INSTALL_DISMISS_COUNT) || '0', 10);
        if (dismissCount >= 4) {
            return false; // Cap at 4 reminders to respect user decision
        }

        const lastDismissed = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_INSTALL_DISMISSED) || '0', 10);
        if (!lastDismissed) {
            return true; // Never dismissed yet
        }

        const now = Date.now();
        const hoursSinceDismiss = (now - lastDismissed) / (1000 * 60 * 60);
        // Progressive intervals: 24h -> 48h -> 7 days
        const requiredHours = dismissCount === 1 ? 24 : dismissCount === 2 ? 48 : 168;
        if (hoursSinceDismiss < requiredHours) {
            return false;
        }

        // Also ensure user has performed active actions since last dismiss
        const actionsCount = parseInt(localStorage.getItem(STORAGE_KEYS.INSTALL_ACTIONS_COUNT) || '0', 10);
        const requiredActions = dismissCount === 1 ? 2 : 3;
        return actionsCount >= requiredActions;
    }, []);

    useEffect(() => {
        const handleUpdate = (event) => {
            const reg = event.detail;
            setSwRegistration(reg);
            if (reg && reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            setShowUpdateReady(false);
        };
        window.addEventListener('swUpdateAvailable', handleUpdate);

        // Track beforeinstallprompt for 1-click install support
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredInstallPrompt(e);
            // Only show prompt banner if user has started using app properly and not in snooze
            if (canShowInstallReminder()) {
                const totalActivity = (tasksCount || 0) + (archivedCount || 0);
                if (totalActivity >= 2 || (archivedCount || 0) >= 1) {
                    setShowInstallPrompt(true);
                }
            }
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const handleAppInstalled = () => {
            setDeferredInstallPrompt(null);
            setShowInstallPrompt(false);
            setShowInstallModal(false);
            setIsStandalone(true);
        };
        window.addEventListener('appinstalled', handleAppInstalled);

        // Check standalone mode change
        const mql = window.matchMedia('(display-mode: standalone)');
        const handleDisplayModeChange = (e) => {
            if (e.matches) {
                setIsStandalone(true);
                setShowInstallPrompt(false);
                setShowInstallModal(false);
            }
        };
        if (mql.addEventListener) {
            mql.addEventListener('change', handleDisplayModeChange);
        }

        // MOBILE-FIRST PERSISTENCE: 
        if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persist().then(persistent => {
                if (persistent) {
                    console.log('💾 Data storage is persistent.');
                }
            }).catch(err => console.error('Persistence request failed:', err));
        }

        return () => {
            window.removeEventListener('swUpdateAvailable', handleUpdate);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            if (mql.removeEventListener) {
                mql.removeEventListener('change', handleDisplayModeChange);
            }
        };
    }, [canShowInstallReminder, tasksCount, archivedCount]);

    const checkBackupReminder = useCallback((count) => {
        setShowBackupReminder(false);
    }, []);

    const checkInstallPrompt = useCallback(() => {
        const hasSeenWelcome = localStorage.getItem(STORAGE_KEYS.WELCOME_SEEN);
        if (!hasSeenWelcome) return; // Wait until after initial onboarding

        if (canShowInstallReminder()) {
            const totalActivity = (tasksCount || 0) + (archivedCount || 0);
            if (totalActivity >= 2 || (archivedCount || 0) >= 1) {
                setShowInstallPrompt(true);
                localStorage.setItem(STORAGE_KEYS.LAST_INSTALL_PROMPT, Date.now().toString());
            }
        }
    }, [canShowInstallReminder, tasksCount, archivedCount]);

    // Call when user adds or completes tasks (starting to use app properly)
    const recordAppUsageAction = useCallback((actionType = 'action') => {
        if (typeof window === 'undefined') return;
        const inStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (inStandalone) return;

        const currentActions = parseInt(localStorage.getItem(STORAGE_KEYS.INSTALL_ACTIONS_COUNT) || '0', 10);
        const updatedActions = currentActions + 1;
        localStorage.setItem(STORAGE_KEYS.INSTALL_ACTIONS_COUNT, updatedActions.toString());

        if (canShowInstallReminder()) {
            const totalActivity = (tasksCount || 0) + (archivedCount || 0);
            // Trigger reminder modal after meaningful engagement (completed task or 2+ items created)
            if ((actionType === 'complete' || totalActivity >= 2) && !showWelcome) {
                setTimeout(() => {
                    const stillNotStandalone = !window.matchMedia('(display-mode: standalone)').matches && !window.navigator.standalone;
                    if (stillNotStandalone) {
                        setShowInstallModal(true);
                        localStorage.setItem(STORAGE_KEYS.LAST_INSTALL_PROMPT, Date.now().toString());
                    }
                }, 1200);
            }
        }
    }, [canShowInstallReminder, tasksCount, archivedCount, showWelcome]);

    // Initialize system states
    useEffect(() => {
        // Welcome screen
        const hasSeenWelcome = localStorage.getItem(STORAGE_KEYS.WELCOME_SEEN);
        if (!hasSeenWelcome) {
            setTimeout(() => setShowWelcome(true), 500);
        }

        // Milestones
        const savedMilestones = localStorage.getItem(STORAGE_KEYS.MILESTONES);
        if (savedMilestones) {
            const milestoneData = JSON.parse(savedMilestones);
            setAchievedMilestones(milestoneData.achievedMilestones || []);
            setLastMilestoneDate(milestoneData.lastMilestoneDate || null);
        }

        // Backup reminder
        checkBackupReminder(tasksCount);

        // Install prompt
        setTimeout(() => checkInstallPrompt(), 2000);
    }, [checkBackupReminder, checkInstallPrompt, tasksCount]);

    const checkMilestones = useCallback((archived) => {
        const today = new Date().toDateString();

        let currentAchieved = achievedMilestones;
        if (lastMilestoneDate !== today) {
            currentAchieved = [];
            setAchievedMilestones([]);
            setLastMilestoneDate(today);
        }

        const todayCompleted = archived.filter(task => {
            return new Date(task.completedAt).toDateString() === today;
        }).length;

        const milestones = [5, 10, 15];

        for (let milestone of milestones) {
            if (todayCompleted >= milestone && !currentAchieved.includes(milestone)) {
                setAchievedMilestones(prev => {
                    const updated = [...prev, milestone];
                    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify({
                        achievedMilestones: updated,
                        lastMilestoneDate: today
                    }));
                    return updated;
                });
                setShowCongrats({ milestone, todayCompleted });
                break;
            }
        }
    }, [achievedMilestones, lastMilestoneDate]);

    const dismissWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem(STORAGE_KEYS.WELCOME_SEEN, 'true');
    };

    const dismissInstallPrompt = useCallback((fromModal = false) => {
        setShowInstallPrompt(false);
        setShowInstallModal(false);
        const now = Date.now();
        const currentCount = parseInt(localStorage.getItem(STORAGE_KEYS.INSTALL_DISMISS_COUNT) || '0', 10);
        const newCount = currentCount + 1;
        localStorage.setItem(STORAGE_KEYS.INSTALL_DISMISS_COUNT, newCount.toString());
        localStorage.setItem(STORAGE_KEYS.LAST_INSTALL_DISMISSED, now.toString());
        localStorage.setItem(STORAGE_KEYS.INSTALL_ACTIONS_COUNT, '0');
    }, []);

    const dismissBackupReminder = () => {
        setShowBackupReminder(false);
        localStorage.setItem(STORAGE_KEYS.REMINDER_DISMISSED, Date.now().toString());
    };

    const recordBackup = () => {
        localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, Date.now().toString());
        setShowBackupReminder(false);
    };

    const checkForUpdates = useCallback(async (forceSimulate = false) => {
        return await triggerSWUpdateCheck(forceSimulate);
    }, []);

    const triggerNativeInstall = useCallback(async () => {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            const choiceResult = await deferredInstallPrompt.userChoice;
            if (choiceResult && choiceResult.outcome === 'accepted') {
                setShowInstallPrompt(false);
                setShowInstallModal(false);
                setDeferredInstallPrompt(null);
                return true;
            }
        }
        return false;
    }, [deferredInstallPrompt]);

    return {
        showWelcome,
        showInstallPrompt,
        showInstallModal,
        setShowInstallModal,
        showBackupReminder,
        showCongrats,
        showUpdateReady,
        swRegistration,
        setShowCongrats,
        setShowUpdateReady,
        checkMilestones,
        dismissWelcome,
        dismissInstallPrompt,
        recordAppUsageAction,
        dismissBackupReminder,
        recordBackup,
        checkForUpdates,
        isStandalone,
        canNativeInstall: Boolean(deferredInstallPrompt),
        triggerNativeInstall
    };
};
