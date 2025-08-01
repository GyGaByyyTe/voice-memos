import './IconButton.css';
import React, { ButtonHTMLAttributes, useMemo } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The variant of the icon button
   */
  variant?: 'primary' | 'secondary';
  /**
   * The size of the icon button
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether the icon button is disabled
   */
  disabled?: boolean;
  /**
   * The icon to display
   */
  children: React.ReactNode;
}

/**
 * IconButton component for icon-only buttons
 */
export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'secondary',
  size = 'medium',
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const buttonClasses = useMemo(
    () =>
      [
        'icon-button',
        `icon-button-${variant}`,
        `icon-button-${size}`,
        disabled ? 'icon-button-disabled' : '',
        className,
      ].join(' '),
    [variant, size, disabled, className]
  );

  return (
    <button className={buttonClasses} disabled={disabled} data-testid="icon-button" {...props}>
      {children}
    </button>
  );
};

export default IconButton;
