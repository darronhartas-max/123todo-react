import { parseGoogleTasksJSON, parseMicrosoftToDoCSV } from './googleTasksImporter';

describe('Google Tasks & MS To Do Importer', () => {
    test('parses Google Tasks JSON correctly', () => {
        const json = {
            items: [
                { title: 'Submit Tax Return', notes: 'Include receipts', status: 'needsAction', due: '2026-10-15T00:00:00.000Z' }
            ]
        };
        const tasks = parseGoogleTasksJSON(json);
        expect(tasks.length).toBe(1);
        expect(tasks[0].text).toBe('Submit Tax Return');
        expect(tasks[0].notes).toBe('Include receipts');
        expect(tasks[0].dueDate).toBe('2026-10-15');
    });

    test('parses Microsoft To Do CSV correctly', () => {
        const csv = `Task Name,Notes,Importance,Completed,List Name
Deploy App,Server deployment,High,false,Work`;
        const tasks = parseMicrosoftToDoCSV(csv);
        expect(tasks.length).toBe(1);
        expect(tasks[0].text).toBe('Deploy App');
        expect(tasks[0].priority).toBe('p1');
        expect(tasks[0].project).toBe('Work');
    });
});
