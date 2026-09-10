import { formatSpokenPunctuation, mergeBaseAndTranscript, processVoiceCommands, isMobileDevice, startVoiceDictation, processSpellingConstructs } from './voiceUtils';

describe('voiceUtils - formatSpokenPunctuation', () => {
  test('formats spoken punctuation and capitalizes sentences correctly', () => {
    expect(formatSpokenPunctuation('buy milk full stop call John comma tomorrow')).toBe('buy milk. Call John, tomorrow');
    expect(formatSpokenPunctuation('buy milk fullstop call John comma tomorrow')).toBe('buy milk. Call John, tomorrow');
    expect(formatSpokenPunctuation('buy milk dot call John')).toBe('buy milk. Call John');
    expect(formatSpokenPunctuation('is task done question mark yes exclamation mark')).toBe('is task done? Yes!');
    expect(formatSpokenPunctuation('is task done questionmark yes exclamationpoint')).toBe('is task done? Yes!');
    expect(formatSpokenPunctuation('first thought new paragraph second thought')).toBe('first thought\n\nsecond thought');
    expect(formatSpokenPunctuation('to do list bullet point buy milk')).toBe('to do list\n- buy milk');
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

  test('does not drop words when sentences share phrases or start with same words', () => {
    expect(mergeBaseAndTranscript('Inspect the radiator in bedroom one.', 'Inspect the radiator in bedroom two.'))
      .toBe('Inspect the radiator in bedroom one. Inspect the radiator in bedroom two.');
    expect(mergeBaseAndTranscript('Check the roof and walls.', 'Check the windows.'))
      .toBe('Check the roof and walls. Check the windows.');
    expect(mergeBaseAndTranscript('Call John on his mobile.', 'His mobile is not answering.'))
      .toBe('Call John on his mobile. His mobile is not answering.');
  });
});

describe('voiceUtils - processVoiceCommands', () => {
  test('handles spoken deletion commands (delete last word, scratch that)', () => {
    expect(processVoiceCommands('buy milk and bread scratch that wholemeal').text).toBe('buy milk and wholemeal');
    expect(processVoiceCommands('call John tomorrow delete last word').text).toBe('call John');
    expect(processVoiceCommands('call John tomorrow delete the last word').text).toBe('call John');
    expect(processVoiceCommands('buy milk clear all').text).toBe('');
  });

  test('handles spoken N words deletion with all natural phrasing variations', () => {
    // "delete the last 2 words" vs "delete last 2 words"
    expect(processVoiceCommands('buy milk and bread delete last 2 words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete the last 2 words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete the last two words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete last two words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete 2 words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete two words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete the last two').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete last two').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete last 2').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete the last 2').text).toBe('buy milk');

    // With attached period (e.g. from speech engine)
    expect(processVoiceCommands('buy milk and bread delete last 2 words.').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete the last 2 words.').text).toBe('buy milk');

    // Homophones ("to", "too")
    expect(processVoiceCommands('buy milk and bread delete last to words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete the last too words').text).toBe('buy milk');

    // Synonyms ("remove", "scratch", "erase", "undo", "couple", "few")
    expect(processVoiceCommands('buy milk and bread remove the last 2 words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread scratch the last two words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread erase last 2 words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete the last couple of words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk and bread delete last couple words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk bread and eggs delete a few words').text).toBe('buy milk');
  });

  test('handles spoken sentence and line deletion commands (delete last sentence, delete last line)', () => {
    expect(processVoiceCommands('Buy milk and bread. Call John tomorrow delete last sentence').text).toBe('Buy milk and bread.');
    expect(processVoiceCommands('Buy milk and bread. Call John tomorrow delete the last sentence').text).toBe('Buy milk and bread.');
    expect(processVoiceCommands('Buy milk and bread. Call John tomorrow. scratch last sentence').text).toBe('Buy milk and bread.');
    expect(processVoiceCommands('Buy milk and bread. Call John tomorrow. scratch the last sentence').text).toBe('Buy milk and bread.');
    expect(processVoiceCommands('Call John tomorrow delete last sentence').text).toBe('');
    expect(processVoiceCommands('Call John tomorrow delete the last sentence').text).toBe('');
    expect(processVoiceCommands('First line\nSecond line delete last line').text).toBe('First line');
    expect(processVoiceCommands('First line\nSecond line delete the last line').text).toBe('First line');
  });

  test('handles spoken word replacement commands (change last word to, replace X with Y)', () => {
    expect(processVoiceCommands('Meeting with Jon change last word to John').text).toBe('Meeting with John');
    expect(processVoiceCommands('Buy organic melk. replace last word with milk').text).toBe('Buy organic milk.');
    expect(processVoiceCommands('Call Dave tomorrow at noon change Dave to David').text).toBe('Call David tomorrow at noon');
    expect(processVoiceCommands('Buy apples and oranges replace apples with pears').text).toBe('Buy pears and oranges');
  });

  test('handles letter-by-letter spelling constructs (spell S M Y T H E, Rice spelled R H Y S)', () => {
    // Basic spelling letter-by-letter
    expect(processSpellingConstructs('Meet with Dr spell S M Y T H E tomorrow')).toBe('Meet with Dr Smythe tomorrow');
    expect(processSpellingConstructs('Book ticket for spell out D A R R O N')).toBe('Book ticket for Darron');

    // Spelled word replacing immediately preceding misheard word
    expect(processSpellingConstructs('Call Rice spelled R H Y S at 5pm')).toBe('Call Rhys at 5pm');
    expect(processSpellingConstructs('Meeting with Smith spelt S M Y T H E')).toBe('Meeting with Smythe');

    // "double [letter]" support
    expect(processSpellingConstructs('His name is spell A double N A')).toBe('His name is Anna');
    expect(processSpellingConstructs('Order spell C O double F E E')).toBe('Order Coffee');

    // All caps / acronyms
    expect(processSpellingConstructs('Work on spell all caps N A S A project')).toBe('Work on NASA project');
    expect(processSpellingConstructs('Support spell H T M L formatting')).toBe('Support HTML formatting');

    // NATO phonetic alphabet support
    expect(processSpellingConstructs('Client is spell Sierra Mike Yankee Tango Hotel Echo')).toBe('Client is Smythe');

    // Hyphenated letters (e.g. S-M-Y-T-H-E)
    expect(processSpellingConstructs('Call spell S-M-Y-T-H-E today')).toBe('Call Smythe today');

    // Dotted letter transcriptions from speech engine (e.g. S. M. Y. T. H. E.)
    expect(processSpellingConstructs('Doctor is spell S. M. Y. T. H. E.')).toBe('Doctor is Smythe.');

    // Composition through processVoiceCommands
    expect(processVoiceCommands('Meeting with Jon change last word to spell J O H N').text).toBe('Meeting with John');

    // Non-spelling phrases with "spell" must not be corrupted
    expect(processSpellingConstructs('How do you spell that')).toBe('How do you spell that');
    expect(processSpellingConstructs('I can spell words')).toBe('I can spell words');
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

  test('startVoiceDictation keeps listening across brief pauses without requiring user to touch record button', () => {
    jest.useFakeTimers();

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

    // Start voice dictation with 20s silence timeout
    const rec = startVoiceDictation({
      initialText: '',
      onTranscript,
      onStatusChange,
      onEnd,
      silenceTimeout: 20000
    });

    expect(rec).not.toBeNull();
    expect(startMock).toHaveBeenCalledTimes(1);

    // Simulate transcript received for first phrase
    instance.onresult({
      results: [
        [{ transcript: 'Buy fresh bread' }]
      ]
    });
    expect(onTranscript).toHaveBeenCalledWith('Buy fresh bread', false);

    // User stops talking for 2-3 seconds, browser speech recognition fires onend
    instance.onend();

    // Within 50ms, the engine smoothly re-initializes so mic is listening when user speaks again
    jest.advanceTimersByTime(100);

    expect(startMock).toHaveBeenCalledTimes(2);
    expect(onEnd).not.toHaveBeenCalled();

    // User starts talking again without touching the record button
    instance.onresult({
      results: [
        [{ transcript: 'and organic milk' }]
      ]
    });
    expect(onTranscript).toHaveBeenCalledWith('Buy fresh bread and organic milk', false);

    // User explicitly stops listening (e.g. taps button to finish)
    rec.stop();

    expect(onStatusChange).toHaveBeenCalledWith('✨ Voice input captured!');
    expect(onEnd).toHaveBeenCalled();

    delete window.SpeechRecognition;
    jest.useRealTimers();
  });

  test('startVoiceDictation keeps listening continuously and does not shut down prematurely after 4s pause', () => {
    jest.useFakeTimers();

    const originalUserAgent = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      configurable: true
    });

    const startMock = jest.fn();
    let instance = null;

    class MockSpeechRecognition {
      constructor() {
        this.continuous = true;
        this.interimResults = true;
        this.start = startMock;
        this.stop = jest.fn();
        this.abort = jest.fn();
        instance = this;
      }
    }

    window.SpeechRecognition = MockSpeechRecognition;

    const onTranscript = jest.fn();
    const onStatusChange = jest.fn();
    const onEnd = jest.fn();

    const rec = startVoiceDictation({
      initialText: '',
      onTranscript,
      onStatusChange,
      onEnd,
      silenceTimeout: 25000
    });

    expect(rec).not.toBeNull();
    expect(startMock).toHaveBeenCalledTimes(1);

    // Simulate transcript received for first 4 seconds of talking
    instance.onresult({
      results: [
        [{ transcript: 'Pick up laundry' }]
      ]
    });
    expect(onTranscript).toHaveBeenCalledWith('Pick up laundry', false);

    // Browser speech engine concludes an utterance on pause (~4s)
    instance.onend();

    // Does NOT shut down! Instead, restarts listening smoothly
    expect(onEnd).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(startMock).toHaveBeenCalledTimes(2);

    // User continues speaking their note
    instance.onresult({
      results: [
        [{ transcript: 'and call the plumber' }]
      ]
    });
    expect(onTranscript).toHaveBeenCalledWith('Pick up laundry and call the plumber', false);

    // Explicit stop by user
    rec.stop();
    expect(onEnd).toHaveBeenCalledTimes(1);

    delete window.SpeechRecognition;
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
    jest.useRealTimers();
  });
});

