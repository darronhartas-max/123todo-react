import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SyncModal from './SyncModal';

describe('SyncModal', () => {
    const mockCloudflareSync = {
        isAuthed: false,
        syncStatus: 'idle',
        passphrase: '',
        setPassphrase: jest.fn(),
        connectSync: jest.fn().mockResolvedValue({ success: true }),
        disconnectSync: jest.fn(),
        generatePairCode: jest.fn().mockResolvedValue('123456'),
        signIn: jest.fn(),
        signOut: jest.fn(),
        performSync: jest.fn()
    };

    const mockGdriveSync = {
        isAuthed: false,
        syncStatus: 'idle',
        passphrase: '',
        setPassphrase: jest.fn(),
        connectSync: jest.fn(),
        disconnectSync: jest.fn(),
        generatePairCode: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn(),
        performSync: jest.fn()
    };

    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        syncProvider: 'cloudflare',
        setSyncProvider: jest.fn(),
        cloudflareSync: mockCloudflareSync,
        gdriveSync: mockGdriveSync
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockCloudflareSync.connectSync.mockResolvedValue({ success: true });
        mockCloudflareSync.generatePairCode.mockResolvedValue('123456');
    });

    test('does not render when isOpen is false', () => {
        const { container } = render(<SyncModal {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders sync header and provider selector', () => {
        render(<SyncModal {...defaultProps} />);
        expect(screen.getByText('Cloud Sync & Backup')).toBeInTheDocument();
        expect(screen.getByText(/123todo sync \(set & forget\)/i)).toBeInTheDocument();
        expect(screen.getByText('Google Drive')).toBeInTheDocument();
    });

    test('switches provider to Google Drive when tab clicked', () => {
        render(<SyncModal {...defaultProps} />);
        const gdriveTab = screen.getByText('Google Drive');
        fireEvent.click(gdriveTab);
        expect(defaultProps.setSyncProvider).toHaveBeenCalledWith('gdrive');
    });

    test('shows validation message if connecting without passphrase', async () => {
        render(<SyncModal {...defaultProps} />);
        const enableBtn = screen.getByRole('button', { name: /enable instant cloud sync/i });
        expect(enableBtn).toBeDisabled();
    });

    test('connects successfully when passphrase is provided', async () => {
        render(<SyncModal {...defaultProps} />);
        const passphraseInput = screen.getByPlaceholderText(/enter secret passphrase/i);
        fireEvent.change(passphraseInput, { target: { value: 'SecretKey123' } });

        const enableBtn = screen.getByRole('button', { name: /enable instant cloud sync/i });
        expect(enableBtn).not.toBeDisabled();
        fireEvent.click(enableBtn);

        await waitFor(() => {
            expect(mockCloudflareSync.connectSync).toHaveBeenCalledWith('SecretKey123', null);
            expect(mockCloudflareSync.performSync).toHaveBeenCalledWith(true);
        });
    });

    test('renders authenticated state and generates pairing code', async () => {
        const authedCloudflareSync = {
            ...mockCloudflareSync,
            isAuthed: true,
            syncStatus: 'synced'
        };

        render(<SyncModal {...defaultProps} cloudflareSync={authedCloudflareSync} />);
        expect(screen.getByText('Connected & Syncing')).toBeInTheDocument();

        const pairCodeBtn = screen.getByRole('button', { name: /get 6-digit pairing code/i });
        fireEvent.click(pairCodeBtn);

        await waitFor(() => {
            expect(mockCloudflareSync.generatePairCode).toHaveBeenCalled();
            expect(screen.getByText('123456')).toBeInTheDocument();
        });
    });

    test('disconnects and closes modal when disconnect is clicked in authed state', () => {
        const authedCloudflareSync = {
            ...mockCloudflareSync,
            isAuthed: true,
            syncStatus: 'synced'
        };

        render(<SyncModal {...defaultProps} cloudflareSync={authedCloudflareSync} />);
        const disconnectBtn = screen.getByRole('button', { name: /disconnect sync/i });
        fireEvent.click(disconnectBtn);

        expect(mockCloudflareSync.disconnectSync).toHaveBeenCalled();
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
