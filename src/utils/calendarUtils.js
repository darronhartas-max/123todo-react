/**
 * Utility functions for exporting and adding scheduled tasks to external calendars (Google Calendar & Apple Calendar / iCal).
 */

/**
 * Formats a YYYY-MM-DD date and optional HH:MM time into Google Calendar date range format.
 * All-day: YYYYMMDD/YYYYMMDD (next day)
 * Timed: YYYYMMDDTHHmmSS/YYYYMMDDTHHmmSS (local time without Z for user calendar timezone)
 *
 * @param {string} scheduledDate - "YYYY-MM-DD"
 * @param {string|null} scheduledTime - "HH:MM" or null
 * @returns {string} Google Calendar dates param value
 */
export const formatGoogleCalendarDates = (scheduledDate, scheduledTime = null) => {
    if (!scheduledDate) return '';
    const cleanDate = scheduledDate.replace(/-/g, '');

    if (!scheduledTime) {
        // All-day event: Google Calendar end date is exclusive (day + 1)
        const [y, m, d] = scheduledDate.split('-').map(Number);
        const nextDay = new Date(y, m - 1, d + 1);
        const nextY = nextDay.getFullYear();
        const nextM = String(nextDay.getMonth() + 1).padStart(2, '0');
        const nextD = String(nextDay.getDate()).padStart(2, '0');
        const nextDateStr = `${nextY}${nextM}${nextD}`;
        return `${cleanDate}/${nextDateStr}`;
    }

    // Timed event: default to 30-minute duration
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const startStr = `${cleanDate}T${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;

    const startMinutes = hours * 60 + minutes + 30;
    const endH = Math.floor(startMinutes / 60) % 24;
    const endM = startMinutes % 60;
    const endStr = `${cleanDate}T${String(endH).padStart(2, '0')}${String(endM).padStart(2, '0')}00`;

    return `${startStr}/${endStr}`;
};

/**
 * Builds a direct web URL to add a scheduled task to Google Calendar.
 *
 * @param {Object} options
 * @param {string} options.title - Task title
 * @param {string} options.scheduledDate - "YYYY-MM-DD"
 * @param {string|null} [options.scheduledTime] - "HH:MM" or null
 * @param {string} [options.notes] - Task notes/description
 * @returns {string} Google Calendar template URL
 */
export const generateGoogleCalendarUrl = ({ title, scheduledDate, scheduledTime = null, notes = '' }) => {
    if (!scheduledDate) return '';
    const dates = formatGoogleCalendarDates(scheduledDate, scheduledTime);
    const cleanTitle = (title || 'Scheduled Task').trim();
    let details = (notes || '').trim();
    if (details) {
        details += '\n\n';
    }
    details += 'Scheduled via 123 To Do (https://123todo.com)';

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: cleanTitle,
        dates,
        details
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Opens Google Calendar in a new tab/window to schedule the task.
 */
export const openGoogleCalendar = (options) => {
    const url = generateGoogleCalendarUrl(options);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Escapes characters for iCalendar (RFC 5545) text fields.
 */
const escapeIcsText = (str) => {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
};

/**
 * Generates RFC 5545 compliant .ics (iCalendar) content for Apple Calendar / Outlook.
 *
 * @param {Object} options
 * @param {string} options.title - Task title
 * @param {string} options.scheduledDate - "YYYY-MM-DD"
 * @param {string|null} [options.scheduledTime] - "HH:MM" or null
 * @param {string} [options.notes] - Task notes/description
 * @returns {string} .ics file content
 */
export const generateIcsContent = ({ title, scheduledDate, scheduledTime = null, notes = '' }) => {
    if (!scheduledDate) return '';
    const cleanDate = scheduledDate.replace(/-/g, '');
    const cleanTitle = escapeIcsText((title || 'Scheduled Task').trim());
    let cleanNotes = (notes || '').trim();
    if (cleanNotes) {
        cleanNotes += '\n\n';
    }
    cleanNotes += 'Scheduled via 123 To Do (https://123todo.com)';
    const escapedDetails = escapeIcsText(cleanNotes);

    const now = new Date();
    const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `123todo-${Date.now()}-${Math.floor(Math.random() * 100000)}@123todo.com`;

    let dtStartLine = '';
    let dtEndLine = '';

    if (!scheduledTime) {
        // All-day event
        const [y, m, d] = scheduledDate.split('-').map(Number);
        const nextDay = new Date(y, m - 1, d + 1);
        const nextY = nextDay.getFullYear();
        const nextM = String(nextDay.getMonth() + 1).padStart(2, '0');
        const nextD = String(nextDay.getDate()).padStart(2, '0');
        const nextDateStr = `${nextY}${nextM}${nextD}`;

        dtStartLine = `DTSTART;VALUE=DATE:${cleanDate}`;
        dtEndLine = `DTEND;VALUE=DATE:${nextDateStr}`;
    } else {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const startH = String(hours).padStart(2, '0');
        const startM = String(minutes).padStart(2, '0');
        const startMinutes = hours * 60 + minutes + 30;
        const endH = String(Math.floor(startMinutes / 60) % 24).padStart(2, '0');
        const endM = String(startMinutes % 60).padStart(2, '0');

        dtStartLine = `DTSTART:${cleanDate}T${startH}${startM}00`;
        dtEndLine = `DTEND:${cleanDate}T${endH}${endM}00`;
    }

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//123 To Do//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        dtStartLine,
        dtEndLine,
        `SUMMARY:${cleanTitle}`,
        `DESCRIPTION:${escapedDetails}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${cleanTitle}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ];

    return lines.join('\r\n');
};

/**
 * Downloads an .ics file or opens it to trigger Apple Calendar / native calendar integration.
 */
export const downloadAppleCalendarIcs = (options) => {
    const icsContent = generateIcsContent(options);
    if (!icsContent) return;

    const safeTitle = (options.title || 'task')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 30);
    const filename = `${safeTitle || 'event'}.ics`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
};
