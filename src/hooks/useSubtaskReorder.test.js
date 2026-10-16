import { renderHook, act } from '@testing-library/react';
import { useSubtaskReorder } from './useSubtaskReorder';

describe('useSubtaskReorder hook', () => {
  const initialSubtasks = [
    { id: '1', text: 'Subtask 1', completed: false },
    { id: '2', text: 'Subtask 2', completed: false },
    { id: '3', text: 'Subtask 3', completed: false }
  ];

  test('initializes with null drag states', () => {
    const onReorder = jest.fn();
    const { result } = renderHook(() => useSubtaskReorder(initialSubtasks, onReorder));

    expect(result.current.draggedSubtaskIndex).toBeNull();
    expect(result.current.dragOverSubtaskInfo).toBeNull();
    expect(typeof result.current.handleSubtaskTouchStart).toBe('function');
  });

  test('allows manual update of draggedSubtaskIndex and dragOverSubtaskInfo', () => {
    const onReorder = jest.fn();
    const { result } = renderHook(() => useSubtaskReorder(initialSubtasks, onReorder));

    act(() => {
      result.current.setDraggedSubtaskIndex(1);
      result.current.setDragOverSubtaskInfo({ index: 2, position: 'after' });
    });

    expect(result.current.draggedSubtaskIndex).toBe(1);
    expect(result.current.dragOverSubtaskInfo).toEqual({ index: 2, position: 'after' });

    act(() => {
      result.current.setDraggedSubtaskIndex(null);
      result.current.setDragOverSubtaskInfo(null);
    });

    expect(result.current.draggedSubtaskIndex).toBeNull();
    expect(result.current.dragOverSubtaskInfo).toBeNull();
  });

  test('handles touch start event and sets dragged index', () => {
    const onReorder = jest.fn();
    const { result } = renderHook(() => useSubtaskReorder(initialSubtasks, onReorder));

    const mockEvent = {
      stopPropagation: jest.fn(),
      touches: [{ clientX: 100, clientY: 150 }]
    };

    act(() => {
      result.current.handleSubtaskTouchStart(mockEvent, 0);
    });

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(result.current.draggedSubtaskIndex).toBe(0);

    // Simulate window touchend to reset
    act(() => {
      window.dispatchEvent(new Event('touchend'));
    });

    expect(result.current.draggedSubtaskIndex).toBeNull();
  });
});
