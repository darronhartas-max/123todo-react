/**
 * Utility functions for Web Notifications on Desktop and Mobile PWA.
 */

export const isNotificationSupported = () => {
    return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = () => {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission;
};

export const requestNotificationPermission = async () => {
    if (!isNotificationSupported()) return 'unsupported';
    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch (e) {
        console.warn('Error requesting notification permission:', e);
        return 'denied';
    }
};

/**
 * Triggers a system notification for a due scheduled task.
 *
 * @param {Object} task
 * @param {string} [timeLabel='']
 */
export const sendTaskNotification = (task, timeLabel = '') => {
    if (!isNotificationSupported() || Notification.permission !== 'granted' || !task) return null;

    const title = task.text ? `⏰ ${task.text}` : '⏰ Scheduled Task Reminder';
    const body = task.scheduledTime
        ? `Scheduled for ${task.scheduledTime}${task.notes ? ` • ${task.notes.slice(0, 80)}` : ''}`
        : `Due today${task.notes ? ` • ${task.notes.slice(0, 80)}` : ''}`;

    const options = {
        body,
        icon: '/favicon.ico',
        tag: `123todo-task-${task.id}`,
        renotify: true
    };

    try {
        // Prefer service worker registration notification if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
                if (reg && reg.showNotification) {
                    reg.showNotification(title, options);
                } else {
                    new Notification(title, options);
                }
            }).catch(() => {
                new Notification(title, options);
            });
        } else {
            const notification = new Notification(title, options);
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            return notification;
        }
    } catch (e) {
        console.warn('Failed to send notification:', e);
    }
    return null;
};
