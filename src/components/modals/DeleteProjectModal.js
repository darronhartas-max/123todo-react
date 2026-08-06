import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DeleteProjectModal = ({ project, projects, taskCount, onConfirm, onClose }) => {
    const otherProjects = projects.filter(p => p.id !== project.id && p.id !== 'all');
    const [targetProjectId, setTargetProjectId] = useState(otherProjects[0]?.id || 'general');

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10500
        },
        modal: {
            background: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '90%',
            width: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '16px',
            color: '#dc2626'
        },
        content: {
            fontSize: '1rem',
            lineHeight: '1.5',
            marginBottom: '20px'
        },
        warning: {
            marginTop: '12px',
            padding: '10px',
            background: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '6px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600'
        },
        select: {
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            marginBottom: '20px'
        },
        actions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
        },
        btnSecondary: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'transparent',
            color: 'var(--text-color)',
            cursor: 'pointer'
        },
        btnDanger: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#dc2626',
            color: 'white',
            cursor: 'pointer'
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={styles.title}>Delete Project?</div>
                <div style={styles.content}>
                    Are you sure you want to delete <strong>{project.name}</strong>?

                    {taskCount > 0 && (
                        <div style={styles.warning}>
                            There {taskCount === 1 ? 'is' : 'are'} <strong>{taskCount}</strong> task{taskCount !== 1 ? 's' : ''} in this project.
                            Please select a project to move them to:
                        </div>
                    )}
                </div>

                {taskCount > 0 && (
                    <>
                        <label style={styles.label}>Move to:</label>
                        <select
                            style={styles.select}
                            value={targetProjectId}
                            onChange={(e) => setTargetProjectId(e.target.value)}
                        >
                            {otherProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </>
                )}

                <div style={styles.actions}>
                    <button style={styles.btnSecondary} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        style={styles.btnDanger}
                        onClick={() => onConfirm(project.id, targetProjectId)}
                    >
                        Delete Project
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default DeleteProjectModal;
