import React, { useState } from 'react';
import { FastForward, Clock, Calendar, Plus, Repeat, Minus } from 'lucide-react';
import { getTodayDateString, getTomorrowDateString, getNextWeekDateString, formatDisplayTime } from '../../../utils/dateUtils';
import { openGoogleCalendar, downloadAppleCalendarIcs } from '../../../utils/calendarUtils';
import TimePickerModal from '../../modals/TimePickerModal';
import RecurrencePicker from './RecurrencePicker';

const SchedulePicker = ({
    scheduledDate,
    onChangeScheduledDate,
    scheduledTime,
    onChangeScheduledTime,
    timeSchedulingEnabled = true,
    dateFormat = 'UK',
    buttonDisplayMode = 'icons',
    isRecurring = false,
    onToggleRecurring,
    recurrenceFrequency = 1,
    onChangeRecurrenceFrequency,
    recurrenceInterval = 'days',
    onChangeRecurrenceInterval,
    recurrenceDaysOfWeek = [],
    onChangeRecurrenceDaysOfWeek,
    taskTitle = '',
    taskNotes = '',
    onContract,
    dateInputId = 'edit-scheduled-date',
    timeInputId = 'edit-scheduled-time',
    containerStyle = {}
}) => {
    const [showTimeInput, setShowTimeInput] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

    const showBtnIcons = buttonDisplayMode === 'icons' || buttonDisplayMode === 'both';
    const showBtnText = buttonDisplayMode === 'text' || buttonDisplayMode === 'both';

    const handleClear = () => {
        onChangeScheduledDate(null);
        if (onChangeScheduledTime) onChangeScheduledTime(null);
        setShowTimeInput(false);
        if (onToggleRecurring) onToggleRecurring(false);
    };

    return (
        <div style={{
            marginTop: '10px',
            padding: '12px',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            background: 'var(--item-bg)',
            boxSizing: 'border-box',
            ...containerStyle
        }}>
            {/* Header with Contract Minus Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: 'var(--muted-text)'
                    }}>
                        Date & Recurrence
                    </span>
                    {onContract && (
                        <button
                            type="button"
                            onClick={onContract}
                            title="Contract schedule"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--muted-text)',
                                padding: '2px 4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '4px'
                            }}
                        >
                            <Minus size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Date Input + Day + Week + Clear */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '10px', flexWrap: 'nowrap', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: '0 0 104px', minWidth: '92px', maxWidth: '108px', flexShrink: 0 }}>
                    <label htmlFor={dateInputId} style={{ fontSize: '0.78rem', color: 'var(--muted-text)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Start/Scheduled Date">Start/Scheduled Date</label>
                    <input
                        id={dateInputId}
                        aria-label="Start/Scheduled Date"
                        type="date"
                        value={scheduledDate || ''}
                        onChange={(e) => onChangeScheduledDate(e.target.value || null)}
                        style={{
                            padding: '6px 4px',
                            fontSize: '0.82rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            background: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            outline: 'none',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => onChangeScheduledDate(getTomorrowDateString())}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '6px 8px',
                        background: 'var(--accent-bg)',
                        border: '1px solid var(--accent-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        color: 'var(--accent-color)',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        boxSizing: 'border-box'
                    }}
                    title="Schedule for tomorrow (Next Day)"
                >
                    <FastForward size={13} style={{ flexShrink: 0 }} />
                    <span>Day</span>
                </button>
                <button
                    type="button"
                    onClick={() => onChangeScheduledDate(getNextWeekDateString())}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '6px 8px',
                        background: 'var(--accent-bg)',
                        border: '1px solid var(--accent-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        color: 'var(--accent-color)',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        boxSizing: 'border-box'
                    }}
                    title="Schedule for Monday of next week"
                >
                    <FastForward size={13} style={{ flexShrink: 0 }} />
                    <span>Week</span>
                </button>
                {scheduledDate && (
                    <button
                        type="button"
                        onClick={handleClear}
                        style={{
                            padding: '6px 8px',
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            color: '#ef4444',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            boxSizing: 'border-box'
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Time & Repeat Scheduling Row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
                flexWrap: 'wrap'
            }}>
                {/* Minimalist Time Input with Circular Clock Face */}
                {timeSchedulingEnabled && (
                    <>
                        {!showTimeInput && !scheduledTime ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowTimeInput(true);
                                    if (!scheduledDate) onChangeScheduledDate(getTodayDateString());
                                    setIsTimePickerOpen(true);
                                }}
                                aria-label="Add time"
                                title="Add scheduled time"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '2px 0',
                                    color: 'var(--muted-text)',
                                    cursor: 'pointer',
                                    fontSize: '0.78rem',
                                    fontWeight: '500',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                {showBtnIcons && (
                                    <>
                                        <Clock size={13} />
                                        <Plus size={11} strokeWidth={2.5} />
                                    </>
                                )}
                                {showBtnText && <span>Add time</span>}
                            </button>
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexWrap: 'nowrap'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--muted-text)', fontSize: '0.78rem', fontWeight: '500' }}>
                                    <Clock size={13} />
                                    <label htmlFor={timeInputId}>Time:</label>
                                </div>
                                <button
                                    id={timeInputId}
                                    type="button"
                                    onClick={() => setIsTimePickerOpen(true)}
                                    aria-label="Select time"
                                    style={{
                                        padding: '4px 8px',
                                        fontSize: '0.82rem',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        background: 'var(--bg-color)',
                                        color: scheduledTime ? 'var(--text-color)' : 'var(--muted-text)',
                                        fontWeight: scheduledTime ? '600' : '400',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    {scheduledTime ? formatDisplayTime(scheduledTime, dateFormat) : 'Select time...'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (onChangeScheduledTime) onChangeScheduledTime(null);
                                        setShowTimeInput(false);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--muted-text)',
                                        cursor: 'pointer',
                                        fontSize: '0.78rem',
                                        padding: '4px 6px',
                                        borderRadius: '4px',
                                        display: 'inline-flex',
                                        alignItems: 'center'
                                    }}
                                    title="Remove time"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Repeat Toggle Icon Button */}
                {onToggleRecurring && (
                    <button
                        type="button"
                        role="checkbox"
                        aria-checked={isRecurring}
                        aria-label="Repeat this task"
                        title={isRecurring ? "Repeating task: active (tap to turn off recurrence)" : "Repeat this task (recurrence)"}
                        onClick={() => {
                            const next = !isRecurring;
                            onToggleRecurring(next);
                            if (next && !scheduledDate) {
                                onChangeScheduledDate(getTodayDateString());
                            }
                        }}
                        style={{
                            background: isRecurring ? 'rgba(59, 130, 246, 0.12)' : 'none',
                            border: isRecurring ? '1px solid var(--accent-color)' : '1px solid transparent',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            minHeight: '26px',
                            color: isRecurring ? 'var(--accent-color)' : 'var(--muted-text)',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: isRecurring ? '600' : '500',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        {showBtnIcons && <Repeat size={13} strokeWidth={isRecurring ? 2.5 : 2} />}
                        {showBtnText && <span>Repeat</span>}
                    </button>
                )}
            </div>

            {/* TimePickerModal */}
            {timeSchedulingEnabled && (
                <TimePickerModal
                    isOpen={isTimePickerOpen}
                    value={scheduledTime}
                    onSave={(newTime) => {
                        if (onChangeScheduledTime) onChangeScheduledTime(newTime);
                        if (newTime && !scheduledDate) {
                            onChangeScheduledDate(getTodayDateString());
                        }
                        if (!newTime) {
                            setShowTimeInput(false);
                        }
                    }}
                    onClose={() => setIsTimePickerOpen(false)}
                />
            )}

            {/* Add to External Calendars */}
            {scheduledDate && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px',
                    flexWrap: 'wrap'
                }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Add to:
                    </span>
                    <button
                        type="button"
                        onClick={() => openGoogleCalendar({
                            title: taskTitle || 'Scheduled Task',
                            scheduledDate,
                            scheduledTime: timeSchedulingEnabled ? scheduledTime : null,
                            notes: taskNotes
                        })}
                        style={{
                            background: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            color: 'var(--text-color)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                        title="Add to Google Calendar (with automated reminders)"
                    >
                        <Calendar size={12} style={{ color: '#4285f4' }} />
                        <span>Google Cal</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => downloadAppleCalendarIcs({
                            title: taskTitle || 'Scheduled Task',
                            scheduledDate,
                            scheduledTime: timeSchedulingEnabled ? scheduledTime : null,
                            notes: taskNotes
                        })}
                        style={{
                            background: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            color: 'var(--text-color)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                        title="Add to Apple Calendar / Download .ics (with automated 15-min reminder)"
                    >
                        <Calendar size={12} style={{ color: '#ea4335' }} />
                        <span>Apple Cal</span>
                    </button>
                </div>
            )}

            {/* Recurrence Sub-section */}
            <RecurrencePicker
                isRecurring={isRecurring}
                frequency={recurrenceFrequency}
                onChangeFrequency={onChangeRecurrenceFrequency}
                interval={recurrenceInterval}
                onChangeInterval={onChangeRecurrenceInterval}
                daysOfWeek={recurrenceDaysOfWeek}
                onChangeDaysOfWeek={onChangeRecurrenceDaysOfWeek}
                scheduledDate={scheduledDate}
                onAdjustScheduledDate={onChangeScheduledDate}
            />
        </div>
    );
};

export default SchedulePicker;
