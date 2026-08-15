import { parseTickTickCSV } from './ticktickImporter';

describe('TickTick Importer', () => {
    test('parses standard TickTick CSV export correctly', () => {
        const sampleCSV = `List Name,Title,Content,Priority,Status,Due Date
Work,Finish Report,High priority quarterly review,High,0,2026-09-01
Personal,Buy Groceries,Milk and Bread,Low,Completed,2026-08-20`;

        const tasks = parseTickTickCSV(sampleCSV);
        expect(tasks.length).toBe(2);

        expect(tasks[0].text).toBe('Finish Report');
        expect(tasks[0].project).toBe('Work');
        expect(tasks[0].priority).toBe('p1');
        expect(tasks[0].notes).toBe('High priority quarterly review');

        expect(tasks[1].text).toBe('Buy Groceries');
        expect(tasks[1].project).toBe('Personal');
        expect(tasks[1].completed).toBe(true);
        expect(tasks[1].priority).toBe('p3');
    });

    test('returns empty array for invalid CSV', () => {
        expect(parseTickTickCSV('')).toEqual([]);
        expect(parseTickTickCSV(null)).toEqual([]);
    });
});
