import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, INSTALL_PROMPT_DAYS } from '../utils/constants';
import { checkForUpdates as triggerSWUpdateCheck } from '../serviceWorkerRegistration';

export const useAppSystem = (archivedCount, tasksCount, isSyncAuthed) => {
    const [showWelcome, setShowWelcome] = useState(false);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [showBackupReminder, setShowBackupReminder] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [achievedMilestones, setAchievedMilestones] = useState([]);
    const [lastMilestoneDate, setLastMilestoneDate] = useState(null);
    const [showUpdateReady, setShowUpdateReady] = useState(false);
    const [swRegistration, setSwRegistration] = useState(null);

    useEffect(() => {
        const handleUpdate = (event) => {
            setSwRegistration(event.detail);
            setShowUpdateReady(true);
        };
        window.addEventListener('swUpdateAvailable', handleUpdate);

        // MOBILE-FIRST PERSISTENCE: 
        // Request persistent storage to prevent the browser from automatically 
        // clearing localStorage/IndexedDB on mobile devices when space is low.
        if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persist().then(persistent => {
                if (persistent) {
                    console.log('💾 Data storage is persistent.');
                }
            }).catch(err => console.error('Persistence request failed:', err));
        }

        return () => window.removeEventListener('swUpdateAvailable', handleUpdate);
    }, []);

    const checkBackupReminder = useCallback((count) => {
        // Redundant due to automatic 24-hour shadow backups, persistent storage API, and Google Drive sync.
        setShowBackupReminder(false);
    }, []);

    const checkInstallPrompt = useCallback(() => {
        const installDismissed = localStorage.getItem(STORAGE_KEYS.INSTALL_DISMISSED);
        const lastInstallPrompt = localStorage.getItem(STORAGE_KEYS.LAST_INSTALL_PROMPT);
        const now = Date.now();
        const promptPeriod = INSTALL_PROMPT_DAYS * 24 * 60 * 60 * 1000;

        if (!installDismissed && (!lastInstallPrompt || (now - parseInt(lastInstallPrompt)) > promptPeriod)) {
            if (!window.matchMedia('(display-mode: standalone)').matches && !window.navigator.standalone) {
                setShowInstallPrompt(true);
                localStorage.setItem(STORAGE_KEYS.LAST_INSTALL_PROMPT, now.toString());
            }
        }
    }, []);

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

    const dismissInstallPrompt = () => {
        setShowInstallPrompt(false);
        localStorage.setItem(STORAGE_KEYS.INSTALL_DISMISSED, 'true');
    };

    const dismissBackupReminder = () => {
        setShowBackupReminder(false);
        localStorage.setItem(STORAGE_KEYS.REMINDER_DISMISSED, Date.now().toString());
    };

    const recordBackup = () => {
        localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, Date.now().toString());
        setShowBackupReminder(false);
    };

    const checkForUpdates = useCallback(async () => {
        return await triggerSWUpdateCheck();
    }, []);

    return {
        showWelcome,
        showInstallPrompt,
        showBackupReminder,
        showCongrats,
        showUpdateReady,
        swRegistration,
        setShowCongrats,
        setShowUpdateReady,
        checkMilestones,
        dismissWelcome,
        dismissInstallPrompt,
        dismissBackupReminder,
        recordBackup,
        checkForUpdates
    };
};
