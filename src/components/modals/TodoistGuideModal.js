import React from 'react';
import { motion } from 'framer-motion';
import { X, FileType, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { COMMON_STYLES } from '../../utils/styles';

const TodoistGuideModal = ({ isOpen, onClose, onStartImport }) => {
    if (!isOpen) return null;

    const styles = {
        guideModal: {
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            padding: '24px 20px',
            borderRadius: '16px',
            maxWidth: '92%',
            width: '540px',
            boxShadow: '0 16px 45px rgba(0, 0, 0, 0.35)',
            maxHeight: '85vh',
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
            marginBottom: '18px'
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
            background: 'rgba(228, 67, 50, 0.12)',
            color: '#e44332',
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
        stepCard: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '14px',
            textAlign: 'left'
        },
        stepHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px'
        },
        stepBadge: {
            background: '#e44332',
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
        featureGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            margin: '16px 0'
        },
        featureItem: {
            background: 'var(--item-bg)',
            border: '1px solid var(--border-color)',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-color)',
            fontWeight: '500'
        },
        ctaBtn: {
            width: '100%',
            padding: '12px 20px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #e44332 0%, #dc2626 100%)',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.05rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(228, 67, 50, 0.3)',
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
                            <FileType size={24} />
                        </div>
                        <div>
                            <h3 style={styles.title}>Todoist Migration Guide</h3>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>Step-by-step export & import instructions</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', display: 'flex' }}>
                        <X size={22} />
                    </button>
                </div>

                {/* Step 1 */}
                <div style={styles.stepCard}>
                    <div style={styles.stepHeader}>
                        <span style={styles.stepBadge}>STEP 1</span>
                        <span style={styles.stepTitle}>Export CSV Files from Todoist</span>
                    </div>
                    <div style={styles.stepBody}>
                        <ol style={{ margin: '6px 0 0 16px', padding: 0 }}>
                            <li>Open <strong>Todoist</strong> on your desktop browser or app.</li>
                            <li>Go to the Project you want to export.</li>
                            <li>Click the <strong>three dots (...)</strong> menu icon in the top-right corner.</li>
                            <li>Select <strong>Export as CSV</strong> and save the file to your computer.</li>
                            <li><em>Repeat for any additional projects you wish to migrate.</em></li>
                        </ol>
                    </div>
                </div>

                {/* Step 2 */}
                <div style={styles.stepCard}>
                    <div style={styles.stepHeader}>
                        <span style={styles.stepBadge}>STEP 2</span>
                        <span style={styles.stepTitle}>Upload CSV Files to 123 To Do</span>
                    </div>
                    <div style={styles.stepBody}>
                        <ol style={{ margin: '6px 0 0 16px', padding: 0 }}>
                            <li>Click the <strong>Import</strong> button in the 123 To Do footer.</li>
                            <li>Select <strong>Todoist Export</strong>.</li>
                            <li>Drag and drop your <strong>.csv</strong> files into the upload dropzone (or click to choose files).</li>
                        </ol>
                    </div>
                </div>

                {/* Step 3 */}
                <div style={styles.stepCard}>
                    <div style={styles.stepHeader}>
                        <span style={styles.stepBadge}>STEP 3</span>
                        <span style={styles.stepTitle}>Map Projects & Confirm Import</span>
                    </div>
                    <div style={styles.stepBody}>
                        123 To Do will automatically read your files and suggest matching existing project names. Choose whether to assign tasks to existing color-coded projects or create brand new projects automatically!
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
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--accent-color)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} /> What Gets Migrated & Preserved:
                    </div>
                    <div style={styles.featureGrid}>
                        <div style={styles.featureItem}>
                            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                            <span><strong>Unlimited Notes:</strong> Full descriptions imported without character limits.</span>
                        </div>
                        <div style={styles.featureItem}>
                            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                            <span><strong>Due Dates:</strong> Todoist dates formatted as <code>📅 Due: ...</code></span>
                        </div>
                        <div style={styles.featureItem}>
                            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                            <span><strong>Subtask Hierarchy:</strong> Subtasks indented with <code>↳</code></span>
                        </div>
                        <div style={styles.featureItem}>
                            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                            <span><strong>Clean Import:</strong> Section headers & blank rows auto-filtered out.</span>
                        </div>
                    </div>
                </div>

                <button style={styles.ctaBtn} onClick={handleStartClick}>
                    <span>Start Migration Wizard Now</span>
                    <ArrowRight size={18} />
                </button>
            </motion.div>
        </div>
    );
};

export default TodoistGuideModal;
