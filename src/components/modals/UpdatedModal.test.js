import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UpdatedModal from './UpdatedModal';
import { APP_VERSION } from '../../utils/constants';

describe('UpdatedModal', () => {
  test('renders previous and current versions when versions differ', () => {
    render(
      <UpdatedModal
        oldVersion="3.6.12"
        newVersion="3.6.20"
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('123 To Do Updated!')).toBeInTheDocument();
    expect(screen.getByText('PREVIOUS')).toBeInTheDocument();
    expect(screen.getByText('v3.6.12')).toBeInTheDocument();
    expect(screen.getByText('CURRENT')).toBeInTheDocument();
    expect(screen.getByText('v3.6.20')).toBeInTheDocument();
    expect(screen.getByText("✨ What's New in v3.6.20:")).toBeInTheDocument();
  });

  test('renders single current version badge cleanly without duplicate when oldVersion equals newVersion', () => {
    render(
      <UpdatedModal
        oldVersion="3.6.20"
        newVersion="3.6.20"
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('123 To Do Updated!')).toBeInTheDocument();
    expect(screen.queryByText('PREVIOUS')).not.toBeInTheDocument();
    expect(screen.getByText('CURRENT VERSION')).toBeInTheDocument();
    expect(screen.getByText('v3.6.20')).toBeInTheDocument();
  });

  test('calls onClose when Awesome, Let\'s Go! button is clicked', () => {
    const onCloseMock = jest.fn();
    render(
      <UpdatedModal
        oldVersion="3.6.12"
        newVersion={APP_VERSION}
        onClose={onCloseMock}
      />
    );

    const closeButton = screen.getByRole('button', { name: /Awesome, Let's Go!/i });
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
