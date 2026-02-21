import React from 'react';
import { COMMON_STYLES } from '../../utils/styles';

const CongratsModal = ({ milestone, todayCompleted, totalArchived, onContinue }) => {
    const styles = {
        congratsModal: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '40px 30px',
            borderRadius: '20px',
            maxWidth: '90%',
            width: '400px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay}>
            <div style={styles.congratsModal}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    Congratulations!
                </div>
                <div style={{ fontSize: '1.1rem', marginBottom: '20px', opacity: 0.9, lineHeight: '1.4' }}>
                    You've completed {milestone} tasks today!
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '15px',
                    margin: '20px 0',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'left'
                }}>
                    <div>Tasks Completed Today: <strong>{todayCompleted}</strong></div>
                    <div>Total All Time: <strong>{totalArchived}</strong></div>
                    <div style={{ marginTop: '5px' }}>Keep going you're on a roll! 🚀</div>
                </div>
                <button
                    onClick={onContinue}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        padding: '12px 30px',
                        borderRadius: '25px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '10px'
                    }}
                >
                    Continue Being Awesome!
                </button>
            </div>
        </div>
    );
};

export default CongratsModal;
