import { useState, useRef, useEffect, useCallback } from 'react';
import { reorderList } from '../utils/reorderUtils';

/**
 * Custom hook to manage touch-based and drag-and-drop reordering for subtasks.
 * Provides unified gesture state, coordinate collision detection, and vibration feedback.
 *
 * @param {Array} subtasks - Current array of subtasks
 * @param {Function} onReorder - Callback receiving the newly reordered subtask array
 */
export const useSubtaskReorder = (subtasks, onReorder) => {
    const [draggedSubtaskIndex, setDraggedSubtaskIndex] = useState(null);
    const [dragOverSubtaskInfo, setDragOverSubtaskInfo] = useState(null);
    const touchSubtaskRef = useRef(null);
    const touchCleanupsRef = useRef(null);
    const subtasksRef = useRef(subtasks);

    useEffect(() => {
        subtasksRef.current = subtasks;
    }, [subtasks]);

    useEffect(() => {
        return () => {
            if (touchCleanupsRef.current) {
                touchCleanupsRef.current();
                touchCleanupsRef.current = null;
            }
        };
    }, []);

    const handleSubtaskTouchStart = useCallback((e, index) => {
        e.stopPropagation();
        if (!e.touches || e.touches.length !== 1) return;

        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }

        touchSubtaskRef.current = {
            startIndex: index,
            lastOverIndex: index,
            lastPosition: 'before'
        };
        setDraggedSubtaskIndex(index);
        if (typeof window !== 'undefined' && window.navigator?.vibrate) {
            try { window.navigator.vibrate(12); } catch (err) {}
        }

        const onTouchMove = (moveEvent) => {
            if (!touchSubtaskRef.current) return;
            if (moveEvent.cancelable) moveEvent.preventDefault();
            const currentTouch = moveEvent.touches[0];
            if (!currentTouch) return;

            const targetEl = document.elementFromPoint(currentTouch.clientX, currentTouch.clientY);
            const targetLi = targetEl ? targetEl.closest('[data-subtask-index]') : null;
            if (targetLi) {
                const targetIdx = parseInt(targetLi.getAttribute('data-subtask-index'), 10);
                if (!isNaN(targetIdx)) {
                    const rect = targetLi.getBoundingClientRect();
                    const pos = currentTouch.clientY < (rect.top + rect.height / 2) ? 'before' : 'after';
                    touchSubtaskRef.current.lastOverIndex = targetIdx;
                    touchSubtaskRef.current.lastPosition = pos;
                    setDragOverSubtaskInfo({ index: targetIdx, position: pos });
                }
            }
        };

        const onTouchEnd = () => {
            removeListeners();
            const active = touchSubtaskRef.current;
            if (active && active.startIndex !== null && active.lastOverIndex !== null) {
                const reordered = reorderList(subtasksRef.current || [], active.startIndex, active.lastOverIndex, active.lastPosition);
                if (onReorder) {
                    onReorder(reordered);
                }
                if (typeof window !== 'undefined' && window.navigator?.vibrate) {
                    try { window.navigator.vibrate(10); } catch (err) {}
                }
            }
            touchSubtaskRef.current = null;
            setDraggedSubtaskIndex(null);
            setDragOverSubtaskInfo(null);
        };

        const removeListeners = () => {
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
            touchCleanupsRef.current = null;
        };
        touchCleanupsRef.current = removeListeners;

        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchcancel', onTouchEnd);
    }, [onReorder]);

    return {
        draggedSubtaskIndex,
        dragOverSubtaskInfo,
        handleSubtaskTouchStart,
        setDraggedSubtaskIndex,
        setDragOverSubtaskInfo
    };
};
