import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, ShieldCheck, Smartphone, Check } from 'lucide-react';

const SyncModal = ({
    isOpen,
    onClose,
    syncProvider,
    setSyncProvider,
    cloudflareSync,
    gdriveSync
}) => {
    const isCloudflare = syncProvider === 'cloudflare';
    const activeSync = isCloudflare ? cloudflareSync : gdriveSync;

    const {
        isAuthed,
        syncStatus,
        passphrase,
        setPassphrase,
        connectSync,
        disconnectSync,
        generatePairCode,
        signIn,
        signOut,
        performSync
    } = activeSync;

    const [localPassphrase, setLocalPassphrase] = useState(passphrase || '');
    const [pairCodeInput, setPairCodeInput] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [showPassphrase, setShowPassphrase] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pairStatus, setPairStatus] = useState('');

    useEffect(() => {
        setLocalPassphrase(passphrase || '');
    }, [passphrase]);

    useEffect(() => {
        if (isSaving && syncStatus === 'synced') {
            setIsSaving(false);
            onClose();
        }
    }, [syncStatus, isSaving, onClose]);

    if (!isOpen) return null;

    const handleConnectCloudflare = async () => {
        if (!localPassphrase) {
            setPairStatus('Please enter an Encryption Passphrase to secure your data.');
            return;
        }
        setPairStatus('Connecting to 123ToDo Cloud Sync...');
        const result = await connectSync(localPassphrase, pairCodeInput ? pairCodeInput.trim() : null);
        if (result && result.success) {
            setPairStatus('Connected successfully! 🎉');
            setIsSaving(true);
            performSync(true);
        } else {
            setPairStatus(`Connection error: ${result?.error || 'Failed to connect'}`);
        }
    };

    const handleGeneratePairCode = async () => {
        setPairStatus('Generating 6-digit pairing code...');
        const code = await generatePairCode();
        if (code) {
            setGeneratedCode(code);
            setPairStatus('Code generated! Enter this 6-digit code on your second device within 10 minutes.');
        } else {
            setPairStatus('Failed to generate pairing code.');
        }
    };

    const handleSavePassphrase = () => {
        setPassphrase(localPassphrase);
        if (isAuthed) {
            setIsSaving(true);
            performSync(true);
        }
    };

    const handleDisconnect = () => {
        if (isCloudflare) {
            disconnectSync();
        } else {
            signOut();
        }
        onClose();
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)'
        },
        modal: {
            background: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '440px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            color: 'var(--text-color)',
            maxHeight: '90vh',
            overflowY: 'auto'
        },
        header: {
            margin: '0 0 16px 0',
            fontSize: '1.2rem',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
        },
        providerSelector: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '4px',
            display: 'flex',
            marginBottom: '16px',
            gap: '4px'
        },
        providerTab: (active) => ({
            flex: 1,
            padding: '8px 10px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: '700',
            cursor: 'pointer',
            background: active ? 'var(--accent-color)' : 'transparent',
            color: active ? '#ffffff' : 'var(--muted-text)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
        }),
        input: {
            width: '100%',
            padding: '10px 12px',
            marginBottom: '12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            boxSizing: 'border-box',
            fontSize: '0.9rem'
        },
        button: {
            padding: '10px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            width: '100%',
            marginBottom: '8px',
            fontSize: '0.9rem'
        },
        primaryBtn: {
            background: 'var(--accent-color)',
            color: 'white'
        },
        dangerBtn: {
            background: '#ef4444',
            color: 'white'
        },
        secondaryBtn: {
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
        },
        statusBadge: {
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: syncStatus === 'synced' ? 'rgba(16, 185, 129, 0.15)' : 'var(--item-bg)',
            color: syncStatus === 'synced' ? '#10b981' : 'var(--text-color)',
            border: '1px solid var(--border-color)'
        }
    };

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.modal}
            >
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                        <Cloud size={20} color="var(--accent-color)" />
                        Cloud Sync & Backup
                    </div>
                    <span style={styles.statusBadge}>{syncStatus.toUpperCase()}</span>
                </div>

                {/* Dual Provider Selection Tabs */}
                <div style={styles.providerSelector}>
                    <button
                        style={styles.providerTab(isCloudflare)}
                        onClick={() => setSyncProvider('cloudflare')}
                    >
                        <ShieldCheck size={14} />
                        123ToDo Sync (Set & Forget)
                    </button>
                    <button
                        style={styles.providerTab(!isCloudflare)}
                        onClick={() => setSyncProvider('gdrive')}
                    >
                        Google Drive
                    </button>
                </div>

                {isCloudflare ? (
                    <div>
                        <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: '1.4' }}>
                            🔒 <strong>Instant Cloud Sync</strong>: Keep your tasks updated across your phone, tablet, and computer without constant re-login prompts.
                        </div>

                        {!isAuthed ? (
                            <div>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '0.88rem' }}>
                                        1. Secret Passphrase
                                    </label>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginBottom: '6px' }}>
                                        Create a password to keep your tasks private. Use the exact same passphrase on all your devices.
                                    </div>
                                    <input
                                        type={showPassphrase ? 'text' : 'password'}
                                        style={styles.input}
                                        value={localPassphrase}
                                        onChange={(e) => setLocalPassphrase(e.target.value)}
                                        placeholder="Enter secret passphrase (e.g. MyPassphrase123)"
                                    />
                                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginTop: '-6px', marginBottom: '10px' }}>
                                        <input type="checkbox" checked={showPassphrase} onChange={(e) => setShowPassphrase(e.target.checked)} />
                                        Show Passphrase
                                    </label>
                                </div>

                                <div style={{ marginBottom: '14px', background: 'var(--item-bg)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '0.88rem' }}>
                                        2. Connecting a Second Device?
                                    </label>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginBottom: '6px' }}>
                                        If you already set up sync on another device (e.g. Laptop), enter the 6-digit pairing code from that device below:
                                    </div>
                                    <input
                                        type="text"
                                        style={{ ...styles.input, marginBottom: '0' }}
                                        value={pairCodeInput}
                                        onChange={(e) => setPairCodeInput(e.target.value)}
                                        placeholder="Enter 6-digit code (Leave blank if 1st device)"
                                        maxLength={6}
                                    />
                                </div>

                                {pairStatus && (
                                    <div style={{ fontSize: '0.82rem', color: 'var(--accent-color)', marginBottom: '12px', fontWeight: '600' }}>
                                        {pairStatus}
                                    </div>
                                )}

                                <button
                                    style={{ ...styles.button, ...styles.primaryBtn }}
                                    onClick={handleConnectCloudflare}
                                    disabled={!localPassphrase}
                                >
                                    Enable Instant Cloud Sync
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div style={{ background: 'var(--item-bg)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <Check size={16} /> Connected & Syncing
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                                        Your tasks are syncing across all connected devices.
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>
                                        📱 Connect Another Device (Phone, Tablet, PC)
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginBottom: '10px', lineHeight: '1.4' }}>
                                        To link a new phone or computer to this device:
                                        <br />
                                        1. Open 123ToDo on your second device and go to <strong>Settings → Cloud Sync</strong>.
                                        <br />
                                        2. Enter the same passphrase and the 6-digit code below.
                                    </div>

                                    {generatedCode ? (
                                        <div style={{ textAlign: 'center', background: 'var(--accent-bg)', border: '2px dashed var(--accent-color)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted-text)' }}>6-DIGIT PAIRING CODE</div>
                                            <div style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '4px', color: 'var(--accent-color)', margin: '4px 0' }}>{generatedCode}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>Enter this code on your second device (valid for 10 minutes)</div>
                                        </div>
                                    ) : (
                                        <button
                                            style={{ ...styles.button, ...styles.secondaryBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                            onClick={handleGeneratePairCode}
                                        >
                                            <Smartphone size={16} /> Get 6-Digit Pairing Code
                                        </button>
                                    )}
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />

                                <button
                                    style={{ ...styles.button, ...styles.dangerBtn }}
                                    onClick={handleDisconnect}
                                >
                                    Disconnect Sync
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                            Sync tasks using your personal Google Drive account.
                        </div>

                        {!isAuthed ? (
                            <button
                                style={{ ...styles.button, ...styles.primaryBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={signIn}
                            >
                                Sign in with Google
                            </button>
                        ) : (
                            <div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                                        Encryption Passphrase
                                    </label>
                                    <input
                                        type={showPassphrase ? "text" : "password"}
                                        style={styles.input}
                                        value={localPassphrase}
                                        onChange={(e) => setLocalPassphrase(e.target.value)}
                                        placeholder="Enter secure passphrase"
                                    />
                                    <button
                                        style={{ ...styles.button, ...styles.primaryBtn }}
                                        onClick={handleSavePassphrase}
                                        disabled={!localPassphrase}
                                    >
                                        Save & Sync Google Drive
                                    </button>
                                </div>
                                <button
                                    style={{ ...styles.button, ...styles.dangerBtn }}
                                    onClick={handleDisconnect}
                                >
                                    Sign Out of Google
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <button style={{ ...styles.button, ...styles.secondaryBtn, marginTop: '8px' }} onClick={onClose}>
                    Close
                </button>
            </motion.div>
        </div>
    );
};

export default SyncModal;
