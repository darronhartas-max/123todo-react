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
