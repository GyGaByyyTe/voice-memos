import './TextArea.css';
import React, { TextareaHTMLAttributes, useMemo, forwardRef } from 'react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Whether the textarea has an error
   */
  error?: boolean;
  /**
   * The label for the textarea
   */
  label?: string;
  /**
   * Helper text to display below the textarea
   */
  helperText?: string;
  /**
   * Whether the textarea is disabled
   */
  disabled?: boolean;
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * TextArea component for multiline text entry
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error = false, label, helperText, disabled = false, className = '', ...props }, ref) => {
    const textareaClasses = useMemo(
      () =>
        [
          'textarea',
          error ? 'textarea-error' : '',
          disabled ? 'textarea-disabled' : '',
          className,
        ].join(' '),
      [error, disabled, className]
    );

    return (
      <div className="textarea-container">
        {label && (
          <label className="textarea-label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={textareaClasses}
          disabled={disabled}
          data-testid={props['data-testid'] || 'textarea'}
          {...props}
        />
        {helperText && (
          <span className={`textarea-helper-text ${error ? 'textarea-error-text' : ''}`}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
