import './Button.css';
import React, { ButtonHTMLAttributes, useMemo } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The variant of the button
   */
  variant?: 'primary' | 'secondary' | 'text';
  /**
   * The size of the button
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * The content of the button
   */
  children: React.ReactNode;
}

const baseClasses = 'button';

const variantClasses = {
  primary: 'button-primary',
  secondary: 'button-secondary',
  text: 'button-text',
};

const sizeClasses = {
  small: 'button-small',
  medium: 'button-medium',
  large: 'button-large',
};
/**
 * Button for user interaction
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const buttonClasses = useMemo(
    () =>
      [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled ? 'button-disabled' : '',
        className,
      ].join(' '),
    [variant, size, disabled, className]
  );

  return (
    <button className={buttonClasses} disabled={disabled} data-testid="button" {...props}>
      {children}
    </button>
  );
};

export default Button;
