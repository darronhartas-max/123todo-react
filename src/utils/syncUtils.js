/**
 * Utility functions for 2-way Google Drive data sync merging and conflict resolution.
 */

/**
 * Performs a 2-way merge of local device data and remote Google Drive data.
 * Guarantees that new tasks, completed tasks, or projects added offline on any device
 * are preserved and merged, preventing data loss across devices.
 */
export const mergeSyncDatasets = (localData = {}, remoteData = {}) => {
  const localTasks = Array.isArray(localData.tasks) ? localData.tasks : [];
  const remoteTasks = Array.isArray(remoteData.tasks) ? remoteData.tasks : [];
  const localArchived = Array.isArray(localData.archived) ? localData.archived : [];
  const remoteArchived = Array.isArray(remoteData.archived) ? remoteData.archived : [];
  const localProjects = Array.isArray(localData.projects) ? localData.projects : [];
  const remoteProjects = Array.isArray(remoteData.projects) ? remoteData.projects : [];

  // 1. Merge Projects
  const projectMap = new Map();
  // Ensure default General project exists
  projectMap.set('general', { id: 'general', name: 'General', color: '#285a82' });

  [...remoteProjects, ...localProjects].forEach(p => {
    if (!p || !p.id || p.id === 'all') return;
    if (!projectMap.has(p.id)) {
      projectMap.set(p.id, { ...p });
    } else {
      const existing = projectMap.get(p.id);
      projectMap.set(p.id, {
        ...existing,
        ...p,
        name: p.name || existing.name,
        color: p.color || existing.color
      });
    }
  });
  const mergedProjects = Array.from(projectMap.values());

  // Helper key to uniquely identify tasks across devices
  const getTaskKey = (t) => {
    if (!t) return null;
    const cleanText = (t.text || '').trim().toLowerCase();
    const projId = t.projectId || t.categoryId || 'general';
    return `${cleanText}::${projId}`;
  };

  // 2. Merge Archived Tasks
  const archivedMap = new Map();
  [...remoteArchived, ...localArchived].forEach(t => {
    if (!t || !t.text) return;
    const key = t.id ? `id_${t.id}` : getTaskKey(t);
    if (!archivedMap.has(key)) {
      archivedMap.set(key, t);
    } else {
      const existing = archivedMap.get(key);
      if ((t.completedAt || 0) >= (existing.completedAt || 0)) {
        archivedMap.set(key, { ...existing, ...t });
      }
    }
  });

  const archivedContentKeys = new Set(
    Array.from(archivedMap.values()).map(t => getTaskKey(t)).filter(Boolean)
  );

  // 3. Merge Active Tasks
  const activeTaskMap = new Map();

  [...remoteTasks, ...localTasks].forEach(t => {
    if (!t || !t.text) return;
    const contentKey = getTaskKey(t);

    // If task has been archived on either device, treat as archived
    if (contentKey && archivedContentKeys.has(contentKey)) {
      return;
    }

    const key = t.id ? `id_${t.id}` : contentKey;

    if (!activeTaskMap.has(key)) {
      activeTaskMap.set(key, t);
    } else {
      const existing = activeTaskMap.get(key);
      // Merge updates: retain subtasks, notes, recurrence, scheduling, and priority updates
      const mergedTask = {
        ...existing,
        ...t,
        notes: (t.notes && t.notes.trim()) ? t.notes : (existing.notes || ''),
        priority: t.priority !== undefined ? t.priority : existing.priority,
        projectId: t.projectId || t.categoryId || existing.projectId || 'general',
        scheduledDate: t.scheduledDate || existing.scheduledDate,
        subtasks: (t.subtasks && t.subtasks.length > 0) ? t.subtasks : (existing.subtasks || []),
        isRecurring: t.isRecurring !== undefined ? t.isRecurring : existing.isRecurring,
        recurrence: t.recurrence || existing.recurrence
      };
      activeTaskMap.set(key, mergedTask);
    }
  });

  const mergedActiveRaw = Array.from(activeTaskMap.values());
  const mergedArchivedRaw = Array.from(archivedMap.values());

  // 4. Resolve ID collisions & Sanitize Task IDs
  const usedIds = new Set();
  let maxId = Math.max(localData.counter || 0, remoteData.counter || 0, 0);

  const scanMax = (list) => {
    list.forEach(t => {
      if (t && typeof t.id === 'number' && t.id > maxId) {
        maxId = t.id;
      }
    });
  };
  scanMax(mergedActiveRaw);
  scanMax(mergedArchivedRaw);

  let currentCounter = maxId;

  const sanitize = (list) => {
    return list.map(t => {
      let id = t.id;
      if (id === undefined || id === null || usedIds.has(id)) {
        currentCounter++;
        id = currentCounter;
      } else {
        usedIds.add(id);
      }
      return {
        ...t,
        id,
        projectId: t.projectId || t.categoryId || 'general'
      };
    });
  };

  const finalTasks = sanitize(mergedActiveRaw);
  const finalArchived = sanitize(mergedArchivedRaw);

  return {
    tasks: finalTasks,
    archived: finalArchived,
    projects: mergedProjects,
    counter: currentCounter,
    timestamp: Date.now()
  };
};
