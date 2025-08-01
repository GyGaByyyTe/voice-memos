import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import IconButton from './IconButton';

describe('IconButton Component', () => {
  test('renders icon button with default props', async () => {
    await render(<IconButton>🔍</IconButton>, { withMemoProvider: false });

    const button = screen.getByTestId('icon-button');

    // Check content
    expect(button).toHaveTextContent('🔍');

    // Check default classes
    expect(button).toHaveClass('icon-button');
    expect(button).toHaveClass('icon-button-secondary');
    expect(button).toHaveClass('icon-button-medium');

    // Check not disabled by default
    expect(button).not.toBeDisabled();
  });

  test('renders icon button with custom props', async () => {
    await render(
      <IconButton variant="primary" size="large" disabled={true} className="custom-class">
        🔍
      </IconButton>,
      { withMemoProvider: false }
    );

    const button = screen.getByTestId('icon-button');

    // Check content
    expect(button).toHaveTextContent('🔍');

    // Check custom classes
    expect(button).toHaveClass('icon-button-primary');
    expect(button).toHaveClass('icon-button-large');
    expect(button).toHaveClass('icon-button-disabled');
    expect(button).toHaveClass('custom-class');

    // Check disabled state
    expect(button).toBeDisabled();
  });

  test('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();

    await render(<IconButton onClick={handleClick}>🔍</IconButton>, { withMemoProvider: false });

    const button = screen.getByTestId('icon-button');

    // Click the button
    fireEvent.click(button);

    // Check that the click handler was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();

    await render(
      <IconButton onClick={handleClick} disabled>
        🔍
      </IconButton>,
      { withMemoProvider: false }
    );

    const button = screen.getByTestId('icon-button');

    // Try to click the disabled button
    fireEvent.click(button);

    // Check that the click handler was not called
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('renders with SVG icon', async () => {
    await render(
      <IconButton>
        <svg data-testid="svg-icon" width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
      </IconButton>,
      { withMemoProvider: false }
    );

    const button = screen.getByTestId('icon-button');
    const svgIcon = screen.getByTestId('svg-icon');

    // Check that the SVG icon is rendered inside the button
    expect(button).toContainElement(svgIcon);
  });
});
