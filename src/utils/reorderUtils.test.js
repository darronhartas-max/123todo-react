import { reorderList, toggleSubtaskStatus } from './reorderUtils';

describe('reorderList', () => {
  const sample = ['A', 'B', 'C', 'D'];

  test('moves item forward (downwards) before target', () => {
    // Move A (index 0) before C (index 2) -> result should be [B, A, C, D]
    const result = reorderList(sample, 0, 2, 'before');
    expect(result).toEqual(['B', 'A', 'C', 'D']);
  });

  test('moves item forward (downwards) after target', () => {
    // Move A (index 0) after C (index 2) -> result should be [B, C, A, D]
    const result = reorderList(sample, 0, 2, 'after');
    expect(result).toEqual(['B', 'C', 'A', 'D']);
  });

  test('moves item to the very end after last element', () => {
    // Move A (index 0) after D (index 3) -> result should be [B, C, D, A]
    const result = reorderList(sample, 0, 3, 'after');
    expect(result).toEqual(['B', 'C', 'D', 'A']);
  });

  test('moves item backward (upwards) before target', () => {
    // Move D (index 3) before A (index 0) -> result should be [D, A, B, C]
    const result = reorderList(sample, 3, 0, 'before');
    expect(result).toEqual(['D', 'A', 'B', 'C']);
  });

  test('moves item backward (upwards) after target', () => {
    // Move D (index 3) after A (index 0) -> result should be [A, D, B, C]
    const result = reorderList(sample, 3, 0, 'after');
    expect(result).toEqual(['A', 'D', 'B', 'C']);
  });

  test('moves item between adjacent items', () => {
    // Move B (index 1) after C (index 2) -> result should be [A, C, B, D]
    const result = reorderList(sample, 1, 2, 'after');
    expect(result).toEqual(['A', 'C', 'B', 'D']);
  });

  test('returns original list if indices are out of bounds or invalid', () => {
    expect(reorderList(sample, -1, 2)).toEqual(sample);
    expect(reorderList(sample, 0, 10)).toEqual(sample);
    expect(reorderList(null, 0, 1)).toBeNull();
    expect(reorderList([], 0, 1)).toEqual([]);
  });
});

describe('toggleSubtaskStatus', () => {
  const initialSubtasks = [
    { id: 1, text: 'Item 1', completed: false },
    { id: 2, text: 'Item 2', completed: false },
    { id: 3, text: 'Item 3', completed: false },
    { id: 4, text: 'Item 4', completed: true }
  ];

  test('completing a subtask moves it to just below the uncompleted subtasks', () => {
    // Complete Item 1
    const result = toggleSubtaskStatus(initialSubtasks, 1);
    expect(result.map(s => s.id)).toEqual([2, 3, 1, 4]);
    expect(result.find(s => s.id === 1).completed).toBe(true);
  });

  test('completing another subtask places it at the top of the completed section (just below uncompleted)', () => {
    // First complete Item 1 -> [2, 3, 1, 4]
    const step1 = toggleSubtaskStatus(initialSubtasks, 1);
    // Now complete Item 2 -> should be [3, 2, 1, 4]
    const step2 = toggleSubtaskStatus(step1, 2);
    expect(step2.map(s => s.id)).toEqual([3, 2, 1, 4]);
    expect(step2.find(s => s.id === 2).completed).toBe(true);
  });

  test('uncompleting a subtask moves it back into the uncompleted list above completed items', () => {
    // Uncomplete Item 4 (which was completed)
    const result = toggleSubtaskStatus(initialSubtasks, 4);
    expect(result.map(s => s.id)).toEqual([1, 2, 3, 4]);
    expect(result.find(s => s.id === 4).completed).toBe(false);
  });

  test('handles non-existent id or invalid input gracefully', () => {
    expect(toggleSubtaskStatus(initialSubtasks, 999)).toEqual(initialSubtasks);
    expect(toggleSubtaskStatus(null, 1)).toEqual([]);
  });
});
