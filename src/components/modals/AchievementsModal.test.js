import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AchievementsModal from './AchievementsModal';

test('renders level, core stats, milestone badges and blog resources when open', () => {
    const tasks = [
        { id: 1, text: 'Active Task 1', priority: 1, projectId: 'general', subtasks: [{ id: 10, text: 'Sub 1', completed: true }] }
    ];
    const archived = [
        { id: 2, text: 'Completed Task 1', priority: 1, projectId: 'general', completedAt: '2026-08-19T10:00:00Z', subtasks: [{ id: 11, text: 'Sub 2', completed: true }] },
        { id: 3, text: 'Completed Task 2', priority: 2, projectId: 'general', completedAt: '2026-08-18T10:00:00Z' },
        { id: 4, text: 'Completed Task 3', priority: 3, projectId: 'general', completedAt: '2026-08-17T10:00:00Z' }
    ];
    const projects = [
        { id: 'general', name: 'General', color: '#6b7280' },
        { id: 'work', name: 'Work', color: '#2563eb' },
        { id: 'personal', name: 'Personal', color: '#10b981' }
    ];

    const onClose = jest.fn();

    render(
        <AchievementsModal
            isOpen={true}
            onClose={onClose}
            tasks={tasks}
            archived={archived}
            projects={projects}
        />
    );

    // Verify Title & Header
    expect(screen.getByText('Productivity & Achievements')).toBeInTheDocument();
    
    // Verify Level
    expect(screen.getAllByText(/Level/i).length).toBeGreaterThan(0);

    // Verify Stats
    expect(screen.getByText('Productivity Insights')).toBeInTheDocument();
    expect(screen.getByText('Tasks archived')).toBeInTheDocument();
    expect(screen.getByText('Daily Streak')).toBeInTheDocument();
    expect(screen.getByText('7-Day Velocity')).toBeInTheDocument();
    expect(screen.getByText('1-2-3 Balance')).toBeInTheDocument();
    expect(screen.getByText('Subtasks Done')).toBeInTheDocument();

    // Verify Milestones
    expect(screen.getByText('Milestone Badges')).toBeInTheDocument();
    expect(screen.getByText('First Step')).toBeInTheDocument();
    expect(screen.getByText('Hat Trick')).toBeInTheDocument();

    // Verify Blog Guides
    expect(screen.getByText('Time Management & Productivity Guides')).toBeInTheDocument();
    expect(screen.getByText('Mastering the 1-2-3 Rule')).toBeInTheDocument();
    expect(screen.getByText('Defeating Procrastination with Micro-Steps')).toBeInTheDocument();

    // Close button triggers onClose
    const closeBtn = screen.getByTitle('Close');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
});
