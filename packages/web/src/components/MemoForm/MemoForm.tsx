import './MemoForm.css';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Memo } from '@voice-memos/common';
import { Button, IconButton, TextArea } from '@/components';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { useMemoContext } from '@/contexts/MemoContext';

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

/**
 * Component for creating or editing memos
 */
export const MemoForm: React.FC<MemoFormProps> = ({ memo, onSubmit, onCancel, className = '' }) => {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [touched, setTouched] = useState<boolean>(false);

  const { createMemo, updateMemo } = useMemoContext();

  // Determine if there's a validation error to show
  const showError = useMemo(() => touched && !text.trim(), [touched, text]);

  useEffect(() => {
    if (memo) {
      setText(memo.text);
    }
  }, [memo]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setTouched(true);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTouched(true);

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
    [memo, text, onSubmit, updateMemo, createMemo]
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

        <form onSubmit={handleSubmit} data-testid="memo-form-element">
          <CardBody className="memo-form-body">
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

            {error && !showError && <div className="memo-form-error">{error}</div>}
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

export default MemoForm;
