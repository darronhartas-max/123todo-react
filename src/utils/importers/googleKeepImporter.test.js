import { parseGoogleKeepJSON } from './googleKeepImporter';

describe('Google Keep Importer', () => {
    test('parses Google Keep JSON note objects correctly', () => {
        const keepItems = [
            {
                title: 'Project Ideas',
                textContent: '1. Build new PWA\n2. Add multi-importer',
                labels: [{ name: 'Ideas' }],
                isArchived: false
            },
            {
                title: 'Shopping Checklist',
                listContent: [
                    { text: 'Apples', isChecked: false },
                    { text: 'Bananas', isChecked: true }
                ],
                labels: [{ name: 'Personal' }]
            }
        ];

        const tasks = parseGoogleKeepJSON(keepItems);
        expect(tasks.length).toBe(2);

        expect(tasks[0].text).toBe('Project Ideas');
        expect(tasks[0].project).toBe('Ideas');
        expect(tasks[0].notes).toBe('1. Build new PWA\n2. Add multi-importer');

        expect(tasks[1].text).toBe('Shopping Checklist');
        expect(tasks[1].project).toBe('Personal');
        expect(tasks[1].subtasks.length).toBe(2);
        expect(tasks[1].subtasks[0].text).toBe('Apples');
        expect(tasks[1].subtasks[1].completed).toBe(true);
    });
});
