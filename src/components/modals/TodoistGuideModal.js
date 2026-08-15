import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { COMMON_STYLES } from '../../utils/styles';

const TodoistGuideModal = ({ isOpen, onClose, onStartImport }) => {
    const [activeTab, setActiveTab] = useState('todoist');

    if (!isOpen) return null;

    const styles = {
        guideModal: {
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            padding: '24px 20px',
            borderRadius: '16px',
            maxWidth: '92%',
            width: '560px',
            boxShadow: '0 16px 45px rgba(0, 0, 0, 0.35)',
            maxHeight: '88vh',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            position: 'relative',
            boxSizing: 'border-box'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '14px',
            marginBottom: '16px'
        },
        titleContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        iconBox: {
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(40, 90, 130, 0.15)',
            color: '#285a82',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '800',
            margin: 0,
            color: 'var(--text-color)'
        },
        tabBtn: (id) => ({
            padding: '8px 12px',
            borderRadius: '8px',
            border: activeTab === id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
            background: activeTab === id ? 'var(--accent-bg)' : 'var(--bg-color)',
            color: 'var(--text-color)',
            fontWeight: activeTab === id ? '700' : '500',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
        }),
        stepCard: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '14px',
            textAlign: 'left'
        },
        stepBadge: {
            background: 'var(--accent-color)',
            color: 'white',
            fontWeight: '800',
            fontSize: '0.8rem',
            padding: '2px 8px',
            borderRadius: '12px',
            letterSpacing: '0.5px'
        },
        stepTitle: {
            fontWeight: '700',
            fontSize: '1.05rem',
            color: 'var(--text-color)'
        },
        stepBody: {
            fontSize: '0.92rem',
            color: 'var(--muted-text)',
            lineHeight: '1.5'
        },
        ctaBtn: {
            width: '100%',
            padding: '12px 20px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #285a82 0%, #1a3a54 100%)',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.05rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(40, 90, 130, 0.3)',
            transition: 'all 0.2s ease',
            marginTop: '16px'
        }
    };

    const handleStartClick = () => {
        onClose();
        if (onStartImport) onStartImport();
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.25 }}
                style={styles.guideModal}
                onClick={e => e.stopPropagation()}
            >
                <div style={styles.header}>
                    <div style={styles.titleContainer}>
                        <div style={styles.iconBox}>
                            <Layers size={24} />
                        </div>
                        <div>
                            <h3 style={styles.title}>Migration Guide — Import App Data</h3>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>Step-by-step export & import instructions</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', display: 'flex' }}>
                        <X size={22} />
                    </button>
                </div>

                {/* App Selection Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <button style={styles.tabBtn('todoist')} onClick={() => setActiveTab('todoist')}>🔴 Todoist</button>
                    <button style={styles.tabBtn('ticktick')} onClick={() => setActiveTab('ticktick')}>🔵 TickTick</button>
                    <button style={styles.tabBtn('keep')} onClick={() => setActiveTab('keep')}>🟡 Google Keep</button>
                    <button style={styles.tabBtn('gtasks')} onClick={() => setActiveTab('gtasks')}>🟢 Google Tasks / MS To Do</button>
                </div>

                {/* Todoist Guide */}
                {activeTab === 'todoist' && (
                    <>
                        <div style={styles.stepCard}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={styles.stepBadge}>STEP 1</span>
                                <span style={styles.stepTitle}>Export CSV Files from Todoist</span>
                            </div>
                            <div style={styles.stepBody}>
                                Open Todoist on your desktop ➔ Open a Project ➔ Click <strong>(...) menu</strong> ➔ Select <strong>Export as CSV</strong>.
                            </div>
                        </div>
                    </>
                )}

                {/* TickTick Guide */}
                {activeTab === 'ticktick' && (
                    <>
                        <div style={styles.stepCard}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={styles.stepBadge}>STEP 1</span>
                                <span style={styles.stepTitle}>Export CSV from TickTick</span>
                            </div>
                            <div style={styles.stepBody}>
                                Open TickTick ➔ Go to <strong>Settings</strong> ➔ Select <strong>Backup & Export</strong> ➔ Click <strong>Export Backup CSV</strong>.
                            </div>
                        </div>
                    </>
                )}

                {/* Google Keep Guide */}
                {activeTab === 'keep' && (
                    <>
                        <div style={styles.stepCard}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={styles.stepBadge}>STEP 1</span>
                                <span style={styles.stepTitle}>Export Keep Notes via Google Takeout</span>
                            </div>
                            <div style={styles.stepBody}>
                                Visit <strong>takeout.google.com</strong> ➔ Deselect all ➔ Check <strong>Keep</strong> ➔ Click <strong>Create Export</strong> ➔ Download and drop the JSON note files into 123 ToDo.
                            </div>
                        </div>
                    </>
                )}

                {/* Google Tasks / MS To Do Guide */}
                {activeTab === 'gtasks' && (
                    <>
                        <div style={styles.stepCard}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={styles.stepBadge}>STEP 1</span>
                                <span style={styles.stepTitle}>Export Google Tasks or MS To Do</span>
                            </div>
                            <div style={styles.stepBody}>
                                For Google Tasks: Use <strong>takeout.google.com</strong> selecting <strong>Tasks</strong> (gives <code>Tasks.json</code>).<br />
                                For MS To Do: Open Outlook/To Do Settings ➔ Export account data CSV.
                            </div>
                        </div>
                    </>
                )}

                {/* Step 2 */}
                <div style={styles.stepCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={styles.stepBadge}>STEP 2</span>
                        <span style={styles.stepTitle}>Drop Files into 123 To Do</span>
                    </div>
                    <div style={styles.stepBody}>
                        Click <strong>Import</strong> in the 123 To Do footer ➔ Select <strong>Import from Other Apps</strong> ➔ Drop your exported CSV or JSON files into the wizard.
                    </div>
                </div>

                {/* Features & Preservation Summary */}
                <div style={{
                    background: 'rgba(37, 99, 235, 0.06)',
                    border: '1px solid rgba(37, 99, 235, 0.15)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginTop: '12px',
                    textAlign: 'left'
                }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--accent-color)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} /> 🛡️ What Gets Migrated & Preserved:
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-color)', lineHeight: 1.5 }}>
                        ✓ <strong>Zero Length Cap:</strong> 100% of notes, body text, & descriptions preserved.<br />
                        ✓ <strong>Priorities & Projects:</strong> Mapped to P1-P4 priorities and custom project colors.<br />
                        ✓ <strong>Subtasks & Checklists:</strong> Imported as interactive checklists.
                    </div>
                </div>

                <button style={styles.ctaBtn} onClick={handleStartClick}>
                    <span>Launch Import Wizard Now</span>
                    <ArrowRight size={18} />
                </button>
            </motion.div>
        </div>
    );
};

export default TodoistGuideModal;
