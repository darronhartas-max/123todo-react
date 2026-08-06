import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, ShieldCheck, Eye, EyeOff, TrendingUp, Download, Smartphone, Users, Check, RefreshCw, Clock, CheckSquare } from 'lucide-react';
import { getTelemetryData, verifyAdminPassword, updateAdminPassword, formatShortDateStr } from '../../utils/telemetry';

const COMMON_STYLES = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
    },
    modalContainer: {
        background: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-color)',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px'
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    btnReset: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};

const AdminStatsModal = ({ isOpen, onClose }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState('');
    const [timeframe, setTimeframe] = useState('7d'); // '7d', '30d', 'all'
    const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' or 'security'

    // Password change state
    const [newPass, setNewPass] = useState('');
    const [passChangeSuccess, setPassChangeSuccess] = useState(false);

    // Refresh telemetry stats
    const [telemetry, setTelemetry] = useState(() => getTelemetryData());

    const handleRefresh = () => {
        setTelemetry(getTelemetryData());
    };

    const handleLogin = (e) => {
        if (e) e.preventDefault();
        setAuthError('');
        if (verifyAdminPassword(passwordInput)) {
            setIsAuthenticated(true);
            setPasswordInput('');
        } else {
            setAuthError('Incorrect Admin Password. Default is "admin".');
        }
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (updateAdminPassword(newPass)) {
            setPassChangeSuccess(true);
            setNewPass('');
            setTimeout(() => setPassChangeSuccess(false), 3000);
        }
    };

    // Filter daily history based on timeframe
    const filteredHistory = useMemo(() => {
        const history = telemetry.dailyHistory || [];
        if (timeframe === '7d') return history.slice(-7);
        if (timeframe === '30d') return history.slice(-30);
        return history;
    }, [telemetry, timeframe]);

    // Calculate maximum graph Y values for auto-scaling SVG charts
    const maxVisits = useMemo(() => {
        return Math.max(...filteredHistory.map(d => d.visits || 0), 5);
    }, [filteredHistory]);

    if (!isOpen) return null;

    return (
        <div style={COMMON_STYLES.overlay}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={COMMON_STYLES.modalContainer}
            >
                {/* Header */}
                <div style={COMMON_STYLES.header}>
                    <div style={COMMON_STYLES.title}>
                        <ShieldCheck size={22} style={{ color: 'var(--accent-color)' }} />
                        <span>Private Admin Portal</span>
                    </div>
                    <button onClick={onClose} style={COMMON_STYLES.btnReset}>
                        <X size={22} style={{ color: 'var(--muted-text)' }} />
                    </button>
                </div>

                {!isAuthenticated ? (
                    /* Password Gate Login View */
                    <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'rgba(37, 99, 235, 0.1)',
                            color: 'var(--accent-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Lock size={32} />
                        </div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: 'var(--text-color)', fontWeight: '700' }}>
                            Admin Authentication
                        </h3>
                        <p style={{ margin: '0 0 24px', color: 'var(--muted-text)', fontSize: '0.95rem' }}>
                            Enter your private admin password to access analytics & usage graphs.
                        </p>

                        <form onSubmit={handleLogin} style={{ maxWidth: '320px', margin: '0 auto' }}>
                            <div style={{ position: 'relative', marginBottom: '16px' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    placeholder="Enter Admin Password"
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '12px 42px 12px 14px',
                                        borderRadius: '8px',
                                        border: '1.5px solid var(--border-color)',
                                        background: 'var(--bg-color)',
                                        color: 'var(--text-color)',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--muted-text)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {authError && (
                                <div style={{
                                    color: '#dc2626',
                                    fontSize: '0.88rem',
                                    fontWeight: '600',
                                    marginBottom: '16px',
                                    padding: '8px',
                                    background: 'rgba(220, 38, 38, 0.08)',
                                    borderRadius: '6px'
                                }}>
                                    {authError}
                                </div>
                            )}

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'var(--accent-color)',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                }}
                            >
                                Unlock Admin Portal
                            </button>
                            <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                                Default password: <code style={{ background: 'var(--bg-color)', padding: '2px 6px', borderRadius: '4px' }}>admin</code>
                            </p>
                        </form>
                    </div>
                ) : (
                    /* Authenticated Admin Dashboard */
                    <div style={{ padding: '20px' }}>
                        {/* Privacy Guarantee Badge */}
                        <div style={{
                            padding: '10px 14px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            borderRadius: '8px',
                            color: '#10b981',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '20px'
                        }}>
                            <ShieldCheck size={18} />
                            <span>100% Privacy-Preserving Analytics: Zero Cookies • Zero IP Addresses • 100% Owned by You</span>
                        </div>

                        {/* Top Bar Tabs & Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setActiveTab('metrics')}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: activeTab === 'metrics' ? 'var(--accent-color)' : 'var(--bg-color)',
                                        color: activeTab === 'metrics' ? '#ffffff' : 'var(--text-color)',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📊 Usage & Graphs
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: activeTab === 'security' ? 'var(--accent-color)' : 'var(--bg-color)',
                                        color: activeTab === 'security' ? '#ffffff' : 'var(--text-color)',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔑 Security & Password
                                </button>
                            </div>

                            <button
                                onClick={handleRefresh}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-color)',
                                    fontWeight: '600',
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <RefreshCw size={15} />
                                <span>Refresh Stats</span>
                            </button>
                        </div>

                        {activeTab === 'metrics' ? (
                            <>
                                {/* Metric Cards Row */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '12px',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                                            <Users size={16} style={{ color: 'var(--accent-color)' }} />
                                            <span>Total Visits</span>
                                        </div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-color)' }}>
                                            {telemetry.totalVisits || 0}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                                            <Download size={16} style={{ color: '#10b981' }} />
                                            <span>PWA Installs</span>
                                        </div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-color)' }}>
                                            {telemetry.totalInstalls || 0}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                                            <Smartphone size={16} style={{ color: '#8b5cf6' }} />
                                            <span>App Opens</span>
                                        </div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-color)' }}>
                                            {telemetry.totalStandaloneOpens || 0}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                                            <Clock size={16} style={{ color: '#f59e0b' }} />
                                            <span>Active Usage</span>
                                        </div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-color)' }}>
                                            {telemetry.totalActiveMinutes ? (telemetry.totalActiveMinutes >= 60 ? `${Math.floor(telemetry.totalActiveMinutes / 60)}h ${telemetry.totalActiveMinutes % 60}m` : `${telemetry.totalActiveMinutes}m`) : '< 1m'}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                                            <CheckSquare size={16} style={{ color: '#ec4899' }} />
                                            <span>Tasks Completed</span>
                                        </div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-color)' }}>
                                            {telemetry.totalTasksCompleted || 0}
                                        </div>
                                    </div>
                                </div>

                                {/* Graph Controls */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <TrendingUp size={18} style={{ color: 'var(--accent-color)' }} />
                                        <span>Daily Traffic Trend</span>
                                    </h4>
                                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-color)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <button
                                            onClick={() => setTimeframe('7d')}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: timeframe === '7d' ? 'var(--surface-color)' : 'transparent',
                                                color: timeframe === '7d' ? 'var(--accent-color)' : 'var(--muted-text)',
                                                fontWeight: '700',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            7 Days
                                        </button>
                                        <button
                                            onClick={() => setTimeframe('30d')}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: timeframe === '30d' ? 'var(--surface-color)' : 'transparent',
                                                color: timeframe === '30d' ? 'var(--accent-color)' : 'var(--muted-text)',
                                                fontWeight: '700',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            30 Days
                                        </button>
                                    </div>
                                </div>

                                {/* SVG Interactive Bar Chart */}
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '24px', position: 'relative' }}>
                                        {filteredHistory.map((d, i) => {
                                            const heightPct = Math.max((d.visits / maxVisits) * 100, 8);
                                            return (
                                                <div
                                                    key={d.date || i}
                                                    style={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        height: '100%',
                                                        justifyContent: 'flex-end',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--muted-text)', marginBottom: '4px' }}>
                                                        {d.visits}
                                                    </div>
                                                    <div style={{
                                                        width: '80%',
                                                        maxWidth: '36px',
                                                        height: `${heightPct}%`,
                                                        background: 'linear-gradient(180deg, var(--accent-color) 0%, rgba(37, 99, 235, 0.4) 100%)',
                                                        borderRadius: '6px 6px 2px 2px',
                                                        transition: 'all 0.3s ease'
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '-22px',
                                                        fontSize: '0.72rem',
                                                        color: 'var(--muted-text)',
                                                        fontWeight: '600',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {formatShortDateStr(d.date)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Security & Change Password Tab */
                            <div style={{ padding: '16px 0' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '1.05rem', color: 'var(--text-color)', fontWeight: '700' }}>
                                    Change Admin Portal Password
                                </h4>
                                <p style={{ margin: '0 0 20px', color: 'var(--muted-text)', fontSize: '0.9rem' }}>
                                    Update the password required to unlock this private analytics dashboard.
                                </p>

                                <form onSubmit={handlePasswordChange} style={{ maxWidth: '360px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted-text)', marginBottom: '6px' }}>
                                            New Admin Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPass}
                                            onChange={(e) => setNewPass(e.target.value)}
                                            placeholder="Enter new password (min 3 chars)"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                border: '1.5px solid var(--border-color)',
                                                background: 'var(--bg-color)',
                                                color: 'var(--text-color)',
                                                fontSize: '0.95rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    {passChangeSuccess && (
                                        <div style={{
                                            padding: '10px',
                                            borderRadius: '6px',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            color: '#10b981',
                                            fontWeight: '600',
                                            fontSize: '0.88rem',
                                            marginBottom: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <Check size={16} />
                                            <span>Admin Password updated successfully!</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={newPass.length < 3}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: '8px',
                                            background: newPass.length >= 3 ? 'var(--accent-color)' : 'var(--border-color)',
                                            color: '#ffffff',
                                            fontWeight: '700',
                                            fontSize: '0.95rem',
                                            border: 'none',
                                            cursor: newPass.length >= 3 ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        Save New Password
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminStatsModal;
