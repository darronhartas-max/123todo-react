import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeModal from './WelcomeModal';

describe('WelcomeModal', () => {
    const defaultProps = {
        onAccept: jest.fn(),
        canNativeInstall: false,
        onInstall: jest.fn(),
        isStandalone: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders welcome title and get started button', () => {
        render(<WelcomeModal {...defaultProps} />);

        expect(screen.getByText('Welcome to 123 To Do')).toBeInTheDocument();
        expect(screen.getByText('Start Using 123 To Do ➔')).toBeInTheDocument();
        expect(screen.getByText(/100% Free App • Works Offline/i)).toBeInTheDocument();
    });

    test('calls onAccept when start button is clicked', () => {
        render(<WelcomeModal {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: /start using 123 to do/i }));
        expect(defaultProps.onAccept).toHaveBeenCalledTimes(1);
    });

    test('shows 1-tap install button when canNativeInstall is true and onInstall is provided', () => {
        render(<WelcomeModal {...defaultProps} canNativeInstall={true} onInstall={defaultProps.onInstall} />);

        const installBtn = screen.getByRole('button', { name: /install app/i });
        expect(installBtn).toBeInTheDocument();

        fireEvent.click(installBtn);
        expect(defaultProps.onInstall).toHaveBeenCalledTimes(1);
    });

    test('shows app mode active when isStandalone is true', () => {
        render(<WelcomeModal {...defaultProps} isStandalone={true} />);

        expect(screen.getByText(/App Mode Active • Running from Home Screen/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument();
    });

    test('toggles accordion sections open and closed', () => {
        render(<WelcomeModal {...defaultProps} />);

        // Initially accordions are collapsed
        expect(screen.queryByText(/Full beginner guide/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Rich Task & Note Mode/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Zero-knowledge sync across all your devices/i)).not.toBeInTheDocument();

        // Expand "How to Install"
        const installAccordionBtn = screen.getByRole('button', { name: /how to install/i });
        fireEvent.click(installAccordionBtn);
        expect(screen.getByText(/Full beginner guide/i)).toBeInTheDocument();

        // Expand "What You Can Do" (should collapse install or switch)
        const featuresAccordionBtn = screen.getByRole('button', { name: /what you can do/i });
        fireEvent.click(featuresAccordionBtn);
        expect(screen.getByText(/Rich Task & Note Mode/i)).toBeInTheDocument();
        expect(screen.queryByText(/Full beginner guide/i)).not.toBeInTheDocument();

        // Collapse "What You Can Do" by clicking again
        fireEvent.click(featuresAccordionBtn);
        expect(screen.queryByText(/Rich Task & Note Mode/i)).not.toBeInTheDocument();

        // Expand "Privacy, Security & Terms"
        const legalAccordionBtn = screen.getByRole('button', { name: /privacy, security & terms/i });
        fireEvent.click(legalAccordionBtn);
        expect(screen.getByText(/Terms of Service ➔/i)).toBeInTheDocument();
        expect(screen.getByText(/Privacy Policy ➔/i)).toBeInTheDocument();
    });
});
