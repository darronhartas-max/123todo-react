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
 * - "buy milk full stop call John comma tomorrow" -> "buy milk. Call John, tomorrow"
 * - "is task done question mark yes exclamation mark" -> "is task done? Yes!"
 */
export const formatSpokenPunctuation = (text) => {
  if (!text || typeof text !== 'string') return text;

  let formatted = text
    // Spoken punctuation replacements (handles singular, plural, variations)
    .replace(/\b(full\s*stops?|fullstop|period|dot)\b/gi, '.')
    .replace(/\b(commas?)\b/gi, ',')
    .replace(/\b(question\s*marks?|questionmark)\b/gi, '?')
    .replace(/\b(exclamation\s*(marks?|points?)|exclamationmark|exclamationpoint)\b/gi, '!')
    .replace(/\b(colons?)\b/gi, ':')
    .replace(/\b(semi\s*colons?|semicolon|semi-colon)\b/gi, ';')
    .replace(/\b(new\s*lines?|newlines?|new\s*paragraphs?|paragraphs?)\b/gi, '\n')
    .replace(/\b(dash|hyphen)\b/gi, ' - ');

  // Fix spacing around punctuation: remove space before punctuation marks, ensure space after punctuation marks if followed by text
  formatted = formatted
    .replace(/\s+([.,?!:;])/g, '$1')
    .replace(/([.,?!:;])(?=[a-zA-Z0-9])/g, '$1 ');

  // Auto-capitalize the first letter following sentence-ending punctuation (. ? !)
  formatted = formatted.replace(/([.?!]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());

  return formatted;
};

/**
 * Intelligently merges baseText and speech transcript avoiding duplicate words or repeated prefixes.
 * Handles punctuation differences, case sensitivity, and word overlaps.
 */
export const mergeBaseAndTranscript = (baseText, speechText) => {
  const base = (baseText || '').trim();
  const speech = (speechText || '').trim();

  if (!base) return speech;
  if (!speech) return base;

  // Extract clean alphanumeric words for comparison alongside original raw tokens
  const baseRawWords = base.split(/\s+/);
  const speechRawWords = speech.split(/\s+/);

  const baseCleanWords = baseRawWords.map(w => w.toLowerCase().replace(/[^a-z0-9]/gi, ''));
  const speechCleanWords = speechRawWords.map(w => w.toLowerCase().replace(/[^a-z0-9]/gi, ''));

  const baseCleanList = baseCleanWords.filter(Boolean);
  const speechCleanList = speechCleanWords.filter(Boolean);

  if (speechCleanList.length === 0) {
    // speechText consists only of punctuation marks or symbols (e.g. '.', ',', '?', '!', '\n')
    // Append punctuation cleanly if base doesn't already end with punctuation
    const punc = speech.replace(/\s+/g, '');
    if (!punc) return base;
    if (/[.,?!:;]$/.test(base) && /[.,?!:;]/.test(punc)) {
      return base;
    }
    if (base.endsWith(punc)) {
      return base;
    }
    return `${base}${punc}`;
  }
  if (baseCleanList.length === 0) return speech;

  const baseCleanStr = baseCleanList.join(' ');
  const speechCleanStr = speechCleanList.join(' ');

  // Helper to get raw speech words after skipping `cleanCount` non-empty clean words
  const sliceSpeechRawAfterCleanCount = (cleanCount) => {
    let seen = 0;
    let idx = 0;
    for (; idx < speechCleanWords.length; idx++) {
      if (speechCleanWords[idx]) {
        seen++;
        if (seen === cleanCount) {
          idx++;
          break;
        }
      }
    }
    return speechRawWords.slice(idx);
  };

  // Helper to append remaining speech words to base with clean spacing
  const combineBaseAndRemainingSpeech = (baseStr, remainingSpeechWords) => {
    if (!remainingSpeechWords || remainingSpeechWords.length === 0) {
      return baseStr;
    }
    const remainingText = remainingSpeechWords.join(' ');
    const separator = baseStr.endsWith(' ') ? '' : ' ';
    let result = `${baseStr}${separator}${remainingText}`.trim();
    return result.replace(/\s+/g, ' ').replace(/\s+([.,?!:;])/g, '$1');
  };

  // Case 1: Speech starts with base (normalized)
  if (speechCleanStr.startsWith(baseCleanStr)) {
    const remainingRaw = sliceSpeechRawAfterCleanCount(baseCleanList.length);
    return combineBaseAndRemainingSpeech(base, remainingRaw);
  }

  // Case 2: Base starts with speech (normalized) - speech is already contained in base
  if (baseCleanStr.startsWith(speechCleanStr)) {
    return base;
  }

  // Case 3: Suffix of base matches Prefix of speech (word overlap)
  let maxOverlap = 0;
  const maxCheck = Math.min(baseCleanList.length, speechCleanList.length);

  for (let len = 1; len <= maxCheck; len++) {
    const baseSuffix = baseCleanList.slice(baseCleanList.length - len).join(' ');
    const speechPrefix = speechCleanList.slice(0, len).join(' ');
    if (baseSuffix === speechPrefix) {
      maxOverlap = len;
    }
  }

  if (maxOverlap > 0) {
    const remainingRaw = sliceSpeechRawAfterCleanCount(maxOverlap);
    return combineBaseAndRemainingSpeech(base, remainingRaw);
  }

  // Case 4: Standard clean concatenation
  const separator = base.endsWith(' ') ? '' : ' ';
  return `${base}${separator}${speech}`;
};

/**
 * Processes spoken deletion commands ("delete last word", "scratch that", "delete last 3 words", "clear all")
 * and auto-submit commands ("add task", "add note", "submit task", "save note", etc.).
 */
export const processVoiceCommands = (text) => {
  if (!text || typeof text !== 'string') return { text: '', isSubmitCommand: false };

  let processed = text;
  let isSubmitCommand = false;

  // 1. Check for spoken submit command ("add task", "add note", "add a note", "add a task", "submit task", "save note", "create task", "add new note", "add new task", etc.)
  // Matches action verbs: add, ad, at, and, had, create, save, submit, finish, done, complete
  // Optional determiners: a, an, the, this, my, new
  // Noun targets: task, tax, text, note, node, noat, know
  const submitRegex = /\b(add|ad|at|and|had|create|save|submit|finish|done|complete)\s*(a|an|the|this|my|new)?\s*(task|tax|text|note|node|noat|know)\b/gi;
  
  // Standalone submit triggers anywhere at the end of speech (e.g. "... buy milk submit", "... save note", "... add task.", "... finish")
  const endSubmitRegex = /\b(add\s*task|add\s*note|submit\s*task|submit\s*note|save\s*task|save\s*note|create\s*task|create\s*note|submit|save|finish|done|complete)\b[.,?!]*$/gi;

  if (submitRegex.test(processed) || endSubmitRegex.test(processed)) {
    isSubmitCommand = true;
    processed = processed.replace(submitRegex, '').replace(endSubmitRegex, '').trim();

    // Clean up trailing punctuation or separators left after stripping command
    processed = processed.replace(/[,:;\s]+$/, '').trim();

    // Add full stop at end of sentence if no terminal punctuation exists and processed text is non-empty
    if (processed.length > 0 && !/[.,?!]$/.test(processed)) {
      processed += '.';
    }
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
 * Maintains continuous dictation across silence pauses and handles regional language accents.
 */
export const startVoiceDictation = ({
  initialText = '',
  onTranscript,
  onStatusChange,
  onEnd,
  lang
}) => {
  if (!isSpeechRecognitionSupported()) {
    onStatusChange('Voice input is not supported in this browser.');
    setTimeout(() => onStatusChange(''), 4000);
    return null;
  }

  const baseText = (initialText || '').trim();
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let isActive = true;
  let restartCount = 0;
  let lastRestartTime = Date.now();
  let currentSessionBaseText = baseText;
  let lastEmittedText = baseText;

  const createAndStartRecognition = () => {
    if (!isActive) return;

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = lang || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

      recognition.onstart = () => {
        onStatusChange('Listening...');
      };

      recognition.onresult = (event) => {
        let cleanFinal = '';
        let cleanInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (!res || !res[0]) continue;
          const rawChunk = res[0].transcript;
          const formattedChunk = formatSpokenPunctuation(rawChunk).trim();
          if (!formattedChunk) continue;

          if (res.isFinal) {
            cleanFinal = mergeBaseAndTranscript(cleanFinal, formattedChunk);
          } else {
            cleanInterim = mergeBaseAndTranscript(cleanInterim, formattedChunk);
          }
        }

        let currentSpeech = mergeBaseAndTranscript(cleanFinal, cleanInterim);
        let combined = mergeBaseAndTranscript(currentSessionBaseText, currentSpeech);

        const { text: processedText, isSubmitCommand } = processVoiceCommands(combined);
        let finalText = processedText;

        if (finalText.length > 0) {
          finalText = finalText.charAt(0).toUpperCase() + finalText.slice(1);
        }

        if (isSubmitCommand) {
          isActive = false;
        }

        lastEmittedText = finalText;
        onTranscript(finalText, isSubmitCommand);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isActive = false;
          onStatusChange('⚠️ Microphone permission denied.');
          setTimeout(() => onStatusChange(''), 4000);
          if (onEnd) onEnd();
        } else if (event.error === 'no-speech') {
          onStatusChange('🎙️ Listening... (Paused - keep speaking)');
        } else if (event.error === 'aborted') {
          // Aborted manually or by stop()
        } else {
          onStatusChange(`Voice status: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (isActive) {
          const now = Date.now();
          if (now - lastRestartTime < 1000) {
            restartCount++;
          } else {
            restartCount = 0;
          }
          lastRestartTime = now;

          if (restartCount < 10) {
            try {
              currentSessionBaseText = lastEmittedText;
              createAndStartRecognition();
              return;
            } catch (e) {
              console.warn('Failed to restart speech recognition:', e);
            }
          }
        }

        onStatusChange('✨ Voice input captured!');
        setTimeout(() => onStatusChange(''), 3000);
        if (onEnd) onEnd();
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to initialize speech recognition:', e);
      isActive = false;
      onStatusChange('Voice recognition error.');
      setTimeout(() => onStatusChange(''), 3000);
      if (onEnd) onEnd();
    }
  };

  createAndStartRecognition();

  return {
    stop: () => {
      isActive = false;
      if (recognition) {
        try { recognition.stop(); } catch {}
      }
    }
  };
};
