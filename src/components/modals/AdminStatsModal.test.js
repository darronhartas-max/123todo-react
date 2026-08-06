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
