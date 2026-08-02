import React, { useState } from 'react';

const SharePromptModal = ({ onClose, onShared }) => {
    const [copied, setCopied] = useState(false);

    const rawShareText = 'Organize your day in seconds with 123 ToDo — the free, simple task manager that cuts through clutter and helps you get your life in order!';
    const rawShareUrl = 'https://www.123todo.com';
    const shareText = encodeURIComponent(rawShareText);
    const shareUrl = encodeURIComponent(rawShareUrl);

    const handleShareAction = (url) => {
        onShared();
        if (url === 'copy') {
            navigator.clipboard.writeText(rawShareUrl).then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                    onClose();
                }, 1800);
            });
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
            onClose();
        }
    };

    const handleDismiss = () => {
        onClose();
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeInOverlay 0.3s ease',
    };

    const modalStyle = {
        background: 'var(--modal-bg, #ffffff)',
        borderRadius: '20px',
        padding: '32px 28px 28px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 25px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
        animation: 'slideInModal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        textAlign: 'center',
    };

    const shareBtnStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(0,0,0,0.1)',
        background: 'rgba(0,0,0,0.04)',
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontWeight: '600',
        color: 'var(--text-primary, #1e293b)',
        transition: 'all 0.18s ease',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
    };

    const shareButtons = [
        {
            label: 'X (Twitter)',
            color: '#000000',
            url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
        {
            label: 'WhatsApp',
            color: '#25D366',
            url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.299.476-1.151 4.202 4.298-1.127.497.296z"/>
                </svg>
            ),
        },
        {
            label: 'Facebook',
            color: '#1877F2',
            url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
        },
        {
            label: 'LinkedIn',
            color: '#0A66C2',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
        },
        {
            label: 'Email',
            color: '#6B7280',
            url: `mailto:?subject=${encodeURIComponent('Stay organized with 123 ToDo')}&body=${shareText}%20${rawShareUrl}`,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                </svg>
            ),
        },
    ];

    return (
        <>
            <style>{`
                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInModal {
                    from { opacity: 0; transform: scale(0.88) translateY(24px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .share-btn-modal:hover {
                    background: rgba(0,0,0,0.08) !important;
                    border-color: rgba(0,0,0,0.2) !important;
                    transform: translateY(-1px);
                }
                .copy-link-btn:hover {
                    background: #285a82 !important;
                    color: white !important;
                }
                .dismiss-btn:hover {
                    opacity: 0.75;
                }
            `}</style>
            <div style={overlayStyle} onClick={handleDismiss}>
                <div style={modalStyle} onClick={e => e.stopPropagation()}>

                    {/* Emoji Header */}
                    <div style={{ fontSize: '2.8rem', marginBottom: '12px', lineHeight: 1 }}>🎉</div>

                    <h2 style={{
                        margin: '0 0 8px 0',
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        color: 'var(--text-primary, #0f172a)',
                        lineHeight: 1.3,
                    }}>
                        Enjoying 123 ToDo?
                    </h2>

                    <p style={{
                        margin: '0 0 6px 0',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#285a82',
                    }}>
                        Help others discover the power of simple organisation!
                    </p>

                    <p style={{
                        margin: '0 0 22px 0',
                        fontSize: '0.82rem',
                        color: 'var(--text-muted, #64748b)',
                        lineHeight: 1.6,
                    }}>
                        If 123 ToDo has helped you feel more in control of your day, share it with a friend or colleague — completely free, no strings attached.
                    </p>

                    {/* Share Buttons Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        marginBottom: '12px',
                    }}>
                        {shareButtons.map(btn => (
                            <button
                                key={btn.label}
                                className="share-btn-modal"
                                style={shareBtnStyle}
                                onClick={() => handleShareAction(btn.url)}
                                title={`Share on ${btn.label}`}
                            >
                                {btn.icon}
                                {btn.label}
                            </button>
                        ))}

                        {/* Copy Link – spans full width */}
                        <button
                            className="share-btn-modal copy-link-btn"
                            style={{
                                ...shareBtnStyle,
                                gridColumn: '1 / -1',
                                background: 'linear-gradient(135deg, #285a82 0%, #1a3a54 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '12px',
                                fontSize: '0.88rem',
                            }}
                            onClick={() => handleShareAction('copy')}
                        >
                            {copied ? (
                                <>✓ Link copied to clipboard!</>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    Copy Share Link
                                </>
                            )}
                        </button>
                    </div>

                    {/* Dismiss link */}
                    <button
                        className="dismiss-btn"
                        onClick={handleDismiss}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted, #94a3b8)',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            marginTop: '4px',
                        }}
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </>
    );
};

export default SharePromptModal;
