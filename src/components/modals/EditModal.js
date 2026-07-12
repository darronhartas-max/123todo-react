import React from 'react';
import { PRIORITIES, MAX_TASK_LENGTH, MAX_NOTES_LENGTH } from '../../utils/constants';
import { COMMON_STYLES } from '../../utils/styles';

const EditModal = ({ task, onSave, onClose, projects }) => {
    const [editingTask, setEditingTask] = React.useState({ ...task });

    const handleInput = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const handleSave = () => {
        onSave(editingTask.id, {
            text: editingTask.text,
            priority: editingTask.priority,
            projectId: editingTask.projectId,
            notes: editingTask.notes
        });
        onClose();
    };

    const styles = {
        modalContent: {
            background: 'var(--surface-color)',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '95%',
            width: '500px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            color: 'var(--text-color)'
        },
        textarea: {
            width: '100%',
            padding: '8px',
            fontSize: '1.1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            resize: 'none',
            overflowY: 'auto',
            marginBottom: '12px',
            minHeight: '60px',
            maxHeight: '300px',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box',
            background: 'var(--item-bg)',
            color: 'var(--text-color)'
        },
        select: {
            width: '100%',
            padding: '8px',
            fontSize: '1.1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            marginBottom: '12px',
            boxSizing: 'border-box',
            background: 'var(--item-bg)',
            color: 'var(--text-color)'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <textarea
                    autoFocus
                    value={editingTask.text}
                    onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                    onInput={handleInput}
                    style={styles.textarea}
                    maxLength={MAX_TASK_LENGTH}
                    ref={(textarea) => {
                        if (textarea) {
                            textarea.style.height = 'auto';
                            textarea.style.height = textarea.scrollHeight + 'px';
                        }
                    }}
                />

                <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>Priority</label>
                    <select
                        value={editingTask.priority}
                        onChange={(e) => setEditingTask({ ...editingTask, priority: parseInt(e.target.value) })}
                        style={styles.select}
                    >
                        {Object.entries(PRIORITIES).map(([value, config]) => (
                            <option key={value} value={value}>{config.label}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>Project</label>
                    <select
                        value={editingTask.projectId || 'general'}
                        onChange={(e) => setEditingTask({ ...editingTask, projectId: e.target.value })}
                        style={styles.select}
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>Notes</label>
                    <textarea
                        value={editingTask.notes || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                        onInput={handleInput}
                        placeholder="Add notes or descriptions here..."
                        style={{ ...styles.textarea, minHeight: '80px', fontSize: '1.1rem' }}
                        maxLength={MAX_NOTES_LENGTH}
                        ref={(textarea) => {
                            if (textarea) {
                                textarea.style.height = 'auto';
                                textarea.style.height = textarea.scrollHeight + 'px';
                            }
                        }}
                    />
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', textAlign: 'right', marginTop: '-8px', marginBottom: '12px' }}>
                        {(editingTask.notes || '').length}/{MAX_NOTES_LENGTH}
                    </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '12px' }}>
                    {editingTask.text.length}/{MAX_TASK_LENGTH}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            fontSize: '1.1rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: '#e5e7eb',
                            color: '#333'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '8px 16px',
                            fontSize: '1.1rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: '#2563eb',
                            color: '#fff'
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
