import React from 'react';
import { COMMON_STYLES } from '../../utils/styles';

const WelcomeModal = ({ onAccept }) => {
    const styles = {
        welcomeModal: {
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            padding: '24px 20px',
            borderRadius: '16px',
            maxWidth: '90%',
            width: '500px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            textAlign: 'center',
            maxHeight: '80vh',
            overflowY: 'auto'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay}>
            <div style={styles.welcomeModal}>
                <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '1.5rem', fontWeight: '700' }}>
                    Welcome to 123 To Do!
                </h2>
                <div style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '1.1rem' }}>
                    A sophisticated task management app with offline support
                </div>

                <div style={{
                    background: 'rgba(55, 48, 163, 0.1)',
                    border: '1px solid var(--accent-color)',
                    borderRadius: '8px',
                    padding: '16px',
                    margin: '16px 0',
                    fontSize: '1rem',
                    textAlign: 'left'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--accent-color)', fontSize: '1.1rem' }}>
                        For mobile use - Install as Home Screen App
                    </h4>
                    <div style={{ marginBottom: '12px' }}>
                        <strong>iPhone/iPad:</strong>
                        <ol style={{ margin: '8px 0 0 16px', color: 'var(--text-color)' }}>
                            <li>Tap the Share button (square with arrow)</li>
                            <li>Scroll down and tap "Add to Home Screen"</li>
                            <li>Tap "Add" to confirm</li>
                        </ol>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <strong>Android:</strong>
                        <ol style={{ margin: '8px 0 0 16px', color: 'var(--text-color)' }}>
                            <li>Tap the menu button (3 dots)</li>
                            <li>Tap "Add to Home screen" or "Install app"</li>
                            <li>Tap "Add" or "Install" to confirm</li>
                        </ol>
                    </div>
                    <p><strong>Benefits:</strong> Works offline with faster loading.</p>
                </div>

                <div style={{
                    background: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '20px',
                    margin: '20px 0',
                    textAlign: 'left',
                    fontSize: '1rem',
                    lineHeight: '1.5'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: '600' }}>
                        🛡️ Important Notice - Terms of Use
                    </h4>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--muted-text)' }}>
                        <strong>Use at Your Own Risk:</strong> This application is provided "as is" without warranties. You use this software entirely at your own risk.
                    </p>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--muted-text)' }}>
                        <strong>Data Responsibility:</strong> You are solely responsible for backing up your data. We recommend regular exports of your tasks.
                    </p>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--muted-text)' }}>
                        <strong>Local Storage:</strong> Your data is stored locally in your browser and may be lost due to browser settings, updates, or other factors beyond our control.
                    </p>
                    <p style={{ margin: '0', color: 'var(--muted-text)' }}>
                        For complete terms: <a href="https://www.123todo.com/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>www.123todo.com/terms</a>
                    </p>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        onClick={() => window.open('https://www.123todo.com/terms', '_blank')}
                        style={{
                            padding: '12px 24px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: 'var(--item-bg)',
                            color: 'var(--text-color)'
                        }}
                    >
                        View Terms First
                    </button>
                    <button
                        onClick={onAccept}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        I Understand, Let's Start!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
