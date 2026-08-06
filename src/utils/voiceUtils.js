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
 * Starts continuous speech recognition and appends transcript to existing text.
 * Allows user to pause/think without cutting off, and appends new spoken words seamlessly.
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

  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Continuous listening so pauses while thinking don't stop recording
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let sessionTranscript = '';

    recognition.onstart = () => {
      onStatusChange('🎙️ Listening... Speak naturally (appends to text)');
    };

    recognition.onresult = (event) => {
      let currentSessionText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentSessionText += event.results[i][0].transcript;
      }
      sessionTranscript = currentSessionText;

      const trimmedInitial = (initialText || '').trim();
      const trimmedSpeech = sessionTranscript.trim();
      
      let combined = trimmedSpeech;
      if (trimmedInitial) {
        combined = `${trimmedInitial} ${trimmedSpeech}`;
      }

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
        onStatusChange(`Voice error: ${event.error}`);
      }
      setTimeout(() => onStatusChange(''), 4000);
      if (onEnd) onEnd();
    };

    recognition.onend = () => {
      onStatusChange('✨ Voice input captured!');
      setTimeout(() => onStatusChange(''), 3000);
      if (onEnd) onEnd();
    };

    recognition.start();
    return recognition;
  } catch (e) {
    console.error('Failed to start speech recognition:', e);
    onStatusChange('Voice recognition error.');
    setTimeout(() => onStatusChange(''), 3000);
    if (onEnd) onEnd();
    return null;
  }
};
