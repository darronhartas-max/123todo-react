import React from 'react';
import { COMMON_STYLES } from '../../utils/styles';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, Flame, ArrowRight } from 'lucide-react';

const CongratsModal = ({ milestone, todayCompleted, totalArchived, onContinue }) => {
    const styles = {
        modalContent: {
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            padding: '24px 24px 20px 24px',
            borderRadius: '14px',
            maxWidth: '92%',
            width: '400px',
            textAlign: 'center',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.22)',
            color: 'var(--text-color)',
            boxSizing: 'border-box'
        },
        badgeContainer: {
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--accent-bg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto'
        },
        statsCard: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '12px 16px',
            margin: '16px 0',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        statRow: {
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onContinue}>
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={styles.badgeContainer}>
                    <Trophy size={28} color="var(--accent-color)" />
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-color)', marginBottom: '4px' }}>
                    Milestone Reached!
                </div>

                <div style={{ fontSize: '0.92rem', color: 'var(--muted-text)', lineHeight: '1.45' }}>
                    You've completed <strong>{milestone} tasks</strong> today. Outstanding focus!
                </div>

                <div style={styles.statsCard}>
                    <div style={styles.statRow}>
                        <span style={{ color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={15} color="#10b981" /> Tasks Completed Today
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-color)' }}>{todayCompleted}</strong>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border-color)', opacity: 0.6 }} />
                    <div style={styles.statRow}>
                        <span style={{ color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Flame size={15} color="#f59e0b" /> Total Archived All Time
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-color)' }}>{totalArchived}</strong>
                    </div>
                </div>

                <button
                    onClick={onContinue}
                    style={{
                        width: '100%',
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--accent-color)',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        transition: 'opacity 0.15s ease'
                    }}
                >
                    <span>Keep Going</span>
                    <ArrowRight size={16} />
                </button>
            </motion.div>
        </div>
    );
};

export default CongratsModal;
