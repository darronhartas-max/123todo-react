import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Trophy, 
    Flame, 
    Zap, 
    Target, 
    CheckCircle2, 
    Award, 
    TrendingUp, 
    BookOpen, 
    ExternalLink, 
    FolderKanban, 
    Star
} from 'lucide-react';

const BLOG_ARTICLES = [
    {
        id: 'prioritization',
        title: 'Mastering Task Prioritization',
        subtitle: 'Discover how a simple priority-based task management system transforms daily productivity.',
        url: 'https://www.123todo.com/mastering-time-management-with-task-prioritization',
        tag: 'Prioritization',
        icon: '🎯'
    },
    {
        id: 'small-steps',
        title: 'Small Steps, Big Dreams',
        subtitle: 'How breaking daunting projects into checklist subtasks unlocks instant momentum.',
        url: 'https://www.123todo.com/small-steps-big-dreams-goal-achievement',
        tag: 'Goal Setting',
        icon: '⚡'
    },
    {
        id: 'building-habits',
        title: 'Building Habits That Stick',
        subtitle: 'Build unbreakable daily productivity habits through compounding consistency and streaks.',
        url: 'https://www.123todo.com/building-habits-that-stick',
        tag: 'Habits',
        icon: '🔥'
    },
    {
        id: 'beginners-guide',
        title: "Beginner's Guide to Time Management",
        subtitle: 'The science-backed benefits of writing down tasks and organizing daily wins.',
        url: 'https://www.123todo.com/beginners-guide-to-time-management',
        tag: 'Time Management',
        icon: '🌱'
    },
    {
        id: 'full-blog',
        title: 'Explore All Guides on 123todo.com',
        subtitle: 'Read all expert tutorials, productivity insights, and focus strategies on our blog.',
        url: 'https://www.123todo.com/blog',
        tag: 'Official Blog',
        icon: '📚'
    }
];

const AchievementsModal = ({ isOpen, onClose, tasks = [], archived = [], projects = [] }) => {
    // 1. Compute Gamification & Productivity Metrics
    const stats = useMemo(() => {
        const totalCompleted = archived.length;
        const totalActive = tasks.length;
        
        // Count subtasks completed
        let subtasksCompleted = 0;
        archived.forEach(t => {
            if (t.subtasks && Array.isArray(t.subtasks)) {
                subtasksCompleted += t.subtasks.filter(st => st.completed).length;
            }
        });
        tasks.forEach(t => {
            if (t.subtasks && Array.isArray(t.subtasks)) {
                subtasksCompleted += t.subtasks.filter(st => st.completed).length;
            }
        });

        // 1-2-3 Rule Breakdown in Archived tasks
        const p1Count = archived.filter(t => t.priority === 1).length;
        const p2Count = archived.filter(t => t.priority === 2).length;
        const p3Count = archived.filter(t => t.priority === 3).length;

        // Calculate Daily Streaks & Velocity
        const now = new Date();
        const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const past14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        let completedThisWeek = 0;
        let completedPrevWeek = 0;

        // Group archived completions by day YYYY-MM-DD
        const completionDates = new Set();
        archived.forEach(t => {
            const timestamp = t.completedAt || t.updatedAt || t.createdAt;
            if (timestamp) {
                const dateObj = new Date(timestamp);
                if (!isNaN(dateObj.getTime())) {
                    const dateStr = dateObj.toISOString().split('T')[0];
                    completionDates.add(dateStr);

                    if (dateObj >= past7Days) {
                        completedThisWeek++;
                    } else if (dateObj >= past14Days && dateObj < past7Days) {
                        completedPrevWeek++;
                    }
                }
            }
        });

        // Calculate active daily streak
        let currentStreak = 0;
        let checkDate = new Date();
        // If today has completions, count from today; otherwise check yesterday
        const todayStr = checkDate.toISOString().split('T')[0];
        let hasToday = completionDates.has(todayStr);
        if (!hasToday) {
            checkDate.setDate(checkDate.getDate() - 1);
        }
        
        while (true) {
            const str = checkDate.toISOString().split('T')[0];
            if (completionDates.has(str)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // If today is completed or yesterday is completed, currentStreak is active
        if (totalCompleted > 0 && currentStreak === 0 && completionDates.size > 0) {
            currentStreak = 1;
        }

        // Productivity Points Calculation: 10 pts per archived task + 2 pts per subtask + 15 pts per streak day
        const points = (totalCompleted * 10) + (subtasksCompleted * 2) + (currentStreak * 15);

        // 10-Tier Level Definitions (Progressive scale up to elite Level 10 pinnacle)
        const levels = [
            { level: 1, title: 'Focused Starter', minPoints: 0, maxPoints: 100, icon: '🌱' },
            { level: 2, title: 'Momentum Builder', minPoints: 100, maxPoints: 300, icon: '⚡' },
            { level: 3, title: 'Task Master', minPoints: 300, maxPoints: 700, icon: '🎯' },
            { level: 4, title: '1-2-3 Strategist', minPoints: 700, maxPoints: 1500, icon: '🏆' },
            { level: 5, title: 'Focus Champion', minPoints: 1500, maxPoints: 3000, icon: '🌟' },
            { level: 6, title: 'Productivity Pro', minPoints: 3000, maxPoints: 6000, icon: '💎' },
            { level: 7, title: 'Workflow Titan', minPoints: 6000, maxPoints: 12000, icon: '🚀' },
            { level: 8, title: 'Master of Execution', minPoints: 12000, maxPoints: 25000, icon: '🛡️' },
            { level: 9, title: 'Grandmaster of Focus', minPoints: 25000, maxPoints: 50000, icon: '🌌' },
            { level: 10, title: '123 Immortal', minPoints: 50000, maxPoints: 999999, icon: '👑' }
        ];

        const currentLevelInfo = levels.slice().reverse().find(l => points >= l.minPoints) || levels[0];
        const isMaxLevel = currentLevelInfo.level === 10;
        const nextLevelInfo = isMaxLevel ? currentLevelInfo : (levels.find(l => l.level === currentLevelInfo.level + 1) || currentLevelInfo);
        
        const pointsInCurrentLevel = points - currentLevelInfo.minPoints;
        const pointsRequiredForNext = nextLevelInfo.maxPoints - currentLevelInfo.minPoints;
        const levelProgressPercent = isMaxLevel 
            ? 100 
            : Math.min(Math.max(Math.round((pointsInCurrentLevel / Math.max(pointsRequiredForNext, 1)) * 100), 0), 100);

        // Milestone Badges
        const badges = [
            {
                id: 'first-task',
                title: 'First Step',
                desc: 'Completed your very first task in 123 ToDo.',
                icon: '🚀',
                unlocked: totalCompleted >= 1,
                progress: `${Math.min(totalCompleted, 1)}/1`
            },
            {
                id: 'hat-trick',
                title: 'Hat Trick',
                desc: 'Completed 3 or more tasks.',
                icon: '🎩',
                unlocked: totalCompleted >= 3,
                progress: `${Math.min(totalCompleted, 3)}/3`
            },
            {
                id: 'streak-3',
                title: 'On Fire',
                desc: 'Achieved a 3-day task completion streak.',
                icon: '🔥',
                unlocked: currentStreak >= 3 || totalCompleted >= 6,
                progress: `${Math.min(currentStreak, 3)}/3 days`
            },
            {
                id: 'rule-master',
                title: '1-2-3 Virtuoso',
                desc: 'Completed tasks across Must-Do, Should-Do & Could-Do tiers.',
                icon: '🎯',
                unlocked: p1Count >= 1 && p2Count >= 1 && p3Count >= 1,
                progress: `${(p1Count > 0 ? 1 : 0) + (p2Count > 0 ? 1 : 0) + (p3Count > 0 ? 1 : 0)}/3 tiers`
            },
            {
                id: 'checklist-hero',
                title: 'Subtask Slayer',
                desc: 'Checked off 10 or more checklist subtasks.',
                icon: '📋',
                unlocked: subtasksCompleted >= 10,
                progress: `${Math.min(subtasksCompleted, 10)}/10`
            },
            {
                id: 'century',
                title: 'Century Club',
                desc: 'Completed 100 tasks all-time.',
                icon: '💯',
                unlocked: totalCompleted >= 100,
                progress: `${Math.min(totalCompleted, 100)}/100`
            },
            {
                id: 'organized',
                title: 'Project Commander',
                desc: 'Organized tasks across 3 or more project categories.',
                icon: '📁',
                unlocked: (projects && projects.length >= 3) || completionDates.size >= 3,
                progress: `${Math.min(projects?.length || 1, 3)}/3 projects`
            },
            {
                id: 'voice-pro',
                title: 'Voice Pioneer',
                desc: 'Created or appended tasks using instant Voice Dictation.',
                icon: '🎙️',
                unlocked: Boolean(localStorage.getItem('voice_used') === 'true' || totalCompleted >= 5),
                progress: totalCompleted >= 5 ? 'Unlocked' : 'Try Voice'
            }
        ];

        return {
            totalCompleted,
            totalActive,
            subtasksCompleted,
            p1Count,
            p2Count,
            p3Count,
            currentStreak,
            completedThisWeek,
            completedPrevWeek,
            points,
            isMaxLevel,
            currentLevelInfo,
            nextLevelInfo,
            levelProgressPercent,
            badges
        };
    }, [tasks, archived, projects]);

    if (!isOpen) return null;

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            backdropFilter: 'blur(4px)',
            padding: '16px',
            boxSizing: 'border-box'
        },
        modalContainer: {
            background: 'var(--surface-color, #ffffff)',
            color: 'var(--text-color, #111827)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color, #e5e7eb)',
            overflow: 'hidden'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color, #e5e7eb)',
            background: 'var(--header-bg, #f9fafb)'
        },
        content: {
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        heroLevelCard: {
            background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(147,51,234,0.12) 100%)',
            border: '1.5px solid rgba(37,99,235,0.25)',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        statGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
            gap: '12px'
        },
        statCard: {
            background: 'var(--item-bg, #f3f4f6)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        },
        sectionTitle: {
            fontSize: '1.05rem',
            fontWeight: '700',
            color: 'var(--text-color, #111827)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        badgesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px'
        },
        badgeCard: (unlocked) => ({
            background: unlocked ? 'var(--item-bg, #ffffff)' : 'rgba(0,0,0,0.03)',
            border: unlocked ? '1.5px solid #10b981' : '1px dashed var(--border-color, #d1d5db)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '6px',
            opacity: unlocked ? 1 : 0.65,
            transition: 'all 0.2s ease',
            boxShadow: unlocked ? '0 2px 8px rgba(16, 185, 129, 0.12)' : 'none'
        }),
        blogGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px'
        },
        blogCard: {
            background: 'var(--item-bg, #f9fafb)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
        }
    };

    return (
        <AnimatePresence>
            <div style={styles.overlay} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    style={styles.modalContainer}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)'
                            }}>
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                                    Productivity & Achievements
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted-text)' }}>
                                    Track your momentum, daily streaks, and 1-2-3 mastery
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--muted-text)',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={styles.content}>
                        {/* Hero Level & Productivity Points Progression */}
                        <div style={styles.heroLevelCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1.6rem' }}>{stats.currentLevelInfo.icon}</span>
                                    <div>
                                        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', color: '#2563eb' }}>
                                            Level {stats.currentLevelInfo.level} of 10
                                        </div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                                            {stats.currentLevelInfo.title}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-color)' }}>
                                        {stats.points.toLocaleString()} Points
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
                                        {stats.isMaxLevel ? 'Pinnacle Achieved 👑' : `${stats.levelProgressPercent}% to Level ${stats.nextLevelInfo.level}`}
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{
                                width: '100%',
                                height: '8px',
                                background: 'rgba(0,0,0,0.08)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${stats.levelProgressPercent}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #2563eb 0%, #9333ea 100%)',
                                    borderRadius: '4px',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                        </div>

                        {/* Core Stats 6-Card Grid */}
                        <div>
                            <div style={{ ...styles.sectionTitle, marginBottom: '10px' }}>
                                <Zap size={16} color="#f59e0b" />
                                Productivity Insights
                            </div>
                            <div style={styles.statGrid}>
                                <div style={styles.statCard}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-text)', fontWeight: '600' }}>
                                        <CheckCircle2 size={14} color="#10b981" />
                                        Completed
                                    </div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981' }}>
                                        {stats.totalCompleted}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                                        Tasks archived
                                    </div>
                                </div>

                                <div style={styles.statCard}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-text)', fontWeight: '600' }}>
                                        <Flame size={14} color="#ef4444" />
                                        Daily Streak
                                    </div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ef4444' }}>
                                        {stats.currentStreak} <span style={{ fontSize: '0.85rem' }}>days</span>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                                        Consecutive focus
                                    </div>
                                </div>

                                <div style={styles.statCard}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-text)', fontWeight: '600' }}>
                                        <TrendingUp size={14} color="#2563eb" />
                                        7-Day Velocity
                                    </div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#2563eb' }}>
                                        {stats.completedThisWeek}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                                        Done this week
                                    </div>
                                </div>

                                <div style={styles.statCard}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-text)', fontWeight: '600' }}>
                                        <Target size={14} color="#9333ea" />
                                        1-2-3 Balance
                                    </div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: '700', marginTop: '2px' }}>
                                        <span style={{ color: '#ef4444' }}>{stats.p1Count}</span> / <span style={{ color: '#f59e0b' }}>{stats.p2Count}</span> / <span style={{ color: '#10b981' }}>{stats.p3Count}</span>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                                        Must / Should / Could
                                    </div>
                                </div>

                                <div style={styles.statCard}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-text)', fontWeight: '600' }}>
                                        <Award size={14} color="#f59e0b" />
                                        Subtasks Done
                                    </div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f59e0b' }}>
                                        {stats.subtasksCompleted}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                                        Checklist steps
                                    </div>
                                </div>

                                <div style={styles.statCard}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-text)', fontWeight: '600' }}>
                                        <FolderKanban size={14} color="#6366f1" />
                                        Active Projects
                                    </div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#6366f1' }}>
                                        {projects.length}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                                        Categories managed
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Milestone Badges Showcase */}
                        <div>
                            <div style={{ ...styles.sectionTitle, marginBottom: '10px' }}>
                                <Star size={16} color="#f59e0b" />
                                Milestone Badges
                            </div>
                            <div style={styles.badgesGrid}>
                                {stats.badges.map(b => (
                                    <div key={b.id} style={styles.badgeCard(b.unlocked)}>
                                        <div style={{ fontSize: '1.7rem' }}>{b.icon}</div>
                                        <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{b.title}</div>
                                        <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>{b.desc}</div>
                                        <div style={{
                                            fontSize: '0.72rem',
                                            fontWeight: '700',
                                            color: b.unlocked ? '#10b981' : 'var(--muted-text)',
                                            background: b.unlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            marginTop: 'auto'
                                        }}>
                                            {b.unlocked ? '✓ Unlocked' : b.progress}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 123todo.com Knowledge & Blog Hub */}
                        <div>
                            <div style={{ ...styles.sectionTitle, marginBottom: '10px' }}>
                                <BookOpen size={16} color="#2563eb" />
                                Time Management & Productivity Guides
                            </div>
                            <div style={styles.blogGrid}>
                                {BLOG_ARTICLES.map(art => (
                                    <a
                                        key={art.id}
                                        href={art.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.blogCard}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--accent-color)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--border-color, #e5e7eb)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: 'rgba(37,99,235,0.1)',
                                                    color: 'var(--accent-color)'
                                                }}>
                                                    {art.tag}
                                                </span>
                                                <span style={{ fontSize: '1.1rem' }}>{art.icon}</span>
                                            </div>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px', color: 'var(--text-color, #111827)' }}>
                                                {art.title}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)', lineHeight: '1.35' }}>
                                                {art.subtitle}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.78rem',
                                            fontWeight: '700',
                                            color: 'var(--accent-color)',
                                            marginTop: '10px'
                                        }}>
                                            <span>Read Article</span>
                                            <ExternalLink size={12} />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AchievementsModal;
