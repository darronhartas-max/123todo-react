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
 * Processes spoken deletion commands ("delete last word", "scratch that", "delete last 3 words", "clear all")
 * and auto-submit commands ("add task", "submit task", "save task").
 */
export const processVoiceCommands = (text) => {
  if (!text || typeof text !== 'string') return { text: '', isSubmitCommand: false };

  let processed = text;
  let isSubmitCommand = false;

  // 1. Check for spoken submit command ("add task", "submit task", "save task")
  const submitRegex = /\b(add\s*task|submit\s*task|save\s*task)\b/gi;
  if (submitRegex.test(processed)) {
    isSubmitCommand = true;
    processed = processed.replace(submitRegex, '').trim();
  }

  // 2. Check for "clear all" or "delete all"
  const clearAllRegex = /\b(clear\s*all|delete\s*all)\b/gi;
  if (clearAllRegex.test(processed)) {
    return { text: '', isSubmitCommand: false };
  }

  // 3. Process "delete last N words" (e.g., "delete last 2 words", "delete last 3 words")
  const deleteNRegex = /\bdelete\s+last\s+(\d+|one|two|three|four|five)\s+words?\b/gi;
  processed = processed.replace(deleteNRegex, (match, numStr) => {
    const wordMap = { one: 1, two: 2, three: 3, four: 4, five: 5 };
    const count = parseInt(numStr, 10) || wordMap[numStr.toLowerCase()] || 1;
    return `__DEL_${count}__`;
  });

  // 4. Process "delete last word", "scratch that", "undo that"
  processed = processed.replace(/\b(delete\s+last\s+word|scratch\s+that|undo\s+that)\b/gi, '__DEL_1__');

  // Perform deletion of previous N words for each __DEL_N__ marker
  while (processed.includes('__DEL_')) {
    const matchPos = processed.indexOf('__DEL_');
    const markerMatch = processed.match(/__DEL_(\d+)__/);
    if (!markerMatch) break;
    const numToDelete = parseInt(markerMatch[1], 10) || 1;
    const beforeMarker = processed.substring(0, matchPos).trim();
    const afterMarker = processed.substring(matchPos + markerMatch[0].length).trim();

    const words = beforeMarker.split(/\s+/).filter(Boolean);
    const remainingWords = words.slice(0, Math.max(0, words.length - numToDelete));
    const newBefore = remainingWords.join(' ');

    processed = newBefore ? (afterMarker ? `${newBefore} ${afterMarker}` : newBefore) : afterMarker;
  }

  return { text: processed, isSubmitCommand };
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
      onStatusChange('🎙️ Listening... Speak naturally (supports punctuation, "delete last word", & "add task")');
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

      // Process spoken editing & auto-submit commands
      const { text: processedText, isSubmitCommand } = processVoiceCommands(combined);
      let finalText = processedText;

      // Capitalize first letter of output
      if (finalText.length > 0) {
        finalText = finalText.charAt(0).toUpperCase() + finalText.slice(1);
      }

      onTranscript(finalText, isSubmitCommand);
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
