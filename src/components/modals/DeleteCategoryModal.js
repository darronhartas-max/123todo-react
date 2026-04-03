import React, { useState } from 'react';
import { COMMON_STYLES } from '../../utils/styles';

const DeleteCategoryModal = ({ category, projects, taskCount, onConfirm, onClose }) => {
    const otherCategories = projects.filter(p => p.id !== category.id && p.id !== 'all');
    const [targetCategoryId, setTargetCategoryId] = useState(otherCategories[0]?.id || 'general');

    const styles = {
        modalContent: {
            background: 'var(--surface-color)',
            padding: '20px',
            borderRadius: '12px',
            maxWidth: '90%',
            width: '360px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
        },
        title: {
            fontSize: '1.2rem',
            fontWeight: '700',
            marginBottom: '12px',
            color: '#dc2626'
        },
        text: {
            fontSize: '1.1rem',
            lineHeight: '1.5',
            marginBottom: '16px',
            color: 'var(--text-color)'
        },
        label: {
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '6px',
            color: 'var(--muted-text)'
        },
        select: {
            width: '100%',
            padding: '10px',
            fontSize: '1.1rem',
            border: '1.5px solid var(--border-color)',
            borderRadius: '8px',
            marginBottom: '20px',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            cursor: 'pointer'
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
        },
        button: (isDelete) => ({
            padding: '10px 20px',
            fontSize: '1.1rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            background: isDelete ? '#dc2626' : 'var(--border-color)',
            color: isDelete ? 'white' : 'var(--text-color)',
            transition: 'opacity 0.2s'
        })
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.title}>Delete Category?</div>

                <div style={styles.text}>
                    Are you sure you want to delete <strong>{category.name}</strong>?
                    {taskCount > 0 && (
                        <div style={{ marginTop: '8px' }}>
                            There {taskCount === 1 ? 'is' : 'are'} <strong>{taskCount}</strong> task{taskCount !== 1 ? 's' : ''} in this category.
                        </div>
                    )}
                </div>

                {taskCount > 0 && (
                    <>
                        <label style={styles.label}>Move tasks to:</label>
                        <select
                            value={targetCategoryId}
                            onChange={(e) => setTargetCategoryId(e.target.value)}
                            style={styles.select}
                        >
                            {otherCategories.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </>
                )}

                <div style={styles.buttonContainer}>
                    <button
                        onClick={onClose}
                        style={styles.button(false)}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(category.id, targetCategoryId)}
                        style={styles.button(true)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCategoryModal;
