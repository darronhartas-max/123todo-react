import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Share2, Copy, Check, Mail } from 'lucide-react';
import { COMMON_STYLES } from '../../utils/styles';

const ExportModal = ({ data, onClose, onRecordBackup }) => {
    const [copied, setCopied] = useState(false);
    const [isSavePickerSupported, setIsSavePickerSupported] = useState(false);
    const [isShareSupported, setIsShareSupported] = useState(false);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        setIsSavePickerSupported(typeof window !== 'undefined' && 'showSaveFilePicker' in window);
        setIsShareSupported(typeof navigator !== 'undefined' && 'share' in navigator && 'File' in window);
        
        const dateStr = new Date().toISOString().split('T')[0];
        setFileName(`123todo-backup-${dateStr}.json`);
    }, []);

    const backupString = JSON.stringify(data, null, 2);

    const triggerFallbackDownload = () => {
        const blob = new Blob([backupString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onRecordBackup();
        onClose();
    };

    const handleSaveLocally = async () => {
        if (!isSavePickerSupported) {
            triggerFallbackDownload();
            return;
        }

        try {
            const opts = {
                suggestedName: fileName,
                types: [{
                    description: '123 ToDo Backup File',
                    accept: { 'application/json': ['.json'] },
                }],
            };
            const handle = await window.showSaveFilePicker(opts);
            const writable = await handle.createWritable();
            await writable.write(backupString);
            await writable.close();
            onRecordBackup();
            onClose();
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('File System Access API save failed:', err);
                // Fallback to standard download
                triggerFallbackDownload();
            }
        }
    };

    const handleShareBackup = async () => {
        try {
            const file = new File([backupString], fileName, { type: 'application/json' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: '123 To Do Backup',
                    text: 'Here is my 123 To Do tasks backup file.'
                });
                onRecordBackup();
                onClose();
            } else {
                alert("Direct file sharing is not supported by your browser/device configuration. We will copy your backup data to your clipboard and open your email client instead.");
                handleEmailFallback();
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Sharing failed:', err);
                alert("Direct file sharing is not supported on this browser/OS configuration. Your backup data has been copied to your clipboard, and your email client will now open so you can paste it.");
                handleEmailFallback();
            }
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(backupString).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Clipboard copy failed:', err);
        });
    };

    const handleEmailFallback = () => {
        // Since mailto doesn't support attachments, we copy the JSON and open mailto
        handleCopyToClipboard();
        const mailtoUrl = `mailto:?subject=123%20ToDo%20Backup&body=Please%20paste%20your%20copied%20backup%20data%20here%3A%0A%0A%5BPASTE%20HERE%5D`;
        window.open(mailtoUrl, '_blank');
    };

    const styles = {
        exportModal: {
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            padding: '24px 20px',
            borderRadius: '16px',
            maxWidth: '90%',
            width: '460px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            textAlign: 'center',
            maxHeight: '85vh',
            overflowY: 'auto',
            border: '1px solid var(--border-color)'
        },
        title: {
            margin: '0 0 10px 0',
            fontSize: '1.4rem',
            fontWeight: '700',
            color: 'var(--text-color)'
        },
        card: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        cardText: {
            flex: 1
        },
        cardTitle: {
            fontWeight: '700',
            fontSize: '1.05rem',
            color: 'var(--text-color)',
            marginBottom: '4px'
        },
        cardDesc: {
            fontSize: '0.85rem',
            color: 'var(--muted-text)',
            lineHeight: '1.3'
        },
        iconCircle: {
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--item-bg)',
            color: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                style={styles.exportModal}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={styles.title}>Export Tasks & Settings</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', display: 'flex' }}>
                        <X size={22} />
                    </button>
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--muted-text)', marginBottom: '20px', lineHeight: '1.4', textAlign: 'left' }}>
                    Choose how you want to save or share your backup file. Regular backups ensure you don't lose any data.
                </p>

                {/* Save Locally Card */}
                <div style={styles.card} onClick={handleSaveLocally}>
                    <div style={styles.iconCircle}>
                        <Download size={20} />
                    </div>
                    <div style={styles.cardText}>
                        <div style={styles.cardTitle}>Save File Locally</div>
                        <div style={styles.cardDesc}>
                            {isSavePickerSupported 
                                ? 'Choose a custom folder location. Your browser will remember this folder next time.' 
                                : 'Download backup file to your standard browser Downloads folder.'}
                        </div>
                    </div>
                </div>

                {/* Email / Share Attachment Card */}
                {isShareSupported ? (
                    <div style={styles.card} onClick={handleShareBackup}>
                        <div style={styles.iconCircle}>
                            <Share2 size={20} />
                        </div>
                        <div style={styles.cardText}>
                            <div style={styles.cardTitle}>Email / Share Backup</div>
                            <div style={styles.cardDesc}>
                                Attach the backup file automatically to Mail, Gmail, or messaging clients on your device.
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={styles.card} onClick={handleEmailFallback}>
                        <div style={styles.iconCircle}>
                            <Mail size={20} />
                        </div>
                        <div style={styles.cardText}>
                            <div style={styles.cardTitle}>Email Backup Data</div>
                            <div style={styles.cardDesc}>
                                Copies backup text to your clipboard and opens your email client for you to paste.
                            </div>
                        </div>
                    </div>
                )}

                {/* Copy to Clipboard Card */}
                <div style={styles.card} onClick={handleCopyToClipboard}>
                    <div style={styles.iconCircle}>
                        {copied ? <Check size={20} style={{ color: '#10b981' }} /> : <Copy size={20} />}
                    </div>
                    <div style={styles.cardText}>
                        <div style={styles.cardTitle}>
                            {copied ? 'Copied successfully!' : 'Copy to Clipboard'}
                        </div>
                        <div style={styles.cardDesc}>
                            Copy raw JSON backup data to manually paste it into any document or email client.
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            fontSize: '1rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: 'var(--item-bg)',
                            color: 'var(--text-color)',
                            fontWeight: '600'
                        }}
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ExportModal;
