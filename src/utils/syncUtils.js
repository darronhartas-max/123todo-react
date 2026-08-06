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

  const localDeletedProjects = Array.isArray(localData.deletedProjects) ? localData.deletedProjects : [];
  const remoteDeletedProjects = Array.isArray(remoteData.deletedProjects) ? remoteData.deletedProjects : [];
  const mergedDeletedProjects = Array.from(new Set([...localDeletedProjects, ...remoteDeletedProjects]));

  // 1. Merge Projects
  const projectMap = new Map();
  // Ensure default General project exists
  projectMap.set('general', { id: 'general', name: 'General', color: '#285a82' });

  [...remoteProjects, ...localProjects].forEach(p => {
    if (!p || !p.id || p.id === 'all') return;
    if (mergedDeletedProjects.includes(p.id)) return; // Ignore deleted project
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
      if ((t.completedAt || t.updatedAt || 0) >= (existing.completedAt || existing.updatedAt || 0)) {
        archivedMap.set(key, { ...existing, ...t });
      }
    }
  });

  // 3. Merge Active Tasks & Resolve Active vs Archived Conflicts
  const activeTaskMap = new Map();

  [...remoteTasks, ...localTasks].forEach(t => {
    if (!t || !t.text) return;
    const contentKey = getTaskKey(t);
    const key = t.id ? `id_${t.id}` : contentKey;

    // Check if task exists in archivedMap (by ID or content key)
    const archivedKey = (t.id && archivedMap.has(`id_${t.id}`)) 
      ? `id_${t.id}` 
      : (contentKey && archivedMap.has(contentKey) ? contentKey : null);

    if (archivedKey) {
      const archivedTask = archivedMap.get(archivedKey);
      const isLocallyActive = localTasks.some(lt => lt.id === t.id || (contentKey && getTaskKey(lt) === contentKey));
      const activeTimestamp = t.restoredAt || t.updatedAt || (isLocallyActive ? (localData.timestamp || Date.now()) : 0);
      const archivedTimestamp = archivedTask.completedAt || archivedTask.updatedAt || 0;

      if (activeTimestamp >= archivedTimestamp) {
        // Active/Restored version is newer than or equal to archived completion -> Active WINS
        archivedMap.delete(archivedKey);
      } else {
        // Archived version is newer -> Remains archived
        return;
      }
    }

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
        recurrence: t.recurrence || existing.recurrence,
        restoredAt: t.restoredAt || existing.restoredAt
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
    deletedProjects: mergedDeletedProjects,
    counter: currentCounter,
    timestamp: Date.now()
  };
};
