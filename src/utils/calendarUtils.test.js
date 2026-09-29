import { formatGoogleCalendarDates, generateGoogleCalendarUrl, generateIcsContent } from './calendarUtils';

describe('calendarUtils', () => {
    describe('formatGoogleCalendarDates', () => {
        test('formats all-day event dates correctly', () => {
            // 2026-10-15 all day -> 20261015/20261016
            expect(formatGoogleCalendarDates('2026-10-15', null)).toBe('20261015/20261016');
        });

        test('formats timed event dates correctly with 30-min duration', () => {
            // 2026-10-15 at 14:30 -> 20261015T143000/20261015T150000
            expect(formatGoogleCalendarDates('2026-10-15', '14:30')).toBe('20261015T143000/20261015T150000');
            // 2026-10-15 at 23:45 -> 20261015T234500/20261015T001500
            expect(formatGoogleCalendarDates('2026-10-15', '23:45')).toBe('20261015T234500/20261015T001500');
        });

        test('returns empty string if no scheduled date', () => {
            expect(formatGoogleCalendarDates(null)).toBe('');
        });
    });

    describe('generateGoogleCalendarUrl', () => {
        test('generates valid Google Calendar URL for all-day task', () => {
            const url = generateGoogleCalendarUrl({
                title: 'Review Quarterly Report',
                scheduledDate: '2026-10-15',
                notes: 'Check revenue projections'
            });

            expect(url).toContain('https://calendar.google.com/calendar/render?');
            expect(url).toContain('action=TEMPLATE');
            expect(url).toContain('text=Review+Quarterly+Report');
            expect(url).toContain('dates=20261015%2F20261016');
            expect(url).toContain('details=Check+revenue+projections');
        });

        test('generates valid Google Calendar URL for timed task', () => {
            const url = generateGoogleCalendarUrl({
                title: 'Dentist Checkup',
                scheduledDate: '2026-10-15',
                scheduledTime: '10:15',
                notes: 'Dr Smith clinic'
            });

            expect(url).toContain('dates=20261015T101500%2F20261015T104500');
        });
    });

    describe('generateIcsContent', () => {
        test('generates valid RFC 5545 iCalendar content with alarm', () => {
            const ics = generateIcsContent({
                title: 'Client Meeting, Notes & Plan',
                scheduledDate: '2026-10-15',
                scheduledTime: '15:00',
                notes: 'Discuss scope;\nReview budget'
            });

            expect(ics).toContain('BEGIN:VCALENDAR');
            expect(ics).toContain('VERSION:2.0');
            expect(ics).toContain('BEGIN:VEVENT');
            expect(ics).toContain('DTSTART:20261015T150000');
            expect(ics).toContain('DTEND:20261015T153000');
            expect(ics).toContain('SUMMARY:Client Meeting\\, Notes & Plan');
            expect(ics).toContain('DESCRIPTION:Discuss scope\\;\\nReview budget');
            expect(ics).toContain('BEGIN:VALARM');
            expect(ics).toContain('TRIGGER:-PT15M');
            expect(ics).toContain('END:VEVENT');
            expect(ics).toContain('END:VCALENDAR');
        });

        test('generates all-day iCalendar content', () => {
            const ics = generateIcsContent({
                title: 'Project Deadline',
                scheduledDate: '2026-10-15',
                scheduledTime: null
            });

            expect(ics).toContain('DTSTART;VALUE=DATE:20261015');
            expect(ics).toContain('DTEND;VALUE=DATE:20261016');
        });
    });
});
