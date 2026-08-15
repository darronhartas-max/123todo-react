/**
 * TickTick CSV Export Parser
 * Converts TickTick CSV backup exports into 123 ToDo task objects.
 */

export const parseTickTickCSV = (csvText, defaultProject = 'General') => {
    if (!csvText || typeof csvText !== 'string') return [];

    const lines = csvText.split(/\r?\n/);
    if (lines.length <= 1) return [];

    // Simple robust CSV row splitter supporting quoted cells with commas
    const parseCSVRow = (line) => {
        const row = [];
        let insideQuote = false;
        let currentCell = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (insideQuote && line[i + 1] === '"') {
                    currentCell += '"';
                    i++;
                } else {
                    insideQuote = !insideQuote;
                }
            } else if (char === ',' && !insideQuote) {
                row.push(currentCell.trim());
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        row.push(currentCell.trim());
        return row;
    };

    const header = parseCSVRow(lines[0]).map(h => h.toLowerCase().replace(/[\s_]+/g, ''));
    
    const findExactOrIncludesIndex = (names) => {
        // Try exact match first
        for (const name of names) {
            const idx = header.findIndex(h => h === name);
            if (idx !== -1) return idx;
        }
        // Fallback to startsWith or includes
        for (const name of names) {
            const idx = header.findIndex(h => h.startsWith(name) || h.endsWith(name));
            if (idx !== -1) return idx;
        }
        return -1;
    };

    const listIdx = findExactOrIncludesIndex(['listname', 'foldername', 'list', 'folder', 'project']);
    const titleIdx = findExactOrIncludesIndex(['title', 'task', 'taskname', 'subject']);
    const contentIdx = findExactOrIncludesIndex(['content', 'note', 'notes', 'description', 'details']);
    const priorityIdx = findExactOrIncludesIndex(['priority']);
    const dueDateIdx = findExactOrIncludesIndex(['duedate', 'due']);
    const statusIdx = findExactOrIncludesIndex(['status', 'completed', 'iscompleted']);

    const tasks = [];
    const timestamp = Date.now();

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const row = parseCSVRow(line);
        const title = titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : '';
        if (!title) continue;

        const projectName = (listIdx !== -1 && row[listIdx]) ? row[listIdx] : defaultProject;
        const notes = (contentIdx !== -1 && row[contentIdx]) ? row[contentIdx] : '';
        const rawPriority = (priorityIdx !== -1 && row[priorityIdx]) ? row[priorityIdx].toLowerCase() : '';
        const rawDueDate = (dueDateIdx !== -1 && row[dueDateIdx]) ? row[dueDateIdx] : '';
        const rawStatus = (statusIdx !== -1 && row[statusIdx]) ? row[statusIdx].toLowerCase() : '';

        // Map TickTick priority (5/high -> p1, 3/medium -> p2, 1/low -> p3, 0/none -> p4)
        let priority = 'p2';
        if (rawPriority.includes('high') || rawPriority === '5') {
            priority = 'p1';
        } else if (rawPriority.includes('med') || rawPriority === '3' || rawPriority === '2') {
            priority = 'p2';
        } else if (rawPriority.includes('low') || rawPriority === '1') {
            priority = 'p3';
        } else if (rawPriority.includes('none') || rawPriority === '0') {
            priority = 'p4';
        }

        const isCompleted = rawStatus === '2' || rawStatus === '1' || rawStatus.includes('completed') || rawStatus === 'true';

        tasks.push({
            id: `ticktick_${timestamp}_${i}_${Math.random().toString(36).substr(2, 6)}`,
            text: title,
            priority,
            project: projectName,
            completed: isCompleted,
            notes: notes,
            dueDate: rawDueDate ? rawDueDate.split('T')[0] : null,
            subtasks: [],
            createdAt: new Date().toISOString()
        });
    }

    return tasks;
};
