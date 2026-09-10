import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InstallGuideModal from './InstallGuideModal';

describe('InstallGuideModal', () => {
  test('does not render when isOpen is false', () => {
    const { container } = render(
      <InstallGuideModal
        isOpen={false}
        onClose={jest.fn()}
        onNativeInstall={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders modal content and platform tabs when isOpen is true', () => {
    render(
      <InstallGuideModal
        isOpen={true}
        onClose={jest.fn()}
        onNativeInstall={jest.fn()}
      />
    );

    expect(screen.getByText('Install 123 To Do as an App')).toBeInTheDocument();
    expect(screen.getByText(/iPhone & iPad/i)).toBeInTheDocument();
    expect(screen.getByText(/Android/i)).toBeInTheDocument();
    expect(screen.getByText(/Mac & PC/i)).toBeInTheDocument();
  });

  test('displays reminder banner when isReminder is true', () => {
    render(
      <InstallGuideModal
        isOpen={true}
        onClose={jest.fn()}
        onNativeInstall={jest.fn()}
        isReminder={true}
      />
    );

    expect(screen.getByText(/Enjoying 123 To Do\?/i)).toBeInTheDocument();
  });

  test('calls onClose when Maybe Later or Got It is clicked', () => {
    const onCloseMock = jest.fn();
    render(
      <InstallGuideModal
        isOpen={true}
        onClose={onCloseMock}
        onNativeInstall={jest.fn()}
      />
    );

    const maybeLaterBtn = screen.getByRole('button', { name: /maybe later/i });
    expect(maybeLaterBtn).toBeInTheDocument();
    fireEvent.click(maybeLaterBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    const gotItBtn = screen.getByRole('button', { name: /got it/i });
    expect(gotItBtn).toBeInTheDocument();
    fireEvent.click(gotItBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });
});
