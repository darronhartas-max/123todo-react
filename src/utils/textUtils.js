import React from 'react';

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
                    onClick={(e) => e.stopPropagation()}
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
