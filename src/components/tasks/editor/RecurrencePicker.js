import React from 'react';
import { getTodayDateString, adjustStartDateForWeekdays } from '../../../utils/dateUtils';

const RecurrencePicker = ({
    isRecurring,
    frequency = 1,
    onChangeFrequency,
    interval = 'days',
    onChangeInterval,
    daysOfWeek = [],
    onChangeDaysOfWeek,
    scheduledDate,
    onAdjustScheduledDate
}) => {
    if (!isRecurring) return null;

    return (
        <div style={{
            marginTop: '4px',
            marginBottom: '10px',
            padding: '10px 12px',
            background: 'var(--item-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--muted-text)' }}>Every</span>
                <input
                    type="number"
                    min="1"
                    value={frequency}
                    onChange={(e) => onChangeFrequency(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{
                        width: '58px',
                        padding: '6px 8px',
                        fontSize: '1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)',
                        textAlign: 'center'
                    }}
                />
                <select
                    value={interval}
                    onChange={(e) => onChangeInterval(e.target.value)}
                    style={{
                        padding: '6px 10px',
                        fontSize: '1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                    }}
                >
                    <option value="days">Day(s)</option>
                    <option value="weeks">Week(s)</option>
                    <option value="months">Month(s)</option>
                    <option value="years">Year(s)</option>
                </select>
            </div>

            {interval === 'weeks' && (
                <div style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Repeat on specific days:
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                            const isSelected = daysOfWeek.includes(idx);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                        let updatedDays;
                                        if (isSelected) {
                                            updatedDays = daysOfWeek.filter(d => d !== idx);
                                        } else {
                                            updatedDays = [...daysOfWeek, idx];
                                        }
                                        onChangeDaysOfWeek(updatedDays);

                                        if (onAdjustScheduledDate) {
                                            const baseDate = scheduledDate || getTodayDateString();
                                            const snappedDate = adjustStartDateForWeekdays(baseDate, updatedDays);
                                            onAdjustScheduledDate(snappedDate);
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '7px 4px',
                                        fontSize: '0.88rem',
                                        fontWeight: '700',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                                        background: isSelected ? 'var(--accent-color)' : 'var(--item-bg)',
                                        color: isSelected ? 'white' : 'var(--text-color)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {day[0]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecurrencePicker;
