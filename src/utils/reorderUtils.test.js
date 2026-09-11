import { reorderList } from './reorderUtils';

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
