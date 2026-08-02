import React from 'react';
import { COMMON_STYLES } from '../../utils/styles';
import { FileJson, FileType, X, Database } from 'lucide-react';

const ImportSelectionModal = ({ onJSONImport, onTodoistImport, onRestoreShadow, onOpenTodoistGuide, onClose }) => {
    const styles = {
        modalContent: {
            background: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '16px',
            maxWidth: '90%',
            width: '400px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '700',
            margin: 0
        },
        description: {
            fontSize: '1.1rem',
            color: 'var(--muted-text)',
            marginBottom: '24px'
        },
        optionList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        optionBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
            fontSize: '1.1rem'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Import Tasks</h2>
                    <button 
                        onClick={onClose} 
                        style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <p style={styles.description}>
                    Choose where you would like to import your tasks from:
                </p>

                <div style={styles.optionList}>
                    <button 
                        style={styles.optionBtn}
                        onClick={() => {
                            onJSONImport();
                            onClose();
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-color)';
                            e.currentTarget.style.background = 'var(--accent-bg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.background = 'var(--bg-color)';
                        }}
                    >
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '8px', color: 'var(--accent-color)' }}>
                            <FileJson size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700' }}>123 ToDo Backup</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--muted-text)' }}>Import from a .json backup file</div>
                        </div>
                    </button>

                    <button 
                        style={styles.optionBtn}
                        onClick={() => {
                            onTodoistImport();
                            onClose();
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#e44332';
                            e.currentTarget.style.background = 'rgba(228, 67, 50, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.background = 'var(--bg-color)';
                        }}
                    >
                        <div style={{ background: 'rgba(228, 67, 50, 0.1)', padding: '10px', borderRadius: '8px', color: '#e44332' }}>
                            <FileType size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Todoist Export</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClose();
                                        if (onOpenTodoistGuide) onOpenTodoistGuide();
                                    }}
                                    style={{
                                        background: 'rgba(228, 67, 50, 0.12)',
                                        border: 'none',
                                        color: '#e44332',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📖 View Guide
                                </button>
                            </div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--muted-text)', marginTop: '2px' }}>Import multi-project .csv files — 100% text & descriptions preserved with zero length cap</div>
                        </div>
                    </button>

                    <button 
                        style={styles.optionBtn}
                        onClick={() => {
                            onRestoreShadow();
                            onClose();
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-color)';
                            e.currentTarget.style.background = 'var(--accent-bg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.background = 'var(--bg-color)';
                        }}
                    >
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '8px', color: 'var(--accent-color)' }}>
                            <Database size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700' }}>Shadow Backup</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--muted-text)' }}>Restore from the last 24h auto-snapshot</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportSelectionModal;
