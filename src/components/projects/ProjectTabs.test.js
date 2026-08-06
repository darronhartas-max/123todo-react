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
});
