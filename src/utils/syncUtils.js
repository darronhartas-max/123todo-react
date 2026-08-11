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

  const localDeletedTaskKeys = Array.isArray(localData.deletedTaskKeys) ? localData.deletedTaskKeys : [];
  const remoteDeletedTaskKeys = Array.isArray(remoteData.deletedTaskKeys) ? remoteData.deletedTaskKeys : [];
  const mergedDeletedTaskKeys = Array.from(new Set([...localDeletedTaskKeys, ...remoteDeletedTaskKeys]));
  const deletedTaskSet = new Set(mergedDeletedTaskKeys);

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
    const contentKey = getTaskKey(t);
    const key = t.id ? `id_${t.id}` : contentKey;
    if (deletedTaskSet.has(`id_${t.id}`) || (contentKey && deletedTaskSet.has(contentKey))) {
      return; // Skip deleted archived task
    }
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

  const primaryActiveTasks = (localData.timestamp || 0) >= (remoteData.timestamp || 0)
    ? [...localTasks, ...remoteTasks]
    : [...remoteTasks, ...localTasks];

  primaryActiveTasks.forEach(t => {
    if (!t || !t.text) return;
    const contentKey = getTaskKey(t);
    const key = t.id ? `id_${t.id}` : contentKey;
    if (deletedTaskSet.has(`id_${t.id}`) || (contentKey && deletedTaskSet.has(contentKey))) {
      return; // Skip deleted active task
    }

    // Check if task exists in archivedMap (by ID or content key)
    const archivedKey = (t.id && archivedMap.has(`id_${t.id}`)) 
      ? `id_${t.id}` 
      : (contentKey && archivedMap.has(contentKey) ? contentKey : null);

    if (archivedKey) {
      const archivedTask = archivedMap.get(archivedKey);
      const archivedTimestamp = archivedTask.completedAt || archivedTask.updatedAt || 0;
      const restoredTimestamp = t.restoredAt || 0;
      const updatedTimestamp = t.updatedAt || 0;

      // Active task ONLY wins over archived task if it was explicitly restored after archiving (restoredAt >= archivedTimestamp)
      // OR if it was updated strictly AFTER the task was archived (updatedAt > archivedTimestamp).
      const activeWins = (restoredTimestamp > 0 && restoredTimestamp >= archivedTimestamp) || 
                         (updatedTimestamp > 0 && updatedTimestamp > archivedTimestamp);

      if (activeWins) {
        // Active/Restored version is newer than archived completion -> Active WINS
        archivedMap.delete(archivedKey);
      } else {
        // Archived version is newer or equal -> Remains archived
        return;
      }
    }

    if (!activeTaskMap.has(key)) {
      activeTaskMap.set(key, t);
    } else {
      const existing = activeTaskMap.get(key);
      const existingTimestamp = existing.updatedAt || existing.restoredAt || 0;
      const tTimestamp = t.updatedAt || t.restoredAt || 0;
      const primaryTask = tTimestamp > existingTimestamp ? t : existing;
      const secondaryTask = primaryTask === t ? existing : t;

      const mergedTask = {
        ...secondaryTask,
        ...primaryTask,
        notes: primaryTask.notes !== undefined ? primaryTask.notes : secondaryTask.notes,
        priority: primaryTask.priority !== undefined ? primaryTask.priority : secondaryTask.priority,
        projectId: primaryTask.projectId || primaryTask.categoryId || secondaryTask.projectId || 'general',
        scheduledDate: primaryTask.scheduledDate !== undefined ? primaryTask.scheduledDate : secondaryTask.scheduledDate,
        subtasks: primaryTask.subtasks !== undefined ? primaryTask.subtasks : secondaryTask.subtasks,
        isRecurring: primaryTask.isRecurring !== undefined ? primaryTask.isRecurring : secondaryTask.isRecurring,
        recurrence: primaryTask.recurrence !== undefined ? primaryTask.recurrence : secondaryTask.recurrence,
        restoredAt: primaryTask.restoredAt || secondaryTask.restoredAt,
        updatedAt: Math.max(primaryTask.updatedAt || 0, secondaryTask.updatedAt || 0) || undefined
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

  // 6. Merge Admin Password Hash (preserve custom password across devices & updates)
  const defaultAdminHash = 'h_589b25';
  const localHash = localData.adminPasswordHash || (typeof localStorage !== 'undefined' ? localStorage.getItem('123TodoAdminPassHash') : null);
  const remoteHash = remoteData.adminPasswordHash;
  let mergedAdminPasswordHash = localHash;
  if (remoteHash && remoteHash !== defaultAdminHash) {
    mergedAdminPasswordHash = remoteHash;
  } else if (localHash && localHash !== defaultAdminHash) {
    mergedAdminPasswordHash = localHash;
  }

  if (mergedAdminPasswordHash && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('123TodoAdminPassHash', mergedAdminPasswordHash);
    } catch (e) {}
  }

  return {
    tasks: finalTasks,
    archived: finalArchived,
    projects: mergedProjects,
    deletedProjects: mergedDeletedProjects,
    deletedTaskKeys: mergedDeletedTaskKeys,
    counter: currentCounter,
    adminPasswordHash: mergedAdminPasswordHash,
    timestamp: Date.now()
  };
};
