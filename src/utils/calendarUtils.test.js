import {
    formatGoogleCalendarDates,
    generateGoogleCalendarUrl,
    generateIcsContent,
    formatCalendarTitle,
    CALENDAR_TITLE_MAX_LENGTH
} from './calendarUtils';

describe('calendarUtils', () => {
    describe('formatCalendarTitle', () => {
        test('falls back to default title for empty or whitespace-only text', () => {
            expect(formatCalendarTitle('')).toBe('Scheduled Task');
            expect(formatCalendarTitle('   ')).toBe('Scheduled Task');
            expect(formatCalendarTitle(null)).toBe('Scheduled Task');
            expect(formatCalendarTitle(undefined)).toBe('Scheduled Task');
        });

        test('preserves concise titles under or equal to max length as-is', () => {
            expect(formatCalendarTitle('Buy groceries')).toBe('Buy groceries');
            expect(formatCalendarTitle('Dentist appointment')).toBe('Dentist appointment');
        });

        test('normalizes multiple spaces and line breaks into a clean single line', () => {
            expect(formatCalendarTitle('Call client\n\nabout proposal  details')).toBe(
                'Call client about proposal details'
            );
        });

        test('truncates titles over 40 characters at a clean word boundary without trailing ellipses', () => {
            const longTask = 'Dentist appointment at St Mary\'s clinic on High Street to fix dental crown';
            const result = formatCalendarTitle(longTask);

            expect(result.length).toBeLessThanOrEqual(CALENDAR_TITLE_MAX_LENGTH);
            expect(result).toBe('Dentist appointment at St Mary\'s clinic');
            expect(result).not.toContain('...');
        });

        test('cleans trailing punctuation when truncating', () => {
            const taskWithPunctuation = 'Review project quarterly financials, and check current bank balance thoroughly';
            const result = formatCalendarTitle(taskWithPunctuation);

            expect(result.length).toBeLessThanOrEqual(CALENDAR_TITLE_MAX_LENGTH);
            expect(result).toBe('Review project quarterly financials');
            expect(result.endsWith(',')).toBe(false);
            expect(result.endsWith('.')).toBe(false);
        });
    });

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

        test('truncates long title to 40 characters and preserves full task text in details', () => {
            const longTask = 'Complete annual performance reviews for all regional engineering team members';
            const url = generateGoogleCalendarUrl({
                title: longTask,
                scheduledDate: '2026-10-15',
                notes: 'Bring rubric'
            });

            // Title is concise (under 40 chars)
            expect(url).toContain('text=Complete+annual+performance+reviews');
            // Full original task is preserved in details
            expect(url).toContain('Task%3A+Complete+annual+performance+reviews+for+all+regional+engineering+team+members');
            expect(url).toContain('Bring+rubric');
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

        test('truncates long summary and includes full task text in iCalendar description', () => {
            const longTask = 'Prepare quarterly investor deck with updated growth metrics and forecast';
            const ics = generateIcsContent({
                title: longTask,
                scheduledDate: '2026-10-15',
                scheduledTime: '11:00'
            });

            expect(ics).toContain('SUMMARY:Prepare quarterly investor deck with');
            expect(ics).toContain('DESCRIPTION:Task: Prepare quarterly investor deck with updated growth metrics and forecast');
        });
    });
});
