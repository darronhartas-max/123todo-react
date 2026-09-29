import React, { useState, useEffect, useRef } from 'react';
import { COMMON_STYLES } from '../../utils/styles';
import { motion } from 'framer-motion';
import { Clock, X } from 'lucide-react';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const TimePickerModal = ({ isOpen, value, onSave, onClose }) => {
    const [mode, setMode] = useState('hour'); // 'hour' | 'minute'
    const [selectedHour, setSelectedHour] = useState(9);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [period, setPeriod] = useState('AM'); // 'AM' | 'PM'
    const svgRef = useRef(null);

    // Initialize state when modal opens or value changes
    useEffect(() => {
        if (!isOpen) return;

        if (value && typeof value === 'string' && value.includes(':')) {
            const parts = value.split(':');
            const h = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            if (!isNaN(h) && !isNaN(m)) {
                const p = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 === 0 ? 12 : h % 12;
                setSelectedHour(h12);
                setSelectedMinute(Math.round(m / 5) * 5 % 60);
                setPeriod(p);
                setMode('hour');
                return;
            }
        }
        // Default to 9:00 AM if no valid value
        setSelectedHour(9);
        setSelectedMinute(0);
        setPeriod('AM');
        setMode('hour');
    }, [isOpen, value]);

    // Handle ESC key to close
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Convert coordinates: center (110, 110), radius 76
    const cx = 110;
    const cy = 110;
    const radius = 76;

    const getHourCoord = (h) => {
        const angle = (h % 12) * 30 * (Math.PI / 180);
        return {
            x: cx + radius * Math.sin(angle),
            y: cy - radius * Math.cos(angle)
        };
    };

    const getMinuteCoord = (m) => {
        const angle = (m % 60) * 6 * (Math.PI / 180);
        return {
            x: cx + radius * Math.sin(angle),
            y: cy - radius * Math.cos(angle)
        };
    };

    const handleDialClick = (e) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left - rect.width / 2;
        const clickY = e.clientY - rect.top - rect.height / 2;

        let angle = Math.atan2(clickX, -clickY) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        if (mode === 'hour') {
            let h = Math.round(angle / 30);
            if (h === 0) h = 12;
            setSelectedHour(h);
            setMode('minute');
        } else {
            let m = (Math.round(angle / 30) * 5) % 60;
            setSelectedMinute(m);
        }
    };

    const handleConfirm = () => {
        let h24 = selectedHour;
        if (period === 'PM') {
            if (h24 !== 12) h24 += 12;
        } else {
            if (h24 === 12) h24 = 0;
        }
        const timeStr = `${String(h24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
        onSave(timeStr);
        onClose();
    };

    const handleClear = () => {
        onSave(null);
        onClose();
    };

    const activeCoord = mode === 'hour' ? getHourCoord(selectedHour) : getMinuteCoord(selectedMinute);

    return (
        <div 
            style={{
                ...COMMON_STYLES.modalOverlay,
                zIndex: 2500
            }} 
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Select Time"
                style={{
                    background: 'var(--surface-color, #ffffff)',
                    border: '1px solid var(--border-color)',
                    padding: '20px',
                    borderRadius: '16px',
                    width: '300px',
                    maxWidth: '92%',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
                    color: 'var(--text-color)',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '14px',
                    userSelect: 'none'
                }}
            >
                {/* Header Title with Close Icon */}
                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: '600' }}>
                        <Clock size={16} color="var(--accent-color)" />
                        <span>Select Time</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close time picker"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--muted-text)',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Digital Time & AM/PM Selector */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '6px 0'
                }}>
                    {/* Hour and Minute Display Buttons */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        background: 'var(--item-bg, #f3f4f6)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <button
                            type="button"
                            onClick={() => setMode('hour')}
                            style={{
                                background: mode === 'hour' ? 'var(--accent-bg, rgba(59, 130, 246, 0.15))' : 'transparent',
                                color: mode === 'hour' ? 'var(--accent-color)' : 'var(--text-color)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.12s ease'
                            }}
                            title="Select hour"
                        >
                            {String(selectedHour).padStart(2, '0')}
                        </button>
                        <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--muted-text)' }}>:</span>
                        <button
                            type="button"
                            onClick={() => setMode('minute')}
                            style={{
                                background: mode === 'minute' ? 'var(--accent-bg, rgba(59, 130, 246, 0.15))' : 'transparent',
                                color: mode === 'minute' ? 'var(--accent-color)' : 'var(--text-color)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.12s ease'
                            }}
                            title="Select minutes"
                        >
                            {String(selectedMinute).padStart(2, '0')}
                        </button>
                    </div>

                    {/* AM / PM Toggle Pill */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--item-bg, #f3f4f6)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden'
                    }}>
                        <button
                            type="button"
                            onClick={() => setPeriod('AM')}
                            style={{
                                background: period === 'AM' ? 'var(--accent-color, #3b82f6)' : 'transparent',
                                color: period === 'AM' ? '#ffffff' : 'var(--muted-text)',
                                border: 'none',
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            onClick={() => setPeriod('PM')}
                            style={{
                                background: period === 'PM' ? 'var(--accent-color, #3b82f6)' : 'transparent',
                                color: period === 'PM' ? '#ffffff' : 'var(--muted-text)',
                                border: 'none',
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            PM
                        </button>
                    </div>
                </div>

                {/* Subtitle helper showing what is being selected */}
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                    {mode === 'hour' ? 'Tap an hour on the clock' : 'Tap minutes on the clock'}
                </div>

                {/* Circular Clock Face SVG */}
                <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                    <svg
                        ref={svgRef}
                        width="220"
                        height="220"
                        viewBox="0 0 220 220"
                        onClick={handleDialClick}
                        style={{ cursor: 'pointer', touchAction: 'none' }}
                    >
                        {/* Clock Dial Background Circle */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r={104}
                            fill="var(--item-bg, #f3f4f6)"
                            stroke="var(--border-color, #e5e7eb)"
                            strokeWidth="1.5"
                        />

                        {/* Hand Line pointing to selected item */}
                        <line
                            x1={cx}
                            y1={cy}
                            x2={activeCoord.x}
                            y2={activeCoord.y}
                            stroke="var(--accent-color, #3b82f6)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />

                        {/* Selected bubble highlight circle */}
                        <circle
                            cx={activeCoord.x}
                            cy={activeCoord.y}
                            r={15}
                            fill="var(--accent-color, #3b82f6)"
                        />

                        {/* Center Pivot Point */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill="var(--accent-color, #3b82f6)"
                        />

                        {/* Render Numbers */}
                        {mode === 'hour' ? (
                            HOURS.map((h) => {
                                const coord = getHourCoord(h);
                                const isSelected = h === selectedHour;
                                return (
                                    <text
                                        key={h}
                                        x={coord.x}
                                        y={coord.y}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fill={isSelected ? '#ffffff' : 'var(--text-color, #111827)'}
                                        fontSize="13"
                                        fontWeight={isSelected ? '700' : '600'}
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        {h}
                                    </text>
                                );
                            })
                        ) : (
                            MINUTES.map((m) => {
                                const coord = getMinuteCoord(m);
                                const isSelected = m === selectedMinute;
                                return (
                                    <text
                                        key={m}
                                        x={coord.x}
                                        y={coord.y}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fill={isSelected ? '#ffffff' : 'var(--text-color, #111827)'}
                                        fontSize="11"
                                        fontWeight={isSelected ? '700' : '600'}
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        {String(m).padStart(2, '0')}
                                    </text>
                                );
                            })
                        )}
                    </svg>
                </div>

                {/* Footer Action Buttons */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <button
                        type="button"
                        onClick={handleClear}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--muted-text)',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '4px'
                        }}
                    >
                        Clear
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-color)',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            style={{
                                background: 'var(--accent-color, #3b82f6)',
                                border: 'none',
                                color: '#ffffff',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Set Time
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TimePickerModal;
