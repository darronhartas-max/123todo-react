import React, { useState } from 'react';

const SharePromptModal = ({ onClose, onShared }) => {
    const [copied, setCopied] = useState(false);

    const rawShareText = 'Been using 123 ToDo to stay on top of things — it\'s free, no account needed, and it genuinely helps. Thought you might find it useful! 👉 www.123todo.com';
    const rawShareUrl = 'https://www.123todo.com';
    const rawShareImage = 'https://www.123todo.com/social-share.png';
    const shareText = encodeURIComponent(rawShareText);
    const shareUrl = encodeURIComponent(rawShareUrl);
    const shareImage = encodeURIComponent(rawShareImage);

    const handleShareAction = async (url) => {
        onShared();
        if (url === 'graphic') {
            try {
                const response = await fetch('/social-share.png');
                const blob = await response.blob();
                const file = new File([blob], '123todo-share.png', { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: '123 ToDo - Free Task Manager',
                        text: `${rawShareText} ${rawShareUrl}`,
                        files: [file]
                    });
                    onClose();
                    return;
                }
            } catch (e) {
                console.warn('Native image share failed, opening image:', e);
            }
            window.open('/social-share.png', '_blank');
            onClose();
        } else if (url === 'copy') {
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
        padding: '26px 22px 22px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 25px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
        animation: 'slideInModal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        textAlign: 'center',
        maxHeight: '92vh',
        overflowY: 'auto'
    };

    const shareBtnStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '9px 10px',
        borderRadius: '10px',
        border: '1px solid rgba(0,0,0,0.1)',
        background: 'rgba(0,0,0,0.04)',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '600',
        color: 'var(--text-primary, #1e293b)',
        transition: 'all 0.18s ease',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
    };

    const shareButtons = [
        {
            label: 'Share Graphic',
            color: '#285a82',
            url: 'graphic',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#285a82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            ),
        },
        {
            label: 'X (Twitter)',
            color: '#000000',
            url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
        {
            label: 'WhatsApp',
            color: '#25D366',
            url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.299.476-1.151 4.202 4.298-1.127.497.296z"/>
                </svg>
            ),
        },
        {
            label: 'Facebook',
            color: '#1877F2',
            url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
        },
        {
            label: 'LinkedIn',
            color: '#0A66C2',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
        },
        {
            label: 'Reddit',
            color: '#FF4500',
            url: `https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}`,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF4500">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-1.037 3.111a.75.75 0 0 0 .949.949l3.111-1.037A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.67 14.34a2.29 2.29 0 0 1-1.57.62c-.41 0-.79-.11-1.13-.31-.92.6-2.13.97-3.47 1.01l.73-3.44 2.4.51a1.64 1.64 0 1 0 1.64-1.64c-.16 0-.32.03-.46.08l-2.74-.58a.4.4 0 0 0-.47.31l-.85 3.99c-1.38-.03-2.62-.4-3.56-1.01a2.27 2.27 0 0 1-1.13.31c-.62 0-1.19-.24-1.6-.64-.42-.42-.65-.98-.65-1.58 0-.84.47-1.57 1.15-1.95a2.24 2.24 0 0 1-.05-.48c0-2.45 2.87-4.44 6.4-4.44s6.4 1.99 6.4 4.44c0 .16-.02.32-.05.48.69.38 1.16 1.11 1.16 1.95 0 .6-.23 1.16-.65 1.58zM9.25 13c.69 0 1.25-.56 1.25-1.25S9.94 10.5 9.25 10.5 8 11.06 8 11.75 8.56 13 9.25 13zm5.5 0c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25zm-5.46 3.1c.14.15.35.23.56.23h4.3c.21 0 .42-.08.56-.23a.75.75 0 0 0-1.06-1.06c-.19.19-.66.39-1.65.39s-1.46-.2-1.65-.39a.75.75 0 0 0-1.06 1.06z"/>
                </svg>
            ),
        },
        {
            label: 'Telegram',
            color: '#24A1DE',
            url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#24A1DE">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
            ),
        },
        {
            label: 'Threads',
            color: '#000000',
            url: `https://www.threads.net/intent/post?text=${shareText}%20${shareUrl}`,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.186 24c-2.736 0-5.18-.894-7.068-2.586C3.12 19.605 2 16.892 2 13.882c0-3.088 1.134-5.835 3.193-7.734C7.147 4.34 9.68 3.38 12.33 3.38c2.812 0 5.344 1.052 7.323 3.042 1.802 1.813 2.825 4.316 2.88 7.047.012.632-.488 1.157-1.12 1.17-.63.01-1.157-.488-1.17-1.12-.045-2.227-.872-4.267-2.332-5.733-1.572-1.58-3.582-2.416-5.801-2.416-2.096 0-4.095.75-5.63 2.113C4.843 8.878 3.94 11.23 3.94 13.882c0 2.479.914 4.704 2.573 6.265 1.5 1.411 3.483 2.127 5.673 2.127 2.65 0 4.88-.984 6.452-2.846.168-.2.418-.314.68-.314.49 0 .894.404.894.894 0 .205-.072.398-.198.547-1.892 2.24-4.595 3.445-7.828 3.445zM12.016 7.64c-3.13 0-5.688 2.558-5.688 5.688 0 3.13 2.558 5.688 5.688 5.688 2.057 0 3.953-1.118 4.947-2.915.228-.413.744-.563 1.157-.335.413.228.563.744.335 1.157-1.282 2.316-3.725 3.76-6.439 3.76-3.887 0-7.056-3.169-7.056-7.056 0-3.887 3.169-7.056 7.056-7.056 3.14 0 5.86 2.074 6.786 5.08.134.437-.107.899-.544 1.033-.437.134-.899-.107-1.033-.544-.72-2.336-2.836-3.95-5.275-3.95z"/>
                </svg>
            ),
        },
        {
            label: 'Bluesky',
            color: '#1185FE',
            url: `https://bsky.app/intent/compose?text=${shareText}%20${shareUrl}`,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1185FE">
                    <path d="M12 10.8c-1.087-2.114-4.046-6.012-7.144-7.854C1.905 1.173 0 2.13 0 4.607c0 2.477.562 8.784 1.488 10.155 1.439 2.13 4.244 2.453 6.32 1.341-2.453 1.954-2.88 4.254-1.074 5.393 2.658 1.678 4.616-.628 5.266-2.196.65 1.568 2.608 3.874 5.266 2.196 1.806-1.139 1.379-3.439-1.074-5.393 2.076 1.112 4.881.789 6.32-1.341C23.438 13.391 24 7.084 24 4.607c0-2.477-1.905-3.434-4.856-1.661C16.046 4.788 13.087 8.686 12 10.8z"/>
                </svg>
            ),
        },
        {
            label: 'Pinterest',
            color: '#E60023',
            url: `https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${shareImage}&description=${shareText}`,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#E60023">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
            ),
        },
        {
            label: 'Email',
            color: '#6B7280',
            url: `mailto:?subject=${encodeURIComponent('Thought you might find this useful')}&body=${shareText}%20${rawShareUrl}`,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <div style={{ fontSize: '2.3rem', marginBottom: '8px', lineHeight: 1 }}>🎉</div>

                    <h2 style={{
                        margin: '0 0 6px 0',
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        color: 'var(--text-primary, #0f172a)',
                        lineHeight: 1.3,
                    }}>
                        Glad it's been useful! 😊
                    </h2>

                    <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        color: '#285a82',
                    }}>
                        Know someone who could do with a bit more headspace?
                    </p>

                    {/* Shared Graphic Preview Thumbnail */}
                    <div style={{
                        margin: '10px 0 12px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        <img
                            src="/social-share.png"
                            alt="123 ToDo Share Graphic"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                maxHeight: '140px',
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    <p style={{
                        margin: '0 0 14px 0',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted, #64748b)',
                        lineHeight: 1.4,
                    }}>
                        Share this preview card with friends or colleagues. Completely free — no catch, no signup.
                    </p>

                    {/* Share Buttons Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                        gap: '8px',
                        marginBottom: '14px',
                    }}>
                        {shareButtons.map(btn => (
                            <button
                                key={btn.label}
                                className="share-btn-modal"
                                style={shareBtnStyle}
                                onClick={() => handleShareAction(btn.url)}
                                title={`Share ${btn.label === 'Share Graphic' ? 'Graphic Image' : 'on ' + btn.label}`}
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
                                padding: '11px',
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
                            marginTop: '2px',
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
