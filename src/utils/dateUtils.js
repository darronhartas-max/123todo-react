/**
 * Date utility functions for handling scheduled and recurring tasks.
 */

/**
 * Returns today's date in local YYYY-MM-DD format.
 */
export const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Returns next week's date (7 days from today) in local YYYY-MM-DD format.
 */
export const getNextWeekDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return formatDateString(d);
};

/**
 * Parses a YYYY-MM-DD string into a local Date object.
 */
export const parseDateString = (dateStr) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Formats a Date object to YYYY-MM-DD in local time.
 */
export const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Formats a YYYY-MM-DD string or Date object according to user preference.
 * @param {string|Date} dateVal - YYYY-MM-DD date string or Date instance
 * @param {string} formatStyle - 'UK' | 'US' | 'ISO' | 'UK_TEXT' | 'US_TEXT'
 * @returns {string} Formatted display date string
 */
export const formatDisplayDate = (dateVal, formatStyle = 'UK') => {
    if (!dateVal) return '';
    let d;
    if (typeof dateVal === 'string') {
        d = parseDateString(dateVal);
    } else {
        d = dateVal;
    }
    if (isNaN(d.getTime())) return String(dateVal);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthText = monthNames[d.getMonth()];

    switch (formatStyle) {
        case 'US':
            return `${month}/${day}/${year}`;
        case 'ISO':
            return `${year}-${month}-${day}`;
        case 'UK_TEXT':
            return `${d.getDate()} ${monthText} ${year}`;
        case 'US_TEXT':
            return `${monthText} ${d.getDate()}, ${year}`;
        case 'UK':
        default:
            return `${day}/${month}/${year}`;
    }
};

/**
 * Calculates the next recurrence date based on the current scheduled date and the recurrence rules.
 * @param {string} currentDateStr - YYYY-MM-DD format
 * @param {Object} recurrence - { frequency, interval, daysOfWeek }
 * @returns {string} YYYY-MM-DD format
 */
export const calculateNextRecurrenceDate = (currentDateStr, recurrence) => {
    if (!recurrence) return null;
    const { frequency = 1, interval = 'days', daysOfWeek = [] } = recurrence;
    
    // Parse to local Date object
    const date = parseDateString(currentDateStr);
    const nFrequency = parseInt(frequency, 10) || 1;
    
    if (interval === 'days') {
        date.setDate(date.getDate() + nFrequency);
    } else if (interval === 'weeks') {
        if (daysOfWeek && daysOfWeek.length > 0) {
            // Find the next day of the week that matches daysOfWeek
            let found = false;
            let safetyCounter = 0;
            while (!found && safetyCounter < 366) {
                date.setDate(date.getDate() + 1);
                safetyCounter++;
                const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
                if (daysOfWeek.includes(day)) {
                    found = true;
                }
            }
            if (nFrequency > 1) {
                // For custom weekly intervals, add (frequency - 1) weeks
                date.setDate(date.getDate() + (nFrequency - 1) * 7);
            }
        } else {
            date.setDate(date.getDate() + nFrequency * 7);
        }
    } else if (interval === 'months') {
        date.setMonth(date.getMonth() + nFrequency);
    } else if (interval === 'years') {
        date.setFullYear(date.getFullYear() + nFrequency);
    }
    
    return formatDateString(date);
};

/**
 * Adjusts a starting date string to the next occurrence of one of the target weekdays.
 * If the current weekday of the date is already in daysOfWeek, it returns the date unchanged.
 * @param {string} dateStr - YYYY-MM-DD format
 * @param {Array<number>} daysOfWeek - Array of weekday indexes (0-6)
 * @returns {string} YYYY-MM-DD format
 */
export const adjustStartDateForWeekdays = (dateStr, daysOfWeek) => {
    if (!daysOfWeek || daysOfWeek.length === 0) return dateStr;
    const date = parseDateString(dateStr);
    const initialDay = date.getDay();
    if (daysOfWeek.includes(initialDay)) {
        return dateStr;
    }
    
    let found = false;
    let safetyCounter = 0;
    while (!found && safetyCounter < 7) {
        date.setDate(date.getDate() + 1);
        safetyCounter++;
        const day = date.getDay();
        if (daysOfWeek.includes(day)) {
            found = true;
        }
    }
    return formatDateString(date);
};
