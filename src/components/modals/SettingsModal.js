import React, { useState } from 'react';
import { X, Sliders, FolderOpen, MoveHorizontal, Cloud, Mic, Keyboard, Info, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    SettingsProjectsTab,
    SettingsAppearanceTab,
    SettingsTasksTab,
    SettingsSwipeTab,
    SettingsVoiceTab,
    SettingsShortcutsTab,
    SettingsSyncTab,
    SettingsAboutTab
} from './settings';

const SettingsModal = ({
    isOpen,
    onClose,
    projects,
    onAddProject,
    onEditProject,
    onDeleteProject,
    onMoveProject,
    onReorderProjects,
    fontSize,
    setFontSize,
    notesFontSize = 18,
    setNotesFontSize,
    notesAutosaveDelay = '60s',
    setNotesAutosaveDelay,
    layoutWidth,
    setLayoutWidth,
    wideColumnView = 'priorities',
    setWideColumnView,
    syncSpeed = 'adaptive',
    setSyncSpeed,
    themeMode,
    setThemeMode,
    lightModeTone = 'soft',
    setLightModeTone,
    swipeSettings,
    onUpdateSwipeSettings,
    onCheckForUpdates,
    updateCheckStatus = 'idle',
    dateFormat = 'UK',
    setDateFormat,
    taskLengthLimit = '250',
    setTaskLengthLimit,
    isBoldFont = false,
    setIsBoldFont,
    onOpenAdminStats,
    syncProvider = 'cloudflare',
    setSyncProvider,
    onOpenSyncModal,
    appMode = 'tasks',
    onSwitchMode = () => {},
    taskViewMode = 'compact',
    setTaskViewMode,
    viewProfile = 'lite',
    setViewProfile,
    isStandalone = false,
    canNativeInstall = false,
    onNativeInstall,
    onOpenInstallGuide,
    emailClientPreference,
    setEmailClientPreference,
    initialTab = 'appearance',
    isAuthed = false,
    syncStatus = 'idle',
    isOffline = false,
    onOpenLatestUpdates,
    screenScalingMode = 'auto',
    setScreenScalingMode,
    notificationsEnabled = false,
    setNotificationsEnabled,
    timeSchedulingEnabled = true,
    setTimeSchedulingEnabled,
    buttonDisplayMode = 'icons',
    setButtonDisplayMode,
    showTaskCreationDate = false,
    setShowTaskCreationDate,
    onOpenExport
}) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    const getCompactSyncStatusText = () => {
        if (isOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) return 'Offline';
        if (syncStatus === 'error') return 'Sync Error';
        if (isAuthed) return 'Synced';
        return 'Sync';
    };

    const getCompactSyncButtonStyle = () => {
        const base = {
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            fontSize: '0.76rem',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        };
        if (isOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) return { ...base, background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', borderColor: 'rgba(245, 158, 11, 0.3)' };
        if (syncStatus === 'error') return { ...base, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: '#ef4444' };
        if (isAuthed) return { ...base, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.25)' };
        return { ...base, background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)' };
    };

    if (!isOpen) return null;

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
            transition: 'background 0.3s ease'
        },
        modal: {
            background: 'var(--surface-color)',
            borderRadius: '16px',
            width: '94%',
            maxWidth: '720px',
            height: '86vh',
            maxHeight: '680px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
        },
        header: {
            padding: '12px clamp(12px, 3vw, 24px)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--surface-color)'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        body: {
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            flexDirection: (typeof window !== 'undefined' && window.innerWidth < 600) ? 'column' : 'row'
        },
        sidebar: {
            width: (typeof window !== 'undefined' && window.innerWidth < 600) ? '100%' : '165px',
            borderRight: (typeof window !== 'undefined' && window.innerWidth < 600) ? 'none' : '1px solid var(--border-color)',
            borderBottom: (typeof window !== 'undefined' && window.innerWidth < 600) ? '1px solid var(--border-color)' : 'none',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: (typeof window !== 'undefined' && window.innerWidth < 600) ? 'row' : 'column',
            padding: (typeof window !== 'undefined' && window.innerWidth < 600) ? '8px' : '12px 6px',
            gap: '4px',
            flexShrink: 0,
            overflowX: (typeof window !== 'undefined' && window.innerWidth < 600) ? 'auto' : 'hidden',
            overflowY: (typeof window !== 'undefined' && window.innerWidth < 600) ? 'hidden' : 'auto',
            WebkitOverflowScrolling: 'touch'
        },
        tabBtn: (isActive) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: (typeof window !== 'undefined' && window.innerWidth < 600) ? '6px 12px' : '8px 12px',
            borderRadius: (typeof window !== 'undefined' && window.innerWidth < 600) ? '16px' : '8px',
            background: isActive ? 'var(--surface-color)' : 'transparent',
            color: isActive ? 'var(--accent-color)' : 'var(--muted-text)',
            border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: isActive ? '700' : '500',
            fontSize: '0.88rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            justifyContent: (typeof window !== 'undefined' && window.innerWidth < 600) ? 'center' : 'flex-start',
            boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.04)' : 'none',
            transition: 'all 0.2s ease'
        }),
        content: {
            flex: 1,
            padding: 'clamp(14px, 3vw, 24px)',
            overflowY: 'auto',
            background: 'var(--surface-color)'
        },
        sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: '700',
            marginBottom: '16px',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        projectItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            marginBottom: '4px',
            background: 'var(--item-bg)'
        },
        projectInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '600',
            fontSize: '0.95rem',
            color: 'var(--text-color)'
        },
        colorDot: (color) => ({
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: color
        }),
        actions: {
            display: 'flex',
            gap: '6px',
            alignItems: 'center'
        },
        actionBtn: {
            padding: '4px 6px',
            borderRadius: '6px',
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted-text)',
            transition: 'all 0.15s ease',
            minWidth: '28px',
            minHeight: '28px'
        },
        addSection: {
            marginTop: '20px',
            padding: '16px',
            background: 'var(--bg-color)',
            borderRadius: '12px',
            border: '1px dashed var(--border-color)'
        },
        input: {
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            fontSize: '1rem',
            marginBottom: '12px',
            outline: 'none'
        },
        colorGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: '10px 4px',
            justifyItems: 'center',
            alignItems: 'center',
            marginBottom: '16px'
        },
        colorBtn: (color, isSelected) => ({
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: color,
            cursor: 'pointer',
            border: isSelected ? '2.5px solid var(--text-color)' : '1.5px solid transparent',
            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.15s ease',
            boxShadow: isSelected ? '0 0 0 1px var(--text-color), 0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
        }),
        submitBtn: {
            width: '100%',
            padding: '10px',
            background: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
        },
        settingRow: {
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        settingLabel: {
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        segmentContainer: {
            display: 'flex',
            background: 'var(--bg-color)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
        },
        segmentBtn: (isActive) => ({
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: isActive ? 'var(--surface-color)' : 'transparent',
            color: isActive ? 'var(--accent-color)' : 'var(--muted-text)',
            fontWeight: isActive ? '700' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.05)' : 'none'
        }),
        sliderContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-color)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
        },
        slider: {
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            outline: 'none',
            accentColor: 'var(--accent-color)',
            cursor: 'pointer'
        },
        shortcutItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '1rem',
            color: 'var(--text-color)'
        },
        kbdBadge: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontFamily: 'monospace',
            fontWeight: '700',
            fontSize: '0.9rem',
            boxShadow: '0 2px 0 var(--border-color)',
            color: 'var(--accent-color)'
        },
        voiceGuideTag: {
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '0.82rem',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px'
        },
        voiceGuideRow: {
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '0.84rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-color)'
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={styles.modal}
                onClick={e => e.stopPropagation()}
            >
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={styles.title}>Settings</div>
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
                                            boxShadow: `0 0 5px ${isAuthed ? (syncStatus === 'error' ? '#ef4444' : '#10b981') : '#ef4444'}`,
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
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', display: 'flex' }}>
                        <X size={22} />
                    </button>
                </div>

                <div style={styles.body}>
                    <div style={styles.sidebar}>
                        <button
                            style={styles.tabBtn(activeTab === 'appearance')}
                            onClick={() => setActiveTab('appearance')}
                        >
                            <Sliders size={18} />
                            Appearance
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'tasks')}
                            onClick={() => setActiveTab('tasks')}
                        >
                            <ListChecks size={18} />
                            Tasks
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'projects')}
                            onClick={() => setActiveTab('projects')}
                        >
                            <FolderOpen size={18} />
                            Projects
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'swipe')}
                            onClick={() => setActiveTab('swipe')}
                        >
                            <MoveHorizontal size={18} />
                            Swipe
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'sync')}
                            onClick={() => setActiveTab('sync')}
                        >
                            <Cloud size={18} />
                            Cloud Sync
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'voice')}
                            onClick={() => setActiveTab('voice')}
                        >
                            <Mic size={18} />
                            Voice
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'shortcuts')}
                            onClick={() => setActiveTab('shortcuts')}
                        >
                            <Keyboard size={18} />
                            Shortcuts
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'about' || activeTab === 'install')}
                            onClick={() => setActiveTab('about')}
                        >
                            <Info size={18} />
                            App & Updates
                        </button>
                    </div>

                    <div style={styles.content}>
                        {activeTab === 'projects' && (
                            <SettingsProjectsTab
                                projects={projects}
                                onAddProject={onAddProject}
                                onEditProject={onEditProject}
                                onDeleteProject={onDeleteProject}
                                onMoveProject={onMoveProject}
                                onReorderProjects={onReorderProjects}
                                styles={styles}
                            />
                        )}

                        {activeTab === 'appearance' && (
                            <SettingsAppearanceTab
                                appMode={appMode}
                                onSwitchMode={onSwitchMode}
                                viewProfile={viewProfile}
                                setViewProfile={setViewProfile}
                                buttonDisplayMode={buttonDisplayMode}
                                setButtonDisplayMode={setButtonDisplayMode}
                                fontSize={fontSize}
                                setFontSize={setFontSize}
                                notesFontSize={notesFontSize}
                                setNotesFontSize={setNotesFontSize}
                                themeMode={themeMode}
                                setThemeMode={setThemeMode}
                                screenScalingMode={screenScalingMode}
                                setScreenScalingMode={setScreenScalingMode}
                                lightModeTone={lightModeTone}
                                setLightModeTone={setLightModeTone}
                                isBoldFont={isBoldFont}
                                setIsBoldFont={setIsBoldFont}
                                layoutWidth={layoutWidth}
                                setLayoutWidth={setLayoutWidth}
                                wideColumnView={wideColumnView}
                                setWideColumnView={setWideColumnView}
                                styles={styles}
                            />
                        )}

                        {activeTab === 'tasks' && (
                            <SettingsTasksTab
                                taskViewMode={taskViewMode}
                                setTaskViewMode={setTaskViewMode}
                                dateFormat={dateFormat}
                                setDateFormat={setDateFormat}
                                timeSchedulingEnabled={timeSchedulingEnabled}
                                setTimeSchedulingEnabled={setTimeSchedulingEnabled}
                                showTaskCreationDate={showTaskCreationDate}
                                setShowTaskCreationDate={setShowTaskCreationDate}
                                taskLengthLimit={taskLengthLimit}
                                setTaskLengthLimit={setTaskLengthLimit}
                                notesAutosaveDelay={notesAutosaveDelay}
                                setNotesAutosaveDelay={setNotesAutosaveDelay}
                                emailClientPreference={emailClientPreference}
                                setEmailClientPreference={setEmailClientPreference}
                                notificationsEnabled={notificationsEnabled}
                                setNotificationsEnabled={setNotificationsEnabled}
                                styles={styles}
                            />
                        )}

                        {activeTab === 'swipe' && (
                            <SettingsSwipeTab
                                swipeSettings={swipeSettings}
                                onUpdateSwipeSettings={onUpdateSwipeSettings}
                                styles={styles}
                            />
                        )}

                        {activeTab === 'voice' && (
                            <SettingsVoiceTab styles={styles} />
                        )}

                        {activeTab === 'shortcuts' && (
                            <SettingsShortcutsTab styles={styles} />
                        )}

                        {activeTab === 'sync' && (
                            <SettingsSyncTab
                                syncProvider={syncProvider}
                                setSyncProvider={setSyncProvider}
                                onOpenSyncModal={onOpenSyncModal}
                                syncStatus={syncStatus}
                                isAuthed={isAuthed}
                                isOffline={isOffline}
                                onOpenExport={onOpenExport}
                                onClose={onClose}
                                getCompactSyncButtonStyle={getCompactSyncButtonStyle}
                                getCompactSyncStatusText={getCompactSyncStatusText}
                                styles={styles}
                            />
                        )}

                        {(activeTab === 'about' || activeTab === 'install') && (
                            <SettingsAboutTab
                                updateCheckStatus={updateCheckStatus}
                                onCheckForUpdates={onCheckForUpdates}
                                onOpenLatestUpdates={onOpenLatestUpdates}
                                isStandalone={isStandalone}
                                canNativeInstall={canNativeInstall}
                                onNativeInstall={onNativeInstall}
                                onOpenInstallGuide={onOpenInstallGuide}
                                styles={styles}
                            />
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
