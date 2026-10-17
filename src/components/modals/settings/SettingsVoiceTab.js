import React from 'react';
import { Mic } from 'lucide-react';

const SettingsVoiceTab = ({ styles }) => {
    return (
        <div>
            <div style={styles.sectionTitle}>
                <Mic size={20} /> Voice Input & Dictation Guide
            </div>

            <div style={{
                background: 'var(--bg-color)',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                marginBottom: '20px',
                fontSize: '0.88rem',
                lineHeight: '1.55'
            }}>
                <div style={{ fontWeight: '700', marginBottom: '8px', color: 'var(--accent-color)' }}>
                    Optimized Device Dictation:
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-color)' }}>
                    <li style={{ marginBottom: '6px' }}><strong>💻 Desktop Dictation (Mac / PC)</strong>: Hands-free continuous dictation across thinking pauses. Speaks directly into titles or notes with live spoken punctuation (<em>"comma"</em>, <em>"full stop"</em>) and editing commands (<em>"delete last 2 words"</em>, <em>"spell out..."</em>).</li>
                    <li style={{ marginBottom: '6px' }}><strong>📱 Mobile Quick-Capture (Phones / Tablets)</strong>: Tap the in-app Voice button to dictate a quick thought or task. When you finish speaking, it captures cleanly without repetitive system bleep loops or dropped words. Tap again anytime to append more.</li>
                    <li style={{ marginBottom: '6px' }}><strong>⚡ Continuous Long-Form Dictation on Mobile</strong>: For uninterrupted, multi-minute continuous dictation on your phone without pauses cutting off, tap into the text area and press the <strong>🎙️ microphone icon on your keyboard</strong> (Gboard on Android, or Apple Dictation on iPhone). It provides hardware-accelerated continuous voice capture with zero interruptions!</li>
                    <li><strong>Spoken Auto-Submit</strong>: Say <em>"add task"</em> or <em>"save note"</em> at the end of speech to instantly save hands-free.</li>
                </ul>
            </div>

            <div style={{
                background: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '16px',
                lineHeight: '1.5'
            }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '8px' }}>
                    ✍️ Spoken Punctuation:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                    <div style={styles.voiceGuideTag}>🗣️ <em>"full stop"</em> <strong style={{ color: 'var(--accent-color)' }}>.</strong></div>
                    <div style={styles.voiceGuideTag}>🗣️ <em>"comma"</em> <strong style={{ color: 'var(--accent-color)' }}>,</strong></div>
                    <div style={styles.voiceGuideTag}>🗣️ <em>"question mark"</em> <strong style={{ color: 'var(--accent-color)' }}>?</strong></div>
                    <div style={styles.voiceGuideTag}>🗣️ <em>"exclamation mark"</em> <strong style={{ color: 'var(--accent-color)' }}>!</strong></div>
                    <div style={styles.voiceGuideTag}>🗣️ <em>"colon"</em> <strong style={{ color: 'var(--accent-color)' }}>:</strong></div>
                    <div style={styles.voiceGuideTag}>🗣️ <em>"semi colon"</em> <strong style={{ color: 'var(--accent-color)' }}>;</strong></div>
                    <div style={styles.voiceGuideTag}>🗣️ <em>"new line"</em> <strong style={{ color: 'var(--accent-color)' }}>[↵]</strong></div>
                    <div style={styles.voiceGuideTag}>🗣️ <em>"hyphen"</em> / <em>"dash"</em> <strong style={{ color: 'var(--accent-color)' }}>-</strong></div>
                </div>

                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '8px' }}>
                    ✂️ Voice Editing Commands:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <div style={styles.voiceGuideRow}>
                        <div><kbd style={styles.kbdBadge}>"delete last word"</kbd> or <kbd style={styles.kbdBadge}>"scratch that"</kbd></div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Removes the last spoken word</span>
                    </div>
                    <div style={styles.voiceGuideRow}>
                        <div><kbd style={styles.kbdBadge}>"delete last 2 words"</kbd> (or 3, 4, 5)</div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Removes N words from input</span>
                    </div>
                    <div style={styles.voiceGuideRow}>
                        <div><kbd style={styles.kbdBadge}>"delete last sentence"</kbd> or <kbd style={styles.kbdBadge}>"scratch last sentence"</kbd></div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Deletes the most recent sentence</span>
                    </div>
                    <div style={styles.voiceGuideRow}>
                        <div><kbd style={styles.kbdBadge}>"change last word to [word]"</kbd></div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Replaces the previous word with your correction</span>
                    </div>
                    <div style={styles.voiceGuideRow}>
                        <div><kbd style={styles.kbdBadge}>"change [wordA] to [wordB]"</kbd></div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Replaces any prior word with a new one</span>
                    </div>
                    <div style={styles.voiceGuideRow}>
                        <div><kbd style={styles.kbdBadge}>"clear all"</kbd> or <kbd style={styles.kbdBadge}>"delete all"</kbd></div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Clears the entire text field</span>
                    </div>
                </div>

                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '8px' }}>
                    🔤 Spell Words Letter-by-Letter:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <div style={styles.voiceGuideRow}>
                        <div><kbd style={styles.kbdBadge}>"spell S M Y T H E"</kbd> or <kbd style={styles.kbdBadge}>"spell out D A R R O N"</kbd></div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Spells unusual names or words letter-by-letter</span>
                    </div>
                    <div style={styles.voiceGuideRow}>
                        <div><kbd style={styles.kbdBadge}>"Rice spelled R H Y S"</kbd></div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Corrects previous misheard word with your spelling</span>
                    </div>
                    <div style={styles.voiceGuideRow}>
                        <div><kbd style={styles.kbdBadge}>"spell A double N A"</kbd></div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Supports "double [letter]" naturally</span>
                    </div>
                    <div style={styles.voiceGuideRow}>
                        <div><kbd style={styles.kbdBadge}>"spell all caps N A S A"</kbd> or <kbd style={styles.kbdBadge}>"spell H T M L"</kbd></div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Constructs uppercase acronyms</span>
                    </div>
                </div>

                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '8px' }}>
                    Auto-Submit Command:
                </div>
                <div style={styles.voiceGuideRow}>
                    <div><kbd style={styles.kbdBadge}>"add task"</kbd> or <kbd style={styles.kbdBadge}>"submit task"</kbd></div>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#10b981' }}>Strips command & automatically saves task!</span>
                </div>

                <p style={{ margin: '14px 0 0 0', fontSize: '0.82rem', color: 'var(--muted-text)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    💡 <strong>Mobile Friendly:</strong> On phones and tablets, dictation captures your phrase cleanly and concludes without triggering repetitive system confirmation chimes. Simply tap the mic again anytime to append more thoughts seamlessly!
                </p>
            </div>
        </div>
    );
};

export default SettingsVoiceTab;
