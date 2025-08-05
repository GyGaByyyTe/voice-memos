import './Input.css';
import React, { InputHTMLAttributes, useMemo, forwardRef } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Whether the input has an error
   */
  error?: boolean;
  /**
   * The label for the input
   */
  label?: string;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * The size of the input
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
};

/**
 * Input component for text entry
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error = false,
      label,
      helperText,
      size = 'medium',
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputClasses = useMemo(
      () =>
        [
          'input',
          `input-${size}`,
          error ? 'input-error' : '',
          disabled ? 'input-disabled' : '',
          className,
        ].join(' '),
      [size, error, disabled, className]
    );

    return (
      <div style={wrapperStyle}>
        {label && (
          <label className="input-label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          data-testid={props['data-testid'] || 'input'}
          {...props}
        />
        {helperText && (
          <span className={`input-helper-text ${error ? 'input-error-text' : ''}`}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
