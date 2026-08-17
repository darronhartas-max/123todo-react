import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectColumn from './ProjectColumn';

describe('ProjectColumn Component', () => {
    const mockProject = { id: 'work', name: 'Work', color: '#2563eb' };
    const mockTasks = [
        { id: 1, text: 'Design landing page', priority: 1, projectId: 'work' },
        { id: 2, text: 'Review PR', priority: 2, projectId: 'work' }
    ];

    test('renders project column with title and task items', () => {
        render(
            <ProjectColumn
                project={mockProject}
                tasks={mockTasks}
                projects={[mockProject]}
            />
        );

        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Design landing page')).toBeInTheDocument();
        expect(screen.getByText('Review PR')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('triggers onQuickAdd callback when + button is clicked', () => {
        const handleQuickAdd = jest.fn();
        render(
            <ProjectColumn
                project={mockProject}
                tasks={mockTasks}
                projects={[mockProject]}
                onQuickAdd={handleQuickAdd}
            />
        );

        const addBtn = screen.getByTitle('Add task to Work');
        fireEvent.click(addBtn);
        expect(handleQuickAdd).toHaveBeenCalledWith('work');
    });

    test('renders empty state when no tasks exist for the project', () => {
        render(
            <ProjectColumn
                project={{ id: 'empty', name: 'Empty Project', color: '#10b981' }}
                tasks={[]}
                projects={[]}
            />
        );

        expect(screen.getByText('Empty Project')).toBeInTheDocument();
        expect(screen.getByText('No tasks in Empty Project')).toBeInTheDocument();
    });
});
