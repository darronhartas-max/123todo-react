import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

const SettingsVoiceTab = ({ styles }) => {
    const [isTesting, setIsTesting] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [soundDetected, setSoundDetected] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [permError, setPermError] = useState(null);
    const [silenceHint, setSilenceHint] = useState(false);

    const streamRef = useRef(null);
    const audioCtxRef = useRef(null);
    const animFrameRef = useRef(null);
    const silenceTimeoutRef = useRef(null);

    const stopTest = () => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
        if (streamRef.current) {
            try {
                streamRef.current.getTracks().forEach(t => t.stop());
            } catch (e) {}
            streamRef.current = null;
        }
        if (audioCtxRef.current) {
            try {
                audioCtxRef.current.close();
            } catch (e) {}
            audioCtxRef.current = null;
        }
        setIsTesting(false);
        setAudioLevel(0);
    };

    useEffect(() => {
        return () => {
            stopTest();
        };
    }, []);

    const startTest = async () => {
        setPermError(null);
        setSoundDetected(false);
        setSilenceHint(false);

        if (!navigator?.mediaDevices?.getUserMedia) {
            setPermError('Audio input is not supported in this browser environment.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            try {
                const track = stream.getAudioTracks()[0];
                if (track && track.label) {
                    setDeviceName(track.label);
                } else if (navigator.mediaDevices.enumerateDevices) {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const audioIn = devices.find(d => d.kind === 'audioinput' && d.label);
                    if (audioIn) setDeviceName(audioIn.label);
                }
            } catch (e) {
                console.warn('Could not read audio device label:', e);
            }

            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) {
                setIsTesting(true);
                return;
            }

            const audioCtx = new AudioCtx();
            audioCtxRef.current = audioCtx;

            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.3;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            setIsTesting(true);

            silenceTimeoutRef.current = setTimeout(() => {
                setSilenceHint(true);
            }, 3500);

            let hasDetectedAudio = false;

            const checkLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                const scaledLevel = Math.min(100, Math.round((average / 50) * 100));
                setAudioLevel(scaledLevel);

                if (scaledLevel > 8 && !hasDetectedAudio) {
                    hasDetectedAudio = true;
                    setSoundDetected(true);
                    setSilenceHint(false);
                    if (silenceTimeoutRef.current) {
                        clearTimeout(silenceTimeoutRef.current);
                        silenceTimeoutRef.current = null;
                    }
                }

                animFrameRef.current = requestAnimationFrame(checkLevel);
            };

            animFrameRef.current = requestAnimationFrame(checkLevel);
        } catch (err) {
            setIsTesting(false);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermError('permission-denied');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setPermError('no-device');
            } else {
                setPermError(err.message || 'Unable to access microphone.');
            }
        }
    };

    return (
        <div>
            <div style={styles.sectionTitle}>
                <Mic size={20} /> Voice Input & Dictation Guide
            </div>

            {/* Microphone Live Diagnostics & Level Tester */}
            <div style={{
                background: 'var(--bg-color)',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                marginBottom: '20px',
                lineHeight: '1.5'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Volume2 size={18} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-color)' }}>
                                Microphone & Audio Check
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                                Verify in real-time that 123 To Do can hear your voice clearly.
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={isTesting ? stopTest : startTest}
                        style={{
                            background: isTesting ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
                            color: isTesting ? '#ef4444' : '#dc2626',
                            border: isTesting ? '1px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.35)',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                        }}
                    >
                        {isTesting ? <><MicOff size={15} color="#ef4444" /> Stop Test</> : <><Mic size={15} color="rgba(239, 68, 68, 0.65)" /> Test Mic</>}
                    </button>
                </div>

                {isTesting && (
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <Mic size={14} color={soundDetected ? "#ef4444" : "rgba(239, 68, 68, 0.65)"} />
                            <span><strong>Audio Device:</strong> {deviceName || 'Default Microphone'}</span>
                        </div>

                        {/* VU Audio Level Bar */}
                        <div style={{
                            background: 'var(--surface-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            height: '10px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: `${audioLevel}%`,
                                    background: soundDetected ? '#10b981' : 'var(--accent-color)',
                                    transition: 'width 0.05s ease',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>

                        <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                            {soundDetected ? (
                                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                    <CheckCircle2 size={14} /> Sound detected! Your microphone is working.
                                </span>
                            ) : (
                                <span style={{ color: 'var(--muted-text)' }}>
                                    Listening... Speak naturally into your mic to test levels.
                                </span>
                            )}
                            <span style={{ color: 'var(--muted-text)', fontVariantNumeric: 'tabular-nums', fontWeight: '600' }}>
                                {audioLevel}%
                            </span>
                        </div>

                        {silenceHint && (
                            <div style={{
                                marginTop: '12px',
                                padding: '10px 12px',
                                background: 'var(--surface-color)',
                                border: '1px dashed var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                color: 'var(--text-color)',
                                lineHeight: '1.5'
                            }}>
                                <div style={{ fontWeight: '700', color: 'var(--accent-color)', marginBottom: '4px' }}>
                                    💡 No sound detected?
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--muted-text)' }}>
                                    <li style={{ marginBottom: '4px' }}>
                                        <strong>Audio Interface (e.g. Focusrite Scarlett):</strong> Ensure your mic is plugged into <strong>Input 1 (Left channel)</strong>; browsers capture Channel 1.
                                    </li>
                                    <li style={{ marginBottom: '4px' }}>
                                        <strong>MacBook in Closed Mode:</strong> Apple hardware disconnects the internal mic when closed. Use an external mic or open the laptop lid.
                                    </li>
                                    <li>
                                        <strong>Browser Default Device:</strong> In Google Chrome, confirm your interface is selected at <kbd style={styles.kbdBadge}>chrome://settings/content/microphone</kbd>.
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {permError && (
                    <div style={{
                        marginTop: '12px',
                        padding: '12px 14px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        lineHeight: '1.5'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: '700', marginBottom: '6px' }}>
                            <AlertTriangle size={16} /> Microphone Access Blocked
                        </div>
                        <p style={{ margin: '0 0 8px 0', color: 'var(--text-color)' }}>
                            Your browser or operating system has blocked microphone access for this app.
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--muted-text)', fontSize: '0.82rem' }}>
                            <li style={{ marginBottom: '4px' }}>
                                <strong>In Browser / Installed App:</strong> Click the lock or settings icon in the top window/address bar and set Microphone to <strong>Allow</strong>.
                            </li>
                            <li style={{ marginBottom: '4px' }}>
                                <strong>On Mac:</strong> In <strong>System Settings → Privacy & Security → Microphone</strong>, ensure your browser or 123 To Do is toggled <strong>ON</strong>.
                            </li>
                            <li>
                                <strong>In Chrome:</strong> Check your default input device at <kbd style={styles.kbdBadge}>chrome://settings/content/microphone</kbd>.
                            </li>
                        </ul>
                        <button
                            type="button"
                            onClick={startTest}
                            style={{
                                marginTop: '10px',
                                background: 'var(--accent-color)',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <RefreshCw size={13} /> Try Again
                        </button>
                    </div>
                )}
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
