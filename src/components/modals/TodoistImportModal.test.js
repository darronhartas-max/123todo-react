import { parseTodoistFile } from './TodoistImportModal';

describe('Todoist CSV Import Parsing', () => {
    test('filters out view_style=list and metadata rows from Todoist CSV exports', () => {
        const sampleCSV = `TYPE,CONTENT,DESCRIPTION,PRIORITY,INDENT,AUTHOR,RESPONSIBLE,DATE,DATE_LANG,TIMEZONE
task,view_style=list,,,,,,,,
task,Buy groceries,Weekly grocery shopping,1,1,,,,,
task,view_style=board,,,,,,,,
task,Call electrician,,2,1,,,,,
section,Project Backlog,,,,,,,,
note,Some internal note,,,,,,,,`;

        const result = parseTodoistFile('work-tasks.csv', sampleCSV);

        expect(result.tasks).toHaveLength(2);
        expect(result.tasks.map(t => t.text)).toEqual(['Buy groceries', 'Call electrician']);
        expect(result.tasks.some(t => t.text.includes('view_style'))).toBe(false);
    });
});
