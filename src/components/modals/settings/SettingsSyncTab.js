import React, { useState } from 'react';
import { Cloud, Download, Image as ImageIcon } from 'lucide-react';
import { getAllPhotos } from '../../../utils/photoStorage';
import { createZipBlob, dataUrlToBytes, downloadBlob } from '../../../utils/zipUtils';
import { getPhotoExportFileName } from '../../../utils/imageUtils';

const SettingsSyncTab = ({
    syncProvider = 'cloudflare',
    setSyncProvider,
    onOpenSyncModal,
    syncStatus = 'idle',
    isAuthed = false,
    isOffline = false,
    onOpenExport,
    onClose,
    getCompactSyncButtonStyle,
    getCompactSyncStatusText,
    styles
}) => {
    const [isExportingPhotos, setIsExportingPhotos] = useState(false);
    const [photoExportStatus, setPhotoExportStatus] = useState('');

    const handleExportPhotosZip = async () => {
        if (isExportingPhotos) return;
        setIsExportingPhotos(true);
        setPhotoExportStatus('Gathering photos...');
        try {
            const allPhotos = await getAllPhotos();
            if (!allPhotos || allPhotos.length === 0) {
                alert('No photo attachments found in any notes.');
                setIsExportingPhotos(false);
                setPhotoExportStatus('');
                return;
            }

            const usedNames = new Set();
            const files = [];

            for (const photo of allPhotos) {
                const dataUrl = photo.dataUrl || photo.thumbnail;
                if (!dataUrl) continue;
                const bytes = dataUrlToBytes(dataUrl);
                if (!bytes || bytes.length === 0) continue;

                const ext = dataUrl.includes('image/png') ? 'png' : dataUrl.includes('image/webp') ? 'webp' : 'jpg';
                let name = getPhotoExportFileName(photo, ext);

                let counter = 1;
                let uniqueName = name;
                while (usedNames.has(uniqueName)) {
                    const dotIdx = name.lastIndexOf('.');
                    if (dotIdx !== -1) {
                        uniqueName = `${name.slice(0, dotIdx)}_${counter}${name.slice(dotIdx)}`;
                    } else {
                        uniqueName = `${name}_${counter}`;
                    }
                    counter++;
                }
                usedNames.add(uniqueName);

                files.push({
                    name: uniqueName,
                    data: bytes,
                    date: photo.timestamp ? new Date(photo.timestamp) : new Date()
                });
            }

            if (files.length === 0) {
                alert('No photo data available to export.');
                setIsExportingPhotos(false);
                setPhotoExportStatus('');
                return;
            }

            const zipBlob = createZipBlob(files);
            const dateStr = new Date().toISOString().split('T')[0];
            downloadBlob(zipBlob, `123todo-photos-${dateStr}.zip`);

            setPhotoExportStatus(`Exported ${files.length} photos!`);
            setTimeout(() => {
                setPhotoExportStatus('');
                setIsExportingPhotos(false);
            }, 3000);
        } catch (err) {
            console.error('Error creating photos ZIP export:', err);
            alert('Failed to export photos ZIP archive.');
            setIsExportingPhotos(false);
            setPhotoExportStatus('');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={styles.sectionTitle}>Cloud Sync & Backup Options</div>
                {onOpenSyncModal && (
                    <button
                        onClick={onOpenSyncModal}
                        style={getCompactSyncButtonStyle()}
                        title={syncStatus === 'syncing' ? "Syncing in background..." : (isAuthed ? "Cloud Sync Active - Click to configure" : "Click to setup sync")}
                    >
                        {(!isOffline && typeof navigator !== 'undefined' && navigator.onLine) && (
                            <span
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: isAuthed ? (syncStatus === 'error' ? '#ef4444' : '#10b981') : '#ef4444',
                                    boxShadow: `0 0 4px ${isAuthed ? (syncStatus === 'error' ? '#ef4444' : '#10b981') : '#ef4444'}`,
                                    display: 'inline-block',
                                    flexShrink: 0,
                                    animation: syncStatus === 'syncing' ? 'pulseDot 1.2s infinite ease-in-out' : 'none'
                                }}
                            />
                        )}
                        <span>{getCompactSyncStatusText()}</span>
                    </button>
                )}
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--muted-text)', marginBottom: '16px', lineHeight: '1.4' }}>
                Choose your preferred cross-platform sync engine to keep your tasks seamlessly updated across mobile, laptop, and desktop devices.
            </div>

            <div style={{ marginBottom: '20px', background: 'var(--item-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-color)' }}>
                    Active Sync Provider
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}>
                    <input
                        type="radio"
                        name="syncProvider"
                        value="cloudflare"
                        checked={syncProvider === 'cloudflare'}
                        onChange={() => setSyncProvider && setSyncProvider('cloudflare')}
                        style={{ marginTop: '3px' }}
                    />
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-color)' }}>
                            123ToDo Cloud Sync (Recommended - Set & Forget)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '2px', lineHeight: '1.35' }}>
                            Zero 1-hour OAuth drops, 100% iPhone & Safari PWA ready, E2E Zero-Knowledge encrypted.
                        </div>
                    </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input
                        type="radio"
                        name="syncProvider"
                        value="gdrive"
                        checked={syncProvider === 'gdrive'}
                        onChange={() => setSyncProvider && setSyncProvider('gdrive')}
                        style={{ marginTop: '3px' }}
                    />
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-color)' }}>
                            Google Drive AppData
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '2px', lineHeight: '1.35' }}>
                            Sync to your personal Google Drive account. (May require frequent Google re-authentication on iOS Safari).
                        </div>
                    </div>
                </label>
            </div>

            {onOpenSyncModal && (
                <button
                    onClick={onOpenSyncModal}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--accent-color)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Cloud size={18} /> Manage Sync Credentials & Device Pairing
                </button>
            )}

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={18} /> Physical Data & Photo Backups
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--muted-text)', marginBottom: '14px', lineHeight: '1.4' }}>
                    Keep physical, offline backups of your tasks and attached note photos stored safely on your device.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {onOpenExport && (
                        <button
                            type="button"
                            onClick={() => {
                                if (onClose) onClose();
                                onOpenExport();
                            }}
                            style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--item-bg)',
                                color: 'var(--text-color)',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textAlign: 'left'
                            }}
                        >
                            <Download size={16} style={{ color: 'var(--accent-color)' }} />
                            <span>Export Tasks (.JSON)</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleExportPhotosZip}
                        disabled={isExportingPhotos}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--item-bg)',
                            color: 'var(--text-color)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: isExportingPhotos ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textAlign: 'left',
                            opacity: isExportingPhotos ? 0.7 : 1
                        }}
                    >
                        <ImageIcon size={16} style={{ color: '#0ea5e9' }} />
                        <span>{photoExportStatus || (isExportingPhotos ? 'Exporting...' : 'Export All Photos (.ZIP)')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsSyncTab;
