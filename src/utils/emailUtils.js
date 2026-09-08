import { STORAGE_KEYS } from './constants';

export const EMAIL_CLIENTS = {
    DEFAULT: 'default',
    GMAIL: 'gmail',
    OUTLOOK: 'outlook',
    YAHOO: 'yahoo',
    ALWAYS_ASK: 'always_ask'
};

export const EMAIL_CLIENT_OPTIONS = [
    {
        id: EMAIL_CLIENTS.DEFAULT,
        name: 'Default Mail App',
        description: 'Apple Mail, Outlook Desktop, Thunderbird, or system default',
        badge: 'System'
    },
    {
        id: EMAIL_CLIENTS.GMAIL,
        name: 'Gmail',
        description: 'Open in Gmail (browser)',
        badge: 'Web'
    },
    {
        id: EMAIL_CLIENTS.OUTLOOK,
        name: 'Outlook / 365',
        description: 'Open in Outlook.com / Microsoft 365 (browser)',
        badge: 'Web'
    },
    {
        id: EMAIL_CLIENTS.YAHOO,
        name: 'Yahoo Mail',
        description: 'Open in Yahoo Mail (browser)',
        badge: 'Web'
    },
    {
        id: EMAIL_CLIENTS.ALWAYS_ASK,
        name: 'Always Ask',
        description: 'Ask every time an email link is clicked',
        badge: 'Prompt'
    }
];

/**
 * Gets the stored email client preference from localStorage.
 * Returns null if not configured yet.
 */
export const getEmailClientPreference = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.EMAIL_CLIENT_PREFERENCE);
    } catch {
        return null;
    }
};

/**
 * Persists the email client preference to localStorage.
 */
export const setEmailClientPreference = (preference) => {
    try {
        if (!preference) {
            localStorage.removeItem(STORAGE_KEYS.EMAIL_CLIENT_PREFERENCE);
        } else {
            localStorage.setItem(STORAGE_KEYS.EMAIL_CLIENT_PREFERENCE, preference);
        }
    } catch (e) {
        console.error('Failed to save email client preference:', e);
    }
};

/**
 * Generates the appropriate compose URL for the given provider and email.
 */
export const getEmailComposeUrl = (provider, email = '', options = {}) => {
    const { subject = '', body = '' } = options;
    const cleanEmail = email.trim();

    switch (provider) {
        case EMAIL_CLIENTS.GMAIL: {
            const base = 'https://mail.google.com/mail/?view=cm&fs=1';
            const params = new URLSearchParams();
            if (cleanEmail) params.append('to', cleanEmail);
            if (subject) params.append('su', subject);
            if (body) params.append('body', body);
            return `${base}&${params.toString()}`;
        }
        case EMAIL_CLIENTS.OUTLOOK: {
            const base = 'https://outlook.live.com/mail/0/deeplink/compose';
            const params = new URLSearchParams();
            if (cleanEmail) params.append('to', cleanEmail);
            if (subject) params.append('subject', subject);
            if (body) params.append('body', body);
            return `${base}?${params.toString()}`;
        }
        case EMAIL_CLIENTS.YAHOO: {
            const base = 'https://compose.mail.yahoo.com/';
            const params = new URLSearchParams();
            if (cleanEmail) params.append('to', cleanEmail);
            if (subject) params.append('subject', subject);
            if (body) params.append('body', body);
            return `${base}?${params.toString()}`;
        }
        case EMAIL_CLIENTS.DEFAULT:
        default: {
            let mailto = `mailto:${cleanEmail}`;
            const query = [];
            if (subject) query.push(`subject=${encodeURIComponent(subject)}`);
            if (body) query.push(`body=${encodeURIComponent(body)}`);
            if (query.length > 0) {
                mailto += `?${query.join('&')}`;
            }
            return mailto;
        }
    }
};

/**
 * Opens the compose view in the specified email client.
 * For default system mailto, uses a detached anchor to avoid navigation issues on macOS PWAs.
 */
export const openEmailClient = (email = '', options = {}, provider = null) => {
    const effectiveProvider = provider || getEmailClientPreference() || EMAIL_CLIENTS.DEFAULT;
    const url = getEmailComposeUrl(effectiveProvider, email, options);

    if (effectiveProvider === EMAIL_CLIENTS.DEFAULT) {
        try {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                if (a.parentNode) {
                    a.parentNode.removeChild(a);
                }
            }, 150);
            return true;
        } catch {
            window.location.href = url;
            return true;
        }
    } else {
        window.open(url, '_blank', 'noopener,noreferrer');
        return true;
    }
};

/**
 * Handles clicking an email link:
 * If a preference is already saved (and is not 'always_ask'), immediately opens it.
 * Otherwise, triggers a global window event to show the EmailClientModal.
 */
export const promptOrOpenEmail = (email = '', options = {}) => {
    if (!email) return false;

    const pref = getEmailClientPreference();
    if (pref && pref !== EMAIL_CLIENTS.ALWAYS_ASK) {
        return openEmailClient(email, options, pref);
    }

    // Trigger modal prompt
    if (typeof window !== 'undefined') {
        const event = new CustomEvent('123todo:open-email-modal', {
            detail: { email, options }
        });
        window.dispatchEvent(event);
    }
    return false;
};
