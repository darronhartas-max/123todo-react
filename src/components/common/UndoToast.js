import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, RotateCcw, X } from 'lucide-react';

const UndoToast = ({
    toast,
    onUndo,
    onDismiss,
    duration = 5000
}) => {
    const [timeLeft, setTimeLeft] = useState(Math.ceil(duration / 1000));
    const timerRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!toast) {
            setTimeLeft(Math.ceil(duration / 1000));
            return;
        }

        const totalSeconds = Math.ceil(duration / 1000);
        setTimeLeft(totalSeconds);

        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        const startTime = Date.now();
        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
            setTimeLeft(remaining);
        }, 300);

        timerRef.current = setTimeout(() => {
            if (onDismiss) onDismiss();
        }, duration);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [toast, duration, onDismiss]);

    if (!toast) return null;

    const isDelete = toast.actionType === 'delete';
    const taskTitle = toast.task?.text || toast.taskTitle || '';
    const clampedTitle = taskTitle.length > 32 ? `${taskTitle.slice(0, 30)}...` : taskTitle;

    return (
        <AnimatePresence>
            <motion.div
                role="alert"
                aria-live="polite"
                data-testid="undo-toast"
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10001,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px 10px 16px',
                    background: 'var(--surface-color, #ffffff)',
                    color: 'var(--text-color, #1f2937)',
                    border: '1.5px solid var(--border-color, rgba(0,0,0,0.12))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                    maxWidth: 'min(92vw, 460px)',
                    boxSizing: 'border-box'
                }}
            >
                {/* Status Indicator Icon */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isDelete ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    color: isDelete ? '#ef4444' : '#10b981',
                    flexShrink: 0
                }}>
                    {isDelete ? <Trash2 size={15} /> : <Check size={16} strokeWidth={2.5} />}
                </div>

                {/* Message & Title */}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: '1 1 auto' }}>
                    <div style={{
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        color: 'var(--text-color, #111827)',
                        lineHeight: '1.3'
                    }}>
                        {toast.message || (isDelete ? 'Task deleted' : 'Moved to Archive')}
                    </div>
                    {clampedTitle && (
                        <div style={{
                            fontSize: '0.78rem',
                            color: 'var(--muted-text, #6b7280)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            "{clampedTitle}"
                        </div>
                    )}
                </div>

                {/* Undo Action Button */}
                <button
                    type="button"
                    onClick={() => {
                        if (timerRef.current) clearTimeout(timerRef.current);
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        if (onUndo) onUndo(toast);
                    }}
                    aria-label="Undo action"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'var(--accent-color, #2563eb)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                        flexShrink: 0,
                        transition: 'transform 0.15s ease'
                    }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    <RotateCcw size={13} strokeWidth={2.5} />
                    <span>Undo ({timeLeft}s)</span>
                </button>

                {/* Dismiss Cross */}
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss notification"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted-text, #9ca3af)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        flexShrink: 0
                    }}
                >
                    <X size={15} />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export default UndoToast;
