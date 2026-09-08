import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmailClientModal from './EmailClientModal';
import { EMAIL_CLIENTS, getEmailClientPreference } from '../../utils/emailUtils';

describe('EmailClientModal', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            <EmailClientModal
                isOpen={false}
                onClose={() => {}}
                targetEmail="test@example.com"
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders target email and selectable providers when isOpen is true', () => {
        render(
            <EmailClientModal
                isOpen={true}
                onClose={() => {}}
                targetEmail="contact@123todo.com"
            />
        );

        expect(screen.getByText('Choose Email Service')).toBeInTheDocument();
        expect(screen.getByText('contact@123todo.com')).toBeInTheDocument();
        expect(screen.getByText('Default Mail App')).toBeInTheDocument();
        expect(screen.getByText('Gmail')).toBeInTheDocument();
        expect(screen.getByText('Outlook / 365')).toBeInTheDocument();
        expect(screen.getByText('Yahoo Mail')).toBeInTheDocument();
        expect(screen.getByText('Remember my choice')).toBeInTheDocument();
    });

    it('copies target email to clipboard when Copy is clicked', async () => {
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockResolvedValue(true)
            }
        });

        render(
            <EmailClientModal
                isOpen={true}
                onClose={() => {}}
                targetEmail="copytest@example.com"
            />
        );

        const copyBtn = screen.getByRole('button', { name: /copy/i });
        await act(async () => {
            fireEvent.click(copyBtn);
        });

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copytest@example.com');
    });

    it('calls onClose when Cancel is clicked', () => {
        const onClose = jest.fn();
        render(
            <EmailClientModal
                isOpen={true}
                onClose={onClose}
                targetEmail="test@example.com"
            />
        );

        const cancelBtn = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelBtn);
        expect(onClose).toHaveBeenCalled();
    });

    it('persists selected provider and opens client on confirm', () => {
        const onClose = jest.fn();
        const onPreferenceChanged = jest.fn();
        const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => {});

        render(
            <EmailClientModal
                isOpen={true}
                onClose={onClose}
                targetEmail="test@example.com"
                onPreferenceChanged={onPreferenceChanged}
            />
        );

        // Select Gmail
        const gmailOption = screen.getByText('Gmail');
        fireEvent.click(gmailOption);

        // Confirm
        const openEmailBtn = screen.getByRole('button', { name: /open email/i });
        fireEvent.click(openEmailBtn);

        expect(getEmailClientPreference()).toBe(EMAIL_CLIENTS.GMAIL);
        expect(onPreferenceChanged).toHaveBeenCalledWith(EMAIL_CLIENTS.GMAIL);
        expect(windowOpenSpy).toHaveBeenCalledWith(
            expect.stringContaining('mail.google.com'),
            '_blank',
            'noopener,noreferrer'
        );
        expect(onClose).toHaveBeenCalled();

        windowOpenSpy.mockRestore();
    });
});
