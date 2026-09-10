import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PhotoAttachments from './PhotoAttachments';

describe('PhotoAttachments Component', () => {
  const mockPhotos = [
    {
      id: 'img_1',
      name: 'receipt.webp',
      dataUrl: 'data:image/webp;base64,mockdata1',
      thumbnail: 'data:image/webp;base64,mockthumb1',
      size: 150000
    },
    {
      id: 'img_2',
      name: 'whiteboard.webp',
      dataUrl: 'data:image/webp;base64,mockdata2',
      thumbnail: 'data:image/webp;base64,mockthumb2',
      size: 220000
    }
  ];

  test('renders Camera and Attach buttons in edit mode', () => {
    render(<PhotoAttachments photos={[]} onChange={jest.fn()} readOnly={false} />);
    expect(screen.getByText('Camera')).toBeInTheDocument();
    expect(screen.getByText('Attach')).toBeInTheDocument();
    expect(screen.getByText('Photos: 0/3')).toBeInTheDocument();
  });

  test('does not render action buttons in readOnly mode', () => {
    render(<PhotoAttachments photos={mockPhotos} readOnly={true} />);
    expect(screen.queryByText('Camera')).not.toBeInTheDocument();
    expect(screen.queryByText('Attach')).not.toBeInTheDocument();
  });

  test('renders thumbnails for existing photos', () => {
    render(<PhotoAttachments photos={mockPhotos} readOnly={false} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(2);
    expect(images[0]).toHaveAttribute('src', 'data:image/webp;base64,mockthumb1');
    expect(images[1]).toHaveAttribute('src', 'data:image/webp;base64,mockthumb2');
  });

  test('calls onChange with remaining photos when a photo is deleted', () => {
    const onChangeMock = jest.fn();
    render(<PhotoAttachments photos={mockPhotos} onChange={onChangeMock} readOnly={false} />);
    
    const removeButtons = screen.getAllByTitle('Remove photo');
    expect(removeButtons.length).toBe(2);

    fireEvent.click(removeButtons[0]);
    expect(onChangeMock).toHaveBeenCalledWith([mockPhotos[1]]);
  });

  test('opens and closes lightbox when thumbnail is clicked', () => {
    render(<PhotoAttachments photos={mockPhotos} readOnly={false} />);
    
    const images = screen.getAllByRole('img');
    fireEvent.click(images[0]);

    expect(screen.getByText('receipt.webp')).toBeInTheDocument();
    
    const closeBtn = screen.getByTitle('Close (Esc)');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('receipt.webp')).not.toBeInTheDocument();
  });

  test('displays Save to Photos / Share button and photo timestamp in lightbox', () => {
    const photosWithTimestamp = [
      {
        ...mockPhotos[0],
        timestamp: new Date(2026, 8, 10, 11, 30, 0).getTime()
      }
    ];

    render(<PhotoAttachments photos={photosWithTimestamp} readOnly={false} />);

    const images = screen.getAllByRole('img');
    fireEvent.click(images[0]);

    // Save to Photos / Share button should be present in Lightbox
    const shareBtn = screen.getByRole('button', { name: /Save to Photos \/ Share/i });
    expect(shareBtn).toBeInTheDocument();

    // Timestamp should be displayed
    expect(screen.getByText(/Captured: 10 Sep 2026/i)).toBeInTheDocument();

    // Copy photo timestamp button should be present
    expect(screen.getByTitle(/Copy photo evidentiary timestamp/i)).toBeInTheDocument();
  });
});
