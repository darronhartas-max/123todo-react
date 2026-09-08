import React from 'react';
import { Phone, Mail, ExternalLink } from 'lucide-react';
import { promptOrOpenEmail } from './emailUtils';

/**
 * Regular expressions for identifying actionable links in text
 */
const URL_REGEX = /(?:https?:\/\/[^\s<>"'{}|\\^`]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s<>"'{}|\\^`]*)/gi;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
// Matches international and domestic phone number patterns while avoiding single numbers or dates
const PHONE_REGEX = /(?:\+?\d{1,4}[-.\s]*)?(?:\(?\d{2,5}\)?[-.\s]*)?\d{3,4}[-.\s]*\d{3,5}/g;

// Recognizes ISO (YYYY-MM-DD) or common (DD/MM/YYYY, MM/DD/YYYY) dates so we don't turn dates into phone calls
const DATE_REGEX = /^(?:\d{4}[-./]\d{1,2}[-./]\d{1,2}|\d{1,2}[-./]\d{1,2}[-./]\d{2,4})$/;

/**
 * Helper to strip trailing sentence punctuation (.,;:!?) from detected entities
 */
export const cleanTrailingPunctuation = (str) => {
    let clean = str;
    let trailing = '';
    while (clean.length > 0 && /[.,;:!?)]$/.test(clean)) {
        if (clean.endsWith(')')) {
            const openCount = (clean.match(/\(/g) || []).length;
            const closeCount = (clean.match(/\)/g) || []).length;
            if (openCount >= closeCount) {
                break;
            }
        }
        trailing = clean.slice(-1) + trailing;
        clean = clean.slice(0, -1);
    }
    return { clean, trailing };
};

/**
 * Checks if a string is a valid phone number candidate
 */
export const isValidPhoneNumber = (str) => {
    if (!str) return false;
    const trimmed = str.trim();
    // Exclude if it looks like a calendar date
    if (DATE_REGEX.test(trimmed)) return false;

    // Count pure digits
    const digits = trimmed.replace(/\D/g, '');
    // Standard phone numbers worldwide are between 7 and 15 digits
    if (digits.length < 7 || digits.length > 15) return false;

    // Reject if it's purely a repeated digit sequence like 00000000
    if (/^(\d)\1+$/.test(digits)) return false;

    return true;
};

/**
 * Cleans phone number string for href="tel:..."
 */
export const sanitizePhoneHref = (raw) => {
    const trimmed = raw.trim();
    const hasPlus = trimmed.startsWith('+');
    const digits = trimmed.replace(/\D/g, '');
    return hasPlus ? `+${digits}` : digits;
};

/**
 * Formats a text block with actionable links for:
 * 1. Web URLs (https://... or www...)
 * 2. Email addresses (name@example.com)
 * 3. Phone numbers (+1 ..., 07123 ..., (555) ..., etc.)
 *
 * All generated <a> tags have e.stopPropagation() so clicking them in a task or note
 * will never trigger task selection, accordion toggle, or edit modal.
 */
export const renderActionableText = (text, options = {}) => {
    if (!text || typeof text !== 'string') return text;

    const {
        linkColor = 'var(--accent-color, #2563eb)',
        style = {}
    } = options;

    const linkStyle = {
        color: linkColor,
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        cursor: 'pointer',
        wordBreak: 'break-word',
        ...style
    };

    // Find all matches with their start/end indices and types
    const rawMatches = [];

    // 1. URLs
    let match;
    URL_REGEX.lastIndex = 0;
    while ((match = URL_REGEX.exec(text)) !== null) {
        rawMatches.push({
            start: match.index,
            rawText: match[0],
            type: 'url'
        });
    }

    // 2. Emails
    EMAIL_REGEX.lastIndex = 0;
    while ((match = EMAIL_REGEX.exec(text)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        const overlaps = rawMatches.some(m => (start >= m.start && start < m.end) || (end > m.start && end <= m.end));
        if (!overlaps) {
            rawMatches.push({
                start,
                rawText: match[0],
                type: 'email'
            });
        }
    }

    // 3. Phone numbers
    PHONE_REGEX.lastIndex = 0;
    while ((match = PHONE_REGEX.exec(text)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        const matchedText = match[0];

        const overlaps = rawMatches.some(m => (start >= m.start && start < m.end) || (end > m.start && end <= m.end));
        if (!overlaps) {
            const { clean } = cleanTrailingPunctuation(matchedText);
            if (isValidPhoneNumber(clean)) {
                rawMatches.push({
                    start,
                    rawText: matchedText,
                    type: 'phone'
                });
            }
        }
    }

    if (rawMatches.length === 0) return text;

    // Clean trailing punctuation and sort by start position
    const matches = rawMatches.map(m => {
        const { clean } = cleanTrailingPunctuation(m.rawText);
        return {
            start: m.start,
            end: m.start + clean.length,
            text: clean,
            type: m.type
        };
    }).sort((a, b) => a.start - b.start);

    // Build the React elements array
    const elements = [];
    let lastIndex = 0;

    matches.forEach((m, idx) => {
        // Text before the match
        if (m.start > lastIndex) {
            elements.push(text.slice(lastIndex, m.start));
        }

        // Render actionable link
        if (m.type === 'url') {
            const href = m.text.startsWith('http://') || m.text.startsWith('https://') 
                ? m.text 
                : `https://${m.text}`;
            elements.push(
                <a
                    key={`link-${idx}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={linkStyle}
                    title={`Open ${m.text}`}
                >
                    {m.text}
                </a>
            );
        } else if (m.type === 'email') {
            elements.push(
                <a
                    key={`email-${idx}`}
                    href={`mailto:${m.text}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        promptOrOpenEmail(m.text);
                    }}
                    style={linkStyle}
                    title={`Email ${m.text}`}
                >
                    {m.text}
                </a>
            );
        } else if (m.type === 'phone') {
            const phoneHref = sanitizePhoneHref(m.text);
            elements.push(
                <a
                    key={`phone-${idx}`}
                    href={`tel:${phoneHref}`}
                    onClick={(e) => e.stopPropagation()}
                    style={linkStyle}
                    title={`Call ${m.text}`}
                >
                    {m.text}
                </a>
            );
        }

        lastIndex = m.end;
    });

    // Remaining text after last match
    if (lastIndex < text.length) {
        elements.push(text.slice(lastIndex));
    }

    return elements;
};

/**
 * Extracts all actionable entities (phone numbers, email addresses, and URLs)
 * from a given text string. Returns an array of objects with metadata for direct action.
 */
export const extractActionableEntities = (text) => {
    if (!text || typeof text !== 'string') return [];

    const rawMatches = [];

    // 1. URLs
    let match;
    URL_REGEX.lastIndex = 0;
    while ((match = URL_REGEX.exec(text)) !== null) {
        rawMatches.push({
            start: match.index,
            rawText: match[0],
            type: 'url'
        });
    }

    // 2. Emails
    EMAIL_REGEX.lastIndex = 0;
    while ((match = EMAIL_REGEX.exec(text)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        const overlaps = rawMatches.some(m => (start >= m.start && start < m.end) || (end > m.start && end <= m.end));
        if (!overlaps) {
            rawMatches.push({
                start,
                rawText: match[0],
                type: 'email'
            });
        }
    }

    // 3. Phone numbers
    PHONE_REGEX.lastIndex = 0;
    while ((match = PHONE_REGEX.exec(text)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        const matchedText = match[0];

        const overlaps = rawMatches.some(m => (start >= m.start && start < m.end) || (end > m.start && end <= m.end));
        if (!overlaps) {
            const { clean } = cleanTrailingPunctuation(matchedText);
            if (isValidPhoneNumber(clean)) {
                rawMatches.push({
                    start,
                    rawText: matchedText,
                    type: 'phone'
                });
            }
        }
    }

    if (rawMatches.length === 0) return [];

    const sorted = rawMatches.map(m => {
        const { clean } = cleanTrailingPunctuation(m.rawText);
        let href = '';
        let label = clean;
        let actionVerb = 'Open';

        if (m.type === 'url') {
            href = clean.startsWith('http://') || clean.startsWith('https://') ? clean : `https://${clean}`;
            label = clean.replace(/^https?:\/\//, '');
            actionVerb = 'Open';
        } else if (m.type === 'email') {
            href = `mailto:${clean}`;
            label = clean;
            actionVerb = 'Email';
        } else if (m.type === 'phone') {
            href = `tel:${sanitizePhoneHref(clean)}`;
            label = clean;
            actionVerb = 'Call';
        }

        return {
            type: m.type,
            text: clean,
            href,
            label,
            actionVerb,
            start: m.start,
            end: m.start + clean.length
        };
    }).sort((a, b) => a.start - b.start);

    // Deduplicate identical hrefs so redundant chips are not shown
    const seen = new Set();
    return sorted.filter(item => {
        if (seen.has(item.href)) return false;
        seen.add(item.href);
        return true;
    });
};

/**
 * ActionableEntitiesBar
 * Renders an interactive quick-action strip of detected phone, email, and web links
 * right beneath text inputs or textareas in edit mode.
 */
export const ActionableEntitiesBar = ({ text, style = {}, compact = false, label = 'Actionable:' }) => {
    const entities = extractActionableEntities(text);
    if (!entities || entities.length === 0) return null;

    return (
        <div
            className="actionable-entities-bar"
            style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: compact ? '4px' : '6px',
                marginTop: compact ? '2px' : '6px',
                marginBottom: compact ? '4px' : '8px',
                padding: compact ? '3px 6px' : '5px 10px',
                borderRadius: '8px',
                background: 'var(--item-bg, rgba(37, 99, 235, 0.05))',
                border: '1px solid var(--border-color, rgba(37, 99, 235, 0.18))',
                boxSizing: 'border-box',
                fontSize: compact ? '11px' : '12px',
                lineHeight: '1.4',
                ...style
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <span style={{
                fontWeight: '700',
                color: 'var(--text-secondary, #6b7280)',
                marginRight: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
            }}>
                {label}
            </span>
            {entities.map((item, idx) => {
                let badgeBg = 'rgba(14, 165, 233, 0.12)';
                let badgeColor = '#0284c7';
                let borderColor = 'rgba(14, 165, 233, 0.3)';
                let IconComponent = ExternalLink;

                if (item.type === 'phone') {
                    badgeBg = 'rgba(16, 185, 129, 0.14)';
                    badgeColor = '#059669';
                    borderColor = 'rgba(16, 185, 129, 0.35)';
                    IconComponent = Phone;
                } else if (item.type === 'email') {
                    badgeBg = 'rgba(59, 130, 246, 0.14)';
                    badgeColor = '#2563eb';
                    borderColor = 'rgba(59, 130, 246, 0.35)';
                    IconComponent = Mail;
                }

                return (
                    <a
                        key={`actionable-chip-${idx}-${item.href}`}
                        href={item.href}
                        target={item.type === 'url' ? '_blank' : undefined}
                        rel={item.type === 'url' ? 'noopener noreferrer' : undefined}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (item.type === 'email') {
                                e.preventDefault();
                                promptOrOpenEmail(item.text);
                            }
                        }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: compact ? '2px 7px' : '3px 9px',
                            borderRadius: '12px',
                            fontSize: compact ? '11px' : '12px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            border: `1px solid ${borderColor}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                        title={`${item.actionVerb} ${item.label}`}
                    >
                        <IconComponent size={compact ? 11 : 12} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.actionVerb} {item.label}
                        </span>
                    </a>
                );
            })}
        </div>
    );
};

