import { getTodayDateString, getNextWeekDateString, parseDateString, formatDateString } from './dateUtils';

describe('dateUtils - scheduling helpers', () => {
    test('getNextWeekDateString calculates exactly 7 days from today', () => {
        const todayStr = getTodayDateString();
        const nextWeekStr = getNextWeekDateString();

        const todayDate = parseDateString(todayStr);
        const nextWeekDate = parseDateString(nextWeekStr);

        const diffTime = Math.abs(nextWeekDate - todayDate);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        expect(diffDays).toBe(7);
    });
});
