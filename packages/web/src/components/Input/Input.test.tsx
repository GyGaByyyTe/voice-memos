import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
  test('renders with label and placeholder', () => {
    render(<Input label="Test Label" placeholder="Test placeholder" id="test-input" />);

    // Check that the label is rendered
    expect(screen.getByText('Test Label')).toBeInTheDocument();

    // Check that the input has the correct placeholder
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('placeholder', 'Test placeholder');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  test('handles value and onChange', () => {
    const handleChange = jest.fn();

    render(<Input value="Initial value" onChange={handleChange} />);

    // Check that the input has the initial value
    const input = screen.getByTestId('input');
    expect(input).toHaveValue('Initial value');

    // Simulate typing in the input
    fireEvent.change(input, { target: { value: 'New value' } });

    // Check that onChange was called
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('displays error state correctly', () => {
    render(<Input error={true} helperText="Error message" />);

    // Check that the error message is displayed
    expect(screen.getByText('Error message')).toBeInTheDocument();

    // Check that the input has the error class
    const input = screen.getByTestId('input');
    expect(input.className).toContain('input-error');
  });

  test('applies different sizes', () => {
    const { rerender } = render(<Input size="small" />);

    // Check small size
    let input = screen.getByTestId('input');
    expect(input.className).toContain('input-small');

    // Check medium size (default)
    rerender(<Input />);
    input = screen.getByTestId('input');
    expect(input.className).toContain('input-medium');

    // Check large size
    rerender(<Input size="large" />);
    input = screen.getByTestId('input');
    expect(input.className).toContain('input-large');
  });

  test('applies disabled state', () => {
    render(<Input disabled={true} />);

    // Check that the input is disabled
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
    expect(input.className).toContain('input-disabled');
  });

  test('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();

    render(<Input ref={ref} />);

    // Check that the ref is attached to the input
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('INPUT');
  });

  test('applies custom className', () => {
    render(<Input className="custom-class" />);

    // Check that the custom class is applied
    const input = screen.getByTestId('input');
    expect(input.className).toContain('custom-class');
  });
});
