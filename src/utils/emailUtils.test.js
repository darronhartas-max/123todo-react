import {
    EMAIL_CLIENTS,
    EMAIL_CLIENT_OPTIONS,
    getEmailClientPreference,
    setEmailClientPreference,
    getEmailComposeUrl,
    openEmailClient,
    promptOrOpenEmail
} from './emailUtils';
import { STORAGE_KEYS } from './constants';

describe('emailUtils', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('preference getters and setters', () => {
        it('returns null when no preference is stored', () => {
            expect(getEmailClientPreference()).toBeNull();
        });

        it('saves and retrieves email preference correctly', () => {
            setEmailClientPreference(EMAIL_CLIENTS.GMAIL);
            expect(localStorage.getItem(STORAGE_KEYS.EMAIL_CLIENT_PREFERENCE)).toBe(EMAIL_CLIENTS.GMAIL);
            expect(getEmailClientPreference()).toBe(EMAIL_CLIENTS.GMAIL);
        });

        it('removes preference when given empty or null value', () => {
            setEmailClientPreference(EMAIL_CLIENTS.OUTLOOK);
            expect(getEmailClientPreference()).toBe(EMAIL_CLIENTS.OUTLOOK);

            setEmailClientPreference(null);
            expect(getEmailClientPreference()).toBeNull();
        });
    });

    describe('getEmailComposeUrl', () => {
        it('generates standard mailto URL for default client', () => {
            const url = getEmailComposeUrl(EMAIL_CLIENTS.DEFAULT, 'test@example.com');
            expect(url).toBe('mailto:test@example.com');

            const urlWithParams = getEmailComposeUrl(EMAIL_CLIENTS.DEFAULT, 'test@example.com', {
                subject: 'Hello World',
                body: 'Checking in'
            });
            expect(urlWithParams).toBe('mailto:test@example.com?subject=Hello%20World&body=Checking%20in');
        });

        it('generates correct Gmail compose URL', () => {
            const url = getEmailComposeUrl(EMAIL_CLIENTS.GMAIL, 'user@gmail.com', {
                subject: 'Quick question'
            });
            expect(url).toContain('https://mail.google.com/mail/?view=cm&fs=1');
            expect(url).toContain('to=user%40gmail.com');
            expect(url).toContain('su=Quick+question');
        });

        it('generates correct Outlook compose URL', () => {
            const url = getEmailComposeUrl(EMAIL_CLIENTS.OUTLOOK, 'contact@outlook.com', {
                subject: 'Meeting'
            });
            expect(url).toContain('https://outlook.live.com/mail/0/deeplink/compose');
            expect(url).toContain('to=contact%40outlook.com');
            expect(url).toContain('subject=Meeting');
        });

        it('generates correct Yahoo Mail compose URL', () => {
            const url = getEmailComposeUrl(EMAIL_CLIENTS.YAHOO, 'friend@yahoo.com');
            expect(url).toContain('https://compose.mail.yahoo.com/');
            expect(url).toContain('to=friend%40yahoo.com');
        });
    });

    describe('openEmailClient', () => {
        it('opens window for webmail providers', () => {
            const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => {});
            openEmailClient('test@example.com', {}, EMAIL_CLIENTS.GMAIL);

            expect(windowOpenSpy).toHaveBeenCalledWith(
                expect.stringContaining('mail.google.com'),
                '_blank',
                'noopener,noreferrer'
            );
            windowOpenSpy.mockRestore();
        });

        it('creates a detached link for default system mailto', () => {
            const clickSpy = jest.fn();
            const originalCreateElement = document.createElement.bind(document);
            jest.spyOn(document, 'createElement').mockImplementation((tag) => {
                const el = originalCreateElement(tag);
                if (tag === 'a') {
                    el.click = clickSpy;
                }
                return el;
            });

            openEmailClient('test@example.com', {}, EMAIL_CLIENTS.DEFAULT);
            expect(clickSpy).toHaveBeenCalled();
            document.createElement.mockRestore();
        });
    });

    describe('promptOrOpenEmail', () => {
        it('returns false if no email provided', () => {
            expect(promptOrOpenEmail('')).toBe(false);
        });

        it('dispatches 123todo:open-email-modal event when no preference is saved', () => {
            const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
            const result = promptOrOpenEmail('hello@123todo.com');

            expect(result).toBe(false);
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: '123todo:open-email-modal',
                    detail: expect.objectContaining({
                        email: 'hello@123todo.com'
                    })
                })
            );
            dispatchSpy.mockRestore();
        });

        it('directly opens email client without modal if preference is saved', () => {
            setEmailClientPreference(EMAIL_CLIENTS.GMAIL);
            const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => {});
            const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

            const result = promptOrOpenEmail('hello@123todo.com');
            expect(result).toBe(true);
            expect(windowOpenSpy).toHaveBeenCalledWith(
                expect.stringContaining('mail.google.com'),
                '_blank',
                'noopener,noreferrer'
            );
            expect(dispatchSpy).not.toHaveBeenCalled();

            windowOpenSpy.mockRestore();
            dispatchSpy.mockRestore();
        });

        it('dispatches event if preference is set to ALWAYS_ASK', () => {
            setEmailClientPreference(EMAIL_CLIENTS.ALWAYS_ASK);
            const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

            const result = promptOrOpenEmail('prompt@123todo.com');
            expect(result).toBe(false);
            expect(dispatchSpy).toHaveBeenCalled();

            dispatchSpy.mockRestore();
        });
    });
});
