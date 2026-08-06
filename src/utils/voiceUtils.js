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
  let accumulatedFinal = '';
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
      let currentSessionFinal = '';
      let currentSessionInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentSessionFinal += transcriptChunk + ' ';
        } else {
          currentSessionInterim += transcriptChunk;
        }
      }

      if (currentSessionFinal) {
        accumulatedFinal += currentSessionFinal;
      }

      // Format spoken punctuation for accumulated final & current interim
      const cleanFinal = formatSpokenPunctuation(accumulatedFinal).trim();
      const cleanInterim = formatSpokenPunctuation(currentSessionInterim).trim();

      // Combine base text + confirmed final transcript + current interim speech
      let combined = baseText;

      if (cleanFinal) {
        combined = combined ? `${combined} ${cleanFinal}` : cleanFinal;
      }
      if (cleanInterim) {
        combined = combined ? `${combined} ${cleanInterim}` : cleanInterim;
      }

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
