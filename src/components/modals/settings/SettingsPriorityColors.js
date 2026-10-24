import React, { useState } from 'react';
import { RotateCcw, Palette } from 'lucide-react';
import {
    DEFAULT_PRIORITY_COLORS,
    getPriorities
} from '../../../utils/constants';

// Curated 24-color palette combining the 4 default priority colors and the 20 project colors
const PRIORITY_COLOR_PALETTE = [
    // Warm & Yellows
    '#dc2626', // P1 Default (Must Do Red)
    '#b91c1c', // Crimson
    '#ea580c', // Coral
    '#f97316', // Mandarin
    '#f59e0b', // P2 Default (Should Do Amber)
    '#d97706', // Warm Amber
    '#eab308', // Sunflower Yellow
    '#84cc16', // Lime Green
    // Greens, Teals & Cyans
    '#22c55e', // Leaf Green
    '#065f46', // Forest Green
    '#10b981', // Emerald
    '#14b8a6', // Teal
    '#06b6d4', // Bright Cyan
    '#0ea5e9', // Sky Blue
    '#3b82f6', // Vivid Blue
    '#285a82', // Ocean Blue
    // Indigos, Purples, Pinks & Grays
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#9333ea', // P4 Default (On Hold Purple)
    '#a855f7', // Amethyst
    '#d946ef', // Fuchsia
    '#ec4899', // Sweet Pink
    '#f43f5e', // Ruby Rose
    '#6b7280', // P3 Default (Could Do Slate)
];

const SettingsPriorityColors = ({
    priorityColors = DEFAULT_PRIORITY_COLORS,
    setPriorityColors,
    styles = {}
}) => {
    const [activePriority, setActivePriority] = useState(1);

    const effectiveColors = {
        ...DEFAULT_PRIORITY_COLORS,
        ...priorityColors
    };

    const priorities = getPriorities(effectiveColors);
    const currentColor = effectiveColors[activePriority];
    const defaultColorForActive = DEFAULT_PRIORITY_COLORS[activePriority];
    const isCurrentModified = currentColor.toLowerCase() !== defaultColorForActive.toLowerCase();

    const isAnyModified = Object.keys(DEFAULT_PRIORITY_COLORS).some(
        p => effectiveColors[p]?.toLowerCase() !== DEFAULT_PRIORITY_COLORS[p]?.toLowerCase()
    );

    const handleSelectColor = (priority, color) => {
        if (!setPriorityColors) return;
        setPriorityColors({
            ...effectiveColors,
            [priority]: color
        });
    };

    const handleResetActive = () => {
        if (!setPriorityColors) return;
        setPriorityColors({
            ...effectiveColors,
            [activePriority]: DEFAULT_PRIORITY_COLORS[activePriority]
        });
    };

    const handleResetAll = () => {
        if (!setPriorityColors) return;
        setPriorityColors(DEFAULT_PRIORITY_COLORS);
    };

    return (
        <div style={styles.settingRow || { marginBottom: '24px' }}>
            <div style={styles.settingLabel || { fontSize: '1rem', fontWeight: '600', color: 'var(--text-color)' }}>
                <span>Priority Label Colors</span>
                {isAnyModified && (
                    <button
                        type="button"
                        onClick={handleResetAll}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-color)',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}
                        title="Reset all priority colors to default"
                    >
                        <RotateCcw size={12} />
                        <span>Reset All Defaults</span>
                    </button>
                )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500', marginBottom: '8px' }}>
                Select a priority label to customize its color across tasks, headers, and badges.
            </div>

            {/* Priority Selector Pills */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginBottom: '12px'
            }}>
                {[1, 2, 3, 4].map((p) => {
                    const conf = priorities[p];
                    const isSelected = activePriority === p;
                    const pColor = effectiveColors[p];
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setActivePriority(p)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: isSelected ? 'var(--item-bg)' : 'transparent',
                                border: isSelected ? `2px solid ${pColor}` : '1.5px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                textAlign: 'left',
                                boxShadow: isSelected ? `0 2px 8px ${pColor}20` : 'none'
                            }}
                        >
                            <span
                                style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    backgroundColor: pColor,
                                    flexShrink: 0,
                                    boxShadow: `0 0 4px ${pColor}80`
                                }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <span style={{
                                    fontSize: '0.88rem',
                                    fontWeight: isSelected ? '800' : '600',
                                    color: isSelected ? pColor : 'var(--text-color)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {conf.label}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                                    P{p}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Active Priority Palette Panel */}
            <div style={{
                background: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-color)' }}>
                            Choose Color for <span style={{ color: currentColor }}>{priorities[activePriority].label}</span>:
                        </span>
                        <div
                            style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: currentColor,
                                border: '1px solid var(--border-color)',
                                flexShrink: 0
                            }}
                        />
                    </div>

                    {isCurrentModified && (
                        <button
                            type="button"
                            onClick={handleResetActive}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--muted-text)',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                padding: '2px 4px'
                            }}
                            title={`Reset ${priorities[activePriority].label} to default (${defaultColorForActive})`}
                        >
                            <RotateCcw size={12} />
                            <span>Reset to Default</span>
                        </button>
                    )}
                </div>

                {/* Swatches Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: '8px 4px',
                    justifyItems: 'center',
                    alignItems: 'center',
                    padding: '4px 0'
                }}>
                    {PRIORITY_COLOR_PALETTE.map((c) => {
                        const isSelected = currentColor.toLowerCase() === c.toLowerCase();
                        return (
                            <div
                                key={c}
                                onClick={() => handleSelectColor(activePriority, c)}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: c,
                                    cursor: 'pointer',
                                    border: isSelected ? '2.5px solid var(--text-color)' : '1.5px solid transparent',
                                    transform: isSelected ? 'scale(1.18)' : 'scale(1)',
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                    boxShadow: isSelected ? '0 0 0 1px var(--text-color), 0 1px 3px rgba(0,0,0,0.25)' : '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                                title={c}
                            />
                        );
                    })}
                </div>

                {/* Custom Color Input */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '2px' }}>
                    <label
                        title="Pick a custom color"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: 'var(--muted-text)',
                            fontWeight: '600'
                        }}
                    >
                        <Palette size={14} />
                        <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => handleSelectColor(activePriority, e.target.value)}
                            style={{
                                width: '22px',
                                height: '22px',
                                padding: 0,
                                border: '1px solid var(--border-color)',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                background: 'transparent'
                            }}
                        />
                        <span>Custom Color</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SettingsPriorityColors;
