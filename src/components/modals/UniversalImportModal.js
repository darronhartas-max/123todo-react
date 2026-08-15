import React, { useState } from 'react';
import { COMMON_STYLES } from '../../utils/styles';
import { X, Upload, CheckCircle, FileText, FolderPlus, ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { parseTickTickCSV } from '../../utils/importers/ticktickImporter';
import { parseGoogleKeepJSON } from '../../utils/importers/googleKeepImporter';
import { parseGoogleTasksJSON, parseMicrosoftToDoCSV } from '../../utils/importers/googleTasksImporter';

const UniversalImportModal = ({ onClose, onImport, onOpenGuide, existingProjects = [] }) => {
    const [selectedApp, setSelectedApp] = useState('todoist'); // 'todoist', 'ticktick', 'keep', 'gtasks', 'mstodo'
    const [step, setStep] = useState(1); // 1: Upload, 2: Map & Preview, 3: Success
    const [fileList, setFileList] = useState([]);
    const [parsedTasks, setParsedTasks] = useState([]);
    const [targetProject, setTargetProject] = useState('General');
    const [newProjectName, setNewProjectName] = useState('');
    const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const apps = [
        { id: 'todoist', name: 'Todoist', icon: '🔴', color: '#e44332', ext: '.csv', desc: 'Project export CSV files' },
        { id: 'ticktick', name: 'TickTick', icon: '🔵', color: '#2b87ff', ext: '.csv', desc: 'TickTick Backup CSV' },
        { id: 'keep', name: 'Google Keep', icon: '🟡', color: '#f59e0b', ext: '.json', desc: 'Keep Takeout JSON notes' },
        { id: 'gtasks', name: 'Google Tasks', icon: '🟢', color: '#10b981', ext: '.json', desc: 'Google Takeout Tasks.json' },
        { id: 'mstodo', name: 'Microsoft To Do', icon: '🟦', color: '#0078d4', ext: '.csv', desc: 'MS To Do export CSV' },
    ];

    const currentAppConfig = apps.find(a => a.id === selectedApp) || apps[0];

    const processFiles = async (files) => {
        if (!files || files.length === 0) return;
        setFileList(Array.from(files));

        let allTasks = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const text = await file.text();

            if (selectedApp === 'ticktick') {
                const tasks = parseTickTickCSV(text, targetProject);
                allTasks = allTasks.concat(tasks);
            } else if (selectedApp === 'keep') {
                try {
                    const keepData = JSON.parse(text);
                    const tasks = parseGoogleKeepJSON(keepData, targetProject);
                    allTasks = allTasks.concat(tasks);
                } catch (e) {
                    console.error('Failed to parse Keep JSON file:', file.name, e);
                }
            } else if (selectedApp === 'gtasks') {
                try {
                    const gtaskData = JSON.parse(text);
                    const tasks = parseGoogleTasksJSON(gtaskData, targetProject);
                    allTasks = allTasks.concat(tasks);
                } catch (e) {
                    console.error('Failed to parse Google Tasks JSON:', e);
                }
            } else if (selectedApp === 'mstodo') {
                const tasks = parseMicrosoftToDoCSV(text, targetProject);
                allTasks = allTasks.concat(tasks);
            } else {
                // Fallback / Todoist CSV parsing logic
                const tasks = parseTickTickCSV(text, targetProject);
                allTasks = allTasks.concat(tasks);
            }
        }

        setParsedTasks(allTasks);
        if (allTasks.length > 0) {
            setStep(2);
        } else {
            alert(`Could not extract valid tasks or notes from the selected ${currentAppConfig.name} file(s). Please verify the file format.`);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    const handleExecuteImport = () => {
        const finalProject = isCreatingNewProject ? (newProjectName.trim() || 'General') : targetProject;

        const tasksToImport = parsedTasks.map(t => ({
            ...t,
            project: finalProject
        }));

        onImport(tasksToImport, finalProject);
        setStep(3);
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <div 
                style={{
                    background: 'var(--surface-color)',
                    padding: '24px',
                    borderRadius: '20px',
                    maxWidth: '520px',
                    width: '95%',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    position: 'relative',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {step > 1 && (
                            <button
                                onClick={() => setStep(1)}
                                style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', padding: 0 }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={22} color="var(--accent-color)" />
                            Import from Other Apps
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer' }}>
                        <X size={22} />
                    </button>
                </div>

                {/* App Selector Tabs */}
                {step === 1 && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--muted-text)', marginBottom: '8px' }}>
                            Select Source App:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '6px' }}>
                            {apps.map(app => (
                                <button
                                    key={app.id}
                                    onClick={() => setSelectedApp(app.id)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '10px 6px',
                                        borderRadius: '10px',
                                        border: selectedApp === app.id ? `2px solid ${app.color}` : '1px solid var(--border-color)',
                                        background: selectedApp === app.id ? `${app.color}15` : 'var(--bg-color)',
                                        color: 'var(--text-color)',
                                        cursor: 'pointer',
                                        fontSize: '0.78rem',
                                        fontWeight: '700',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{app.icon}</span>
                                    <span>{app.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 1: Upload Canvas */}
                {step === 1 && (
                    <div>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleFileDrop}
                            style={{
                                border: isDragOver ? `2px dashed ${currentAppConfig.color}` : '2px dashed var(--border-color)',
                                background: isDragOver ? `${currentAppConfig.color}10` : 'var(--bg-color)',
                                borderRadius: '16px',
                                padding: '32px 20px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                marginBottom: '16px'
                            }}
                            onClick={() => document.getElementById('universalFileInput').click()}
                        >
                            <input
                                type="file"
                                id="universalFileInput"
                                multiple={selectedApp === 'keep'}
                                accept={currentAppConfig.ext}
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            <div style={{ background: `${currentAppConfig.color}20`, width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: currentAppConfig.color }}>
                                <Upload size={28} />
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '4px' }}>
                                Drop {currentAppConfig.name} {currentAppConfig.ext} file(s) here
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                                or click to browse files ({currentAppConfig.desc})
                            </div>
                        </div>

                        {onOpenGuide && (
                            <button
                                onClick={onOpenGuide}
                                style={{
                                    width: '100%',
                                    background: 'none',
                                    border: '1px solid var(--border-color)',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    color: 'var(--text-color)',
                                    fontSize: '0.88rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <BookOpen size={16} color="var(--accent-color)" />
                                How to export data from {currentAppConfig.name}? View Step-by-Step Guide
                            </button>
                        )}
                    </div>
                )}

                {/* Step 2: Mapping & Preview */}
                {step === 2 && (
                    <div>
                        <div style={{
                            background: 'var(--bg-color)',
                            borderRadius: '12px',
                            padding: '14px',
                            marginBottom: '16px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ fontWeight: '700', fontSize: '1rem', color: currentAppConfig.color, marginBottom: '4px' }}>
                                ✓ Ready to import {parsedTasks.length} task(s) from {currentAppConfig.name}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                                Uploaded {fileList.length} file(s): {fileList.map(f => f.name).join(', ')}
                            </div>
                        </div>

                        {/* Project Destination Assignment */}
                        <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '6px' }}>
                                Import Destination Project:
                            </label>
                            
                            {!isCreatingNewProject ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        value={targetProject}
                                        onChange={(e) => setTargetProject(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--surface-color)',
                                            color: 'var(--text-color)',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <option value="General">General Inbox</option>
                                        {existingProjects.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setIsCreatingNewProject(true)}
                                        style={{
                                            background: 'var(--accent-bg)',
                                            border: '1px solid var(--accent-color)',
                                            color: 'var(--accent-color)',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <FolderPlus size={18} /> New
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Project Name..."
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--accent-color)',
                                            background: 'var(--surface-color)',
                                            color: 'var(--text-color)',
                                            fontSize: '0.95rem'
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setIsCreatingNewProject(false)}
                                        style={{
                                            background: 'none',
                                            border: '1px solid var(--border-color)',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            color: 'var(--muted-text)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Task Preview List */}
                        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--muted-text)', marginBottom: '6px' }}>
                                Sample Tasks Preview ({Math.min(parsedTasks.length, 5)} of {parsedTasks.length}):
                            </div>
                            <div style={{
                                background: 'var(--bg-color)',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                maxHeight: '160px',
                                overflowY: 'auto',
                                padding: '8px'
                            }}>
                                {parsedTasks.slice(0, 5).map((task, i) => (
                                    <div key={i} style={{ padding: '6px 8px', borderBottom: i < 4 ? '1px solid var(--border-color)' : 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={14} color="var(--accent-color)" />
                                        <span style={{ fontWeight: '600', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.text}</span>
                                        {task.notes && <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)', background: 'var(--surface-color)', padding: '2px 6px', borderRadius: '4px' }}>Note</span>}
                                        {task.subtasks && task.subtasks.length > 0 && <span style={{ fontSize: '0.75rem', color: '#10b981', background: '#10b98115', padding: '2px 6px', borderRadius: '4px' }}>{task.subtasks.length} subtasks</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleExecuteImport}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #285a82 0%, #1a3a54 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(40, 90, 130, 0.3)'
                            }}
                        >
                            Confirm & Import {parsedTasks.length} Item(s)
                        </button>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <CheckCircle size={56} color="#10b981" style={{ marginBottom: '12px' }} />
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 8px 0' }}>
                            Import Completed! 🎉
                        </h3>
                        <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem', marginBottom: '20px' }}>
                            Successfully imported {parsedTasks.length} items from {currentAppConfig.name} into your 123 ToDo account.
                        </p>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--accent-color)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Done & View Tasks
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UniversalImportModal;
