import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectTabs from './ProjectTabs';

const sampleProjects = [
    { id: 'work', name: 'Work', color: '#10b981' },
    { id: 'personal', name: 'Personal', color: '#f59e0b' }
];

const sampleTasks = [
    { id: 1, text: 'Task 1', projectId: 'work' },
    { id: 2, text: 'Task 2', projectId: 'work' },
    { id: 3, text: 'Task 3', projectId: 'personal' }
];

describe('ProjectTabs Component', () => {
    test('renders project dropdown trigger button with total task count for All Projects', () => {
        render(
            <ProjectTabs
                projects={sampleProjects}
                tasks={sampleTasks}
                currentProjectId="all"
                onSelect={jest.fn()}
                showSearch={false}
                onToggleSearch={jest.fn()}
                onOpenSettings={jest.fn()}
            />
        );

        // All (3)
        expect(screen.getByText(/All\s*\(3\)/i)).toBeInTheDocument();
    });

    test('renders project task counts inside dropdown options when expanded', () => {
        render(
            <ProjectTabs
                projects={sampleProjects}
                tasks={sampleTasks}
                currentProjectId="all"
                onSelect={jest.fn()}
                showSearch={false}
                onToggleSearch={jest.fn()}
                onOpenSettings={jest.fn()}
            />
        );

        // Open dropdown
        const trigger = screen.getByText(/All\s*\(3\)/i);
        fireEvent.click(trigger);

        // Check options and their counts
        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();

        expect(screen.getByText('Personal')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('renders Achievements trophy button and triggers onOpenAchievements when clicked', () => {
        const onOpenAchievementsMock = jest.fn();
        render(
            <ProjectTabs
                projects={sampleProjects}
                tasks={sampleTasks}
                currentProjectId="all"
                onSelect={jest.fn()}
                showSearch={false}
                onToggleSearch={jest.fn()}
                onOpenSettings={jest.fn()}
                onOpenAchievements={onOpenAchievementsMock}
                viewProfile="pro"
            />
        );
        const trophyBtn = screen.getByTitle('Productivity Achievements & Insights');
        expect(trophyBtn).toBeInTheDocument();
        fireEvent.click(trophyBtn);
        expect(onOpenAchievementsMock).toHaveBeenCalled();
    });

    test('hides Achievements trophy button in toolbar when in Lite mode', () => {
        render(
            <ProjectTabs
                projects={sampleProjects}
                tasks={sampleTasks}
                currentProjectId="all"
                onSelect={jest.fn()}
                showSearch={false}
                onToggleSearch={jest.fn()}
                onOpenSettings={jest.fn()}
                onOpenAchievements={jest.fn()}
                viewProfile="lite"
            />
        );
        expect(screen.queryByTitle('Productivity Achievements & Insights')).not.toBeInTheDocument();
    });

    test('renders correctly with very long project name and preserves action buttons', () => {
        const longProjects = [
            { id: 'super-long', name: 'Very Long Project Name That Could Overflow On Mobile Screens', color: '#6366f1' }
        ];
        const onToggleAddMock = jest.fn();
        const onOpenSettingsMock = jest.fn();

        render(
            <ProjectTabs
                projects={longProjects}
                tasks={[]}
                currentProjectId="super-long"
                onSelect={jest.fn()}
                showSearch={false}
                onToggleSearch={jest.fn()}
                onOpenSettings={onOpenSettingsMock}
                onToggleAdd={onToggleAddMock}
                isAddOpen={false}
            />
        );

        expect(screen.getByText(/Very Long Project Name That Could Overflow On Mobile Screens/i)).toBeInTheDocument();
        const addBtn = screen.getByLabelText(/Open add task/i);
        expect(addBtn).toBeInTheDocument();
        fireEvent.click(addBtn);
        expect(onToggleAddMock).toHaveBeenCalled();
    });

    test('does not render Pro/Lite profile switch in the toolbar', () => {
        render(
            <ProjectTabs
                projects={sampleProjects}
                tasks={sampleTasks}
                currentProjectId="all"
                onSelect={jest.fn()}
                showSearch={false}
                onToggleSearch={jest.fn()}
                onOpenSettings={jest.fn()}
                viewProfile="pro"
            />
        );

        expect(screen.queryByRole('button', { name: /Pro/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Lite/i })).not.toBeInTheDocument();
    });

    test('includes tasks in priorities must, should, could, on hold, and scheduled in active counts', () => {
        const testProjects = [
            { id: 'work', name: 'Work', color: '#10b981' },
            { id: 'personal', name: 'Personal', color: '#f59e0b' }
        ];

        const testTasks = [
            { id: 1, text: 'Must Do Task', priority: 1, projectId: 'work' },
            { id: 2, text: 'Should Do Task', priority: 2, projectId: 'work' },
            { id: 3, text: 'Could Do Task', priority: 3, projectId: 'work' },
            { id: 4, text: 'On Hold Task', priority: 4, projectId: 'work' },
            { id: 5, text: 'Future Scheduled Task', priority: 1, scheduledDate: '2026-12-25', projectId: 'work' },
            { id: 6, text: 'Completed Work Task', priority: 1, completedAt: 1700000000000, projectId: 'work' },
            { id: 7, text: 'Personal Must Task', priority: 1, projectId: 'personal' },
            { id: 8, text: 'Personal Scheduled Task', priority: 3, scheduledDate: '2026-11-15', projectId: 'personal' }
        ];

        render(
            <ProjectTabs
                projects={testProjects}
                tasks={testTasks}
                currentProjectId="work"
                onSelect={jest.fn()}
                showSearch={false}
                onToggleSearch={jest.fn()}
                onOpenSettings={jest.fn()}
            />
        );

        // Work trigger shows 5 active tasks (must, should, could, on hold, scheduled) - completed is excluded
        expect(screen.getByText(/Work\s*\(5\)/i)).toBeInTheDocument();

        // Open dropdown to check option counts
        fireEvent.click(screen.getByText(/Work\s*\(5\)/i));

        // All should have 7 total active tasks (5 Work + 2 Personal)
        expect(screen.getByText('7')).toBeInTheDocument();
        // Work should have 5
        expect(screen.getByText('5')).toBeInTheDocument();
        // Personal should have 2
        expect(screen.getByText('2')).toBeInTheDocument();
    });
});

