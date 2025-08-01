import './Select.css';
import React, { SelectHTMLAttributes, useMemo, forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Options for the select dropdown
   */
  options?: SelectOption[];
  /**
   * Whether the select has an error
   */
  error?: boolean;
  /**
   * The label for the select
   */
  label?: string;
  /**
   * Helper text to display below the select
   */
  helperText?: string;
  /**
   * The size of the select
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * Select for dropdown selection
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options = [],
      error = false,
      label,
      helperText,
      size = 'medium',
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const selectClasses = useMemo(
      () =>
        [
          'select',
          `select-${size}`,
          error ? 'select-error' : '',
          disabled ? 'select-disabled' : '',
          className,
        ].join(' '),
      [size, error, disabled, className]
    );

    return (
      <div>
        {label && (
          <label className="input-label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={selectClasses}
          disabled={disabled}
          data-testid={props['data-testid'] || 'select'}
          {...props}
        >
          {children ||
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
        {helperText && (
          <span className={`input-helper-text ${error ? 'input-error-text' : ''}`}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
