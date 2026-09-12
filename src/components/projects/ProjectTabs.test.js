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
});
