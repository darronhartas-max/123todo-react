/**
 * 123 To Do — Natural Language Quick Add Parser
 * Lightweight, zero-dependency entity detection for task inputs.
 * Detects:
 *   - Due dates: today, tomorrow, weekday names, 'next monday', 'in 3 days', '25th Oct', '2026-10-25'
 *   - Scheduled times: 2pm, 14:00, 9:30am, morning, midday, afternoon, evening
 *   - Priorities: !1, !2, !3, !4, p1, p2, p3, p4, !must, !should, !could, !hold
 *   - Projects: #Work, #Personal (matched against available projects)
 *   - Recurrence: daily, weekly, monthly, every day, every week, every 2 weeks, every weekday
 */

const MONTH_NAMES = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11
};

const WEEKDAY_NAMES = {
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tuesday: 2,
    wed: 3, wednesday: 3,
    thu: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6
};

const PRIORITY_KEYWORDS = {
    '!1': 1, 'p1': 1, '!must': 1,
    '!2': 2, 'p2': 2, '!should': 2,
    '!3': 3, 'p3': 3, '!could': 3,
    '!4': 4, 'p4': 4, '!hold': 4
};

const PRIORITY_LABELS = {
    1: 'Must Do',
    2: 'Should Do',
    3: 'Could Do',
    4: 'On Hold'
};

const TIME_PRESETS = {
    morning: '09:00',
    midday: '12:00',
    noon: '12:00',
    afternoon: '14:00',
    evening: '18:00',
    night: '20:00'
};

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export const formatDateISO = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parse an entity from input text and return structured task attributes
 * @param {string} text - Raw input text from user
 * @param {Array} projects - List of available project objects ({ id, name, color })
 * @param {Object} options - { referenceDate: Date, dateFormat: 'UK'|'US'|'ISO' }
 */
export const parseQuickAdd = (text, projects = [], options = {}) => {
    if (!text || typeof text !== 'string') {
        return {
            cleanText: '',
            originalText: text || '',
            tokens: [],
            scheduledDate: null,
            scheduledTime: null,
            priority: null,
            projectId: null,
            recurrence: null
        };
    }

    const refDate = options.referenceDate ? new Date(options.referenceDate) : new Date();
    const tokens = [];
    const rangesToRemove = [];

    // Helper to register a matched token
    const addToken = (type, raw, value, label, start, end, extra = {}) => {
        tokens.push({
            type,
            raw,
            value,
            label,
            ...extra
        });
        rangesToRemove.push({ start, end });
    };

    // 1. Parse Priorities (!1, p1, !must, etc.)
    // Avoid matching within alphanumeric words (e.g. step1, p100)
    const priorityRegex = /(?:^|\s)(!1|!2|!3|!4|p[1-4]|!must|!should|!could|!hold)(?=\s|$)/gi;
    let match;
    while ((match = priorityRegex.exec(text)) !== null) {
        const rawToken = match[1];
        const key = rawToken.toLowerCase();
        const pVal = PRIORITY_KEYWORDS[key];
        if (pVal !== undefined) {
            const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
            const endIdx = startIdx + rawToken.length;
            addToken('priority', rawToken, pVal, PRIORITY_LABELS[pVal], startIdx, endIdx);
            break; // only one priority per task
        }
    }

    // 2. Parse Projects (#ProjectName)
    if (projects && projects.length > 0) {
        const projectRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)(?=\s|$)/g;
        while ((match = projectRegex.exec(text)) !== null) {
            const rawToken = match[0].trim();
            const tag = match[1].toLowerCase();
            const matchedProj = projects.find(p =>
                (p.name && p.name.toLowerCase() === tag) ||
                (p.id && p.id.toLowerCase() === tag) ||
                (p.name && p.name.toLowerCase().replace(/\s+/g, '') === tag)
            );

            if (matchedProj) {
                const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
                const endIdx = startIdx + rawToken.length;
                addToken('project', rawToken, matchedProj.id, matchedProj.name, startIdx, endIdx, {
                    color: matchedProj.color
                });
                break; // only one project per task
            }
        }
    }

    // 3. Parse Recurrence (every day, daily, weekly, every 2 weeks, every weekday, etc.)
    const recurrenceRegex = /(?:^|\s)\b(daily|weekly|monthly|yearly|every\s+day|every\s+week|every\s+month|every\s+year|every\s+weekday|every\s+(\d+)\s+(days?|weeks?|months?|years?)|every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b(?=\s|$)/gi;
    match = recurrenceRegex.exec(text);
    if (match) {
        const rawToken = match[0].trim();
        const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
        const endIdx = startIdx + rawToken.length;
        const lower = match[1].toLowerCase();

        let recObj = null;
        let label = '';

        if (lower === 'daily' || lower === 'every day') {
            recObj = { frequency: 1, interval: 'days', daysOfWeek: [] };
            label = 'Daily';
        } else if (lower === 'weekly' || lower === 'every week') {
            recObj = { frequency: 1, interval: 'weeks', daysOfWeek: [] };
            label = 'Weekly';
        } else if (lower === 'monthly' || lower === 'every month') {
            recObj = { frequency: 1, interval: 'months', daysOfWeek: [] };
            label = 'Monthly';
        } else if (lower === 'yearly' || lower === 'every year') {
            recObj = { frequency: 1, interval: 'years', daysOfWeek: [] };
            label = 'Yearly';
        } else if (lower === 'every weekday') {
            recObj = { frequency: 1, interval: 'weeks', daysOfWeek: [1, 2, 3, 4, 5] };
            label = 'Every Weekday';
        } else if (match[2] && match[3]) {
            const freq = parseInt(match[2], 10);
            let unit = match[3].toLowerCase();
            if (!unit.endsWith('s')) unit += 's';
            recObj = { frequency: freq, interval: unit, daysOfWeek: [] };
            label = `Every ${freq} ${unit}`;
        } else if (match[4]) {
            const dayName = match[4].toLowerCase();
            const dayNum = WEEKDAY_NAMES[dayName];
            recObj = { frequency: 1, interval: 'weeks', daysOfWeek: [dayNum] };
            label = `Every ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;
        }

        if (recObj) {
            addToken('recurrence', rawToken, recObj, label, startIdx, endIdx);
        }
    }

    // 4. Parse Times (e.g. at 2pm, 14:00, 9:30am, morning, midday, afternoon, evening)
    // 4a. Explicit times: 14:30 or 2:30pm or 2pm or at 9:00am
    const explicitTimeRegex = /(?:^|\s)\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)(?:\s*(am|pm))?\b(?=\s|$)/gi;
    match = explicitTimeRegex.exec(text);
    if (match) {
        const rawToken = match[0].trim();
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = match[3] ? match[3].toLowerCase() : null;

        if (ampm === 'pm' && hours < 12) hours += 12;
        if (ampm === 'am' && hours === 12) hours = 0;

        const timeVal = `${String(hours).padStart(2, '0')}:${minutes}`;
        const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
        const endIdx = startIdx + rawToken.length;
        addToken('time', rawToken, timeVal, timeVal, startIdx, endIdx);
    }

    if (!tokens.some(t => t.type === 'time')) {
        const ampmTimeRegex = /(?:^|\s)\b(?:at\s+)?([1-9]|1[0-2])\s*(am|pm)\b(?=\s|$)/gi;
        match = ampmTimeRegex.exec(text);
        if (match) {
            const rawToken = match[0].trim();
            let hours = parseInt(match[1], 10);
            const ampm = match[2].toLowerCase();

            if (ampm === 'pm' && hours < 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;

            const timeVal = `${String(hours).padStart(2, '0')}:00`;
            const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
            const endIdx = startIdx + rawToken.length;
            addToken('time', rawToken, timeVal, timeVal, startIdx, endIdx);
        }
    }

    // 4b. Named presets (e.g. 'in the morning', 'at midday', 'this evening', or trailing 'morning')
    if (!tokens.some(t => t.type === 'time')) {
        const timePresetRegex = /(?:^|\s)\b(at\s+(?:midday|noon|night)|in\s+the\s+(?:morning|afternoon|evening)|this\s+evening|(?:morning|midday|noon|afternoon|evening|night))\b(?=\s|$)/gi;
        while ((match = timePresetRegex.exec(text)) !== null) {
            const rawToken = match[0].trim();
            const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
            const endIdx = startIdx + rawToken.length;

            // If it's a bare word at the very start of a sentence with more words, it's likely a noun/subject (e.g. "Morning coffee")
            const hasPreposition = /^(at|in|this)\b/i.test(rawToken);
            const isStartOfSentence = startIdx === 0;
            const hasMoreWordsAfter = endIdx < text.trim().length;

            if (isStartOfSentence && !hasPreposition && hasMoreWordsAfter) {
                continue;
            }

            const lower = rawToken.toLowerCase();
            let key = null;
            for (const k of Object.keys(TIME_PRESETS)) {
                if (lower.includes(k)) {
                    key = k;
                    break;
                }
            }

            if (key && TIME_PRESETS[key]) {
                const timeVal = TIME_PRESETS[key];
                addToken('time', rawToken, timeVal, `${key.charAt(0).toUpperCase() + key.slice(1)} (${timeVal})`, startIdx, endIdx);
                break;
            }
        }
    }

    // 5. Parse Dates (today, tomorrow, next friday, in 3 days, 25th Oct, 2026-10-25)
    // 5a. Today / Tomorrow
    const todayTomorrowRegex = /(?:^|\s)\b(today|tomorrow|tmrw)\b(?=\s|$)/gi;
    match = todayTomorrowRegex.exec(text);
    if (match) {
        const rawToken = match[0].trim();
        const lower = match[1].toLowerCase();
        const targetDate = new Date(refDate);

        if (lower === 'tomorrow' || lower === 'tmrw') {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const dateVal = formatDateISO(targetDate);
        const label = lower === 'today' ? 'Today' : 'Tomorrow';
        const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
        const endIdx = startIdx + rawToken.length;
        addToken('date', rawToken, dateVal, label, startIdx, endIdx);
    }

    // 5b. Days of the week (e.g. 'on monday', 'next friday', 'this sunday', 'friday')
    if (!tokens.some(t => t.type === 'date')) {
        const weekdayRegex = /(?:^|\s)\b(?:on\s+|this\s+|next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b(?=\s|$)/gi;
        match = weekdayRegex.exec(text);
        if (match) {
            const rawToken = match[0].trim();
            const isNext = /\bnext\b/i.test(rawToken);
            const dayKey = match[1].toLowerCase();
            const targetDayNum = WEEKDAY_NAMES[dayKey];

            if (targetDayNum !== undefined) {
                const targetDate = new Date(refDate);
                const currentDayNum = targetDate.getDay();
                let dayDiff = targetDayNum - currentDayNum;

                if (dayDiff <= 0) {
                    dayDiff += 7;
                }
                if (isNext) {
                    dayDiff += 7;
                }

                targetDate.setDate(targetDate.getDate() + dayDiff);
                const dateVal = formatDateISO(targetDate);
                const dayCap = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
                const label = isNext ? `Next ${dayCap}` : dayCap;
                const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
                const endIdx = startIdx + rawToken.length;
                addToken('date', rawToken, dateVal, `${label} (${dateVal})`, startIdx, endIdx);
            }
        }
    }

    // 5c. Relative date ('in 3 days', 'in 2 weeks', 'in 1 month')
    if (!tokens.some(t => t.type === 'date')) {
        const relativeDateRegex = /(?:^|\s)\b(?:in\s+)?(\d+)\s+(days?|weeks?|months?)\b(?=\s|$)/gi;
        match = relativeDateRegex.exec(text);
        if (match) {
            const rawToken = match[0].trim();
            const num = parseInt(match[1], 10);
            const unit = match[2].toLowerCase();
            const targetDate = new Date(refDate);

            if (unit.startsWith('day')) {
                targetDate.setDate(targetDate.getDate() + num);
            } else if (unit.startsWith('week')) {
                targetDate.setDate(targetDate.getDate() + (num * 7));
            } else if (unit.startsWith('month')) {
                targetDate.setMonth(targetDate.getMonth() + num);
            }

            const dateVal = formatDateISO(targetDate);
            const label = `In ${num} ${unit}`;
            const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
            const endIdx = startIdx + rawToken.length;
            addToken('date', rawToken, dateVal, `${label} (${dateVal})`, startIdx, endIdx);
        }
    }

    // 5d. Specific calendar dates (25th Oct, Oct 25, 25 October, 2026-10-25)
    if (!tokens.some(t => t.type === 'date')) {
        // ISO YYYY-MM-DD
        const isoRegex = /(?:^|\s)\b(\d{4}-\d{2}-\d{2})\b(?=\s|$)/;
        match = isoRegex.exec(text);
        if (match) {
            const rawToken = match[1];
            const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
            const endIdx = startIdx + rawToken.length;
            addToken('date', rawToken, rawToken, rawToken, startIdx, endIdx);
        }
    }

    if (!tokens.some(t => t.type === 'date')) {
        // '25th Oct', '25 Oct', '25 October 2026'
        const dayMonthRegex = /(?:^|\s)\b(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)(?:\s+(\d{4}))?\b(?=\s|$)/gi;
        match = dayMonthRegex.exec(text);
        if (match) {
            const rawToken = match[0].trim();
            const day = parseInt(match[1], 10);
            const monthKey = match[2].toLowerCase();
            const monthIdx = MONTH_NAMES[monthKey];
            const year = match[3] ? parseInt(match[3], 10) : refDate.getFullYear();

            const targetDate = new Date(year, monthIdx, day);
            // If year wasn't specified and target date is in the past, assume next year
            if (!match[3] && targetDate < new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate())) {
                targetDate.setFullYear(year + 1);
            }

            const dateVal = formatDateISO(targetDate);
            const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
            const endIdx = startIdx + rawToken.length;
            addToken('date', rawToken, dateVal, dateVal, startIdx, endIdx);
        }
    }

    if (!tokens.some(t => t.type === 'date')) {
        // 'Oct 25th', 'October 25', 'Oct 25 2026'
        const monthDayRegex = /(?:^|\s)\b(?:on\s+)?(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?\b(?=\s|$)/gi;
        match = monthDayRegex.exec(text);
        if (match) {
            const rawToken = match[0].trim();
            const monthKey = match[1].toLowerCase();
            const monthIdx = MONTH_NAMES[monthKey];
            const day = parseInt(match[2], 10);
            const year = match[3] ? parseInt(match[3], 10) : refDate.getFullYear();

            const targetDate = new Date(year, monthIdx, day);
            if (!match[3] && targetDate < new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate())) {
                targetDate.setFullYear(year + 1);
            }

            const dateVal = formatDateISO(targetDate);
            const startIdx = match.index + (match[0].startsWith(' ') ? 1 : 0);
            const endIdx = startIdx + rawToken.length;
            addToken('date', rawToken, dateVal, dateVal, startIdx, endIdx);
        }
    }

    // Clean text by removing matched ranges in reverse order
    rangesToRemove.sort((a, b) => b.start - a.start);
    let clean = text;
    for (const r of rangesToRemove) {
        clean = clean.slice(0, r.start) + ' ' + clean.slice(r.end);
    }

    // Clean up extraneous whitespace and dangling prepositions ('at', 'on', 'in') at line ends
    clean = clean
        .replace(/\s+/g, ' ')
        .replace(/\s+(?:at|on|in|due)\s*$/i, '')
        .trim();

    const dateToken = tokens.find(t => t.type === 'date');
    const timeToken = tokens.find(t => t.type === 'time');
    const priorityToken = tokens.find(t => t.type === 'priority');
    const projectToken = tokens.find(t => t.type === 'project');
    const recurrenceToken = tokens.find(t => t.type === 'recurrence');

    return {
        cleanText: clean,
        originalText: text,
        tokens,
        scheduledDate: dateToken ? dateToken.value : null,
        scheduledTime: timeToken ? timeToken.value : null,
        priority: priorityToken ? priorityToken.value : null,
        projectId: projectToken ? projectToken.value : null,
        recurrence: recurrenceToken ? recurrenceToken.value : null
    };
};

/**
 * Remove a specific token's raw text from input text, preserving remaining text
 */
export const removeTokenFromText = (text, rawToken) => {
    if (!text || !rawToken) return text;
    const escaped = rawToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, 'i');
    return text.replace(regex, ' ').replace(/\s+/g, ' ').trim();
};
