/**
 * Google Tasks & Microsoft To Do Importer
 * Parses Google Tasks JSON (Google Takeout) and Microsoft To Do CSV/JSON exports.
 */

export const parseGoogleTasksJSON = (jsonInput, defaultProject = 'General') => {
    if (!jsonInput) return [];

    let parsed = null;
    if (typeof jsonInput === 'string') {
        try {
            parsed = JSON.parse(jsonInput);
        } catch (e) {
            return [];
        }
    } else {
        parsed = jsonInput;
    }

    const items = parsed.items || (Array.isArray(parsed) ? parsed : [parsed]);
    const tasks = [];
    const timestamp = Date.now();

    items.forEach((item, index) => {
        if (!item || typeof item !== 'object') return;
        const title = item.title ? item.title.trim() : '';
        if (!title) return;

        const notes = item.notes ? item.notes.trim() : '';
        const isCompleted = item.status === 'completed' || Boolean(item.completed);
        const rawDue = item.due || item.dueDate;

        tasks.push({
            id: `gtasks_${timestamp}_${index}_${Math.random().toString(36).substr(2, 6)}`,
            text: title,
            priority: 'p2',
            project: item.listName || defaultProject,
            completed: isCompleted,
            notes: notes,
            dueDate: rawDue ? rawDue.split('T')[0] : null,
            subtasks: [],
            createdAt: item.updated || new Date().toISOString()
        });
    });

    return tasks;
};

export const parseMicrosoftToDoCSV = (csvText, defaultProject = 'General') => {
    if (!csvText || typeof csvText !== 'string') return [];

    const lines = csvText.split(/\r?\n/);
    if (lines.length <= 1) return [];

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
    
    const findIndex = (possibleNames) => {
        return header.findIndex(h => possibleNames.some(name => h.includes(name)));
    };

    const titleIdx = findIndex(['taskname', 'title', 'subject', 'name']);
    const notesIdx = findIndex(['notes', 'body', 'description', 'content']);
    const listIdx = findIndex(['listname', 'list', 'folder', 'category']);
    const dueIdx = findIndex(['duedate', 'due']);
    const importanceIdx = findIndex(['importance', 'priority']);
    const completedIdx = findIndex(['completed', 'status']);

    const tasks = [];
    const timestamp = Date.now();

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const row = parseCSVRow(line);
        const title = titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : '';
        if (!title) continue;

        const notes = (notesIdx !== -1 && row[notesIdx]) ? row[notesIdx] : '';
        const listName = (listIdx !== -1 && row[listIdx]) ? row[listIdx] : defaultProject;
        const rawDue = (dueIdx !== -1 && row[dueIdx]) ? row[dueIdx] : '';
        const rawImportance = (importanceIdx !== -1 && row[importanceIdx]) ? row[importanceIdx].toLowerCase() : '';
        const rawCompleted = (completedIdx !== -1 && row[completedIdx]) ? row[completedIdx].toLowerCase() : '';

        let priority = 'p2';
        if (rawImportance.includes('high') || rawImportance.includes('important') || rawImportance === '1') {
            priority = 'p1';
        } else if (rawImportance.includes('low') || rawImportance === '3') {
            priority = 'p3';
        }

        const isCompleted = rawCompleted.includes('completed') || rawCompleted === 'true' || rawCompleted === 'yes';

        tasks.push({
            id: `mstodo_${timestamp}_${i}_${Math.random().toString(36).substr(2, 6)}`,
            text: title,
            priority,
            project: listName,
            completed: isCompleted,
            notes: notes,
            dueDate: rawDue ? rawDue.split('T')[0] : null,
            subtasks: [],
            createdAt: new Date().toISOString()
        });
    }

    return tasks;
};
