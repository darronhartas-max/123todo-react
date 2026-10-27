import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SettingsVoiceTab from './SettingsVoiceTab';

describe('SettingsVoiceTab', () => {
    const mockStyles = {
        sectionTitle: { fontSize: '1.1rem', fontWeight: 'bold' },
        kbdBadge: { background: '#f1f5f9' },
        voiceGuideTag: { padding: '4px' },
        voiceGuideRow: { padding: '4px' }
    };

    let originalMediaDevices;
    let originalAudioContext;
    let mockStream;
    let mockAudioContext;

    beforeEach(() => {
        originalMediaDevices = navigator.mediaDevices;
        originalAudioContext = window.AudioContext;

        mockStream = {
            getTracks: jest.fn(() => [{ stop: jest.fn() }]),
            getAudioTracks: jest.fn(() => [{ label: 'Focusrite Scarlett 2i2 USB', stop: jest.fn() }])
        };

        mockAudioContext = class {
            constructor() {
                this.state = 'running';
                this.resume = jest.fn().mockResolvedValue();
                this.close = jest.fn().mockResolvedValue();
            }
            createAnalyser() {
                return {
                    fftSize: 256,
                    smoothingTimeConstant: 0.3,
                    frequencyBinCount: 128,
                    getByteFrequencyData: jest.fn((array) => {
                        for (let i = 0; i < array.length; i++) array[i] = 40;
                    })
                };
            }
            createMediaStreamSource() {
                return { connect: jest.fn() };
            }
        };

        Object.defineProperty(navigator, 'mediaDevices', {
            value: {
                getUserMedia: jest.fn().mockResolvedValue(mockStream),
                enumerateDevices: jest.fn().mockResolvedValue([
                    { kind: 'audioinput', label: 'Focusrite Scarlett 2i2 USB' }
                ])
            },
            configurable: true
        });

        window.AudioContext = mockAudioContext;
    });

    afterEach(() => {
        Object.defineProperty(navigator, 'mediaDevices', {
            value: originalMediaDevices,
            configurable: true
        });
        window.AudioContext = originalAudioContext;
        jest.clearAllMocks();
    });

    test('renders voice tab guide and mic check card', () => {
        render(<SettingsVoiceTab styles={mockStyles} />);
        expect(screen.getByText(/voice input & dictation guide/i)).toBeInTheDocument();
        expect(screen.getByText(/microphone & audio check/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /test mic/i })).toBeInTheDocument();
    });

    test('starts audio test on button click and displays device and audio level', async () => {
        render(<SettingsVoiceTab styles={mockStyles} />);

        const testBtn = screen.getByRole('button', { name: /test mic/i });
        await act(async () => {
            fireEvent.click(testBtn);
        });

        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
        expect(await screen.findByText(/focusrite scarlett 2i2 usb/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /stop test/i })).toBeInTheDocument();

        // Clicking Stop Test stops the stream
        const stopBtn = screen.getByRole('button', { name: /stop test/i });
        act(() => {
            fireEvent.click(stopBtn);
        });

        expect(screen.getByRole('button', { name: /test mic/i })).toBeInTheDocument();
    });

    test('handles microphone permission denial gracefully', async () => {
        navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(
            Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
        );

        render(<SettingsVoiceTab styles={mockStyles} />);

        const testBtn = screen.getByRole('button', { name: /test mic/i });
        await act(async () => {
            fireEvent.click(testBtn);
        });

        expect(await screen.findByText(/microphone access blocked/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
});
