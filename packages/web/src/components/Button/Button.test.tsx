import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with default props', async () => {
    await render(<Button>Click me</Button>, { withMemoProvider: false });

    const button = screen.getByTestId('button');

    // Check content
    expect(button).toHaveTextContent('Click me');

    // Check default classes
    expect(button).toHaveClass('button');
    expect(button).toHaveClass('button-primary');
    expect(button).toHaveClass('button-medium');

    // Check not disabled by default
    expect(button).not.toBeDisabled();
  });

  test('renders button with custom props', async () => {
    await render(
      <Button variant="secondary" size="large" disabled={true} className="custom-class">
        Submit
      </Button>,
      { withMemoProvider: false }
    );

    const button = screen.getByTestId('button');

    // Check content
    expect(button).toHaveTextContent('Submit');

    // Check custom classes
    expect(button).toHaveClass('button-secondary');
    expect(button).toHaveClass('button-large');
    expect(button).toHaveClass('button-disabled');
    expect(button).toHaveClass('custom-class');

    // Check disabled state
    expect(button).toBeDisabled();
  });

  test('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();

    await render(<Button onClick={handleClick}>Click me</Button>, { withMemoProvider: false });

    const button = screen.getByTestId('button');

    // Click the button
    fireEvent.click(button);

    // Check that the click handler was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();

    await render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>,
      { withMemoProvider: false }
    );

    const button = screen.getByTestId('button');

    // Try to click the disabled button
    fireEvent.click(button);

    // Check that the click handler was not called
    expect(handleClick).not.toHaveBeenCalled();
  });
});
