import React, { useState, useRef } from 'react';
import { COMMON_STYLES } from '../../utils/styles';
import { PROJECT_COLORS, MAX_TASK_LENGTH } from '../../utils/constants';
import { X, FileText, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Layers, Info, ShieldCheck } from 'lucide-react';

// ─── Step identifiers ───────────────────────────────────────────────────────
const STEP_UPLOAD  = 'upload';
const STEP_MAP     = 'map';
const STEP_CONFIRM = 'confirm';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Robust RFC-4180 CSV parser */
const parseCSV = (text) => {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (next === '"') { currentCell += '"'; i++; }
                else { inQuotes = false; }
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
                if (char === '\r' && next === '\n') i++;
                currentRow.push(currentCell);
                if (currentRow.some(c => c.trim() !== '')) rows.push(currentRow);
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
    }
    // Final cell / row
    if (currentCell !== '' || currentRow.length > 0) {
        currentRow.push(currentCell);
        if (currentRow.some(c => c.trim() !== '')) rows.push(currentRow);
    }
    return rows;
};

/** Map a Todoist priority integer to 123todo priority (inverted scale) */
const mapPriority = (raw) => {
    const n = parseInt(raw);
    if (n === 1) return 4; // p1 urgent → Must Do (1) ... wait — Todoist p1 = urgent
    if (n === 2) return 3; // p2 → Should Do
    if (n === 3) return 2; // p3 → Could Do
    return 1;              // p4 / unknown → Must Do default
};

/**
 * Fuzzy project-name matcher: returns the existing project whose name most
 * closely matches the CSV filename, or null if no good match exists.
 */
const findBestMatch = (csvName, existingProjects) => {
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const norm = normalize(csvName);
    for (const p of existingProjects) {
        if (p.id === 'all') continue;
        const pNorm = normalize(p.name);
        if (norm === pNorm) return p;                      // exact
        if (norm.includes(pNorm) || pNorm.includes(norm)) return p; // substring
    }
    return null;
};

/** Parse a Todoist CSV file text into a structured project object */
const parseTodoistFile = (filename, text, taskLengthLimit = '250') => {
    const isUnlimited = taskLengthLimit === 'unlimited';
    const projectName = filename.replace(/\.[^/.]+$/, '');
    const rows = parseCSV(text);
    if (rows.length < 2) return { name: projectName, tasks: [], warnings: ['File appears empty'] };

    const header = rows[0].map(h => h.trim().toUpperCase());
    const col = (name) => header.indexOf(name);

    const typeIdx    = col('TYPE');
    const contentIdx = col('CONTENT');
    const descIdx    = col('DESCRIPTION');
    const prioIdx    = col('PRIORITY');
    const indentIdx  = col('INDENT');
    const dateIdx    = col('DATE');

    if (contentIdx === -1) {
        return { name: projectName, tasks: [], warnings: ['Missing CONTENT column — is this a Todoist CSV?'] };
    }

    const warnings = [];
    const tasks = [];

    rows.slice(1).forEach((row, i) => {
        const type    = typeIdx !== -1 ? (row[typeIdx] || '').trim().toLowerCase() : 'task';
        const content = (row[contentIdx] || '').trim();

        // Skip section, note, header, config rows and blank content
        if (['section', 'note', 'header', 'config', 'setting', 'metadata'].includes(type)) return;
        if (!content) return;

        // Skip Todoist view_style or layout configuration rows (e.g. 'view_style=list', 'view_style=board', etc.)
        const contentLower = content.toLowerCase();
        if (
            contentLower.startsWith('view_style') ||
            contentLower.startsWith('view_type') ||
            contentLower.startsWith('layout=') ||
            contentLower.includes('view_style=') ||
            contentLower.includes('view_type=')
        ) {
            return;
        }

        const rawPriority = prioIdx !== -1 ? row[prioIdx] : '';
        const priority    = mapPriority(rawPriority);

        let notes = descIdx !== -1 ? (row[descIdx] || '').trim() : '';

        // Append due date to notes if present
        if (dateIdx !== -1 && row[dateIdx] && row[dateIdx].trim()) {
            const dateStr = row[dateIdx].trim();
            notes = notes ? `${notes}\n📅 Due: ${dateStr}` : `📅 Due: ${dateStr}`;
        }

        // Sub-task indent prefix
        const indent = indentIdx !== -1 ? parseInt(row[indentIdx] || '1') : 1;
        const prefix = indent > 1 ? '↳ '.repeat(indent - 1) : '';

        // If content exceeds MAX_TASK_LENGTH chars (and not unlimited mode), preserve full original title in notes
        if (!isUnlimited && content.length > MAX_TASK_LENGTH) {
            const headline = content.slice(0, MAX_TASK_LENGTH - 3) + '...';
            notes = `Full Task Title:\n${content}${notes ? '\n\n' + notes : ''}`;
            tasks.push({ text: prefix + headline, notes, priority });
        } else {
            tasks.push({ text: prefix + content, notes, priority });
        }
    });

    if (tasks.length === 0) warnings.push('No importable tasks found (sections/notes excluded).');

    return { name: projectName, tasks, warnings };
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { id: STEP_UPLOAD,  label: '1. Upload' },
        { id: STEP_MAP,     label: '2. Map Projects' },
        { id: STEP_CONFIRM, label: '3. Confirm' },
    ];
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
            {steps.map((s, idx) => {
                const active  = s.id === currentStep;
                const done    = steps.findIndex(x => x.id === currentStep) > idx;
                return (
                    <React.Fragment key={s.id}>
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '5px 8px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: active ? '700' : '500',
                            background: active  ? 'var(--accent-color)'
                                      : done    ? 'rgba(16,185,129,0.15)'
                                      : 'var(--bg-color)',
                            color:  active  ? '#fff'
                                  : done    ? '#10b981'
                                  : 'var(--muted-text)',
                            border: `1px solid ${active ? 'var(--accent-color)' : done ? '#10b981' : 'var(--border-color)'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            {s.label}
                        </div>
                        {idx < steps.length - 1 && (
                            <ArrowRight size={12} style={{ color: 'var(--border-color)', flexShrink: 0 }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// ─── Main Modal ──────────────────────────────────────────────────────────────

const TodoistImportModal = ({ onClose, onImport, onOpenGuide, projects: existingProjects, taskLengthLimit = '250' }) => {
    const [step, setStep]         = useState(STEP_UPLOAD);
    const [parsedFiles, setParsedFiles]   = useState([]);   // { name, tasks, warnings }[]
    const [mappings, setMappings] = useState([]);            // { csvName, targetType, targetId, targetName, color }[]
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragOver, setIsDragOver]     = useState(false);
    const [error, setError]       = useState(null);
    const fileInputRef = useRef(null);

    // Existing real projects (exclude 'all' virtual project)
    const realProjects = existingProjects.filter(p => p.id !== 'all');

    // ── File processing ──────────────────────────────────────────────────────

    const processFiles = async (fileList) => {
        setIsProcessing(true);
        setError(null);
        const results = [];

        try {
            for (const file of fileList) {
                if (!file.name.match(/\.csv$/i)) continue;
                const text = await file.text();
                results.push(parseTodoistFile(file.name, text, taskLengthLimit));
            }

            if (results.length === 0) {
                setError('No valid CSV files found. Please select Todoist .csv exports.');
                setIsProcessing(false);
                return;
            }

            // Build initial mappings (Phase 2: smart name matching)
            const initialMappings = results.map(r => {
                const match = findBestMatch(r.name, realProjects);
                if (match) {
                    return { csvName: r.name, targetType: 'existing', targetId: match.id, targetName: match.name, color: match.color };
                }
                // Default: create new, pick a colour
                const colorIdx = results.indexOf(r) % PROJECT_COLORS.length;
                return { csvName: r.name, targetType: 'new', targetId: null, targetName: r.name, color: PROJECT_COLORS[colorIdx] };
            });

            setParsedFiles(results);
            setMappings(initialMappings);
            setStep(STEP_MAP);
        } catch (err) {
            console.error('Import error:', err);
            setError('Failed to parse CSV files. Please ensure they are valid Todoist exports.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length) processFiles(files);
    };

    // ── Drag and Drop (Phase 1 fix) ──────────────────────────────────────────

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) processFiles(files);
    };

    // ── Mapping controls ─────────────────────────────────────────────────────

    const updateMapping = (csvName, updates) => {
        setMappings(prev => prev.map(m => m.csvName === csvName ? { ...m, ...updates } : m));
    };

    const handleTargetChange = (csvName, value) => {
        if (value === '__new__') {
            const colorIdx = Math.floor(Math.random() * PROJECT_COLORS.length);
            updateMapping(csvName, { targetType: 'new', targetId: null, targetName: csvName, color: PROJECT_COLORS[colorIdx] });
        } else {
            const project = realProjects.find(p => p.id === value);
            if (project) {
                updateMapping(csvName, { targetType: 'existing', targetId: project.id, targetName: project.name, color: project.color });
            }
        }
    };

    // ── Final import ─────────────────────────────────────────────────────────

    const handleConfirmImport = () => {
        // Build the payload that App.js's handleTodoistImportData expects:
        // [ { name, tasks, targetProjectId (optional — if mapping to existing) } ]
        const payload = parsedFiles.map((pf, idx) => {
            const mapping = mappings[idx];
            return {
                name:            mapping.targetName,
                tasks:           pf.tasks,
                color:           mapping.color,
                targetProjectId: mapping.targetType === 'existing' ? mapping.targetId : null,
            };
        });
        onImport(payload);
        onClose();
    };

    // ── Styles ───────────────────────────────────────────────────────────────

    const s = {
        overlay: COMMON_STYLES.modalOverlay,
        modal: {
            ...COMMON_STYLES.modalContent,
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            width: '500px',
            maxWidth: '95vw',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
        },
        title: { margin: 0, fontSize: '1.2rem', fontWeight: '700' },
        scrollArea: {
            flex: 1,
            overflowY: 'auto',
            marginTop: '8px',
        },
        uploadArea: {
            border: `2px dashed ${isDragOver ? 'var(--accent-color)' : 'var(--border-color)'}`,
            borderRadius: '12px',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: isDragOver ? 'var(--accent-bg)' : 'var(--bg-color)',
            marginBottom: '16px',
        },
        primaryBtn: {
            background: 'var(--accent-color)',
            color: '#fff',
            border: 'none',
            padding: '11px 20px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'opacity 0.15s',
        },
        ghostBtn: {
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--muted-text)',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        btnRow: {
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
        },
        mapRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px',
            background: 'var(--bg-color)',
            borderRadius: '10px',
            marginBottom: '10px',
            border: '1px solid var(--border-color)',
        },
        colorDot: (color) => ({
            width: '10px', height: '10px',
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
        }),
        select: {
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            fontSize: '0.9rem',
            cursor: 'pointer',
        },
        badge: (color) => ({
            background: color + '22',
            color: color,
            border: `1px solid ${color}44`,
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '0.75rem',
            fontWeight: '600',
            flexShrink: 0,
        }),
        infoBox: {
            background: 'rgba(228, 67, 50, 0.07)',
            border: '1px solid rgba(228, 67, 50, 0.2)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '0.85rem',
            color: 'var(--muted-text)',
            marginBottom: '12px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
        },
    };

    // ── Step: Upload ─────────────────────────────────────────────────────────

    const renderUpload = () => (
        <>
            <div
                style={s.uploadArea}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <FileText size={48} style={{ color: isDragOver ? 'var(--accent-color)' : 'var(--muted-text)', marginBottom: '12px' }} />
                <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '4px' }}>
                    {isProcessing ? 'Processing...' : 'Drop CSV files here'}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted-text)', marginBottom: '14px' }}>
                    or click to choose files
                </div>
                <div style={{
                    display: 'inline-block',
                    padding: '7px 18px',
                    background: 'var(--accent-color)',
                    color: '#fff',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    opacity: isProcessing ? 0.6 : 1,
                }}>
                    Select CSV Files
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
            />

            <div style={s.infoBox}>
                <Info size={14} style={{ marginTop: '2px', color: '#e44332', flexShrink: 0 }} />
                <span>
                    Export each Todoist project separately: open the project → <strong>···</strong> → <strong>Export as CSV</strong>.
                    Upload one or all project CSVs at once. Completed tasks are not included in Todoist's CSV export.
                </span>
            </div>

            <div style={{
                background: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.85rem',
                color: 'var(--text-color)',
                marginBottom: '12px',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                textAlign: 'left'
            }}>
                <ShieldCheck size={16} style={{ marginTop: '2px', color: '#2563eb', flexShrink: 0 }} />
                <span>
                    <strong>🛡️ Zero Text Truncation Guarantee:</strong> Todoist tasks & descriptions of ANY length are imported in full. Long task names and rich descriptions are safely stored in unlimited Notes and will <strong>NEVER be truncated when editing</strong> later.
                </span>
            </div>

            {error && (
                <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <AlertCircle size={15} /> {error}
                </div>
            )}
        </>
    );

    // ── Step: Map Projects ───────────────────────────────────────────────────

    const renderMap = () => (
        <>
            <p style={{ color: 'var(--muted-text)', fontSize: '0.9rem', marginBottom: '14px', marginTop: 0 }}>
                Choose which 123todo project each Todoist export should be imported into.
                We've pre-matched where possible — adjust any that need changing.
            </p>

            <div style={s.scrollArea}>
                {parsedFiles.map((pf, idx) => {
                    const m = mappings[idx];
                    const currentValue = m.targetType === 'existing' ? m.targetId : '__new__';
                    return (
                        <div key={pf.name} style={s.mapRow}>
                            <div style={s.colorDot(m.color)} />

                            {/* CSV source name */}
                            <div style={{ minWidth: 0, flex: '0 0 auto', maxWidth: '140px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={pf.name}>
                                    {pf.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>
                                    {pf.tasks.length} task{pf.tasks.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <ArrowRight size={14} style={{ color: 'var(--muted-text)', flexShrink: 0 }} />

                            {/* Project selector */}
                            <select
                                style={s.select}
                                value={currentValue}
                                onChange={(e) => handleTargetChange(pf.name, e.target.value)}
                            >
                                <option value="__new__">➕ Create new: "{pf.name}"</option>
                                {realProjects.length > 0 && <option disabled>── Existing projects ──</option>}
                                {realProjects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>

                            {/* Matched badge */}
                            {m.targetType === 'existing' && (
                                <span style={s.badge('#10b981')}>matched</span>
                            )}

                            {/* Warning badge if no tasks */}
                            {pf.tasks.length === 0 && (
                                <span style={s.badge('#f59e0b')}>empty</span>
                            )}
                        </div>
                    );
                })}

                {/* Warnings */}
                {parsedFiles.some(pf => pf.warnings?.length > 0) && (
                    <div style={{ marginTop: '8px' }}>
                        {parsedFiles.filter(pf => pf.warnings?.length > 0).map(pf => (
                            pf.warnings.map((w, i) => (
                                <div key={pf.name + i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--muted-text)', marginBottom: '4px' }}>
                                    <AlertCircle size={13} style={{ color: '#f59e0b' }} />
                                    <span><strong>{pf.name}</strong>: {w}</span>
                                </div>
                            ))
                        ))}
                    </div>
                )}
            </div>

            <div style={s.btnRow}>
                <button style={s.ghostBtn} onClick={() => { setParsedFiles([]); setMappings([]); setStep(STEP_UPLOAD); }}>
                    <ArrowLeft size={15} /> Back
                </button>
                <button
                    style={{ ...s.primaryBtn, flex: 1, opacity: parsedFiles.every(pf => pf.tasks.length === 0) ? 0.5 : 1 }}
                    onClick={() => setStep(STEP_CONFIRM)}
                    disabled={parsedFiles.every(pf => pf.tasks.length === 0)}
                >
                    Review Import <ArrowRight size={15} />
                </button>
            </div>
        </>
    );

    // ── Step: Confirm ────────────────────────────────────────────────────────

    const renderConfirm = () => {
        const totalTasks = parsedFiles.reduce((sum, pf) => sum + pf.tasks.length, 0);
        const newProjects  = mappings.filter(m => m.targetType === 'new').length;
        const existingProj = mappings.filter(m => m.targetType === 'existing').length;

        return (
            <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '16px', fontWeight: '700', fontSize: '1.05rem' }}>
                    <CheckCircle2 size={20} />
                    Ready to import {totalTasks} task{totalTasks !== 1 ? 's' : ''}
                </div>

                <div style={s.scrollArea}>
                    {parsedFiles.map((pf, idx) => {
                        const m = mappings[idx];
                        return (
                            <div key={pf.name} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                background: 'var(--bg-color)',
                                borderRadius: '8px',
                                marginBottom: '8px',
                                border: '1px solid var(--border-color)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={s.colorDot(m.color)} />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{m.targetName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                                            from: {pf.name}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{pf.tasks.length} tasks</div>
                                    <div style={s.badge(m.targetType === 'new' ? 'var(--accent-color)' : '#10b981')}>
                                        {m.targetType === 'new' ? 'new project' : 'existing'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '8px', padding: '8px 12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <Layers size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        {newProjects > 0 && `${newProjects} new project${newProjects !== 1 ? 's' : ''} will be created. `}
                        {existingProj > 0 && `${existingProj} existing project${existingProj !== 1 ? 's' : ''} will receive tasks.`}
                    </div>
                </div>

                <div style={s.btnRow}>
                    <button style={s.ghostBtn} onClick={() => setStep(STEP_MAP)}>
                        <ArrowLeft size={15} /> Back
                    </button>
                    <button style={{ ...s.primaryBtn, flex: 1 }} onClick={handleConfirmImport}>
                        Import Now <CheckCircle2 size={16} />
                    </button>
                </div>
            </>
        );
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div style={s.overlay} onClick={onClose}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={s.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(228,67,50,0.1)', borderRadius: '8px', padding: '6px 8px', color: '#e44332' }}>
                            <FileText size={18} />
                        </div>
                        <h2 style={s.title}>Import from Todoist</h2>
                        {onOpenGuide && (
                            <button
                                onClick={onOpenGuide}
                                style={{
                                    background: 'rgba(228, 67, 50, 0.1)',
                                    border: 'none',
                                    color: '#e44332',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                📖 View Guide
                            </button>
                        )}
                    </div>
                    <button onClick={onClose} style={COMMON_STYLES.btnReset}>
                        <X size={22} style={{ color: 'var(--muted-text)' }} />
                    </button>
                </div>

                <StepIndicator currentStep={step} />

                {step === STEP_UPLOAD  && renderUpload()}
                {step === STEP_MAP     && renderMap()}
                {step === STEP_CONFIRM && renderConfirm()}
            </div>
        </div>
    );
};

export { parseTodoistFile, parseCSV };
export default TodoistImportModal;
