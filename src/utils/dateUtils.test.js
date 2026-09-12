import { getTodayDateString, getTomorrowDateString, getNextWeekDateString, parseDateString, formatDateString, formatEvidentiaryTimestamp, isValidEvidentiaryTimestamp } from './dateUtils';

describe('dateUtils - scheduling helpers', () => {
    test('getTomorrowDateString calculates exactly 1 day from today', () => {
        const todayStr = getTodayDateString();
        const tomorrowStr = getTomorrowDateString();

        const todayDate = parseDateString(todayStr);
        const tomorrowDate = parseDateString(tomorrowStr);

        const diffTime = Math.abs(tomorrowDate - todayDate);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        expect(diffDays).toBe(1);
    });

    test('getNextWeekDateString returns the Monday of the following week', () => {
        const nextWeekStr = getNextWeekDateString();
        const nextWeekDate = parseDateString(nextWeekStr);

        // Always a Monday (1)
        expect(nextWeekDate.getDay()).toBe(1);
    });

    test('getNextWeekDateString calculates Monday of the following week for all days of week', () => {
        // Sep 2026: Mon 7, Tue 8, Wed 9, Thu 10, Fri 11, Sat 12, Sun 13 -> All link to Mon 14 Sep 2026
        expect(getNextWeekDateString(new Date(2026, 8, 7))).toBe('2026-09-14'); // Monday (+7 days)
        expect(getNextWeekDateString(new Date(2026, 8, 8))).toBe('2026-09-14'); // Tuesday (+6 days)
        expect(getNextWeekDateString(new Date(2026, 8, 9))).toBe('2026-09-14'); // Wednesday (+5 days)
        expect(getNextWeekDateString(new Date(2026, 8, 10))).toBe('2026-09-14'); // Thursday (+4 days)
        expect(getNextWeekDateString(new Date(2026, 8, 11))).toBe('2026-09-14'); // Friday (+3 days)
        expect(getNextWeekDateString(new Date(2026, 8, 12))).toBe('2026-09-14'); // Saturday (+2 days)
        expect(getNextWeekDateString(new Date(2026, 8, 13))).toBe('2026-09-14'); // Sunday (+1 day)
    });

    test('formatEvidentiaryTimestamp produces readable date and time string', () => {
        const ts = new Date(2026, 8, 10, 15, 30, 45).getTime(); // 10 Sep 2026 15:30:45
        const formatted = formatEvidentiaryTimestamp(ts);
        expect(formatted).toContain('10 Sep 2026');
        expect(formatted).toContain('15:30:45');
    });

    test('formatEvidentiaryTimestamp handles empty or invalid values gracefully', () => {
        expect(formatEvidentiaryTimestamp(null)).toBe('');
        expect(formatEvidentiaryTimestamp(undefined)).toBe('');
        expect(formatEvidentiaryTimestamp('invalid-date')).toBe('');
        expect(formatEvidentiaryTimestamp(1)).toBe(''); // sequential counter ID, not an epoch timestamp
        expect(formatEvidentiaryTimestamp(42)).toBe('');
        expect(formatEvidentiaryTimestamp(new Date('1970-01-01').getTime())).toBe('');
    });

    test('isValidEvidentiaryTimestamp accurately validates truthful modern timestamps', () => {
        expect(isValidEvidentiaryTimestamp(null)).toBe(false);
        expect(isValidEvidentiaryTimestamp(undefined)).toBe(false);
        expect(isValidEvidentiaryTimestamp(1)).toBe(false); // sequential counter ID
        expect(isValidEvidentiaryTimestamp('42')).toBe(false);
        expect(isValidEvidentiaryTimestamp(new Date('1970-01-01').getTime())).toBe(false);
        expect(isValidEvidentiaryTimestamp(new Date('2019-12-31').getTime())).toBe(false);
        expect(isValidEvidentiaryTimestamp(new Date('2026-09-12').getTime())).toBe(true);
        expect(isValidEvidentiaryTimestamp('2026-09-12T10:00:00.000Z')).toBe(true);
    });
});
