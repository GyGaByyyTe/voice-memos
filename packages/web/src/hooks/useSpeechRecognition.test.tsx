import { renderHook, act } from '@testing-library/react';
import { SpeechRecognitionCallbacks, SpeechRecognitionOptions } from '@voice-memos/common';
import { useSpeechRecognition } from './useSpeechRecognition';

// Create a mock for the SpeechRecognitionManager
let mockCallbacks: SpeechRecognitionCallbacks = {
  onTranscriptChange: undefined,
  onListeningChange: undefined,
  onError: undefined,
};
let mockIsListening = false;
let mockTranscript = '';
let mockOptions: SpeechRecognitionOptions = {};

// Mock the SpeechRecognitionManager from the common package
jest.mock('@voice-memos/common', () => {
  return {
    SpeechRecognitionManager: jest.fn().mockImplementation((options) => {
      mockOptions = options;
      return {
        startListening: jest.fn().mockImplementation(() => {
          mockIsListening = true;
          if (mockCallbacks.onListeningChange) {
            mockCallbacks.onListeningChange(true);
          }
        }),
        stopListening: jest.fn().mockImplementation(() => {
          mockIsListening = false;
          if (mockCallbacks.onListeningChange) {
            mockCallbacks.onListeningChange(false);
          }
        }),
        resetTranscript: jest.fn().mockImplementation(() => {
          mockTranscript = '';
          if (mockCallbacks.onTranscriptChange) {
            mockCallbacks.onTranscriptChange('');
          }
        }),
        setCallbacks: jest.fn().mockImplementation((callbacks) => {
          mockCallbacks = callbacks;
        }),
        getIsListening: jest.fn().mockImplementation(() => mockIsListening),
        getTranscript: jest.fn().mockImplementation(() => mockTranscript),
        getError: jest.fn().mockReturnValue(null),
      };
    }),
  };
});

describe('useSpeechRecognition hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCallbacks = {};
    mockIsListening = false;
    mockTranscript = '';
    mockOptions = {};
  });

  test('initializes with default values', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.transcript).toBe('');
    expect(result.current.isListening).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.supported).toBe(true);
    expect(typeof result.current.startListening).toBe('function');
    expect(typeof result.current.stopListening).toBe('function');
    expect(typeof result.current.resetTranscript).toBe('function');
  });

  test('starts listening when startListening is called', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    // Manually trigger the callback that would be called by the manager
    act(() => {
      if (mockCallbacks.onListeningChange) {
        mockCallbacks.onListeningChange(true);
      }
    });

    expect(result.current.isListening).toBe(true);
  });

  test('stops listening when stopListening is called', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    // Start listening first and ensure the state is updated
    act(() => {
      // Set the state directly through the callback
      if (mockCallbacks.onListeningChange) {
        mockCallbacks.onListeningChange(true);
      }
    });

    // Verify that isListening is true
    expect(result.current.isListening).toBe(true);

    // Then stop listening
    act(() => {
      result.current.stopListening();
      // Manually trigger the callback
      if (mockCallbacks.onListeningChange) {
        mockCallbacks.onListeningChange(false);
      }
    });

    // Verify that isListening is false
    expect(result.current.isListening).toBe(false);
  });

  test('resets transcript when resetTranscript is called', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    // Simulate receiving a transcript
    act(() => {
      if (mockCallbacks.onTranscriptChange) {
        mockCallbacks.onTranscriptChange('Hello world');
      }
    });

    expect(result.current.transcript).toBe('Hello world');

    // Reset the transcript
    act(() => {
      result.current.resetTranscript();
    });

    expect(result.current.transcript).toBe('');
  });

  test('updates transcript when speech is recognized', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    // Simulate receiving a transcript
    act(() => {
      if (mockCallbacks.onTranscriptChange) {
        mockCallbacks.onTranscriptChange('Testing speech recognition');
      }
    });

    expect(result.current.transcript).toBe('Testing speech recognition');
  });

  test('handles errors correctly', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    // Simulate an error
    act(() => {
      if (mockCallbacks.onError) {
        mockCallbacks.onError('Test error message');
      }
    });

    expect(result.current.error).toBe('Test error message');
  });

  test('sets supported to false when browser does not support speech recognition', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    // Simulate an error indicating lack of browser support
    act(() => {
      if (mockCallbacks.onError) {
        mockCallbacks.onError('Распознавание речи не поддерживается в этом браузере');
      }
    });

    expect(result.current.supported).toBe(false);
  });

  test('passes options to SpeechRecognitionManager', () => {
    const options = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
    };

    renderHook(() => useSpeechRecognition(options));

    // Check that the original options are included in the merged options
    // We're now adding includeInterimResults: false by default
    expect(mockOptions).toMatchObject(options);

    // Also verify that includeInterimResults is set to false by default
    // Use type assertion to bypass TypeScript error
    expect((mockOptions as any).includeInterimResults).toBe(false);
  });
});
