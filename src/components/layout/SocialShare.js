import React, { useState } from 'react';

const SocialShare = () => {
    const isMobile = window.innerWidth < 768;
    const [copied, setCopied] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const styles = {
        adPanel: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(135deg, #285a82 0%, #1a3a54 100%)',
            color: 'white',
            padding: isMobile ? '8px 12px' : '10px 20px',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.15)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '6px' : '14px',
            minHeight: isMobile ? '70px' : '50px'
        },
        shareBtn: {
            background: 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            padding: '6px 9px',
            color: 'white',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.85rem',
            lineHeight: 1
        },
        moreBtn: {
            background: 'rgba(255, 255, 255, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '700',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
        }
    };

    const rawShareText = 'Been using 123 ToDo to keep on top of things — it\'s free, no sign-up, and actually works. Worth a look 👇';
    const rawShareUrl = 'https://www.123todo.com';
    const rawShareImage = 'https://www.123todo.com/social-share.png';
    const shareText = encodeURIComponent(rawShareText);
    const shareUrl = encodeURIComponent(rawShareUrl);
    const shareImage = encodeURIComponent(rawShareImage);

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

    const handleShareGraphic = async () => {
        handleShareClick();
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
                return;
            }
        } catch (e) {
            console.warn('Native image share not available, falling back to open image:', e);
        }
        window.open('/social-share.png', '_blank');
    };

    // Main 5 buttons
    const mainPlatforms = [
        {
            name: 'Share Graphic',
            title: 'Share Official 123 ToDo Graphic Image',
            onClick: handleShareGraphic,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            )
        },
        {
            name: 'X (Twitter)',
            title: 'Share on X (Twitter)',
            url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            )
        },
        {
            name: 'WhatsApp',
            title: 'Share on WhatsApp',
            url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.299.476-1.151 4.202 4.298-1.127.497.296z"/>
                </svg>
            )
        },
        {
            name: 'Facebook',
            title: 'Share on Facebook',
            url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            )
        },
        {
            name: 'LinkedIn',
            title: 'Share on LinkedIn',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            )
        }
    ];

    // Extra platforms toggled by "More..."
    const extraPlatforms = [
        {
            name: 'Reddit',
            title: 'Share on Reddit',
            url: `https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-1.037 3.111a.75.75 0 0 0 .949.949l3.111-1.037A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.67 14.34a2.29 2.29 0 0 1-1.57.62c-.41 0-.79-.11-1.13-.31-.92.6-2.13.97-3.47 1.01l.73-3.44 2.4.51a1.64 1.64 0 1 0 1.64-1.64c-.16 0-.32.03-.46.08l-2.74-.58a.4.4 0 0 0-.47.31l-.85 3.99c-1.38-.03-2.62-.4-3.56-1.01a2.27 2.27 0 0 1-1.13.31c-.62 0-1.19-.24-1.6-.64-.42-.42-.65-.98-.65-1.58 0-.84.47-1.57 1.15-1.95a2.24 2.24 0 0 1-.05-.48c0-2.45 2.87-4.44 6.4-4.44s6.4 1.99 6.4 4.44c0 .16-.02.32-.05.48.69.38 1.16 1.11 1.16 1.95 0 .6-.23 1.16-.65 1.58zM9.25 13c.69 0 1.25-.56 1.25-1.25S9.94 10.5 9.25 10.5 8 11.06 8 11.75 8.56 13 9.25 13zm5.5 0c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25zm-5.46 3.1c.14.15.35.23.56.23h4.3c.21 0 .42-.08.56-.23a.75.75 0 0 0-1.06-1.06c-.19.19-.66.39-1.65.39s-1.46-.2-1.65-.39a.75.75 0 0 0-1.06 1.06z"/>
                </svg>
            )
        },
        {
            name: 'Telegram',
            title: 'Share on Telegram',
            url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
            )
        },
        {
            name: 'Threads',
            title: 'Share on Threads',
            url: `https://www.threads.net/intent/post?text=${shareText}%20${shareUrl}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.186 24c-2.736 0-5.18-.894-7.068-2.586C3.12 19.605 2 16.892 2 13.882c0-3.088 1.134-5.835 3.193-7.734C7.147 4.34 9.68 3.38 12.33 3.38c2.812 0 5.344 1.052 7.323 3.042 1.802 1.813 2.825 4.316 2.88 7.047.012.632-.488 1.157-1.12 1.17-.63.01-1.157-.488-1.17-1.12-.045-2.227-.872-4.267-2.332-5.733-1.572-1.58-3.582-2.416-5.801-2.416-2.096 0-4.095.75-5.63 2.113C4.843 8.878 3.94 11.23 3.94 13.882c0 2.479.914 4.704 2.573 6.265 1.5 1.411 3.483 2.127 5.673 2.127 2.65 0 4.88-.984 6.452-2.846.168-.2.418-.314.68-.314.49 0 .894.404.894.894 0 .205-.072.398-.198.547-1.892 2.24-4.595 3.445-7.828 3.445zM12.016 7.64c-3.13 0-5.688 2.558-5.688 5.688 0 3.13 2.558 5.688 5.688 5.688 2.057 0 3.953-1.118 4.947-2.915.228-.413.744-.563 1.157-.335.413.228.563.744.335 1.157-1.282 2.316-3.725 3.76-6.439 3.76-3.887 0-7.056-3.169-7.056-7.056 0-3.887 3.169-7.056 7.056-7.056 3.14 0 5.86 2.074 6.786 5.08.134.437-.107.899-.544 1.033-.437.134-.899-.107-1.033-.544-.72-2.336-2.836-3.95-5.275-3.95z"/>
                </svg>
            )
        },
        {
            name: 'Bluesky',
            title: 'Share on Bluesky',
            url: `https://bsky.app/intent/compose?text=${shareText}%20${shareUrl}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 10.8c-1.087-2.114-4.046-6.012-7.144-7.854C1.905 1.173 0 2.13 0 4.607c0 2.477.562 8.784 1.488 10.155 1.439 2.13 4.244 2.453 6.32 1.341-2.453 1.954-2.88 4.254-1.074 5.393 2.658 1.678 4.616-.628 5.266-2.196.65 1.568 2.608 3.874 5.266 2.196 1.806-1.139 1.379-3.439-1.074-5.393 2.076 1.112 4.881.789 6.32-1.341C23.438 13.391 24 7.084 24 4.607c0-2.477-1.905-3.434-4.856-1.661C16.046 4.788 13.087 8.686 12 10.8z"/>
                </svg>
            )
        },
        {
            name: 'Pinterest',
            title: 'Share on Pinterest',
            url: `https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${shareImage}&description=${shareText}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
            )
        },
        {
            name: 'Email',
            title: 'Share via Email',
            url: `mailto:?subject=${encodeURIComponent('Thought you might find this useful')}&body=${shareText}%20${shareUrl}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                </svg>
            )
        }
    ];

    return (
        <div style={styles.adPanel}>
            <style>{`
                .footer-share-btn:hover {
                    background: rgba(255, 255, 255, 0.35) !important;
                    transform: translateY(-1px);
                }
            `}</style>
            <span style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', marginRight: isMobile ? '0' : '8px' }}>
                Found this useful? Pass it on — it's free! 😊
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Main 5 Platforms */}
                {mainPlatforms.map(p => p.onClick ? (
                    <button
                        key={p.name}
                        onClick={p.onClick}
                        className="footer-share-btn"
                        style={styles.shareBtn}
                        title={p.title}
                    >
                        {p.icon}
                    </button>
                ) : (
                    <a
                        key={p.name}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleShareClick}
                        className="footer-share-btn"
                        style={styles.shareBtn}
                        title={p.title}
                    >
                        {p.icon}
                    </a>
                ))}

                {/* Extra Platforms shown if More... is clicked */}
                {showMore && extraPlatforms.map(p => (
                    <a
                        key={p.name}
                        href={p.url}
                        target={p.name === 'Email' ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        onClick={handleShareClick}
                        className="footer-share-btn"
                        style={styles.shareBtn}
                        title={p.title}
                    >
                        {p.icon}
                    </a>
                ))}

                {/* Copy Link Button (always shown when expanded or standard) */}
                {showMore && (
                    <button
                        onClick={handleCopyLink}
                        className="footer-share-btn"
                        style={styles.shareBtn}
                        title="Copy Share Link"
                    >
                        {copied ? '✓ Copied!' : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        )}
                    </button>
                )}

                {/* More... Toggle Button */}
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="footer-share-btn"
                    style={styles.moreBtn}
                    title={showMore ? "Show fewer platforms" : "Show more sharing platforms"}
                >
                    {showMore ? 'Less ▲' : 'More... ▼'}
                </button>
            </div>
        </div>
    );
};

export default SocialShare;
