import React, { useState } from 'react';

const SocialShare = () => {
    const isMobile = window.innerWidth < 768;
    const [copied, setCopied] = useState(false);

    const styles = {
        adPanel: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(135deg, #285a82 0%, #1a3a54 100%)',
            color: 'white',
            padding: '12px 20px',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.15)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '8px' : '16px',
            minHeight: isMobile ? '90px' : '55px'
        },
        shareBtn: {
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'white',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.85rem'
        }
    };

    const rawShareText = 'Organize your day in seconds with 123 ToDo — the free, simple task manager that cuts through clutter and helps you get your life in order!';
    const rawShareUrl = 'https://www.123todo.com';
    const shareText = encodeURIComponent(rawShareText);
    const shareUrl = encodeURIComponent(rawShareUrl);

    const handleShareClick = () => {
        try {
            localStorage.setItem('share_modal_has_shared', 'true');
        } catch (e) {}
    };

    const handleCopyLink = () => {
        handleShareClick();
        navigator.clipboard.writeText(rawShareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    return (
        <div style={styles.adPanel}>
            <span style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', marginRight: isMobile ? '0' : '12px' }}>
                🤝 Help others get organized — please SHARE!
            </span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* X (Twitter) Share */}
                <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleShareClick}
                    style={styles.shareBtn}
                    title="Share on X (Twitter)"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </a>

                {/* WhatsApp Share */}
                <a
                    href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleShareClick}
                    style={styles.shareBtn}
                    title="Share on WhatsApp"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.299.476-1.151 4.202 4.298-1.127.497.296z"/>
                    </svg>
                </a>

                {/* Facebook Share */}
                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleShareClick}
                    style={styles.shareBtn}
                    title="Share on Facebook"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                </a>

                {/* LinkedIn Share */}
                <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleShareClick}
                    style={styles.shareBtn}
                    title="Share on LinkedIn"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                </a>

                {/* Email Share */}
                <a
                    href={`mailto:?subject=${encodeURIComponent('Organize your day with 123 ToDo')}&body=${shareText}%20${shareUrl}`}
                    onClick={handleShareClick}
                    style={styles.shareBtn}
                    title="Share via Email"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                </a>

                {/* Copy Link Button */}
                <button
                    onClick={handleCopyLink}
                    style={styles.shareBtn}
                    title="Copy Share Link"
                >
                    {copied ? '✓ Copied!' : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SocialShare;
