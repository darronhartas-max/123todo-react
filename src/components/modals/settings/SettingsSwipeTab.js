import React, { useState, useRef } from 'react';
import { MoveHorizontal, CheckSquare, Trash2, Flag, PauseCircle, Edit2, Slash } from 'lucide-react';
import { SWIPE_ACTIONS } from '../../../utils/constants';

const ACTION_ICONS = {
    CheckSquare,
    Trash2,
    Flag,
    PauseCircle,
    Edit2,
    Slash
};

export const SwipeDemoCard = ({ swipeSettings }) => {
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [demoMessage, setDemoMessage] = useState('Swipe this sample task card left or right!');
    const touchStartRef = useRef({ x: 0, y: 0 });
    const isSwipingRef = useRef(false);

    const THRESHOLD = 95;

    const applyDamping = (diffX) => {
        const absX = Math.abs(diffX);
        if (absX <= THRESHOLD) return diffX;
        const over = absX - THRESHOLD;
        return Math.sign(diffX) * (THRESHOLD + over * 0.45);
    };

    const rightSwipeAction = swipeSettings?.enabled && swipeSettings?.swipeRight ? SWIPE_ACTIONS[swipeSettings.swipeRight] : null;
    const leftSwipeAction = swipeSettings?.enabled && swipeSettings?.swipeLeft ? SWIPE_ACTIONS[swipeSettings.swipeLeft] : null;

    const RightIcon = rightSwipeAction ? ACTION_ICONS[rightSwipeAction.icon] || CheckSquare : null;
    const LeftIcon = leftSwipeAction ? ACTION_ICONS[leftSwipeAction.icon] || Trash2 : null;

    const isRightArmed = swipeOffset >= THRESHOLD && swipeSettings?.swipeRight !== 'none';
    const isLeftArmed = Math.abs(swipeOffset) >= THRESHOLD && swipeOffset < 0 && swipeSettings?.swipeLeft !== 'none';
    const rightProgress = Math.min(1, Math.max(0, swipeOffset / THRESHOLD));
    const leftProgress = Math.min(1, Math.max(0, Math.abs(swipeOffset) / THRESHOLD));

    const handleTouchStart = (e) => {
        if (!swipeSettings?.enabled) return;
        const touch = e.touches ? e.touches[0] : e;
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        isSwipingRef.current = false;
    };

    const handleTouchMove = (e) => {
        if (!swipeSettings?.enabled) return;
        const touch = e.touches ? e.touches[0] : e;
        const diffX = touch.clientX - touchStartRef.current.x;
        const diffY = touch.clientY - touchStartRef.current.y;
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);

        if (!isSwipingRef.current) {
            if (absY > 7 && (absY * 1.15 >= absX || absY > 12)) {
                return;
            }
            if (absX >= 16 && absX > absY * 2.0) {
                isSwipingRef.current = true;
            } else {
                return;
            }
        }

        if (isSwipingRef.current) {
            if (e.cancelable) e.preventDefault();
            const rawOffset = applyDamping(diffX);
            const clampedOffset = Math.max(-260, Math.min(260, rawOffset));
            setSwipeOffset(clampedOffset);
        }
    };

    const handleTouchEnd = () => {
        if (!swipeSettings?.enabled || !isSwipingRef.current) {
            setSwipeOffset(0);
            return;
        }
        if (swipeOffset >= THRESHOLD && swipeSettings.swipeRight !== 'none') {
            setDemoMessage(`Triggered Right Swipe: ${rightSwipeAction?.label}! 🎉`);
        } else if (swipeOffset <= -THRESHOLD && swipeSettings.swipeLeft !== 'none') {
            setDemoMessage(`Triggered Left Swipe: ${leftSwipeAction?.label}! ⚡`);
        }
        setSwipeOffset(0);
        isSwipingRef.current = false;
    };

    const handlePointerDown = (e) => {
        if (!swipeSettings?.enabled) return;
        if (e.pointerType === 'mouse' || e.pointerType === 'touch') return;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
        handleTouchStart(e);
    };

    const handlePointerMove = (e) => {
        if (!swipeSettings?.enabled) return;
        if (e.pointerType === 'mouse' || e.pointerType === 'touch') return;
        if (touchStartRef.current.x === 0 && touchStartRef.current.y === 0) return;
        handleTouchMove(e);
    };

    const handlePointerUp = () => {
        handleTouchEnd();
        touchStartRef.current = { x: 0, y: 0 };
    };

    if (!swipeSettings?.enabled) {
        return (
            <div style={{ textAlign: 'center', padding: '12px', color: 'var(--muted-text)', fontSize: '0.9rem' }}>
                Swipe gestures are currently disabled. Enable them above to test.
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
            {swipeOffset > 0 && rightSwipeAction && swipeSettings?.swipeRight !== 'none' && (
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
                    background: isRightArmed 
                        ? (rightSwipeAction.activeBg || rightSwipeAction.color) 
                        : `linear-gradient(90deg, ${rightSwipeAction.color}e6 0%, ${rightSwipeAction.color}b3 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                    paddingLeft: `${Math.max(8, Math.min(20, swipeOffset * 0.2))}px`,
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: isRightArmed ? '800' : '700',
                    fontSize: '0.88rem',
                    gap: '6px',
                    zIndex: 1,
                    transition: 'background 0.15s ease'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: isRightArmed ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.2)',
                        transform: isRightArmed ? 'scale(1.25)' : `scale(${0.85 + rightProgress * 0.25})`,
                        transition: 'transform 0.15s ease',
                        flexShrink: 0
                    }}>
                        {RightIcon && <RightIcon size={18} color="#ffffff" />}
                    </div>
                    <span style={{ opacity: Math.min(1, Math.abs(swipeOffset) / 10), fontWeight: '700', whiteSpace: 'nowrap' }}>
                        {isRightArmed ? `Release to ${rightSwipeAction.label}` : (rightSwipeAction.actionHint || rightSwipeAction.label)}
                    </span>
                    {!isRightArmed && (
                        <div style={{ position: 'absolute', left: `${THRESHOLD}px`, top: '15%', bottom: '15%', width: '3px', background: '#ffffff', opacity: 0.65, borderRadius: '1.5px' }} />
                    )}
                </div>
            )}
            {swipeOffset < 0 && leftSwipeAction && swipeSettings?.swipeLeft !== 'none' && (
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
                    background: isLeftArmed 
                        ? (leftSwipeAction.activeBg || `linear-gradient(270deg, ${leftSwipeAction.color} 0%, ${leftSwipeAction.color}ee 100%)`) 
                        : `linear-gradient(270deg, ${leftSwipeAction.color}d9 0%, ${leftSwipeAction.color}80 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    paddingRight: `${Math.max(10, Math.min(24, Math.abs(swipeOffset) * 0.18))}px`,
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: isLeftArmed ? '800' : '700',
                    fontSize: '0.88rem',
                    gap: '8px',
                    zIndex: 1,
                    transition: 'background 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: isLeftArmed ? `inset 0 0 28px rgba(0,0,0,0.3)` : 'none'
                }}>
                    <span style={{ opacity: Math.min(1, Math.abs(swipeOffset) / 12), fontWeight: isLeftArmed ? '800' : '700', whiteSpace: 'nowrap' }}>
                        {isLeftArmed ? `Release to ${leftSwipeAction.label}` : (leftSwipeAction.actionHint || leftSwipeAction.label)}
                    </span>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: isLeftArmed ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.22)',
                        transform: isLeftArmed ? 'scale(1.35)' : `scale(${0.85 + leftProgress * 0.3})`,
                        boxShadow: isLeftArmed ? '0 0 16px rgba(255, 255, 255, 0.7)' : 'none',
                        transition: 'transform 0.15s ease',
                        flexShrink: 0
                    }}>
                        {LeftIcon && <LeftIcon size={19} color="#ffffff" />}
                    </div>
                    {!isLeftArmed && (
                        <div style={{ position: 'absolute', right: `${THRESHOLD}px`, top: '15%', bottom: '15%', width: '3px', background: '#ffffff', opacity: 0.75, borderRadius: '1.5px', boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)' }} />
                    )}
                </div>
            )}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                    padding: '12px 16px',
                    background: 'var(--item-bg)',
                    transform: `translateX(${swipeOffset}px)`,
                    transition: swipeOffset === 0 ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                    touchAction: 'pan-y',
                    position: 'relative',
                    zIndex: 2,
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                    <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-color)' }}>{demoMessage}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>Drag me ↔</span>
            </div>
        </div>
    );
};

const SettingsSwipeTab = ({
    swipeSettings,
    onUpdateSwipeSettings,
    styles
}) => {
    return (
        <div>
            <div style={styles.sectionTitle}>
                <MoveHorizontal size={20} /> Task Swipe Gestures
            </div>

            {/* Prominent Enable / Disable Status Card */}
            <div style={{
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${swipeSettings?.enabled ? '#10b981' : 'var(--border-color)'}`,
                background: swipeSettings?.enabled ? 'rgba(16, 185, 129, 0.08)' : 'var(--item-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                transition: 'all 0.2s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: swipeSettings?.enabled ? '#10b981' : '#9ca3af',
                        boxShadow: swipeSettings?.enabled ? '0 0 10px #10b981' : 'none'
                    }} />
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-color)' }}>
                            {swipeSettings?.enabled ? '🟢 Swipe Gestures Active' : '⚪ Swipe Gestures Disabled'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                            {swipeSettings?.enabled ? 'Swipe task cards left or right on mobile & desktop to perform quick actions.' : 'Turn on to swipe task cards left or right for fast shortcuts.'}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onUpdateSwipeSettings({ enabled: !swipeSettings?.enabled })}
                    style={{
                        padding: '8px 18px',
                        borderRadius: '20px',
                        border: 'none',
                        background: swipeSettings?.enabled ? '#10b981' : 'var(--border-color)',
                        color: swipeSettings?.enabled ? '#ffffff' : 'var(--text-color)',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.2s ease'
                    }}
                >
                    {swipeSettings?.enabled ? 'ON' : 'OFF'}
                </button>
            </div>

            <div style={{
                opacity: swipeSettings?.enabled ? 1 : 0.4,
                pointerEvents: swipeSettings?.enabled ? 'auto' : 'none',
                transition: 'opacity 0.2s ease'
            }}>
                {/* Swipe Right Config */}
                <div style={styles.settingRow}>
                    <div style={styles.settingLabel}>
                        <span>➡️ Swipe Right Action (Left to Right)</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginTop: '6px' }}>
                        {Object.entries(SWIPE_ACTIONS).map(([key, action]) => {
                            const isSelected = swipeSettings?.swipeRight === key;
                            const IconComp = ACTION_ICONS[action.icon] || CheckSquare;
                            return (
                                <div
                                    key={key}
                                    onClick={() => onUpdateSwipeSettings({ swipeRight: key })}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: `1.5px solid ${isSelected ? action.color : 'var(--border-color)'}`,
                                        background: isSelected ? `${action.color}15` : 'var(--item-bg)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: isSelected ? '700' : '500',
                                        color: isSelected ? action.color : 'var(--text-color)',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <IconComp size={16} style={{ color: action.color, flexShrink: 0 }} />
                                    <span>{action.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Swipe Left Config */}
                <div style={{ ...styles.settingRow, marginTop: '20px' }}>
                    <div style={styles.settingLabel}>
                        <span>⬅️ Swipe Left Action (Right to Left)</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginTop: '6px' }}>
                        {Object.entries(SWIPE_ACTIONS).map(([key, action]) => {
                            const isSelected = swipeSettings?.swipeLeft === key;
                            const IconComp = ACTION_ICONS[action.icon] || Trash2;
                            return (
                                <div
                                    key={key}
                                    onClick={() => onUpdateSwipeSettings({ swipeLeft: key })}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: `1.5px solid ${isSelected ? action.color : 'var(--border-color)'}`,
                                        background: isSelected ? `${action.color}15` : 'var(--item-bg)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: isSelected ? '700' : '500',
                                        color: isSelected ? action.color : 'var(--text-color)',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <IconComp size={16} style={{ color: action.color, flexShrink: 0 }} />
                                    <span>{action.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Live Practice Card */}
                <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'var(--bg-color)', border: '1px dashed var(--border-color)' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-color)' }}>
                        🧪 Test Your Swipe Gestures Live:
                    </div>
                    <SwipeDemoCard swipeSettings={swipeSettings} />
                </div>
            </div>
        </div>
    );
};

export default SettingsSwipeTab;
