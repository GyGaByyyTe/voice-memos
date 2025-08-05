import './MemoForm.css';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Memo } from '@voice-memos/common';
import { Button, IconButton, TextArea } from '@/components';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { useMemoContext } from '@/contexts/MemoContext';
import { useSpeechRecognition } from '@/hooks';

export interface MemoFormProps {
  /**
   * The memo to edit (if editing an existing memo)
   */
  memo?: Memo;
  /**
   * Callback function called when the form is submitted successfully
   */
  onSubmit?: (memo: Memo) => void;
  /**
   * Callback function called when the form is canceled
   */
  onCancel?: () => void;
  /**
   * Optional className for styling
   */
  className?: string;
}

// Validate form
const validate = (text: string): string | null => {
  if (!text.trim()) {
    return 'Memo text is required';
  }

  return null;
};
const options = {
  language: 'en-US',
  continuous: true,
  interimResults: false,
};
/**
 * Component for creating or editing memos
 */
export const MemoForm: React.FC<MemoFormProps> = ({ memo, onSubmit, onCancel, className = '' }) => {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [touched, setTouched] = useState<boolean>(false);
  const [appendMode, setAppendMode] = useState<boolean>(true);

  const { createMemo, updateMemo } = useMemoContext();

  const {
    transcript,
    isListening,
    error: speechError,
    supported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(options);

  const showError = useMemo(() => touched && !text.trim(), [touched, text]);

  useEffect(() => {
    if (memo) {
      setText(memo.text);
    }
  }, [memo]);

  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  // Update text when transcript changes
  useEffect(() => {
    if (transcript && isListening) {
      if (appendMode) {
        // Append a transcript to an existing text
        setText((prevText) => {
          // Add a space if the previous text doesn't end with one
          const separator = prevText && !prevText.endsWith(' ') ? ' ' : '';
          return prevText + separator + transcript;
        });
      } else {
        // Replace text with transcript
        setText(transcript);
      }
      setTouched(true);
      resetTranscript();
    }
  }, [transcript, isListening, appendMode, resetTranscript]);

  useEffect(() => {
    if (speechError) {
      setError(speechError);
    }
  }, [speechError]);

  const toggleSpeechRecognition = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    },
    [isListening, startListening, stopListening]
  );

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setTouched(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTouched(true);

      if (isListening) {
        stopListening();
      }

      const formError = validate(text);
      if (formError) {
        return;
      }

      try {
        setIsSubmitting(true);

        let result: Memo | null;

        if (memo) {
          result = await updateMemo(memo.id, text.trim());
        } else {
          result = await createMemo(text.trim());
        }

        if (result) {
          if (onSubmit) {
            onSubmit(result);
          }

          // Reset form if creating a new memo
          if (!memo) {
            setText('');
            setTouched(false);
          }
        } else {
          setError('Failed to save memo');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save memo');
      } finally {
        setIsSubmitting(false);
      }
    },
    [memo, text, onSubmit, updateMemo, createMemo, isListening, stopListening]
  );

  const handleCancel = useCallback(() => onCancel?.(), [onCancel]);

  return (
    <div className={`memo-form ${className}`} data-testid="memo-form">
      <Card className="memo-form-card">
        <CardHeader className="memo-form-header">
          <h2 className="memo-form-title">{!!memo ? 'Edit Memo' : 'Create New Memo'}</h2>
          {onCancel && (
            <IconButton
              onClick={handleCancel}
              className="memo-form-close-button"
              aria-label="Cancel"
              data-testid="cancel-button"
            >
              ✕
            </IconButton>
          )}
        </CardHeader>

        {speechSupported && (
          <div
            className="memo-form-voice-controls"
            style={{ padding: '0 1.5rem', marginBottom: '1rem' }}
          >
            <IconButton
              type="button"
              onClick={toggleSpeechRecognition}
              className={`memo-form-mic-button ${isListening ? 'active' : ''}`}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              data-testid="voice-input-button"
              title={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              🎤
            </IconButton>

            {isListening && (
              <div className="memo-form-recording-indicator" data-testid="recording-indicator">
                Recording...
              </div>
            )}

            <div className="memo-form-append-mode">
              <label className="memo-form-append-label">
                <input
                  type="checkbox"
                  checked={appendMode}
                  onChange={() => setAppendMode(!appendMode)}
                  data-testid="append-mode-toggle"
                />
                Append text
              </label>
            </div>
          </div>
        )}

        {!speechSupported && (
          <div
            className="memo-form-speech-not-supported"
            style={{ padding: '0 1.5rem', marginBottom: '1rem' }}
            data-testid="speech-not-supported"
          >
            Voice input is not supported in your browser.
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="memo-form-element">
          <CardBody className="memo-form-body">
            <div className="memo-form-textarea-container">
              <TextArea
                label="Memo Text"
                id="memo-text"
                value={text}
                onChange={handleTextChange}
                placeholder="Enter your memo text here..."
                error={showError}
                helperText={showError ? 'Memo text is required' : ''}
                disabled={isSubmitting}
                required
                data-testid="memo-text-input"
              />
            </div>

            {error && !showError && (
              <div className="memo-form-error" role="alert">
                {error}
              </div>
            )}
          </CardBody>

          <CardFooter className="memo-form-footer">
            {onCancel && (
              <Button
                type="button"
                onClick={handleCancel}
                variant="text"
                disabled={isSubmitting}
                className="memo-form-cancel-button"
                data-testid="cancel-button-footer"
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || (touched && !text.trim())}
              className="memo-form-submit-button"
              data-testid="submit-button"
            >
              {isSubmitting && !memo && 'Creating...'}
              {!isSubmitting && !memo && 'Create Memo'}
              {isSubmitting && !!memo && 'Saving...'}
              {!isSubmitting && !!memo && 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default React.memo(MemoForm);
