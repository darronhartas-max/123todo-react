import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PrioritySection from './PrioritySection';

describe('PrioritySection Component', () => {
    const mockTasks = [
        { id: 1, text: 'Important task', priority: 1, projectId: 'general' }
    ];
    const mockProjects = [
        { id: 'general', name: 'General', color: '#6b7280' }
    ];

    test('renders priority section with title, count, and task items', () => {
        render(
            <PrioritySection
                priority={1}
                tasks={mockTasks}
                projects={mockProjects}
            />
        );

        expect(screen.getByText('1 Must Do')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('Important task')).toBeInTheDocument();
    });

    test('renders empty drop card placeholder in Kanban wide layout mode when empty', () => {
        render(
            <PrioritySection
                priority={1}
                tasks={[]}
                projects={mockProjects}
                isWideLayout={true}
            />
        );

        expect(screen.getByText('1 Must Do')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText(/no must do tasks/i)).toBeInTheDocument();
    });

    test('applies equal flex distribution and minWidth in Kanban wide layout mode', () => {
        const { container } = render(
            <PrioritySection
                priority={2}
                tasks={[]}
                projects={mockProjects}
                isWideLayout={true}
            />
        );

        const sectionDiv = container.firstChild;
        expect(sectionDiv).toHaveStyle({
            flex: '1 1 0px',
            minWidth: '220px'
        });
    });

    test('allows toggling collapse state on click', () => {
        render(
            <PrioritySection
                priority={1}
                tasks={mockTasks}
                projects={mockProjects}
                isWideLayout={false}
            />
        );

        const collapseTrigger = screen.getByTitle('Collapse 1 Must Do');
        fireEvent.click(collapseTrigger);

        // After clicking collapse, header title switches to 'Expand 1 Must Do'
        expect(screen.getByTitle('Expand 1 Must Do')).toBeInTheDocument();
    });
});
