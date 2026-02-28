import React, { useState } from 'react';
import { X, Edit2, Trash2, Plus, Check } from 'lucide-react';
import { COMMON_STYLES } from '../../utils/styles';
import { PROJECT_COLORS } from '../../utils/constants';

const ManageCategoriesModal = ({ projects, onAdd, onEdit, onDelete, onClose }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);

    const styles = {
        modalContent: {
            background: 'var(--surface-color)',
            padding: '20px',
            borderRadius: '12px',
            maxWidth: '95%',
            width: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color)'
        },
        title: {
            fontSize: '1.2rem',
            fontWeight: '700'
        },
        list: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
            overflowY: 'auto',
            flex: 1
        },
        item: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            borderRadius: '8px',
            marginBottom: '8px',
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)'
        },
        categoryInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
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
        actionBtn: (isDelete) => ({
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            color: isDelete ? '#dc2626' : 'var(--muted-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
        }),
        closeBtn: {
            padding: '6px',
            borderRadius: '50%',
            background: 'transparent',
            border: 'none',
            color: 'var(--muted-text)',
            cursor: 'pointer'
        },
        addSection: {
            marginBottom: '16px',
            padding: '12px',
            background: 'var(--bg-color)',
            borderRadius: '10px',
            border: '1px dashed var(--border-color)'
        },
        input: {
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            fontSize: '0.9rem',
            outline: 'none',
            flex: 1
        },
        colorBtn: (color, isSelected) => ({
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: color,
            cursor: 'pointer',
            border: isSelected ? '2px solid var(--text-color)' : 'none',
            transition: 'transform 0.2s'
        })
    };

    const handleAdd = () => {
        if (newName.trim()) {
            onAdd(newName.trim(), selectedColor);
            setNewName('');
            setIsAdding(false);
        }
    };

    const editableProjects = projects.filter(p => p.id !== 'all');

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <div style={styles.title}>Manage Categories</div>
                    <button onClick={onClose} style={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        style={{ ...styles.item, justifyContent: 'center', cursor: 'pointer', borderStyle: 'dashed', background: 'transparent' }}
                    >
                        <Plus size={18} style={{ marginRight: '8px' }} /> Create New Category
                    </button>
                ) : (
                    <div style={styles.addSection}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <input
                                autoFocus
                                placeholder="Category name..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                style={styles.input}
                                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <button onClick={handleAdd} style={{ ...styles.actionBtn(false), background: 'var(--accent-color)', color: 'white', border: 'none' }}>
                                <Check size={18} />
                            </button>
                            <button onClick={() => setIsAdding(false)} style={styles.actionBtn(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
                            {PROJECT_COLORS.map(c => (
                                <div
                                    key={c}
                                    style={styles.colorBtn(c, selectedColor === c)}
                                    onClick={() => setSelectedColor(c)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div style={styles.list}>
                    {editableProjects.map(p => (
                        <div key={p.id} style={styles.item}>
                            <div style={styles.categoryInfo}>
                                <div style={styles.colorDot(p.color)}></div>
                                <span style={{ fontWeight: '600' }}>{p.name}</span>
                            </div>
                            <div style={styles.actions}>
                                <button
                                    onClick={() => onEdit(p)}
                                    style={styles.actionBtn(false)}
                                    title="Edit name and color"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (editableProjects.length <= 1) {
                                            alert("You must have at least one category remaining.");
                                            return;
                                        }
                                        onDelete(p.id);
                                    }}
                                    style={styles.actionBtn(true)}
                                    title="Delete category"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageCategoriesModal;
