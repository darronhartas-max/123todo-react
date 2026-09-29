import { getTodayDateString, getTomorrowDateString, getNextWeekDateString, parseDateString, formatDateString, formatDisplayTime, formatEvidentiaryTimestamp, isValidEvidentiaryTimestamp, promoteDueScheduledTasks } from './dateUtils';

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

    describe('promoteDueScheduledTasks', () => {
        test('promotes due scheduled task to the top of its priority list upon first appearance', () => {
            const today = '2026-09-21';
            const tasks = [
                { id: 1, text: 'Regular Task 1', priority: 1, scheduledDate: null },
                { id: 2, text: 'Regular Task 2', priority: 1, scheduledDate: null },
                { id: 3, text: 'Scheduled Today', priority: 1, scheduledDate: today }
            ];

            const result = promoteDueScheduledTasks(tasks, today);
            expect(result.map(t => t.id)).toEqual([3, 1, 2]);
            expect(result[0].promotedDate).toBe(today);
        });

        test('does not re-promote tasks that have already been marked as promoted', () => {
            const today = '2026-09-21';
            // Suppose user reordered task 3 below task 1
            const tasks = [
                { id: 1, text: 'Regular Task 1', priority: 1, scheduledDate: null },
                { id: 3, text: 'Scheduled Today', priority: 1, scheduledDate: today, promotedDate: today },
                { id: 2, text: 'Regular Task 2', priority: 1, scheduledDate: null }
            ];

            const result = promoteDueScheduledTasks(tasks, today);
            // Must preserve the user's reordered array without snapping to top
            expect(result.map(t => t.id)).toEqual([1, 3, 2]);
        });

        test('orders multiple due tasks on same date with timed tasks first chronologically', () => {
            const today = '2026-09-21';
            const tasks = [
                { id: 1, text: 'Regular Task 1', priority: 1, scheduledDate: null },
                { id: 2, text: 'All-Day Scheduled Today', priority: 1, scheduledDate: today, scheduledTime: null },
                { id: 3, text: 'Afternoon Task', priority: 1, scheduledDate: today, scheduledTime: '14:30' },
                { id: 4, text: 'Morning Task', priority: 1, scheduledDate: today, scheduledTime: '09:00' }
            ];

            const result = promoteDueScheduledTasks(tasks, today);
            // Morning (09:00), then Afternoon (14:30), then All-Day (no time), then regular task
            expect(result.map(t => t.id)).toEqual([4, 3, 2, 1]);
        });
    });

    describe('formatDisplayTime', () => {
        test('formats 24-hour style for UK, ISO, and UK_TEXT', () => {
            expect(formatDisplayTime('14:30', 'UK')).toBe('14:30');
            expect(formatDisplayTime('09:05', 'UK')).toBe('09:05');
            expect(formatDisplayTime('00:00', 'ISO')).toBe('00:00');
            expect(formatDisplayTime('23:59', 'UK_TEXT')).toBe('23:59');
            expect(formatDisplayTime('12:00', 'UK')).toBe('12:00');
        });

        test('formats 12-hour style with AM/PM for US and US_TEXT', () => {
            expect(formatDisplayTime('14:30', 'US')).toBe('2:30 PM');
            expect(formatDisplayTime('09:05', 'US')).toBe('9:05 AM');
            expect(formatDisplayTime('00:00', 'US')).toBe('12:00 AM');
            expect(formatDisplayTime('12:00', 'US')).toBe('12:00 PM');
            expect(formatDisplayTime('23:59', 'US_TEXT')).toBe('11:59 PM');
            expect(formatDisplayTime('00:30', 'US_TEXT')).toBe('12:30 AM');
        });

        test('handles invalid or empty inputs gracefully', () => {
            expect(formatDisplayTime('')).toBe('');
            expect(formatDisplayTime(null)).toBe('');
            expect(formatDisplayTime(undefined)).toBe('');
            expect(formatDisplayTime('invalid')).toBe('invalid');
        });
    });
});


