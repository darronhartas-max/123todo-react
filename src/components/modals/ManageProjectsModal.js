import React, { useState } from 'react';
import { X, Trash2, Edit2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { PROJECT_COLORS } from '../../utils/constants';

const ManageProjectsModal = ({ projects, onAdd, onEdit, onDelete, onClose }) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onAdd({ name: name.trim(), color: selectedColor });
            setName('');
            setSelectedColor(PROJECT_COLORS[0]);
        }
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        },
        modal: {
            background: 'var(--bg-color)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
        },
        header: {
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--surface-color)'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        content: {
            padding: '24px',
            overflowY: 'auto'
        },
        projectItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            marginBottom: '8px',
            background: 'var(--item-bg)'
        },
        projectInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: '600',
            fontSize: '1.1rem',
            color: 'var(--text-color)'
        },
        colorDot: (color) => ({
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: color
        }),
        actions: {
            display: 'flex',
            gap: '8px'
        },
        actionBtn: {
            padding: '6px',
            borderRadius: '6px',
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted-text)',
            transition: 'all 0.2s ease'
        },
        addSection: {
            marginTop: '24px',
            padding: '20px',
            background: 'var(--accent-bg)',
            borderRadius: '12px',
            border: '1px dashed var(--accent-color)'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            fontSize: '1.1rem',
            marginBottom: '12px',
            outline: 'none'
        },
        colorGrid: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px'
        },
        colorBtn: (color, isSelected) => ({
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: color,
            cursor: 'pointer',
            border: isSelected ? '3px solid var(--text-color)' : 'none',
            transition: 'transform 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }),
        submitBtn: {
            width: '100%',
            padding: '12px',
            background: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={styles.modal}
                onClick={e => e.stopPropagation()}
            >
                <div style={styles.header}>
                    <div style={styles.title}>Manage Projects</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={styles.content}>
                    <div>
                        {projects.map(project => (
                            <div key={project.id} style={styles.projectItem}>
                                <div style={styles.projectInfo}>
                                    <div style={styles.colorDot(project.color)} />
                                    {project.name}
                                </div>
                                <div style={styles.actions}>
                                    <button
                                        style={styles.actionBtn}
                                        onClick={() => onEdit(project)}
                                        title="Edit project"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        style={{ ...styles.actionBtn, color: '#dc2626' }}
                                        onClick={() => {
                                            if (projects.length === 1) {
                                                alert("You must have at least one project remaining.");
                                                return;
                                            }
                                            onDelete(project.id);
                                        }}
                                        title="Delete project"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.addSection}>
                        <div style={{ fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                            <Plus size={18} style={{ marginRight: '8px' }} /> Create New Project
                        </div>
                        <form onSubmit={handleAdd}>
                            <input
                                autoFocus
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Project name..."
                                style={styles.input}
                                required
                            />
                            <div style={{ fontSize: '0.9rem', color: 'var(--muted-text)', marginBottom: '8px' }}>Project Color</div>
                            <div style={styles.colorGrid}>
                                {PROJECT_COLORS.map(c => (
                                    <div
                                        key={c}
                                        style={styles.colorBtn(c, selectedColor === c)}
                                        onClick={() => setSelectedColor(c)}
                                    />
                                ))}
                            </div>
                            <button
                                type="submit"
                                style={{ ...styles.submitBtn, opacity: name.trim() ? 1 : 0.5 }}
                                disabled={!name.trim()}
                            >
                                Add Project
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ManageProjectsModal;
