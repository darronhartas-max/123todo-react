import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsModal from './SettingsModal';

describe('SettingsModal', () => {
    const mockProjects = [
        { id: 'proj-1', name: 'Work', color: '#3b82f6' },
        { id: 'proj-2', name: 'Personal', color: '#10b981' }
    ];

    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        projects: mockProjects,
        onAddProject: jest.fn(),
        onEditProject: jest.fn(),
        onDeleteProject: jest.fn(),
        onMoveProject: jest.fn(),
        onReorderProjects: jest.fn(),
        fontSize: 14,
        setFontSize: jest.fn(),
        notesFontSize: 18,
        setNotesFontSize: jest.fn(),
        themeMode: 'system',
        setThemeMode: jest.fn(),
        layoutWidth: '480px',
        setLayoutWidth: jest.fn(),
        swipeSettings: { enabled: true, swipeRight: 'complete', swipeLeft: 'delete' },
        onUpdateSwipeSettings: jest.fn(),
        onCheckForUpdates: jest.fn(),
        dateFormat: 'UK',
        setDateFormat: jest.fn(),
        syncProvider: 'cloudflare',
        setSyncProvider: jest.fn(),
        onOpenSyncModal: jest.fn(),
        appMode: 'tasks',
        onSwitchMode: jest.fn(),
        taskViewMode: 'compact',
        setTaskViewMode: jest.fn(),
        viewProfile: 'lite',
        setViewProfile: jest.fn(),
        onOpenExport: jest.fn(),
        onOpenLatestUpdates: jest.fn(),
        initialTab: 'appearance'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('does not render when isOpen is false', () => {
        const { container } = render(<SettingsModal {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders settings header and default Appearance tab', () => {
        render(<SettingsModal {...defaultProps} />);
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Appearance & Styling')).toBeInTheDocument();
        expect(screen.getByText('Active App Skin')).toBeInTheDocument();
        expect(screen.getByText('Tasks View Text Size')).toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', () => {
        render(<SettingsModal {...defaultProps} />);
        const closeBtn = screen.getByRole('button', { name: '' });
        fireEvent.click(closeBtn);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    test('switches to Tasks tab when clicking Tasks tab button', () => {
        render(<SettingsModal {...defaultProps} />);
        const tasksTabBtn = screen.getByRole('button', { name: /tasks/i });
        fireEvent.click(tasksTabBtn);
        expect(screen.getByText('Tasks & Workflow')).toBeInTheDocument();
        expect(screen.getByText('Tasks List View Mode')).toBeInTheDocument();
    });

    test('switches to Projects tab and displays project list', () => {
        render(<SettingsModal {...defaultProps} />);
        const projectsTabBtn = screen.getByRole('button', { name: /projects/i });
        fireEvent.click(projectsTabBtn);
        expect(screen.getByText('Manage Projects')).toBeInTheDocument();
        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Personal')).toBeInTheDocument();
        expect(screen.getByText(/create new project/i)).toBeInTheDocument();
    });

    test('can open add project form and submit a new project', () => {
        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /projects/i }));

        const createBtn = screen.getByText(/create new project/i);
        fireEvent.click(createBtn);

        const input = screen.getByPlaceholderText('Project name...');
        fireEvent.change(input, { target: { value: 'Fitness' } });

        const submitBtn = screen.getByRole('button', { name: 'Add Project' });
        fireEvent.click(submitBtn);

        expect(defaultProps.onAddProject).toHaveBeenCalledWith('Fitness', expect.any(String));
    });

    test('switches to Swipe tab and toggles swipe settings', () => {
        render(<SettingsModal {...defaultProps} />);
        const swipeTabBtn = screen.getByRole('button', { name: /swipe/i });
        fireEvent.click(swipeTabBtn);
        expect(screen.getByText(/task swipe gestures/i)).toBeInTheDocument();
        expect(screen.getByText('🟢 Swipe Gestures Active')).toBeInTheDocument();

        const toggleBtn = screen.getByRole('button', { name: 'ON' });
        fireEvent.click(toggleBtn);
        expect(defaultProps.onUpdateSwipeSettings).toHaveBeenCalledWith({ enabled: false });
    });

    test('switches to Cloud Sync tab and interacts with provider selection', () => {
        render(<SettingsModal {...defaultProps} />);
        const syncTabBtn = screen.getByRole('button', { name: /cloud sync/i });
        fireEvent.click(syncTabBtn);
        expect(screen.getByText('Cloud Sync & Backup Options')).toBeInTheDocument();
        expect(screen.getByText(/manage sync credentials & device pairing/i)).toBeInTheDocument();

        const gdriveRadio = screen.getByRole('radio', { name: /google drive appdata/i });
        fireEvent.click(gdriveRadio);
        expect(defaultProps.setSyncProvider).toHaveBeenCalledWith('gdrive');
    });

    test('switches to Voice tab and displays dictation guide', () => {
        render(<SettingsModal {...defaultProps} />);
        const voiceTabBtn = screen.getByRole('button', { name: /^voice$/i });
        fireEvent.click(voiceTabBtn);
        expect(screen.getByText(/voice input & dictation guide/i)).toBeInTheDocument();
        expect(screen.getByText(/✍️ Spoken Punctuation:/i)).toBeInTheDocument();
    });

    test('switches to Shortcuts tab and displays keyboard shortcuts', () => {
        render(<SettingsModal {...defaultProps} />);
        const shortcutsTabBtn = screen.getByRole('button', { name: /shortcuts/i });
        fireEvent.click(shortcutsTabBtn);
        expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
        expect(screen.getByText('Toggle Add Task Panel')).toBeInTheDocument();
    });

    test('switches to App & Updates tab and displays version info', () => {
        render(<SettingsModal {...defaultProps} />);
        const aboutTabBtn = screen.getByRole('button', { name: /app & updates/i });
        fireEvent.click(aboutTabBtn);
        expect(screen.getByText(/app version & updates/i)).toBeInTheDocument();
        expect(screen.getByText(/check for updates/i)).toBeInTheDocument();
    });

    test('triggers setFontSize when font slider changes', () => {
        render(<SettingsModal {...defaultProps} />);
        const slider = screen.getAllByRole('slider')[0];
        fireEvent.change(slider, { target: { value: '18' } });
        expect(defaultProps.setFontSize).toHaveBeenCalledWith(18);
    });

    test('triggers setThemeMode when Dark theme is clicked', () => {
        render(<SettingsModal {...defaultProps} />);
        const darkBtn = screen.getByRole('button', { name: 'Dark' });
        fireEvent.click(darkBtn);
        expect(defaultProps.setThemeMode).toHaveBeenCalledWith('dark');
    });
});
