import React from 'react';
import { COMMON_STYLES } from '../../utils/styles';
import { AlertTriangle, Clock, Database, Archive, Layers, Check } from 'lucide-react';

const RestoreShadowModal = ({ backupData, onConfirm, onClose }) => {
    const dateStr = new Date(backupData.timestamp).toLocaleString();
    const activeCount = backupData.tasks?.length || 0;
    const archivedCount = backupData.archived?.length || 0;
    const projectsCount = backupData.projects?.length || 0;
    const projectsList = backupData.projects?.map(p => p.name).join(', ') || 'General';

    const styles = {
        modalContent: {
            background: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '16px',
            maxWidth: '95%',
            width: '480px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '700',
            margin: 0
        },
        warningBanner: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '1rem',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            textAlign: 'left',
            lineHeight: '1.4'
        },
        metaGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '20px'
        },
        metaCard: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            padding: '12px 8px',
            borderRadius: '10px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
        },
        metaVal: {
            fontSize: '1.3rem',
            fontWeight: '800',
            color: 'var(--text-color)'
        },
        metaLbl: {
            fontSize: '0.85rem',
            color: 'var(--muted-text)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        previewLabel: {
            fontSize: '1rem',
            fontWeight: '700',
            color: 'var(--muted-text)',
            marginBottom: '8px',
            textAlign: 'left',
            display: 'block'
        },
        previewContainer: {
            maxHeight: '160px',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '8px 12px',
            background: 'var(--bg-color)',
            marginBottom: '20px',
            textAlign: 'left'
        },
        previewItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 0',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '1rem'
        },
        dot: (priority) => ({
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: priority === 1 ? '#dc2626' : (priority === 2 ? '#f59e0b' : (priority === 3 ? '#6b7280' : '#9333ea')),
            flexShrink: 0
        }),
        buttonContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
        },
        btnCancel: {
            padding: '10px 20px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            transition: 'background 0.2s'
        },
        btnConfirm: {
            padding: '10px 20px',
            fontSize: '1.1rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            background: '#dc2626',
            color: 'white',
            boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)',
            transition: 'background 0.2s'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <Database size={24} style={{ color: 'var(--accent-color)' }} />
                    <h2 style={styles.title}>Restore from Shadow Backup</h2>
                </div>

                <div style={styles.warningBanner}>
                    <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <strong>Warning:</strong> This will overwrite all of your current tasks, archived entries, and projects with the backup data.
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--muted-text)', fontSize: '1rem', fontWeight: '500' }}>
                    <Clock size={16} />
                    <span>Backup Date: <strong>{dateStr}</strong></span>
                </div>

                <div style={styles.metaGrid}>
                    <div style={styles.metaCard}>
                        <Check size={18} style={{ color: 'var(--accent-color)' }} />
                        <span style={styles.metaVal}>{activeCount}</span>
                        <span style={styles.metaLbl}>Active</span>
                    </div>
                    <div style={styles.metaCard}>
                        <Archive size={18} style={{ color: 'var(--muted-text)' }} />
                        <span style={styles.metaVal}>{archivedCount}</span>
                        <span style={styles.metaLbl}>Archived</span>
                    </div>
                    <div style={styles.metaCard}>
                        <Layers size={18} style={{ color: '#8b5cf6' }} />
                        <span style={styles.metaVal}>{projectsCount}</span>
                        <span style={styles.metaLbl}>Projects</span>
                    </div>
                </div>

                {projectsCount > 0 && (
                    <div style={{ fontSize: '0.95rem', color: 'var(--muted-text)', marginBottom: '16px', textAlign: 'left', lineHeight: '1.4' }}>
                        📂 <strong>Projects:</strong> {projectsList}
                    </div>
                )}

                <span style={styles.previewLabel}>Active Tasks Preview:</span>
                <div style={styles.previewContainer}>
                    {activeCount === 0 ? (
                        <div style={{ color: 'var(--muted-text)', padding: '12px 0', textAlign: 'center' }}>
                            No active tasks in this backup.
                        </div>
                    ) : (
                        backupData.tasks.map((t, idx) => (
                            <div key={t.id || idx} style={styles.previewItem}>
                                <div style={styles.dot(t.priority)} />
                                <span style={{ color: 'var(--text-color)', wordBreak: 'break-word' }}>{t.text}</span>
                            </div>
                        ))
                    )}
                </div>

                <div style={styles.buttonContainer}>
                    <button onClick={onClose} style={styles.btnCancel}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={styles.btnConfirm}>
                        Restore & Overwrite
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestoreShadowModal;
