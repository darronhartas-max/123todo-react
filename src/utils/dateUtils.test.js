import { getTodayDateString, getTomorrowDateString, getNextWeekDateString, parseDateString, formatDateString, formatEvidentiaryTimestamp } from './dateUtils';

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

    test('getNextWeekDateString calculates exactly 7 days from today', () => {
        const todayStr = getTodayDateString();
        const nextWeekStr = getNextWeekDateString();

        const todayDate = parseDateString(todayStr);
        const nextWeekDate = parseDateString(nextWeekStr);

        const diffTime = Math.abs(nextWeekDate - todayDate);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        expect(diffDays).toBe(7);
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
    });
});
