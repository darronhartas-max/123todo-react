import React, { useState } from 'react';
import { COMMON_STYLES } from '../../utils/styles';
import { X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const TodoistImportModal = ({ onClose, onImport, projects: existingProjects }) => {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const parseCSV = (text) => {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (inQuotes) {
                if (char === '"') {
                    if (nextChar === '"') {
                        currentCell += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    currentCell += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    currentRow.push(currentCell);
                    currentCell = '';
                } else if (char === '\n' || char === '\r') {
                    if (char === '\r' && nextChar === '\n') i++;
                    currentRow.push(currentCell);
                    if (currentRow.some(cell => cell.trim() !== '')) {
                        rows.push(currentRow);
                    }
                    currentRow = [];
                    currentCell = '';
                } else {
                    currentCell += char;
                }
            }
        }
        if (currentRow.length > 0 || currentCell !== '') {
            currentRow.push(currentCell);
            if (currentRow.some(cell => cell.trim() !== '')) {
                rows.push(currentRow);
            }
        }
        return rows;
    };

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setIsProcessing(true);
        setError(null);

        const newProjects = [];

        try {
            for (const file of selectedFiles) {
                const text = await file.text();
                const rows = parseCSV(text);

                if (rows.length < 2) continue; // Header + at least one row

                const header = rows[0].map(h => h.trim().toUpperCase());
                const contentIdx = header.indexOf('CONTENT');
                const descIdx = header.indexOf('DESCRIPTION');
                const priorityIdx = header.indexOf('PRIORITY');

                if (contentIdx === -1) {
                    setError(`File "${file.name}" is missing a "CONTENT" column.`);
                    continue;
                }

                const projectName = file.name.replace(/\.[^/.]+$/, "");
                const tasks = rows.slice(1).map(row => {
                    // Priority mapping: T4->1, T3->2, T2->3, T1->4
                    const rawPriority = parseInt(row[priorityIdx]) || 1;
                    let mappedPriority = 1;
                    if (rawPriority === 4) mappedPriority = 1;
                    else if (rawPriority === 3) mappedPriority = 2;
                    else if (rawPriority === 2) mappedPriority = 3;
                    else if (rawPriority === 1) mappedPriority = 4;

                    return {
                        text: row[contentIdx] || 'Untitled Task',
                        notes: row[descIdx] || '',
                        priority: mappedPriority
                    };
                });

                newProjects.push({
                    name: projectName,
                    tasks: tasks
                });
            }

            setFiles(newProjects);
        } catch (err) {
            console.error('Import error:', err);
            setError('Failed to parse CSV files. Please ensure they are valid Todoist exports.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmImport = () => {
        onImport(files);
        onClose();
    };

    const styles = {
        ...COMMON_STYLES,
        modalContent: {
            ...COMMON_STYLES.modalContent,
            width: '450px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        },
        fileList: {
            flex: 1,
            overflowY: 'auto',
            margin: '12px 0',
            padding: '12px',
            background: 'var(--bg-color)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
        },
        fileItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: 'var(--surface-color)',
            borderRadius: '6px',
            marginBottom: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        },
        uploadArea: {
            border: '2px dashed var(--border-color)',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
            background: 'rgba(0,0,0,0.01)'
        },
        importBtn: {
            background: 'var(--accent-color)',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '16px',
            width: '100%'
        },
        cancelBtn: {
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer'
        }
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Todoist Import</h2>
                    <button onClick={onClose} style={styles.btnReset}><X size={24} /></button>
                </div>

                {!files.length ? (
                    <>
                        <p style={{ color: 'var(--muted-text)', marginBottom: '24px', fontSize: '0.95rem' }}>
                            Select one or more Todoist CSV export files. Each file will be imported as a separate project.
                        </p>
                        <div
                            style={styles.uploadArea}
                            onClick={() => document.getElementById('todoistFileInput').click()}
                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
                            <FileText size={48} style={{ color: 'var(--muted-text)', marginBottom: '12px' }} />
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Choose CSV Files</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>or drag and drop them here</div>
                        </div>
                        <input
                            type="file"
                            id="todoistFileInput"
                            accept=".csv,text/csv,application/vnd.ms-excel,text/comma-separated-values"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        {error && (
                            <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginTop: '12px' }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', marginBottom: '12px', fontWeight: '600' }}>
                            <CheckCircle2 size={18} />
                            Ready to import {files.length} project{files.length > 1 ? 's' : ''}
                        </div>
                        <div style={styles.fileList}>
                            {files.map((project, idx) => (
                                <div key={idx} style={styles.fileItem}>
                                    <div>
                                        <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{project.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{project.tasks.length} tasks</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            disabled={isProcessing}
                            onClick={handleConfirmImport}
                            style={{
                                ...styles.importBtn,
                                opacity: isProcessing ? 0.7 : 1,
                                cursor: isProcessing ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isProcessing ? 'Processing...' : 'Import Now'}
                        </button>
                        <button
                            onClick={() => setFiles([])}
                            style={{ ...styles.btnReset, color: 'var(--muted-text)', fontSize: '0.85rem', marginTop: '12px', width: '100%' }}
                        >
                            Select different files
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default TodoistImportModal;
