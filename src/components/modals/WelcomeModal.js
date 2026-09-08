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
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))',
                    border: '1.5px solid var(--accent-color)',
                    borderRadius: '12px',
                    padding: '16px',
                    margin: '16px 0',
                    fontSize: '0.95rem',
                    textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.25rem' }}>📲</span>
                        <h4 style={{ margin: 0, color: 'var(--accent-color)', fontSize: '1.1rem', fontWeight: '700' }}>
                            Download & Install on Your Device (Recommended!)
                        </h4>
                    </div>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--text-color)', fontSize: '0.9rem', lineHeight: '1.45' }}>
                        123 To Do is a modern <strong>Progressive Web App (PWA)</strong>. You don't need to visit an app store—you can install it directly onto your phone, tablet, or computer right now in under 10 seconds! Installing gives you 1-tap home screen access, full-screen view without browser bars, and 100% offline capability.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ background: 'var(--bg-color)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: 'var(--text-color)', display: 'block', marginBottom: '4px' }}>
                                📱 iPhone & iPad (Safari):
                            </strong>
                            <div style={{ color: 'var(--muted-text)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                                Tap the <strong>Share button</strong> (square with up arrow ⬆️) ➔ scroll down and tap <strong>"Add to Home Screen"</strong> ➔ tap <strong>"Add"</strong>.
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-color)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: 'var(--text-color)', display: 'block', marginBottom: '4px' }}>
                                🤖 Android (Chrome):
                            </strong>
                            <div style={{ color: 'var(--muted-text)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                                Tap the <strong>three dots (⋮)</strong> menu ➔ tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> ➔ tap <strong>Install</strong>.
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-color)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: 'var(--text-color)', display: 'block', marginBottom: '4px' }}>
                                💻 Mac & Windows PC (Chrome / Edge / Safari):
                            </strong>
                            <div style={{ color: 'var(--muted-text)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                                Click the <strong>Install icon</strong> in your browser address bar (or Safari ➔ File ➔ "Add to Dock").
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <a 
                            href="/how-to-install-123todo-pwa.md" 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}
                        >
                            📖 Read our beginner PWA guide ➔
                        </a>
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
