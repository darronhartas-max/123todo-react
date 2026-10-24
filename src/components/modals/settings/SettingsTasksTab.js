import React, { useState } from 'react';
import { Clock, Bell } from 'lucide-react';
import { DATE_FORMAT_OPTIONS, NOTES_AUTOSAVE_OPTIONS, DEFAULT_NOTES_AUTOSAVE_DELAY, DEFAULT_PRIORITY_COLORS } from '../../../utils/constants';
import { EMAIL_CLIENT_OPTIONS, getEmailClientPreference, setEmailClientPreference as saveEmailClientPreference } from '../../../utils/emailUtils';
import { isNotificationSupported, getNotificationPermission, requestNotificationPermission } from '../../../utils/notificationUtils';
import SettingsPriorityColors from './SettingsPriorityColors';

const SettingsTasksTab = ({
    taskViewMode = 'compact',
    setTaskViewMode,
    dateFormat = 'UK',
    setDateFormat,
    timeSchedulingEnabled = true,
    setTimeSchedulingEnabled,
    showTaskCreationDate = false,
    setShowTaskCreationDate,
    taskLengthLimit = '250',
    setTaskLengthLimit,
    notesAutosaveDelay = '60s',
    setNotesAutosaveDelay,
    emailClientPreference,
    setEmailClientPreference,
    notificationsEnabled = false,
    setNotificationsEnabled,
    priorityColors = DEFAULT_PRIORITY_COLORS,
    setPriorityColors,
    styles
}) => {
    const [localEmailPref, setLocalEmailPref] = useState(() => getEmailClientPreference() || 'default');

    return (
        <div>
            <div style={styles.sectionTitle}>Tasks & Workflow</div>

            {/* Tasks List View Mode */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Tasks List View Mode</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Choose between compact 2-line preview or full-length task titles in list views
                    </span>
                </div>
                <div style={styles.segmentContainer}>
                    <button
                        style={styles.segmentBtn(taskViewMode === 'compact')}
                        onClick={() => setTaskViewMode && setTaskViewMode('compact')}
                    >
                        Compact (2 Lines)
                    </button>
                    <button
                        style={styles.segmentBtn(taskViewMode === 'full')}
                        onClick={() => setTaskViewMode && setTaskViewMode('full')}
                    >
                        Full-Length
                    </button>
                </div>
            </div>

            {/* Priority Colors Customizer */}
            <SettingsPriorityColors
                priorityColors={priorityColors}
                setPriorityColors={setPriorityColors}
                styles={styles}
            />

            {/* Date Format Order Preference */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Date Format Order</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Choose UK, US, or ISO date order display
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '8px', marginTop: '6px' }}>
                    {DATE_FORMAT_OPTIONS.map(fmt => {
                        const isSelected = dateFormat === fmt.id;
                        return (
                            <div
                                key={fmt.id}
                                onClick={() => setDateFormat && setDateFormat(fmt.id)}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                    background: isSelected ? 'var(--accent-bg)' : 'var(--item-bg)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: isSelected ? '700' : '600',
                                    color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'
                                }}>
                                    {fmt.label}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', fontFamily: 'monospace' }}>
                                    {fmt.example}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scheduled Task Times */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={16} style={{ color: 'var(--accent-color)' }} />
                        Scheduled Task Times
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Show time selector when scheduling tasks and display times in list views
                    </span>
                </div>
                <div style={styles.segmentContainer}>
                    <button
                        style={styles.segmentBtn(timeSchedulingEnabled !== false)}
                        onClick={() => setTimeSchedulingEnabled && setTimeSchedulingEnabled(true)}
                    >
                        Shown (Default)
                    </button>
                    <button
                        style={styles.segmentBtn(timeSchedulingEnabled === false)}
                        onClick={() => setTimeSchedulingEnabled && setTimeSchedulingEnabled(false)}
                    >
                        Hidden
                    </button>
                </div>
            </div>

            {/* Task Creation Date & Time */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={16} style={{ color: 'var(--accent-color)' }} />
                        Task Creation Date & Time
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Display initial date and time stamp when viewing and editing tasks
                    </span>
                </div>
                <div style={styles.segmentContainer}>
                    <button
                        style={styles.segmentBtn(!showTaskCreationDate)}
                        onClick={() => setShowTaskCreationDate && setShowTaskCreationDate(false)}
                    >
                        Hidden (Default)
                    </button>
                    <button
                        style={styles.segmentBtn(Boolean(showTaskCreationDate))}
                        onClick={() => setShowTaskCreationDate && setShowTaskCreationDate(true)}
                    >
                        Shown
                    </button>
                </div>
            </div>

            {/* Task Description Character Limit */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Task Description Character Limit</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Set limit for task descriptions (250 chars default encourages concise tasks)
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', marginTop: '6px' }}>
                    {[
                        { id: '250', label: '250 Characters (Default)', desc: 'Encourages concise task details' },
                        { id: 'unlimited', label: 'Unlimited', desc: 'No length restriction' }
                    ].map(opt => {
                        const isSelected = (taskLengthLimit || '250') === opt.id;
                        return (
                            <div
                                key={opt.id}
                                onClick={() => setTaskLengthLimit && setTaskLengthLimit(opt.id)}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                    background: isSelected ? 'var(--accent-bg)' : 'var(--item-bg)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: isSelected ? '700' : '600',
                                    color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'
                                }}>
                                    {opt.label}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                                    {opt.desc}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Notes Mode Auto-Save Delay */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Notes Auto-Save Delay</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Inactivity delay before a drafted note, quote, or job estimate is automatically saved
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginTop: '6px' }}>
                    {NOTES_AUTOSAVE_OPTIONS.map(opt => {
                        const isSelected = (notesAutosaveDelay || DEFAULT_NOTES_AUTOSAVE_DELAY) === opt.id;
                        return (
                            <div
                                key={opt.id}
                                onClick={() => setNotesAutosaveDelay && setNotesAutosaveDelay(opt.id)}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                    background: isSelected ? 'var(--accent-bg)' : 'var(--item-bg)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: isSelected ? '700' : '600',
                                    color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'
                                }}>
                                    {opt.label}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
                                    {opt.desc}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Preferred Email Service */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Preferred Email Service</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Choose which email app or web service opens when clicking email links
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginTop: '6px' }}>
                    {EMAIL_CLIENT_OPTIONS.map(opt => {
                        const currentPref = emailClientPreference || localEmailPref;
                        const isSelected = currentPref === opt.id;
                        return (
                            <div
                                key={opt.id}
                                onClick={() => {
                                    setLocalEmailPref(opt.id);
                                    saveEmailClientPreference(opt.id);
                                    if (setEmailClientPreference) setEmailClientPreference(opt.id);
                                }}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                    background: isSelected ? 'var(--accent-bg)' : 'var(--item-bg)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: isSelected ? '700' : '600',
                                    color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'
                                }}>
                                    {opt.name}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
                                    {opt.badge} • {opt.description}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Automated Reminders & Notifications */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bell size={16} style={{ color: 'var(--accent-color)' }} />
                        Automated Reminders & Notifications
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Receive native system notifications on desktop and open mobile PWA when scheduled tasks reach their set time
                    </span>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!isNotificationSupported() ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                            Notifications are not supported by this browser.
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={async () => {
                                const perm = await requestNotificationPermission();
                                if (perm === 'granted') {
                                    const nextState = !notificationsEnabled;
                                    if (setNotificationsEnabled) setNotificationsEnabled(nextState);
                                } else {
                                    if (setNotificationsEnabled) setNotificationsEnabled(false);
                                }
                            }}
                            style={{
                                ...styles.segmentBtn(notificationsEnabled && getNotificationPermission() === 'granted'),
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <Bell size={14} />
                            <span>
                                {getNotificationPermission() === 'denied'
                                    ? 'Blocked in Browser Permissions'
                                    : (notificationsEnabled && getNotificationPermission() === 'granted'
                                        ? 'Reminders Enabled'
                                        : 'Enable Reminders')}
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsTasksTab;
