import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
    test('renders version number and does not render achievements trophy button in footer', () => {
        render(<Footer version="3.7.8" />);

        expect(screen.getByText('v3.7.8')).toBeInTheDocument();
        expect(screen.queryByTitle('Productivity Achievements & Insights')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Productivity Achievements & Insights')).not.toBeInTheDocument();
    });

    test('renders commercial partner badge and custom client links when custom tenant is active', () => {
        const { TenantProvider } = require('../../context/TenantContext');
        render(
            <TenantProvider initialTenantId="pilot">
                <Footer version="3.7.21" />
            </TenantProvider>
        );

        expect(screen.getByText('Custom Edition prepared for Commercial Pilot')).toBeInTheDocument();
        expect(screen.getByText('Client Support')).toBeInTheDocument();
        expect(screen.getByText(/Commercial Partners/)).toBeInTheDocument();
    });
});
