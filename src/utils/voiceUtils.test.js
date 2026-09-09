import { formatSpokenPunctuation, mergeBaseAndTranscript, processVoiceCommands, isMobileDevice, startVoiceDictation } from './voiceUtils';

describe('voiceUtils - formatSpokenPunctuation', () => {
  test('formats spoken punctuation and capitalizes sentences correctly', () => {
    expect(formatSpokenPunctuation('buy milk full stop call John comma tomorrow')).toBe('buy milk. Call John, tomorrow');
    expect(formatSpokenPunctuation('buy milk fullstop call John comma tomorrow')).toBe('buy milk. Call John, tomorrow');
    expect(formatSpokenPunctuation('buy milk dot call John')).toBe('buy milk. Call John');
    expect(formatSpokenPunctuation('is task done question mark yes exclamation mark')).toBe('is task done? Yes!');
    expect(formatSpokenPunctuation('is task done questionmark yes exclamationpoint')).toBe('is task done? Yes!');
  });
});

describe('voiceUtils - mergeBaseAndTranscript', () => {
  test('returns speech when base is empty', () => {
    expect(mergeBaseAndTranscript('', 'buy milk')).toBe('buy milk');
    expect(mergeBaseAndTranscript(null, 'buy milk')).toBe('buy milk');
  });

  test('returns base when speech is empty', () => {
    expect(mergeBaseAndTranscript('Buy milk', '')).toBe('Buy milk');
  });

  test('prevents duplication when speech starts with base', () => {
    expect(mergeBaseAndTranscript('Buy milk', 'buy milk tomorrow')).toBe('Buy milk tomorrow');
    expect(mergeBaseAndTranscript('Call John', 'Call John tomorrow morning')).toBe('Call John tomorrow morning');
  });

  test('prevents duplication when base contains punctuation (full stop, comma, etc.)', () => {
    expect(mergeBaseAndTranscript('Buy milk.', 'buy milk and eggs')).toBe('Buy milk. and eggs');
    expect(mergeBaseAndTranscript('Buy milk,', 'milk and eggs')).toBe('Buy milk, and eggs');
    expect(mergeBaseAndTranscript('Is task done?', 'is task done yes')).toBe('Is task done? yes');
  });

  test('preserves initial base capitalization when speech matches base', () => {
    expect(mergeBaseAndTranscript('Buy milk', 'buy milk. and eggs')).toBe('Buy milk and eggs');
    expect(mergeBaseAndTranscript('Buy organic milk', 'buy organic milk')).toBe('Buy organic milk');
  });

  test('prevents duplication when speech is a subset of base', () => {
    expect(mergeBaseAndTranscript('Buy milk and eggs tomorrow', 'buy milk')).toBe('Buy milk and eggs tomorrow');
    expect(mergeBaseAndTranscript('Buy milk. Call John. Take out trash.', 'Call John.')).toBe('Buy milk. Call John. Take out trash.');
    expect(mergeBaseAndTranscript('Buy milk. Call John. Take out trash.', 'Call John. Take out trash.')).toBe('Buy milk. Call John. Take out trash.');
  });

  test('prevents sentence duplication when speech repeats earlier sentences and adds new words', () => {
    expect(mergeBaseAndTranscript('Buy milk. Call John.', 'Call John. Pick up dry cleaning.')).toBe('Buy milk. Call John. Pick up dry cleaning.');
    expect(mergeBaseAndTranscript('Buy milk. Call John. Take out trash.', 'Call John. Take out trash. Schedule meeting.')).toBe('Buy milk. Call John. Take out trash. Schedule meeting.');
  });

  test('prevents duplication when speech overlaps with suffix of base', () => {
    expect(mergeBaseAndTranscript('Buy milk', 'milk tomorrow')).toBe('Buy milk tomorrow');
    expect(mergeBaseAndTranscript('Call John tomorrow', 'tomorrow at 9am')).toBe('Call John tomorrow at 9am');
  });

  test('concatenates non-overlapping speech cleanly', () => {
    expect(mergeBaseAndTranscript('Buy milk', 'tomorrow')).toBe('Buy milk tomorrow');
  });

  test('appends punctuation-only speech chunks to base without duplicating', () => {
    expect(mergeBaseAndTranscript('Buy milk', '.')).toBe('Buy milk.');
    expect(mergeBaseAndTranscript('Buy milk.', '.')).toBe('Buy milk.');
    expect(mergeBaseAndTranscript('Is task done', '?')).toBe('Is task done?');
  });
});

describe('voiceUtils - processVoiceCommands', () => {
  test('handles spoken deletion commands (delete last word, scratch that)', () => {
    expect(processVoiceCommands('buy milk and bread scratch that wholemeal').text).toBe('buy milk and wholemeal');
    expect(processVoiceCommands('call John tomorrow delete last word').text).toBe('call John');
    expect(processVoiceCommands('buy milk and bread delete last 2 words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk clear all').text).toBe('');
  });

  test('detects spoken auto-submit commands (add task, add note) and appends full stop', () => {
    const res1 = processVoiceCommands('Buy fresh organic sourdough bread add task');
    expect(res1.text).toBe('Buy fresh organic sourdough bread.');
    expect(res1.isSubmitCommand).toBe(true);

    const res2 = processVoiceCommands('Call Mary tomorrow at 9am submit task');
    expect(res2.text).toBe('Call Mary tomorrow at 9am.');
    expect(res2.isSubmitCommand).toBe(true);

    const res3 = processVoiceCommands('Is the store open? add task');
    expect(res3.text).toBe('Is the store open?');
    expect(res3.isSubmitCommand).toBe(true);

    const res4 = processVoiceCommands('Remember to check water meter add note');
    expect(res4.text).toBe('Remember to check water meter.');
    expect(res4.isSubmitCommand).toBe(true);

    const res5 = processVoiceCommands('Meeting agenda notes save note');
    expect(res5.text).toBe('Meeting agenda notes.');
    expect(res5.isSubmitCommand).toBe(true);

    // Test variations: add a note, add a task, create task, homophones like and note, standalone triggers
    const res6 = processVoiceCommands('Pick up dry cleaning add a note');
    expect(res6.text).toBe('Pick up dry cleaning.');
    expect(res6.isSubmitCommand).toBe(true);

    const res7 = processVoiceCommands('Schedule dental checkup create task');
    expect(res7.text).toBe('Schedule dental checkup.');
    expect(res7.isSubmitCommand).toBe(true);

    const res8 = processVoiceCommands('Buy milk and note');
    expect(res8.text).toBe('Buy milk.');
    expect(res8.isSubmitCommand).toBe(true);

    const res9 = processVoiceCommands('Finish reading report submit');
    expect(res9.text).toBe('Finish reading report.');
    expect(res9.isSubmitCommand).toBe(true);

    const res10 = processVoiceCommands('add note');
    expect(res10.isSubmitCommand).toBe(true);

    const res11 = processVoiceCommands('add task');
    expect(res11.isSubmitCommand).toBe(true);
  });
});

describe('voiceUtils - isMobileDevice and startVoiceDictation', () => {
  test('isMobileDevice detects mobile user agents accurately', () => {
    const originalUserAgent = navigator.userAgent;

    // Simulate iPhone
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      configurable: true
    });
    expect(isMobileDevice()).toBe(true);

    // Simulate Android
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
      configurable: true
    });
    expect(isMobileDevice()).toBe(true);

    // Simulate Desktop Chrome
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      configurable: true
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true
    });
    expect(isMobileDevice()).toBe(false);

    // Restore
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
  });

  test('startVoiceDictation on mobile does not auto-restart on onend to prevent confirmation chimes', () => {
    // Mock SpeechRecognition
    const startMock = jest.fn();
    const abortMock = jest.fn();
    let instance = null;

    class MockSpeechRecognition {
      constructor() {
        this.continuous = true;
        this.interimResults = true;
        this.start = startMock;
        this.abort = abortMock;
        this.stop = jest.fn();
        instance = this;
      }
    }

    window.SpeechRecognition = MockSpeechRecognition;

    const onTranscript = jest.fn();
    const onStatusChange = jest.fn();
    const onEnd = jest.fn();

    // Start with continuous: false (mobile mode)
    const rec = startVoiceDictation({
      initialText: '',
      onTranscript,
      onStatusChange,
      onEnd,
      continuous: false
    });

    expect(rec).not.toBeNull();
    expect(startMock).toHaveBeenCalledTimes(1);

    // Simulate transcript received
    instance.onresult({
      results: [
        [{ transcript: 'Buy fresh bread' }]
      ]
    });
    expect(onTranscript).toHaveBeenCalledWith('Buy fresh bread', false);

    // Simulate utterance end on mobile
    instance.onend();

    // Should gracefully complete with confirmation and call onEnd, NOT restart!
    expect(onStatusChange).toHaveBeenCalledWith('✨ Voice input captured!');
    expect(onEnd).toHaveBeenCalled();
    expect(startMock).toHaveBeenCalledTimes(1); // Crucial: did NOT call start() again!

    delete window.SpeechRecognition;
  });
});

