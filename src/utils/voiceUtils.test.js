import { formatSpokenPunctuation, mergeBaseAndTranscript, processVoiceCommands } from './voiceUtils';

describe('voiceUtils - formatSpokenPunctuation', () => {
  test('formats spoken punctuation correctly', () => {
    expect(formatSpokenPunctuation('buy milk full stop call John comma tomorrow')).toBe('buy milk. call John, tomorrow');
    expect(formatSpokenPunctuation('is task done question mark yes exclamation mark')).toBe('is task done? yes!');
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
    expect(mergeBaseAndTranscript('Buy milk', 'buy milk tomorrow')).toBe('buy milk tomorrow');
    expect(mergeBaseAndTranscript('Call John', 'Call John tomorrow morning')).toBe('Call John tomorrow morning');
  });

  test('prevents duplication when speech overlaps with suffix of base', () => {
    expect(mergeBaseAndTranscript('Buy milk', 'milk tomorrow')).toBe('Buy milk tomorrow');
    expect(mergeBaseAndTranscript('Call John tomorrow', 'tomorrow at 9am')).toBe('Call John tomorrow at 9am');
  });

  test('concatenates non-overlapping speech cleanly', () => {
    expect(mergeBaseAndTranscript('Buy milk', 'tomorrow')).toBe('Buy milk tomorrow');
  });
});

describe('voiceUtils - processVoiceCommands', () => {
  test('handles spoken deletion commands (delete last word, scratch that)', () => {
    expect(processVoiceCommands('buy milk and bread scratch that wholemeal').text).toBe('buy milk and wholemeal');
    expect(processVoiceCommands('call John tomorrow delete last word').text).toBe('call John');
    expect(processVoiceCommands('buy milk and bread delete last 2 words').text).toBe('buy milk');
    expect(processVoiceCommands('buy milk clear all').text).toBe('');
  });

  test('detects spoken auto-submit commands (add task)', () => {
    const res1 = processVoiceCommands('Buy fresh organic sourdough bread add task');
    expect(res1.text).toBe('Buy fresh organic sourdough bread');
    expect(res1.isSubmitCommand).toBe(true);

    const res2 = processVoiceCommands('Call Mary tomorrow at 9am submit task');
    expect(res2.text).toBe('Call Mary tomorrow at 9am');
    expect(res2.isSubmitCommand).toBe(true);
  });
});
