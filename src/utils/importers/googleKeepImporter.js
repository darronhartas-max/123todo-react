/**
 * Google Keep JSON Importer
 * Parses Google Keep Takeout JSON files (single or multiple dropped JSON files/archives)
 * into 123 ToDo tasks and notes.
 */

export const parseGoogleKeepJSON = (keepDataList, defaultProject = 'General') => {
    if (!keepDataList) return [];

    // Standardize input into array of JSON objects
    let rawObjects = [];
    if (Array.isArray(keepDataList)) {
        rawObjects = keepDataList;
    } else if (typeof keepDataList === 'string') {
        try {
            const parsed = JSON.parse(keepDataList);
            rawObjects = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            return [];
        }
    } else if (typeof keepDataList === 'object') {
        rawObjects = [keepDataList];
    }

    const tasks = [];
    const timestamp = Date.now();

    rawObjects.forEach((item, index) => {
        if (!item || typeof item !== 'object') return;
        if (item.isTrashed) return; // Skip trashed notes

        let title = item.title ? item.title.trim() : '';
        let textContent = item.textContent ? item.textContent.trim() : '';

        // Extract subtasks/checklists if item is a Keep checklist
        const subtasks = [];
        if (Array.isArray(item.listContent)) {
            item.listContent.forEach((checkItem, checkIdx) => {
                if (checkItem && checkItem.text) {
                    subtasks.push({
                        id: `keep_sub_${timestamp}_${index}_${checkIdx}`,
                        text: checkItem.text.trim(),
                        completed: Boolean(checkItem.isChecked)
                    });
                }
            });
        }

        // If no title was set, derive title from first line of note body or checklist
        if (!title) {
            if (textContent) {
                const lines = textContent.split('\n');
                title = lines[0].slice(0, 80);
                if (lines.length > 1) {
                    textContent = lines.slice(1).join('\n');
                } else {
                    textContent = '';
                }
            } else if (subtasks.length > 0) {
                title = `List: ${subtasks[0].text}`;
            } else {
                title = `Note #${index + 1}`;
            }
        }

        // Extract label/project
        let projectName = defaultProject;
        if (Array.isArray(item.labels) && item.labels.length > 0 && item.labels[0].name) {
            projectName = item.labels[0].name;
        }

        const isCompleted = Boolean(item.isArchived);

        tasks.push({
            id: `keep_${timestamp}_${index}_${Math.random().toString(36).substr(2, 6)}`,
            text: title,
            priority: 'p2', // Default to P2 (Should Do) for imported notes
            project: projectName,
            completed: isCompleted,
            notes: textContent,
            subtasks: subtasks,
            createdAt: item.userEditedTimestampUsec 
                ? new Date(Math.floor(item.userEditedTimestampUsec / 1000)).toISOString() 
                : new Date().toISOString()
        });
    });

    return tasks;
};
