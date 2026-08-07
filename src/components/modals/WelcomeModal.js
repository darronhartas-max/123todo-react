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
                    <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h5 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-color)' }}>
                            ✨ Powerful Features Included:
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-color)', fontSize: '0.9rem', lineHeight: '1.4', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <li><strong>📝 Unlimited Task Notes:</strong> Rich task descriptions with no length cap.</li>
                            <li><strong>👈 Task Swipe Gestures:</strong> Swipe left or right to complete, delete, or edit.</li>
                            <li><strong>🔒 Encrypted Google Drive Sync:</strong> Keep your tasks in sync across all devices.</li>
                            <li><strong>🖐️ Custom Projects & Reordering:</strong> Drag and drop projects to organize your workflow.</li>
                            <li><strong>⚡ Works Offline:</strong> Instant loading with full offline PWA support.</li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    background: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '20px',
                    margin: '20px 0',
                    textAlign: 'left',
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: '600' }}>
                        🛡️ Important Notice & Legal Policy Summary
                    </h4>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--muted-text)' }}>
                        <strong>Privacy & Security:</strong> Tasks are stored 100% locally in your browser. Optional cloud sync uses end-to-end zero-knowledge encryption directly to your Google Drive. Voice dictation processes audio natively in your browser with zero server recording.
                    </p>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--muted-text)' }}>
                        <strong>Use at Your Own Risk:</strong> This application is provided "as is" without warranties. You use this software entirely at your own risk.
                    </p>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--muted-text)' }}>
                        <strong>Data Responsibility:</strong> You are solely responsible for backing up your tasks. Regular JSON exports or Google Drive sync are strongly recommended.
                    </p>
                    <p style={{ margin: '0', color: 'var(--muted-text)' }}>
                        Full Terms & Privacy Policy: <a href="https://www.123todo.com/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>www.123todo.com/terms</a> • <a href="https://www.123todo.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>www.123todo.com/privacy</a>
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
