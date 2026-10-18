import React from 'react';

const SettingsAppearanceTab = ({
    appMode = 'tasks',
    onSwitchMode = () => {},
    viewProfile = 'lite',
    setViewProfile,
    buttonDisplayMode = 'icons',
    setButtonDisplayMode,
    fontSize,
    setFontSize,
    notesFontSize = 18,
    setNotesFontSize,
    themeMode,
    setThemeMode,
    screenScalingMode = 'auto',
    setScreenScalingMode,
    lightModeTone = 'soft',
    setLightModeTone,
    isBoldFont = false,
    setIsBoldFont,
    layoutWidth,
    setLayoutWidth,
    wideColumnView = 'priorities',
    setWideColumnView,
    styles
}) => {
    return (
        <div>
            <div style={styles.sectionTitle}>Appearance & Styling</div>

            {/* App Skin / Mode */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Active App Skin</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: 'normal' }}>
                        {appMode === 'notes' ? 'Voice Notes' : 'Task Manager (P1-P4 Matrix)'}
                    </span>
                </div>
                <div style={styles.segmentContainer}>
                    <button
                        style={styles.segmentBtn(appMode === 'tasks')}
                        onClick={() => onSwitchMode('tasks')}
                    >
                        📋 Task Manager
                    </button>
                    <button
                        style={styles.segmentBtn(appMode === 'notes')}
                        onClick={() => onSwitchMode('notes')}
                    >
                        🎙️ Voice Notes
                    </button>
                </div>
            </div>

            {/* Interface View Profile */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Interface Profile</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        {viewProfile === 'lite' 
                            ? 'Lite: Clean 2-line minimalist view with progressive disclosure on tap' 
                            : 'Pro: Full feature set with instant access to toolbars, subtasks, and notes'}
                    </span>
                </div>
                <div style={styles.segmentContainer}>
                    <button
                        style={styles.segmentBtn(viewProfile === 'lite')}
                        onClick={() => setViewProfile && setViewProfile('lite')}
                    >
                        🍃 Lite (Simple)
                    </button>
                    <button
                        style={styles.segmentBtn(viewProfile === 'pro')}
                        onClick={() => setViewProfile && setViewProfile('pro')}
                    >
                        ⚡ Pro (Full Power)
                    </button>
                </div>
            </div>

            {/* Feature Buttons & Labels: Icons (Clean), Icons & Text, Text Only */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Feature Buttons & Labels</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        {buttonDisplayMode === 'icons'
                            ? 'Icons (Clean): Shows clean icons for features and actions with comfortable spacing'
                            : buttonDisplayMode === 'both'
                                ? 'Icons & Text: Shows both descriptive icons and text labels side-by-side'
                                : 'Text Only: Shows text labels without icons'}
                    </span>
                </div>
                <div style={styles.segmentContainer}>
                    <button
                        style={styles.segmentBtn(buttonDisplayMode === 'icons')}
                        onClick={() => setButtonDisplayMode && setButtonDisplayMode('icons')}
                        title="Clean mode with icons"
                    >
                        ✨ Icons (Clean)
                    </button>
                    <button
                        style={styles.segmentBtn(buttonDisplayMode === 'both')}
                        onClick={() => setButtonDisplayMode && setButtonDisplayMode('both')}
                        title="Show both icons and text"
                    >
                        🔤 Icons & Text
                    </button>
                    <button
                        style={styles.segmentBtn(buttonDisplayMode === 'text')}
                        onClick={() => setButtonDisplayMode && setButtonDisplayMode('text')}
                        title="Show text only"
                    >
                        📄 Text Only
                    </button>
                </div>
            </div>

            {/* Tasks View Text Size */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Tasks View Text Size</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                        {(() => {
                            const defaultFontSize = (typeof window !== 'undefined' && window.innerWidth > 768) ? 11 : 14;
                            return `${fontSize}pt (${fontSize === defaultFontSize ? 'Default' : fontSize < defaultFontSize ? 'Smaller' : 'Larger'})`;
                        })()}
                    </span>
                </div>
                <div style={styles.sliderContainer}>
                    <span style={{ fontSize: '8pt', color: 'var(--muted-text)' }}>A</span>
                    <input
                        type="range"
                        min="8"
                        max="24"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        style={styles.slider}
                    />
                    <span style={{ fontSize: '20pt', color: 'var(--muted-text)', fontWeight: 'bold' }}>A</span>
                </div>
            </div>

            {/* Notes View Text Size (Independent) */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Notes View Text Size</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                        {notesFontSize}pt ({notesFontSize === 18 ? 'Default' : notesFontSize < 18 ? 'Smaller' : notesFontSize <= 26 ? 'Larger' : 'Extra Large'})
                    </span>
                </div>
                <div style={styles.sliderContainer}>
                    <span style={{ fontSize: '10pt', color: 'var(--muted-text)' }}>A</span>
                    <input
                        type="range"
                        min="12"
                        max="36"
                        value={notesFontSize}
                        onChange={(e) => setNotesFontSize && setNotesFontSize(parseInt(e.target.value, 10))}
                        style={styles.slider}
                    />
                    <span style={{ fontSize: '22pt', color: 'var(--muted-text)', fontWeight: 'bold' }}>A</span>
                </div>
            </div>

            {/* Theme Mode */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>Theme Mode</div>
                <div style={styles.segmentContainer}>
                    <button
                        style={styles.segmentBtn(themeMode === 'system')}
                        onClick={() => setThemeMode('system')}
                    >
                        System
                    </button>
                    <button
                        style={styles.segmentBtn(themeMode === 'light')}
                        onClick={() => setThemeMode('light')}
                    >
                        Light
                    </button>
                    <button
                        style={styles.segmentBtn(themeMode === 'dark')}
                        onClick={() => setThemeMode('dark')}
                    >
                        Dark
                    </button>
                </div>
            </div>

            {/* Screen Scaling & Device Optimization */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Screen Scaling & Device Optimization</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        {screenScalingMode === 'compact'
                            ? 'Compact: Scaled typography, logo & tight paddings for older or smaller phones (≤375px)'
                            : screenScalingMode === 'standard'
                                ? 'Standard: Full comfortable spacing & typography across all displays'
                                : 'Auto: Automatically adapts layout and text based on device screen resolution'}
                    </span>
                </div>
                <div style={styles.segmentContainer}>
                    <button
                        style={styles.segmentBtn(screenScalingMode === 'auto')}
                        onClick={() => setScreenScalingMode && setScreenScalingMode('auto')}
                        title="Auto-detect screen resolution and apply optimal scaling"
                    >
                        📱 Auto (Recommended)
                    </button>
                    <button
                        style={styles.segmentBtn(screenScalingMode === 'compact')}
                        onClick={() => setScreenScalingMode && setScreenScalingMode('compact')}
                        title="Force compact typography and spacing for older/smaller devices"
                    >
                        🔍 Compact
                    </button>
                    <button
                        style={styles.segmentBtn(screenScalingMode === 'standard')}
                        onClick={() => setScreenScalingMode && setScreenScalingMode('standard')}
                        title="Standard typography and spacious padding"
                    >
                        🖥️ Standard
                    </button>
                </div>
            </div>

            {/* Light Mode Background Tone */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Light Mode Background Tone</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Adjust background tone in light mode to reduce glare and eye strain
                    </span>
                </div>
                <div style={styles.segmentContainer}>
                    <button
                        style={styles.segmentBtn(lightModeTone === 'bright')}
                        onClick={() => setLightModeTone && setLightModeTone('bright')}
                        title="Bright (Pure White background)"
                    >
                        Bright
                    </button>
                    <button
                        style={styles.segmentBtn(lightModeTone === 'soft')}
                        onClick={() => setLightModeTone && setLightModeTone('soft')}
                        title="Soft (Warm Light Grey - Low Eye Strain)"
                    >
                        Soft
                    </button>
                    <button
                        style={styles.segmentBtn(lightModeTone === 'muted')}
                        onClick={() => setLightModeTone && setLightModeTone('muted')}
                        title="Muted (Cozy Low-Glare Grey)"
                    >
                        Muted
                    </button>
                </div>
            </div>

            {/* Bold Font Option */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>
                    <span>Bold Text Typography</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                        Increase font weight across tasks, menus, and notes for enhanced high contrast readability
                    </span>
                </div>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: 'var(--text-color)',
                    fontSize: '0.95rem'
                }}>
                    <input
                        type="checkbox"
                        checked={isBoldFont}
                        onChange={(e) => setIsBoldFont && setIsBoldFont(e.target.checked)}
                        style={{
                            width: '18px',
                            height: '18px',
                            accentColor: 'var(--accent-color)',
                            cursor: 'pointer'
                        }}
                    />
                    <span>Enable Bold Text</span>
                </label>
            </div>

            {/* Layout Width Constraint */}
            <div style={styles.settingRow}>
                <div style={styles.settingLabel}>Desktop Layout Width</div>
                <div style={styles.segmentContainer}>
                    <button
                        style={styles.segmentBtn(layoutWidth === '480px')}
                        onClick={() => setLayoutWidth('480px')}
                    >
                        Single Column (480px)
                    </button>
                    <button
                        style={styles.segmentBtn(layoutWidth === '1000px')}
                        onClick={() => setLayoutWidth('1000px')}
                    >
                        Kanban Columns (1000px)
                    </button>
                </div>
            </div>

            {/* Wide View Columns Mode */}
            {layoutWidth !== '480px' && (
                <div style={styles.settingRow}>
                    <div style={styles.settingLabel}>
                        <span>Wide Mode Column View</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                            Group columns in wide mode by Priorities or by Projects
                        </span>
                    </div>
                    <div style={styles.segmentContainer}>
                        <button
                            style={styles.segmentBtn(wideColumnView === 'priorities')}
                            onClick={() => setWideColumnView && setWideColumnView('priorities')}
                        >
                            By Priorities
                        </button>
                        <button
                            style={styles.segmentBtn(wideColumnView === 'projects')}
                            onClick={() => setWideColumnView && setWideColumnView('projects')}
                        >
                            By Projects
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsAppearanceTab;
