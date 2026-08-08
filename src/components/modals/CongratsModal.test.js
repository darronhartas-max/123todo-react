import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CongratsModal from './CongratsModal';

describe('CongratsModal', () => {
  const defaultProps = {
    milestone: 5,
    todayCompleted: 5,
    totalArchived: 42,
    onContinue: jest.fn()
  };

  test('renders milestone title and stats cleanly', () => {
    render(<CongratsModal {...defaultProps} />);
    
    expect(screen.getByText('Milestone Reached!')).toBeInTheDocument();
    expect(screen.getByText('5 tasks')).toBeInTheDocument();
    expect(screen.getByText('Tasks Completed Today')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Total Archived All Time')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('triggers onContinue when button is clicked', () => {
    const onContinueMock = jest.fn();
    render(<CongratsModal {...defaultProps} onContinue={onContinueMock} />);
    
    fireEvent.click(screen.getByRole('button', { name: /keep going/i }));
    expect(onContinueMock).toHaveBeenCalledTimes(1);
  });
});
