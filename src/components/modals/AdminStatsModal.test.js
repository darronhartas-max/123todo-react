import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminStatsModal from './AdminStatsModal';
import { recordVisit, recordPWAInstall, verifyAdminPassword, updateAdminPassword } from '../../utils/telemetry';

describe('Privacy-First Telemetry & Admin Authentication', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('verifies default admin password and updates password correctly', () => {
        expect(verifyAdminPassword('admin')).toBe(true);
        expect(verifyAdminPassword('wrongpass')).toBe(false);

        // Update password
        expect(updateAdminPassword('newSecret123')).toBe(true);
        expect(verifyAdminPassword('newSecret123')).toBe(true);
        expect(verifyAdminPassword('admin')).toBe(false);
    });

    test('seamlessly migrates legacy polynomial hash to cryptographic SHA-256', () => {
        const { STORAGE_KEYS } = require('../../utils/constants');
        // Manually store a legacy polynomial hash for 'legacyPass'
        localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD_HASH, 'h_3a910f'); // simulate legacy hash
        expect(verifyAdminPassword('wrong')).toBe(false);

        // Verify correct password using legacy hash
        const { legacyHashPassword } = require('../../utils/telemetry');
        const legacyHash = legacyHashPassword('myLegacySecret');
        localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD_HASH, legacyHash);

        expect(verifyAdminPassword('myLegacySecret')).toBe(true);

        // Verify that stored hash has been automatically upgraded to 64-char SHA-256
        const upgraded = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD_HASH);
        expect(upgraded).not.toMatch(/^h_/);
        expect(upgraded.length).toBe(64);
        expect(verifyAdminPassword('myLegacySecret')).toBe(true);
    });

    test('records visits and PWA installs without privacy issues', () => {
        recordVisit();
        recordPWAInstall();

        render(<AdminStatsModal isOpen={true} onClose={jest.fn()} />);

        // Login with default password
        const passwordInput = screen.getByPlaceholderText(/Enter Admin Password/i);
        fireEvent.change(passwordInput, { target: { value: 'admin' } });
        fireEvent.click(screen.getByText(/Unlock Admin Portal/i));

        // Check metrics dashboard
        expect(screen.getByText(/Private Admin Portal/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Visits/i)).toBeInTheDocument();
        expect(screen.getByText(/PWA Installs/i)).toBeInTheDocument();
        expect(screen.getByText(/Daily Traffic Trend/i)).toBeInTheDocument();
    });
});
