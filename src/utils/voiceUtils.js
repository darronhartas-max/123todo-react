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
    .replace(/\s*\b(new\s*paragraphs?|next\s*paragraphs?)\b\s*/gi, '\n\n')
    .replace(/\s*\b(new\s*lines?|newlines?|next\s*lines?)\b\s*/gi, '\n')
    .replace(/\s*\b(bullet\s*points?|bullet)\b\s*/gi, '\n- ')
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
 * Intelligently merges baseText and speechText avoiding duplicate words, repeated sentences, or repeated prefixes.
 * Handles punctuation differences, case sensitivity, and sub-sequence overlaps.
 */
export const mergeBaseAndTranscript = (baseText, speechText) => {
  const base = (baseText || '').trim();
  const speech = (speechText || '').trim();

  if (!base) return speech;
  if (!speech) return base;

  // Extract raw words and clean alphanumeric tokens for comparison
  const baseRawWords = base.split(/\s+/);
  const speechRawWords = speech.split(/\s+/);

  const cleanWord = (w) => w.toLowerCase().replace(/[^a-z0-9]/gi, '');

  const baseCleanWords = baseRawWords.map(cleanWord);
  const speechCleanWords = speechRawWords.map(cleanWord);

  const baseCleanList = baseCleanWords.filter(Boolean);
  const speechCleanList = speechCleanWords.filter(Boolean);

  if (speechCleanList.length === 0) {
    // Only punctuation / whitespace in speechText
    const punc = speech.replace(/\s+/g, '');
    if (!punc) return base;
    if (/[.,?!:;]$/.test(base) && /[.,?!:;]/.test(punc)) return base;
    if (base.endsWith(punc)) return base;
    return `${base}${punc}`;
  }

  if (baseCleanList.length === 0) return speech;

  const baseCleanStr = baseCleanList.join(' ');
  const speechCleanStr = speechCleanList.join(' ');

  // 1. Exact match or speech is completely contained within base
  if (baseCleanStr === speechCleanStr) return base;

  // Helper to slice raw speech words after cleanCount non-empty clean words
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

  // Helper to combine base and remaining speech words
  const combineBaseAndRemainingSpeech = (baseStr, remainingSpeechWords) => {
    if (!remainingSpeechWords || remainingSpeechWords.length === 0) return baseStr;
    const remainingText = remainingSpeechWords.join(' ');
    const separator = baseStr.endsWith(' ') ? '' : ' ';
    let result = `${baseStr}${separator}${remainingText}`.trim();
    return result.replace(/\s+/g, ' ').replace(/\s+([.,?!:;])/g, '$1');
  };

  // 2. Speech starts with Base (base is a prefix of speech)
  if (speechCleanStr.startsWith(baseCleanStr)) {
    const remainingRaw = sliceSpeechRawAfterCleanCount(baseCleanList.length);
    return combineBaseAndRemainingSpeech(base, remainingRaw);
  }

  // 3. Base contains speech completely (speech is a sub-phrase or duplicate sentence of base)
  if (baseCleanStr.includes(speechCleanStr)) {
    return base;
  }

  // 4. Suffix of base matches Prefix of speech (standard overlap at boundary)
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

  // 5. Advanced: Check if speech shares a sub-segment overlap with base ending near the end of base
  for (let len = speechCleanList.length; len >= 1; len--) {
    const speechPrefix = speechCleanList.slice(0, len).join(' ');
    const pos = baseCleanStr.lastIndexOf(speechPrefix);
    if (pos !== -1) {
      if (pos + speechPrefix.length >= baseCleanStr.length - 10 || pos + speechPrefix.length === baseCleanStr.length) {
        const remainingRaw = sliceSpeechRawAfterCleanCount(len);
        return combineBaseAndRemainingSpeech(base, remainingRaw);
      }
    }
  }

  // 6. Sentence-Level Deduplication: Check if speech contains sentences already in base
  const speechSentences = speech.split(/(?<=[.?!])\s+/).filter(Boolean);
  const filteredSpeechSentences = speechSentences.filter(s => {
    const sClean = s.split(/\s+/).map(cleanWord).filter(Boolean).join(' ');
    if (!sClean) return false;
    return !baseCleanStr.includes(sClean);
  });

  if (filteredSpeechSentences.length < speechSentences.length) {
    if (filteredSpeechSentences.length === 0) {
      return base;
    }
    const deduplicatedSpeech = filteredSpeechSentences.join(' ');
    const separator = base.endsWith(' ') ? '' : ' ';
    return `${base}${separator}${deduplicatedSpeech}`;
  }

  // 7. Fallback standard concatenation with clean spacing
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

  // 3. Process "change last word to [X]" / "replace last word with [X]" / "correct last word to [X]"
  const replaceLastWordRegex = /\b(change|replace|correct)\s+(the\s+)?last\s+word\s+(to|with)\s+([a-zA-Z0-9'-]+)\b[.,?!]*/gi;
  let match;
  while ((match = replaceLastWordRegex.exec(processed)) !== null) {
    const matchPos = match.index;
    const replacementWord = match[4];
    const beforeMatch = processed.substring(0, matchPos).trim();
    const afterMatch = processed.substring(matchPos + match[0].length).trim();

    const words = beforeMatch.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      const puncMatch = lastWord.match(/([.,?!:;]+)$/);
      const trailingPunc = puncMatch ? puncMatch[1] : '';
      words[words.length - 1] = replacementWord + trailingPunc;
      const newBefore = words.join(' ');
      processed = newBefore ? (afterMatch ? `${newBefore} ${afterMatch}` : newBefore) : afterMatch;
    } else {
      processed = replacementWord + (afterMatch ? ` ${afterMatch}` : '');
    }
    replaceLastWordRegex.lastIndex = 0;
  }

  // 4. Process "change [wordA] to [wordB]" / "replace [wordA] with [wordB]"
  const replaceWordRegex = /\b(change|replace|correct)\s+([a-zA-Z0-9'-]+)\s+(to|with)\s+([a-zA-Z0-9'-]+)\b[.,?!]*/gi;
  while ((match = replaceWordRegex.exec(processed)) !== null) {
    const wordA = match[2];
    const wordB = match[4];
    // Skip if wordA is a reserved keyword in other commands
    if (/^(the|last|sentence|line|word|words|paragraph|all)$/i.test(wordA)) {
      break;
    }
    const matchPos = match.index;
    const beforeMatch = processed.substring(0, matchPos);
    const afterMatch = processed.substring(matchPos + match[0].length).trim();

    // Replace the last occurrence of wordA in beforeMatch (case-insensitive)
    const wordARegex = new RegExp(`\\b${wordA}\\b(?=[^\\b]*$)`, 'i');
    if (wordARegex.test(beforeMatch)) {
      const newBefore = beforeMatch.replace(wordARegex, wordB).trim();
      processed = newBefore ? (afterMatch ? `${newBefore} ${afterMatch}` : newBefore) : afterMatch;
    }
    replaceWordRegex.lastIndex = 0;
  }

  // 5. Process "delete last sentence" / "scratch last sentence" / "delete sentence" / "undo sentence"
  const deleteSentenceRegex = /\b(delete|scratch|remove|undo)\s+(the\s+|last\s+)?sentence\b[.,?!]*/gi;
  while ((match = deleteSentenceRegex.exec(processed)) !== null) {
    const matchPos = match.index;
    const beforeMatch = processed.substring(0, matchPos).trim();
    const afterMatch = processed.substring(matchPos + match[0].length).trim();

    const trimmedBefore = beforeMatch.replace(/[.?!]+$/, '');
    const lastTerminatorIndex = Math.max(
      trimmedBefore.lastIndexOf('.'),
      trimmedBefore.lastIndexOf('?'),
      trimmedBefore.lastIndexOf('!')
    );

    let newBefore = '';
    if (lastTerminatorIndex !== -1) {
      newBefore = beforeMatch.substring(0, lastTerminatorIndex + 1).trim();
    }
    processed = newBefore ? (afterMatch ? `${newBefore} ${afterMatch}` : newBefore) : afterMatch;
    deleteSentenceRegex.lastIndex = 0;
  }

  // 6. Process "delete last line" / "scratch last line" / "delete line"
  const deleteLineRegex = /\b(delete|scratch|remove|undo)\s+(the\s+|last\s+)?line\b[.,?!]*/gi;
  while ((match = deleteLineRegex.exec(processed)) !== null) {
    const matchPos = match.index;
    const beforeMatch = processed.substring(0, matchPos);
    const afterMatch = processed.substring(matchPos + match[0].length).trim();

    const lastNewlineIndex = beforeMatch.lastIndexOf('\n');
    let newBefore = '';
    if (lastNewlineIndex !== -1) {
      newBefore = beforeMatch.substring(0, lastNewlineIndex).trimEnd();
    }
    processed = newBefore ? (afterMatch ? `${newBefore} ${afterMatch}` : newBefore) : afterMatch;
    deleteLineRegex.lastIndex = 0;
  }

  // 7. Process "delete last N words" (e.g., "delete last 2 words", "delete last 3 words")
  const deleteNRegex = /\bdelete\s+last\s+(\d+|one|two|three|four|five)\s+words?\b/gi;
  processed = processed.replace(deleteNRegex, (m, numStr) => {
    const wordMap = { one: 1, two: 2, three: 3, four: 4, five: 5 };
    const count = parseInt(numStr, 10) || wordMap[numStr.toLowerCase()] || 1;
    return `__DEL_${count}__`;
  });

  // 8. Process "delete last word", "scratch that", "undo that"
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
/**
 * Detects if the current client is a mobile or touch device.
 */
export const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
};

/**
 * Starts speech recognition and appends transcript to existing text.
 * Keeps listening across natural pauses until the user turns it off or a reasonable silence timeout passes (default 8s).
 * Handles regional language accents, punctuation formatting, and voice commands.
 */
export const startVoiceDictation = ({
  initialText = '',
  onTranscript,
  onStatusChange,
  onEnd,
  lang,
  continuous,
  silenceTimeout = 8000
}) => {
  if (!isSpeechRecognitionSupported()) {
    onStatusChange('Voice input is not supported in this browser.');
    setTimeout(() => onStatusChange(''), 4000);
    return null;
  }

  const isMobile = isMobileDevice();
  const isContinuous = continuous !== undefined ? continuous : !isMobile;

  const baseText = (initialText || '').trim();
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let isActive = true;
  let currentSessionBaseText = baseText;
  let lastEmittedText = baseText;
  let hadSpeech = false;
  let lastSpeechTime = Date.now();
  let silenceTimer = null;

  const resetSilenceTimer = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      if (isActive) {
        isActive = false;
        if (recognition) {
          try { recognition.abort(); } catch {}
          try { recognition.stop(); } catch {}
        }
        if (hadSpeech) {
          onStatusChange('✨ Voice input captured!');
        } else {
          onStatusChange('');
        }
        setTimeout(() => onStatusChange(''), 3000);
        if (onEnd) onEnd();
      }
    }, silenceTimeout);
  };

  const createAndStartRecognition = () => {
    if (!isActive) return;

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = isContinuous;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = lang || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

      recognition.onstart = () => {
        onStatusChange('🎙️ Listening... Speak naturally (tap button when done)');
        resetSilenceTimer();
      };

      recognition.onresult = (event) => {
        if (!isActive) return;

        let cleanFinal = '';
        let cleanInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (!res || !res[0]) continue;
          const rawChunk = res[0].transcript;
          const formattedChunk = formatSpokenPunctuation(rawChunk).trim();
          if (!formattedChunk) continue;

          hadSpeech = true;
          lastSpeechTime = Date.now();
          resetSilenceTimer();

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
          if (silenceTimer) clearTimeout(silenceTimer);
          if (recognition) {
            try { recognition.abort(); } catch {}
            try { recognition.stop(); } catch {}
          }
        }

        lastEmittedText = finalText;
        onTranscript(finalText, isSubmitCommand);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isActive = false;
          if (silenceTimer) clearTimeout(silenceTimer);
          onStatusChange('⚠️ Microphone permission denied.');
          setTimeout(() => onStatusChange(''), 4000);
          if (onEnd) onEnd();
        } else if (event.error === 'no-speech') {
          // Keep listening during pauses - don't cancel prematurely
          onStatusChange('🎙️ Listening... (Tap button when done)');
        } else if (event.error === 'aborted') {
          // Aborted manually or by stop()
        } else {
          onStatusChange(`Voice status: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (!isActive) return;

        const timeSinceSpeech = Date.now() - lastSpeechTime;

        // If the user hasn't spoken for silenceTimeout (e.g. 8s), finish dictation cleanly
        if (timeSinceSpeech >= silenceTimeout) {
          isActive = false;
          if (silenceTimer) clearTimeout(silenceTimer);
          if (hadSpeech) {
            onStatusChange('✨ Voice input captured!');
          } else {
            onStatusChange('');
          }
          setTimeout(() => onStatusChange(''), 3000);
          if (onEnd) onEnd();
          return;
        }

        // Otherwise, browser speech recognition closed due to a brief pause,
        // but the user is still in active dictation mode: smoothly reconnect to keep listening!
        try {
          currentSessionBaseText = lastEmittedText;
          createAndStartRecognition();
        } catch (e) {
          console.warn('Failed to restart speech recognition:', e);
          isActive = false;
          if (silenceTimer) clearTimeout(silenceTimer);
          if (onEnd) onEnd();
        }
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to initialize speech recognition:', e);
      isActive = false;
      if (silenceTimer) clearTimeout(silenceTimer);
      onStatusChange('Voice recognition error.');
      setTimeout(() => onStatusChange(''), 3000);
      if (onEnd) onEnd();
    }
  };

  createAndStartRecognition();

  return {
    stop: () => {
      isActive = false;
      if (silenceTimer) clearTimeout(silenceTimer);
      if (recognition) {
        try { recognition.abort(); } catch {}
        try { recognition.stop(); } catch {}
      }
      if (hadSpeech) {
        onStatusChange('✨ Voice input captured!');
      } else {
        onStatusChange('');
      }
      setTimeout(() => onStatusChange(''), 3000);
      if (onEnd) onEnd();
    }
  };
};
