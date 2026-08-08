/**
 * Utility functions for Voice Task & Voice Notes Input (Web Speech API)
 */

/**
 * Checks if the browser supports Speech Recognition
 */
export const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

/**
 * Maps spoken punctuation phrases to actual punctuation marks and formats spacing cleanly.
 * Examples:
 * - "buy milk full stop call John comma tomorrow" -> "buy milk. call John, tomorrow"
 * - "is task done question mark yes exclamation mark" -> "is task done? yes!"
 */
export const formatSpokenPunctuation = (text) => {
  if (!text || typeof text !== 'string') return text;

  let formatted = text
    // Spoken punctuation replacements
    .replace(/\b(full\s*stop|period)\b/gi, '.')
    .replace(/\b(comma)\b/gi, ',')
    .replace(/\b(question\s*mark)\b/gi, '?')
    .replace(/\b(exclamation\s*(mark|point))\b/gi, '!')
    .replace(/\b(colon)\b/gi, ':')
    .replace(/\b(semi\s*colon|semicolon)\b/gi, ';')
    .replace(/\b(new\s*line|newline)\b/gi, '\n')
    .replace(/\b(dash|hyphen)\b/gi, ' - ');

  // Fix spacing around punctuation: remove space before punctuation marks, ensure space after punctuation marks if followed by text
  formatted = formatted
    .replace(/\s+([.,?!:;])/g, '$1')
    .replace(/([.,?!:;])(?=[a-zA-Z0-9])/g, '$1 ');

  return formatted;
};

/**
 * Intelligently merges baseText and speech transcript avoiding duplicate words or repeated prefixes.
 */
export const mergeBaseAndTranscript = (baseText, speechText) => {
  const base = (baseText || '').trim();
  const speech = (speechText || '').trim();

  if (!base) return speech;
  if (!speech) return base;

  const baseLower = base.toLowerCase();
  const speechLower = speech.toLowerCase();

  // Case 1: Speech transcript already starts with baseText
  if (speechLower.startsWith(baseLower)) {
    return speech;
  }

  // Case 2: baseText starts with speech transcript
  if (baseLower.startsWith(speechLower)) {
    return base;
  }

  // Case 3: Word-level suffix / prefix overlap check
  const baseWords = base.split(/\s+/);
  const speechWords = speech.split(/\s+/);

  let maxOverlapWords = 0;
  const maxCheck = Math.min(baseWords.length, speechWords.length);

  for (let len = 1; len <= maxCheck; len++) {
    const baseSuffix = baseWords.slice(baseWords.length - len).join(' ').toLowerCase();
    const speechPrefix = speechWords.slice(0, len).join(' ').toLowerCase();
    if (baseSuffix === speechPrefix) {
      maxOverlapWords = len;
    }
  }

  if (maxOverlapWords > 0) {
    const remainingSpeech = speechWords.slice(maxOverlapWords).join(' ');
    return remainingSpeech ? `${base} ${remainingSpeech}` : base;
  }

  // Case 4: Standard clean concatenation
  return `${base} ${speech}`;
};

/**
 * Starts continuous speech recognition and appends transcript to existing text.
 * Uses a locked final-transcript buffer so pauses/stalls while thinking NEVER delete or overwrite existing text.
 */
export const startVoiceDictation = ({
  initialText = '',
  onTranscript,
  onStatusChange,
  onEnd
}) => {
  if (!isSpeechRecognitionSupported()) {
    onStatusChange('Voice input is not supported in this browser.');
    setTimeout(() => onStatusChange(''), 4000);
    return null;
  }

  const baseText = (initialText || '').trim();
  let isActive = true;

  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Continuous dictation across pauses
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      onStatusChange('🎙️ Listening... Speak naturally (appends & supports "full stop", "comma", etc.)');
    };

    recognition.onresult = (event) => {
      let sessionFinal = '';
      let sessionInterim = '';

      for (let i = 0; i < event.results.length; ++i) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sessionFinal += transcriptChunk + ' ';
        } else {
          sessionInterim += transcriptChunk;
        }
      }

      // Format spoken punctuation for final & interim
      const cleanFinal = formatSpokenPunctuation(sessionFinal).trim();
      const cleanInterim = formatSpokenPunctuation(sessionInterim).trim();

      // Combine final & interim speech
      let speechText = cleanFinal;
      if (cleanInterim) {
        speechText = speechText ? `${speechText} ${cleanInterim}` : cleanInterim;
      }

      // Smart merge base text + speech transcript (prevents all text duplication)
      let combined = mergeBaseAndTranscript(baseText, speechText);

      // Capitalize first letter of output
      if (combined.length > 0) {
        combined = combined.charAt(0).toUpperCase() + combined.slice(1);
      }

      onTranscript(combined);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        onStatusChange('⚠️ Microphone permission denied.');
      } else if (event.error === 'no-speech') {
        onStatusChange('No speech detected.');
      } else {
        onStatusChange(`Voice status: ${event.error}`);
      }
      setTimeout(() => onStatusChange(''), 4000);
      if (onEnd) onEnd();
    };

    recognition.onend = () => {
      if (isActive) {
        onStatusChange('✨ Voice input captured!');
        setTimeout(() => onStatusChange(''), 3000);
      }
      if (onEnd) onEnd();
    };

    recognition.start();

    // Return custom controller object with stop method
    return {
      stop: () => {
        isActive = false;
        try { recognition.stop(); } catch {}
      }
    };
  } catch (e) {
    console.error('Failed to start speech recognition:', e);
    onStatusChange('Voice recognition error.');
    setTimeout(() => onStatusChange(''), 3000);
    if (onEnd) onEnd();
    return null;
  }
};
