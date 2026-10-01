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
 * Returns tomorrow's date (1 day from today) in local YYYY-MM-DD format.
 */
export const getTomorrowDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateString(d);
};

/**
 * Returns the date of the Monday of the following week in local YYYY-MM-DD format.
 * (If today is Monday, returns next Monday (+7 days); on any other day returns upcoming Monday).
 * @param {Date} [fromDate=new Date()] - Optional base date (defaults to current date)
 */
export const getNextWeekDateString = (fromDate = new Date()) => {
    const d = new Date(fromDate);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    const daysUntilNextMonday = ((1 - day + 7) % 7) || 7;
    d.setDate(d.getDate() + daysUntilNextMonday);
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
 * Formats an HH:MM time string (24-hour format from <input type="time">) according to user preference.
 * @param {string} timeStr - "HH:MM"
 * @param {string} [formatStyle='UK'] - 'UK' | 'US' | 'ISO' | 'UK_TEXT' | 'US_TEXT'
 * @returns {string} Formatted display time string (e.g. "14:30" or "2:30 PM")
 */
export const formatDisplayTime = (timeStr, formatStyle = 'UK') => {
    if (!timeStr || typeof timeStr !== 'string') return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1].padStart(2, '0');
    if (isNaN(hours)) return timeStr;

    if (formatStyle === 'US' || formatStyle === 'US_TEXT') {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes} ${period}`;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`;
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

/**
 * Checks if a timestamp is valid, accurate, and truthful (modern date >= 2020 and <= 2100).
 * Rejects small sequential IDs (e.g. 1, 2, 42) and empty/ancient dates.
 * @param {number|string|Date} timestamp
 * @returns {boolean}
 */
export const isValidEvidentiaryTimestamp = (timestamp) => {
    if (!timestamp) return false;
    const num = Number(timestamp);
    // Disallow small sequential counter IDs (e.g. 1, 2, 42) or timestamps before year 2020 (1577836800000 ms)
    if (!isNaN(num) && num < 1577836800000) return false;
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return false;
    const year = d.getFullYear();
    if (year < 2020 || year > 2100) return false;
    return true;
};

/**
 * Formats a timestamp into an evidentiary proof string (e.g., "10 Sep 2026, 17:15:32").
 * Returns an empty string if the timestamp is not genuine or prior to feature implementation.
 * @param {number|string|Date} timestamp - Milliseconds timestamp or Date
 * @returns {string} Formatted evidentiary date & time, or '' if not valid/truthful
 */
export const formatEvidentiaryTimestamp = (timestamp) => {
    if (!isValidEvidentiaryTimestamp(timestamp)) return '';
    const d = new Date(timestamp);
    
    const day = d.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
};

/**
 * Promotes scheduled tasks whose due date has arrived (scheduledDate <= today) to the top
 * of their respective priority lists upon initial appearance, marking them with promotedDate.
 * Once marked as promoted, they respect user drag-and-drop reordering without snapping back to top.
 * 
/**
 * Inserts a task into a task list, placing timed tasks in chronological order
 * (earliest scheduledTime first) within their priority section, while placing
 * untimed tasks after timed tasks.
 * 
 * @param {Array} taskList - The current list of tasks
 * @param {Object} taskToInsert - The task being inserted
 * @param {string} [todayStr] - Today's date string in YYYY-MM-DD
 * @returns {Array} A new task array with the task inserted in the proper position
 */
export const insertTaskInTimeOrder = (taskList, taskToInsert, todayStr = getTodayDateString()) => {
    if (!taskList || !Array.isArray(taskList)) return [taskToInsert];
    if (!taskToInsert) return taskList;

    // Remove any existing instance of the task if present
    const listWithoutTask = taskList.filter(t => String(t.id) !== String(taskToInsert.id));
    const targetPriority = taskToInsert.priority || 1;
    const isFutureScheduled = taskToInsert.scheduledDate && taskToInsert.scheduledDate > todayStr;

    // If it's scheduled for a future date (not in active list yet), keep it at the front of tasks
    if (isFutureScheduled) {
        return [taskToInsert, ...listWithoutTask];
    }

    // Find all indices of tasks with the same priority in the list
    const priorityIndices = [];
    listWithoutTask.forEach((t, index) => {
        if ((t.priority || 1) === targetPriority) {
            priorityIndices.push(index);
        }
    });

    // If there are no tasks with this priority yet, find insertion point based on priority order
    if (priorityIndices.length === 0) {
        let insertIdx = listWithoutTask.findIndex(t => (t.priority || 1) > targetPriority);
        if (insertIdx === -1) insertIdx = listWithoutTask.length;
        const result = [...listWithoutTask];
        result.splice(insertIdx, 0, taskToInsert);
        return result;
    }

    const firstPriorityIdx = priorityIndices[0];

    // Helper to determine if an existing task is an active timed task
    const isActiveTimed = (t) => !!(t && t.scheduledTime && (!t.scheduledDate || t.scheduledDate <= todayStr));

    // Case 1: taskToInsert is UNTIMED
    if (!taskToInsert.scheduledTime) {
        // If there are timed tasks in this priority, place after the last timed task
        let lastTimedIdx = -1;
        for (const idx of priorityIndices) {
            if (isActiveTimed(listWithoutTask[idx])) {
                lastTimedIdx = idx;
            }
        }

        const result = [...listWithoutTask];
        if (lastTimedIdx !== -1) {
            result.splice(lastTimedIdx + 1, 0, taskToInsert);
        } else {
            // No timed tasks in this priority -> place at the top of the priority section
            result.splice(firstPriorityIdx, 0, taskToInsert);
        }
        return result;
    }

    // Case 2: taskToInsert HAS a scheduledTime
    const insertTime = taskToInsert.scheduledTime;
    let targetInsertIdx = -1;

    // Look for the first timed task that has a later time (or later scheduledDate)
    for (const idx of priorityIndices) {
        const t = listWithoutTask[idx];
        if (isActiveTimed(t)) {
            // Compare dates first if both have dates
            const dateComp = (t.scheduledDate && taskToInsert.scheduledDate)
                ? t.scheduledDate.localeCompare(taskToInsert.scheduledDate)
                : 0;
            if (dateComp > 0) {
                targetInsertIdx = idx;
                break;
            } else if (dateComp === 0) {
                if (t.scheduledTime.localeCompare(insertTime) > 0) {
                    targetInsertIdx = idx;
                    break;
                }
            }
        }
    }

    const result = [...listWithoutTask];

    if (targetInsertIdx !== -1) {
        result.splice(targetInsertIdx, 0, taskToInsert);
    } else {
        // Either all timed tasks are earlier, or there are no timed tasks yet
        let lastTimedIdx = -1;
        for (const idx of priorityIndices) {
            if (isActiveTimed(listWithoutTask[idx])) {
                lastTimedIdx = idx;
            }
        }

        if (lastTimedIdx !== -1) {
            // Insert immediately after the last timed task (and before any untimed tasks)
            result.splice(lastTimedIdx + 1, 0, taskToInsert);
        } else {
            // No existing timed tasks -> place at the very top of the priority section
            result.splice(firstPriorityIdx, 0, taskToInsert);
        }
    }

    return result;
};

/**
 * Promotes scheduled tasks whose due date has arrived (scheduledDate <= today) to the top
 * of their respective priority lists upon initial appearance, marking them with promotedDate.
 * Once marked as promoted, they respect user drag-and-drop reordering without snapping back to top.
 * 
 * @param {Array} taskList - List of tasks
 * @param {string} [todayStr] - Today's date string in YYYY-MM-DD
 * @returns {Array} Updated task list with due scheduled tasks placed at the top of their priority sections
 */
export const promoteDueScheduledTasks = (taskList, todayStr = getTodayDateString()) => {
    if (!Array.isArray(taskList) || taskList.length === 0) return taskList;

    const needsPromotion = taskList.some(t => 
        t && t.scheduledDate && t.scheduledDate <= todayStr && t.promotedDate !== t.scheduledDate
    );

    if (!needsPromotion) return taskList;

    let result = [...taskList];

    [1, 2, 3, 4].forEach(priority => {
        const dueToPromote = result.filter(t => 
            t && (t.priority === priority || (!t.priority && priority === 1)) &&
            t.scheduledDate && t.scheduledDate <= todayStr && t.promotedDate !== t.scheduledDate
        );

        if (dueToPromote.length === 0) return;

        // Sort multiple due tasks by scheduledDate and scheduledTime (earlier due dates & times first)
        dueToPromote.sort((a, b) => {
            const dateComp = (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
            if (dateComp !== 0) return dateComp;
            if (a.scheduledTime && b.scheduledTime) {
                return a.scheduledTime.localeCompare(b.scheduledTime);
            }
            if (a.scheduledTime && !b.scheduledTime) return -1;
            if (!a.scheduledTime && b.scheduledTime) return 1;
            return 0;
        });

        const promotedDueTasks = dueToPromote.map(t => ({
            ...t,
            promotedDate: t.scheduledDate
        }));

        const dueIds = new Set(promotedDueTasks.map(t => String(t.id)));
        let remaining = result.filter(t => !dueIds.has(String(t.id)));

        // Insert each promoted task into remaining in proper time order
        promotedDueTasks.forEach(task => {
            remaining = insertTaskInTimeOrder(remaining, task, todayStr);
        });

        result = remaining;
    });

    return result;
};


