import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { SpeechRecognitionManager, SpeechRecognitionOptions } from '@voice-memos/common';

/**
 * Hook state interface
 */
export interface SpeechRecognitionState {
  transcript: string;
  isListening: boolean;
  error: string | null;
}

/**
 * Hook return interface
 */
export interface UseSpeechRecognitionReturn extends SpeechRecognitionState {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  supported: boolean;
}

/**
 * Custom hook for using speech recognition functionality
 *
 * @param options Configuration options for speech recognition
 * @returns Object containing speech recognition state and control methods
 */
export const useSpeechRecognition = (
  options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const managerRef = useRef<SpeechRecognitionManager | null>(null);

  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean>(true);

  const mergedOptions = useMemo(
    () =>
      ({
        // By default, don't include interim results
        includeInterimResults: false,
        ...options,
      }) as SpeechRecognitionOptions,
    [options]
  );

  useEffect(() => {
    // Create a new manager instance if it doesn't exist
    if (!managerRef.current) {
      try {
        managerRef.current = new SpeechRecognitionManager(mergedOptions);

        managerRef.current.setCallbacks({
          onTranscriptChange: (newTranscript) => setTranscript(newTranscript),
          onListeningChange: (newIsListening) => setIsListening(newIsListening),
          onError: (newError) => {
            setError(newError);
            if (newError.includes('не поддерживается') || newError.includes('not supported')) {
              setSupported(false);
            }
          },
        });
      } catch (err) {
        setError(`Failed to initialize speech recognition: ${err}`);
        setSupported(false);
      }
    }

    return () => {
      if (managerRef.current && managerRef.current.getIsListening()) {
        managerRef.current.stopListening();
      }
    };
  }, [mergedOptions]);

  const startListening = useCallback(() => {
    if (!managerRef.current) return;

    try {
      setError(null);
      managerRef.current.startListening();
    } catch (err) {
      setError(`Error starting speech recognition: ${err}`);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!managerRef.current) {
      return;
    }

    try {
      managerRef.current.stopListening();
    } catch (err) {
      setError(`Error stopping speech recognition: ${err}`);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    if (!managerRef.current) return;

    try {
      managerRef.current.resetTranscript();
    } catch (err) {
      setError(`Error resetting transcript: ${err}`);
    }
  }, []);

  return {
    transcript,
    isListening,
    error,
    supported,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
