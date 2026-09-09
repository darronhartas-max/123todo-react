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
 * NATO phonetic alphabet mapping for accurate spoken character transcription
 */
export const NATO_PHONETIC_MAP = {
  alpha: 'A', bravo: 'B', charlie: 'C', delta: 'D', echo: 'E',
  foxtrot: 'F', golf: 'G', hotel: 'H', india: 'I', juliet: 'J',
  juliett: 'J', kilo: 'K', lima: 'L', mike: 'M', november: 'N',
  oscar: 'O', papa: 'P', quebec: 'Q', romeo: 'R', sierra: 'S',
  tango: 'T', uniform: 'U', victor: 'V', whiskey: 'W',
  xray: 'X', 'x-ray': 'X', yankee: 'Y', zulu: 'Z'
};

/**
 * Parses spoken spelling constructs to build unusual words, names, and acronyms letter-by-letter.
 * Supports:
 * - "spell S M Y T H E" -> "Smythe"
 * - "spell out D A R R O N" -> "Darron"
 * - "Rice spelled R H Y S" -> "Rhys" (replaces previous misheard word with correct spelling)
 * - "spell A double N A" -> "Anna"
 * - "spell all caps N A S A" -> "NASA"
 * - "spell H T M L" -> "HTML" (acronyms automatically uppercase)
 * - "spell Sierra Mike Yankee Tango Hotel Echo" -> "Smythe" (NATO phonetic alphabet)
 */
export const processSpellingConstructs = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Triggers: "spell out", "spell", "spelled", "spelt", "spelling"
  const triggerRegex = /\b(spell\s*out|spelled|spelt|spelling|spell)\b/gi;

  let processed = text;
  let match;

  while ((match = triggerRegex.exec(processed)) !== null) {
    const triggerWord = match[1].toLowerCase();
    const matchIndex = match.index;
    const matchEnd = matchIndex + match[0].length;

    const afterText = processed.substring(matchEnd).trim();
    if (!afterText) break;

    // Check for optional "all caps" / "capital letters" / "uppercase"
    let forceAllCaps = false;
    let remainder = afterText;

    const allCapsMatch = remainder.match(/^(in\s+)?(all\s*caps|capital\s*letters|uppercase)\s+/i);
    if (allCapsMatch) {
      forceAllCaps = true;
      remainder = remainder.substring(allCapsMatch[0].length);
    }

    // Split remainder by whitespace into tokens
    const rawTokens = remainder.split(/\s+/);
    const letterList = [];
    let tokensConsumed = 0;

    for (let i = 0; i < rawTokens.length; i++) {
      const rawToken = rawTokens[i];
      const cleanToken = rawToken.replace(/[.,?!:;]+$/, '');
      const lower = cleanToken.toLowerCase();

      // Check for hyphenated letter sequence e.g. "S-M-Y-T-H-E"
      if (cleanToken.includes('-')) {
        const parts = cleanToken.split('-');
        if (parts.every(p => /^[a-z]$/i.test(p) || NATO_PHONETIC_MAP[p.toLowerCase()])) {
          for (const p of parts) {
            if (/^[a-z]$/i.test(p)) {
              letterList.push(p.toUpperCase());
            } else if (NATO_PHONETIC_MAP[p.toLowerCase()]) {
              letterList.push(NATO_PHONETIC_MAP[p.toLowerCase()]);
            }
          }
          tokensConsumed = i + 1;
          continue;
        }
      }

      // Check for "double [letter]"
      if (lower === 'double' && i + 1 < rawTokens.length) {
        const nextRaw = rawTokens[i + 1];
        const nextClean = nextRaw.replace(/[.,?!:;]+$/, '');
        const nextLower = nextClean.toLowerCase();

        let char = null;
        if (/^[a-z]$/i.test(nextClean)) {
          char = nextClean.toUpperCase();
        } else if (NATO_PHONETIC_MAP[nextLower]) {
          char = NATO_PHONETIC_MAP[nextLower];
        }

        if (char) {
          letterList.push(char, char);
          i++; // Skip the next token
          tokensConsumed = i + 1;
          continue;
        }
      }

      // Check for single letter (e.g. "S", "s", "S.")
      if (/^[a-z]$/i.test(cleanToken)) {
        letterList.push(cleanToken.toUpperCase());
        tokensConsumed = i + 1;
        continue;
      }

      // Check for NATO phonetic word (e.g. "Sierra", "Mike")
      if (NATO_PHONETIC_MAP[lower]) {
        letterList.push(NATO_PHONETIC_MAP[lower]);
        tokensConsumed = i + 1;
        continue;
      }

      // Stop collecting letters once a non-letter token is encountered
      break;
    }

    // Require at least one letter token (or 2 if trigger is just "spell" to prevent false positives)
    const minLetters = /^(spelled|spelt|spell\s*out)$/i.test(triggerWord) ? 1 : 2;
    if (letterList.length < minLetters) {
      continue;
    }

    // Determine casing of constructed word
    let constructedWord = letterList.join('');
    const hasVowels = /[AEIOUY]/.test(constructedWord);

    if (forceAllCaps || (!hasVowels && constructedWord.length <= 5)) {
      constructedWord = constructedWord.toUpperCase();
    } else {
      // Title Case: First letter uppercase, rest lowercase (e.g. Smythe, Rhys, Aaron)
      constructedWord = constructedWord.charAt(0).toUpperCase() + constructedWord.slice(1).toLowerCase();
    }

    // Check trailing punctuation on the last consumed token
    const lastConsumedRaw = rawTokens[tokensConsumed - 1];
    const trailingPuncMatch = lastConsumedRaw ? lastConsumedRaw.match(/([.,?!:;]+)$/) : null;
    if (trailingPuncMatch) {
      constructedWord += trailingPuncMatch[1];
    }

    const restOfSentence = rawTokens.slice(tokensConsumed).join(' ');
    let beforeTrigger = processed.substring(0, matchIndex).trimEnd();

    // If trigger is "spelled" or "spelt", replace the word immediately preceding it if present
    if (/^(spelled|spelt)$/i.test(triggerWord)) {
      const beforeWords = beforeTrigger.split(/\s+/).filter(Boolean);
      if (beforeWords.length > 0) {
        beforeWords.pop();
        beforeTrigger = beforeWords.join(' ');
      }
    }

    const newBefore = beforeTrigger ? `${beforeTrigger} ${constructedWord}` : constructedWord;
    processed = restOfSentence ? `${newBefore} ${restOfSentence}` : newBefore;

    triggerRegex.lastIndex = 0;
  }

  return processed;
};

/**
 * Processes spoken deletion commands ("delete last word", "scratch that", "delete last 3 words", "clear all")
 * and auto-submit commands ("add task", "add note", "submit task", "save note", etc.).
 */
export const processVoiceCommands = (text) => {
  if (!text || typeof text !== 'string') return { text: '', isSubmitCommand: false };

  let processed = text;
  let isSubmitCommand = false;

  // 1. Check for explicit spoken submit command ("add task", "add note", "add a note", "add a task", "submit task", "save note", "create task", "submit", etc.)
  const submitRegex = /\b(add|ad|at|and|create|save|submit)\s*(a\s+|an\s+|the\s+|this\s+|my\s+|new\s+)?(task|tax|note|node)\b/gi;
  
  // Standalone submit triggers anywhere at the end of speech (e.g. "... buy milk add task", "... save note", "... submit")
  const endSubmitRegex = /\b(add\s*task|add\s*note|submit\s*task|submit\s*note|save\s*task|save\s*note|create\s*task|create\s*note|submit)\b[.,?!]*$/gi;

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

  // 3. Process letter-by-letter spelling constructs ("spell S M Y T H E", "Rice spelled R H Y S", "spell out D A R R O N")
  processed = processSpellingConstructs(processed);

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

  // 5. Process "delete (the) (last/previous) sentence" / "scratch last sentence" / "undo sentence"
  const deleteSentenceRegex = /\b(delete|scratch|remove|undo)\s+(?:the\s+)?(?:last\s+|previous\s+)?sentence\b[.,?!]*/gi;
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

  // 6. Process "delete (the) (last/previous) line" / "scratch last line" / "delete line"
  const deleteLineRegex = /\b(delete|scratch|remove|undo)\s+(?:the\s+)?(?:last\s+|previous\s+)?line\b[.,?!]*/gi;
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

  const WORD_COUNT_MAP = {
    one: 1, won: 1,
    two: 2, to: 2, too: 2,
    three: 3,
    four: 4, for: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8, ate: 8,
    nine: 9,
    ten: 10,
    couple: 2, 'couple of': 2, 'a couple': 2, 'a couple of': 2,
    few: 3, 'a few': 3
  };

  // 7. Process "delete (the) (last/previous) N words"
  // Supports: "delete the last 2 words", "delete last two words", "scratch the last 2 words", "delete the last two", "delete 2 words", etc.
  const deleteNRegex = /\b(delete|remove|scratch|erase|undo)\s+(?:the\s+)?(?:last\s+|previous\s+)?(\d+|one|won|two|to|too|three|four|for|five|six|seven|eight|ate|nine|ten|a\s+couple\s+of|couple\s+of|a\s+couple|couple|a\s+few|few)(?:\s+words?)?\b[.,?!]*/gi;
  processed = processed.replace(deleteNRegex, (m, verb, countStr) => {
    const cleanCount = (countStr || '').toLowerCase().trim();
    const count = parseInt(cleanCount, 10) || WORD_COUNT_MAP[cleanCount] || 1;
    return `__DEL_${count}__`;
  });

  // 8. Process "delete (the) (last/previous/that) word", "scratch that", "undo that"
  const deleteSingleWordRegex = /\b(delete|remove|scratch|erase|undo)\s+(?:the\s+|this\s+|that\s+)?(?:last\s+|previous\s+)?words?\b[.,?!]*|\b(scratch\s+that|undo\s+that)\b[.,?!]*/gi;
  processed = processed.replace(deleteSingleWordRegex, '__DEL_1__');

  // Perform deletion of previous N words for each __DEL_N__ marker
  while (processed.includes('__DEL_')) {
    const matchPos = processed.indexOf('__DEL_');
    const markerMatch = processed.match(/__DEL_(\d+)__/);
    if (!markerMatch) break;
    const numToDelete = parseInt(markerMatch[1], 10) || 1;
    const beforeMarker = processed.substring(0, matchPos).trim();
    let afterMarker = processed.substring(matchPos + markerMatch[0].length).trim();

    // Clean leading punctuation left behind after deletion command
    afterMarker = afterMarker.replace(/^[,:;\s]+/, '').trim();

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
  silenceTimeout = 20000
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
  let restartTimer = null;

  const resetSilenceTimer = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      if (isActive) {
        isActive = false;
        if (restartTimer) clearTimeout(restartTimer);
        if (recognition) {
          try { recognition.abort(); } catch {}
          try { recognition.stop(); } catch {}
          recognition = null;
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

  const scheduleRestart = (delay = 60) => {
    if (!isActive || isMobile) return;
    if (restartTimer) clearTimeout(restartTimer);
    restartTimer = setTimeout(() => {
      if (!isActive) return;
      try {
        currentSessionBaseText = lastEmittedText;
        createAndStartRecognition();
      } catch (err) {
        console.warn('Recognition restart attempt 1 failed:', err);
        if (isActive) {
          restartTimer = setTimeout(() => {
            if (isActive) {
              try {
                currentSessionBaseText = lastEmittedText;
                createAndStartRecognition();
              } catch (e) {
                console.error('Recognition restart attempt 2 failed:', e);
              }
            }
          }, 200);
        }
      }
    }, delay);
  };

  const createAndStartRecognition = () => {
    if (!isActive) return;

    // Clean up any stale recognition instance before starting fresh
    if (recognition) {
      try { recognition.abort(); } catch {}
      recognition = null;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = isContinuous;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = lang || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

      recognition.onstart = () => {
        onStatusChange(isMobile ? '🎙️ Listening... Speak naturally' : '🎙️ Listening... (Tap mic when done)');
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
          if (restartTimer) clearTimeout(restartTimer);
          if (recognition) {
            try { recognition.abort(); } catch {}
            try { recognition.stop(); } catch {}
            recognition = null;
          }
        }

        lastEmittedText = finalText;
        onTranscript(finalText, isSubmitCommand);
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.error('Speech recognition permission error:', event.error);
          isActive = false;
          if (silenceTimer) clearTimeout(silenceTimer);
          if (restartTimer) clearTimeout(restartTimer);
          onStatusChange('⚠️ Microphone permission denied.');
          setTimeout(() => onStatusChange(''), 4000);
          if (onEnd) onEnd();
        } else if (event.error === 'no-speech') {
          if (isMobile) {
            // Mobile pause: let onend conclude cleanly
          } else {
            onStatusChange('🎙️ Listening... (Tap mic when done)');
          }
        } else if (event.error === 'aborted') {
          // Normal when switching sessions or stopping
        } else {
          console.warn('Speech recognition non-fatal error:', event.error);
          if (!isMobile) {
            onStatusChange('🎙️ Listening... (Tap mic when done)');
          }
        }
      };

      recognition.onend = () => {
        if (!isActive) return;

        // On mobile devices (Android / iOS):
        // Conclude dictation cleanly on utterance finish to prevent OS bleep loops and hardware dead-zones.
        if (isMobile) {
          isActive = false;
          if (silenceTimer) clearTimeout(silenceTimer);
          if (restartTimer) clearTimeout(restartTimer);
          if (recognition) {
            try { recognition.abort(); } catch {}
            recognition = null;
          }
          if (hadSpeech) {
            onStatusChange('✨ Captured! (Tap to append, or use keyboard 🎙️ for continuous)');
          } else {
            onStatusChange('');
          }
          setTimeout(() => onStatusChange(''), 4500);
          if (onEnd) onEnd();
          return;
        }

        const timeSinceSpeech = Date.now() - lastSpeechTime;

        // On desktop: If user has been silent for full silenceTimeout (e.g. 20s), finish cleanly
        if (timeSinceSpeech >= silenceTimeout) {
          isActive = false;
          if (silenceTimer) clearTimeout(silenceTimer);
          if (restartTimer) clearTimeout(restartTimer);
          if (hadSpeech) {
            onStatusChange('✨ Voice input captured!');
          } else {
            onStatusChange('');
          }
          setTimeout(() => onStatusChange(''), 3000);
          if (onEnd) onEnd();
          return;
        }

        // On desktop: Keep listening across pauses with smooth 50ms restart
        scheduleRestart(50);
      };

      recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition, retrying:', e);
      if (isActive && !isMobile) {
        scheduleRestart(150);
      } else if (isMobile) {
        isActive = false;
        if (onEnd) onEnd();
      }
    }
  };

  createAndStartRecognition();

  return {
    stop: () => {
      isActive = false;
      if (silenceTimer) clearTimeout(silenceTimer);
      if (restartTimer) clearTimeout(restartTimer);
      if (recognition) {
        try { recognition.abort(); } catch {}
        try { recognition.stop(); } catch {}
        recognition = null;
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
