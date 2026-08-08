import { formatSpokenPunctuation, mergeBaseAndTranscript } from './voiceUtils';

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
