import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
    test('renders version number and achievements trophy button when onOpenAchievements is provided', () => {
        const onOpenAchievementsMock = jest.fn();
        render(
            <Footer
                version="3.7.8"
                onOpenAchievements={onOpenAchievementsMock}
            />
        );

        expect(screen.getByText('v3.7.8')).toBeInTheDocument();
        const trophyBtn = screen.getByTitle('Productivity Achievements & Insights');
        expect(trophyBtn).toBeInTheDocument();

        fireEvent.click(trophyBtn);
        expect(onOpenAchievementsMock).toHaveBeenCalledTimes(1);
    });

    test('renders version number without achievements button if handler not provided', () => {
        render(<Footer version="3.7.8" />);
        expect(screen.getByText('v3.7.8')).toBeInTheDocument();
        expect(screen.queryByTitle('Productivity Achievements & Insights')).not.toBeInTheDocument();
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
