import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Globe, Laptop, Copy, Check, X } from 'lucide-react';
import { EMAIL_CLIENTS, EMAIL_CLIENT_OPTIONS, setEmailClientPreference, openEmailClient } from '../../utils/emailUtils';

const EmailClientModal = ({ isOpen, onClose, targetEmail, options = {}, onPreferenceChanged }) => {
    const [selectedProvider, setSelectedProvider] = useState(EMAIL_CLIENTS.DEFAULT);
    const [rememberChoice, setRememberChoice] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Default selection: if user previously chose a provider, use it; otherwise Default Mail App
            setSelectedProvider(EMAIL_CLIENTS.DEFAULT);
            setRememberChoice(true);
            setCopied(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleCopy = (e) => {
        e.stopPropagation();
        if (!targetEmail) return;
        navigator.clipboard.writeText(targetEmail).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy email:', err);
        });
    };

    const handleConfirm = () => {
        if (rememberChoice) {
            setEmailClientPreference(selectedProvider);
            if (onPreferenceChanged) {
                onPreferenceChanged(selectedProvider);
            }
        }
        openEmailClient(targetEmail, options, selectedProvider);
        onClose();
    };

    const selectableProviders = EMAIL_CLIENT_OPTIONS.filter(opt => opt.id !== EMAIL_CLIENTS.ALWAYS_ASK);

    const getProviderIcon = (id) => {
        switch (id) {
            case EMAIL_CLIENTS.DEFAULT:
                return <Laptop size={20} color="#2563eb" />;
            case EMAIL_CLIENTS.GMAIL:
                return <Globe size={20} color="#ea4335" />;
            case EMAIL_CLIENTS.OUTLOOK:
                return <Globe size={20} color="#0078d4" />;
            case EMAIL_CLIENTS.YAHOO:
                return <Globe size={20} color="#6001d2" />;
            default:
                return <Mail size={20} color="#2563eb" />;
        }
    };

    return (
        <AnimatePresence>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10001,
                    padding: '16px'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 15 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    style={{
                        backgroundColor: 'var(--card-bg, #ffffff)',
                        borderRadius: '20px',
                        maxWidth: '460px',
                        width: '100%',
                        padding: '24px 22px',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
                        color: 'var(--text-color, #1f2937)',
                        position: 'relative',
                        border: '1px solid var(--border-color, rgba(0,0,0,0.1))',
                        boxSizing: 'border-box'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-secondary, #6b7280)',
                            padding: '6px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(37, 99, 235, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563eb'
                        }}>
                            <Mail size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
                                Choose Email Service
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6b7280)' }}>
                                Select which system to use for sending emails
                            </span>
                        </div>
                    </div>

                    {/* Target Email Display with Copy */}
                    {targetEmail && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--item-bg, #f3f4f6)',
                            border: '1px solid var(--border-color, #e5e7eb)',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            marginTop: '12px',
                            marginBottom: '16px'
                        }}>
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: 'var(--text-color, #111827)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginRight: '8px'
                            }}>
                                {targetEmail}
                            </span>
                            <button
                                type="button"
                                onClick={handleCopy}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(37, 99, 235, 0.1)',
                                    color: copied ? '#059669' : '#2563eb',
                                    border: `1px solid ${copied ? '#10b981' : 'rgba(37, 99, 235, 0.25)'}`,
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    transition: 'all 0.15s ease'
                                }}
                                title="Copy email address"
                            >
                                {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    )}

                    {/* Options List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {selectableProviders.map((provider) => {
                            const isSelected = selectedProvider === provider.id;
                            return (
                                <div
                                    key={provider.id}
                                    onClick={() => setSelectedProvider(provider.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        border: `1.5px solid ${isSelected ? 'var(--accent-color, #2563eb)' : 'var(--border-color, #e5e7eb)'}`,
                                        backgroundColor: isSelected ? 'var(--accent-bg, rgba(37, 99, 235, 0.08))' : 'var(--card-bg, #ffffff)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {getProviderIcon(provider.id)}
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '0.95rem',
                                                fontWeight: isSelected ? '700' : '600',
                                                color: isSelected ? 'var(--accent-color, #2563eb)' : 'var(--text-color, #111827)'
                                            }}>
                                                {provider.name}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #6b7280)' }}>
                                                {provider.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        border: `2px solid ${isSelected ? 'var(--accent-color, #2563eb)' : 'var(--border-color, #d1d5db)'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isSelected ? 'var(--accent-color, #2563eb)' : 'transparent',
                                        flexShrink: 0
                                    }}>
                                        {isSelected && (
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Remember Choice Checkbox */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '6px 4px',
                        marginBottom: '18px'
                    }}>
                        <input
                            type="checkbox"
                            checked={rememberChoice}
                            onChange={(e) => setRememberChoice(e.target.checked)}
                            style={{
                                marginTop: '3px',
                                width: '17px',
                                height: '17px',
                                accentColor: 'var(--accent-color, #2563eb)',
                                cursor: 'pointer'
                            }}
                        />
                        <div>
                            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-color, #1f2937)' }}>
                                Remember my choice
                            </span>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #6b7280)' }}>
                                You can change this anytime in Settings &gt; Appearance &amp; Styling.
                            </div>
                        </div>
                    </label>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #d1d5db)',
                                background: 'var(--item-bg, #f3f4f6)',
                                color: 'var(--text-color, #374151)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            style={{
                                flex: 1.5,
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'var(--accent-color, #2563eb)',
                                color: '#ffffff',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                            }}
                        >
                            <span>Open Email</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EmailClientModal;
