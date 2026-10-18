import { parseQuickAdd, removeTokenFromText, formatDateISO } from './nlpParser';

describe('nlpParser', () => {
    const mockProjects = [
        { id: 'work', name: 'Work', color: '#b91c1c' },
        { id: 'personal', name: 'Personal', color: '#10b981' },
        { id: 'side-hustle', name: 'Side Hustle', color: '#f59e0b' }
    ];

    const fixedRefDate = new Date(2026, 9, 18); // Sunday, Oct 18, 2026

    test('handles empty or non-string inputs safely', () => {
        expect(parseQuickAdd('')).toEqual({
            cleanText: '',
            originalText: '',
            tokens: [],
            scheduledDate: null,
            scheduledTime: null,
            priority: null,
            projectId: null,
            recurrence: null
        });

        expect(parseQuickAdd(null).cleanText).toBe('');
    });

    test('extracts priority markers (!1, p2, !must, etc.)', () => {
        const res1 = parseQuickAdd('Submit quarterly tax return !1');
        expect(res1.priority).toBe(1);
        expect(res1.cleanText).toBe('Submit quarterly tax return');

        const res2 = parseQuickAdd('Buy groceries p2');
        expect(res2.priority).toBe(2);
        expect(res2.cleanText).toBe('Buy groceries');

        const res3 = parseQuickAdd('!3 Vacuum living room');
        expect(res3.priority).toBe(3);
        expect(res3.cleanText).toBe('Vacuum living room');

        const res4 = parseQuickAdd('Watch documentary !hold');
        expect(res4.priority).toBe(4);
        expect(res4.cleanText).toBe('Watch documentary');
    });

    test('extracts matching project hashtag (#Work, #Personal, etc.)', () => {
        const res = parseQuickAdd('Write proposal for client #Work', mockProjects);
        expect(res.projectId).toBe('work');
        expect(res.cleanText).toBe('Write proposal for client');

        const res2 = parseQuickAdd('Fix website layout #SideHustle', mockProjects);
        expect(res2.projectId).toBe('side-hustle');
        expect(res2.cleanText).toBe('Fix website layout');

        // Non-existent project hashtag should not be consumed as project
        const res3 = parseQuickAdd('Post photo with #inspiration tag', mockProjects);
        expect(res3.projectId).toBeNull();
        expect(res3.cleanText).toBe('Post photo with #inspiration tag');
    });

    test('extracts relative and named dates (today, tomorrow, weekday names)', () => {
        const resToday = parseQuickAdd('Call plumber today', mockProjects, { referenceDate: fixedRefDate });
        expect(resToday.scheduledDate).toBe('2026-10-18');
        expect(resToday.cleanText).toBe('Call plumber');

        const resTmrw = parseQuickAdd('Ship package tomorrow', mockProjects, { referenceDate: fixedRefDate });
        expect(resTmrw.scheduledDate).toBe('2026-10-19');
        expect(resTmrw.cleanText).toBe('Ship package');

        // Oct 18, 2026 is Sunday. Friday is Oct 23, 2026 (+5 days)
        const resFri = parseQuickAdd('Review sprint backlog friday', mockProjects, { referenceDate: fixedRefDate });
        expect(resFri.scheduledDate).toBe('2026-10-23');
        expect(resFri.cleanText).toBe('Review sprint backlog');

        const resInDays = parseQuickAdd('Follow up in 3 days', mockProjects, { referenceDate: fixedRefDate });
        expect(resInDays.scheduledDate).toBe('2026-10-21');
        expect(resInDays.cleanText).toBe('Follow up');
    });

    test('extracts explicit dates (25th Oct, Oct 25, ISO)', () => {
        const res1 = parseQuickAdd('Dentist checkup 25th Oct', mockProjects, { referenceDate: fixedRefDate });
        expect(res1.scheduledDate).toBe('2026-10-25');
        expect(res1.cleanText).toBe('Dentist checkup');

        const res2 = parseQuickAdd('Renew passport 2026-11-05', mockProjects, { referenceDate: fixedRefDate });
        expect(res2.scheduledDate).toBe('2026-11-05');
        expect(res2.cleanText).toBe('Renew passport');
    });

    test('extracts scheduled times (2pm, 14:30, morning, evening)', () => {
        const res1 = parseQuickAdd('Team sync at 2pm', mockProjects);
        expect(res1.scheduledTime).toBe('14:00');
        expect(res1.cleanText).toBe('Team sync');

        const res2 = parseQuickAdd('Sprint demo 14:30', mockProjects);
        expect(res2.scheduledTime).toBe('14:30');
        expect(res2.cleanText).toBe('Sprint demo');

        const res3 = parseQuickAdd('Morning standup in the morning', mockProjects);
        expect(res3.scheduledTime).toBe('09:00');
        expect(res3.cleanText).toBe('Morning standup');
    });

    test('extracts recurrence rules (daily, weekly, every 2 weeks, every weekday)', () => {
        const res1 = parseQuickAdd('Check server logs daily', mockProjects);
        expect(res1.recurrence).toEqual({ frequency: 1, interval: 'days', daysOfWeek: [] });
        expect(res1.cleanText).toBe('Check server logs');

        const res2 = parseQuickAdd('Water plants every 2 weeks', mockProjects);
        expect(res2.recurrence).toEqual({ frequency: 2, interval: 'weeks', daysOfWeek: [] });
        expect(res2.cleanText).toBe('Water plants');

        const res3 = parseQuickAdd('Standup every weekday', mockProjects);
        expect(res3.recurrence).toEqual({ frequency: 1, interval: 'weeks', daysOfWeek: [1, 2, 3, 4, 5] });
        expect(res3.cleanText).toBe('Standup');
    });

    test('parses full multi-entity power query correctly', () => {
        const query = 'Review quarterly financials tomorrow at 2pm #Work !1';
        const res = parseQuickAdd(query, mockProjects, { referenceDate: fixedRefDate });

        expect(res.cleanText).toBe('Review quarterly financials');
        expect(res.scheduledDate).toBe('2026-10-19');
        expect(res.scheduledTime).toBe('14:00');
        expect(res.projectId).toBe('work');
        expect(res.priority).toBe(1);
        expect(res.tokens.length).toBe(4);
    });

    test('removeTokenFromText cleans specific tokens correctly', () => {
        const raw = 'Dentist appointment tomorrow at 2pm #Personal !1';
        const cleaned = removeTokenFromText(raw, '!1');
        expect(cleaned).toBe('Dentist appointment tomorrow at 2pm #Personal');

        const cleaned2 = removeTokenFromText(cleaned, '#Personal');
        expect(cleaned2).toBe('Dentist appointment tomorrow at 2pm');
    });

    test('formatDateISO formats dates correctly', () => {
        const d = new Date(2026, 0, 5);
        expect(formatDateISO(d)).toBe('2026-01-05');
    });
});
