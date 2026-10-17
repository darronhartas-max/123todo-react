/**
 * Reorders an array by moving the item at `fromIndex` to either 'before' or 'after' the item at `toIndex`.
 * 
 * @param {Array} list - The original array
 * @param {number} fromIndex - Index of the item being moved
 * @param {number} toIndex - Index of the target item
 * @param {'before'|'after'} [position='before'] - Whether to insert before or after the target item
 * @returns {Array} New reordered array
 */
export const reorderList = (list, fromIndex, toIndex, position = 'before') => {
  if (!Array.isArray(list)) return list;
  if (list.length <= 1) return list;
  if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') return list;
  if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return list;

  const targetItem = list[toIndex];
  const items = [...list];
  const [moved] = items.splice(fromIndex, 1);

  let newTargetIndex = items.indexOf(targetItem);
  if (newTargetIndex === -1) {
    newTargetIndex = Math.min(toIndex, items.length);
  }
  if (position === 'after') {
    newTargetIndex += 1;
  }
  items.splice(newTargetIndex, 0, moved);
  return items;
};

/**
 * Toggles a subtask's completion status and automatically moves it:
 * - If completed: moves to just below the uncompleted subtasks (top of completed group)
 * - If uncompleted: moves to just above completed subtasks (bottom of uncompleted group)
 *
 * @param {Array} subtasks - The list of subtasks
 * @param {string|number} stId - The subtask ID to toggle
 * @returns {Array} Reordered and updated subtasks array
 */
export const toggleSubtaskStatus = (subtasks, stId) => {
  if (!Array.isArray(subtasks)) return [];
  const target = subtasks.find(s => s.id === stId);
  if (!target) return subtasks;

  const willBeCompleted = !target.completed;
  const updated = subtasks.map(s => s.id === stId ? { ...s, completed: willBeCompleted } : s);

  if (willBeCompleted) {
    const uncompleted = updated.filter(s => !s.completed);
    const otherCompleted = updated.filter(s => s.completed && s.id !== stId);
    return [...uncompleted, { ...target, completed: true }, ...otherCompleted];
  } else {
    const otherUncompleted = updated.filter(s => !s.completed && s.id !== stId);
    const completed = updated.filter(s => s.completed);
    return [...otherUncompleted, { ...target, completed: false }, ...completed];
  }
};
