import React from 'react';
import { Keyboard } from 'lucide-react';

export const SHORTCUTS_LIST = [
    { keys: ['⌘ / Ctrl', 'K'], desc: 'Open Command Palette' },
    { keys: ['Q', 'A'], desc: 'Toggle Add Task Panel' },
    { keys: ['/'], desc: 'Focus Search Bar' },
    { keys: ['S'], desc: 'Open Settings' },
    { keys: ['Esc'], desc: 'Close Modal / Cancel / Unfocus' },
    { keys: ['Enter'], desc: 'Save task (when editing/adding)' },
    { keys: ['Shift + Enter'], desc: 'Insert line break in notes' }
];

const SettingsShortcutsTab = ({ styles }) => {
    return (
        <div>
            <div style={styles.sectionTitle}>
                <Keyboard size={20} /> Keyboard Shortcuts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {SHORTCUTS_LIST.map((s, idx) => (
                    <div key={idx} style={styles.shortcutItem}>
                        <span style={{ color: 'var(--text-color)', fontWeight: '500' }}>{s.desc}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {s.keys.map(k => (
                                <kbd key={k} style={styles.kbdBadge}>{k}</kbd>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SettingsShortcutsTab;
