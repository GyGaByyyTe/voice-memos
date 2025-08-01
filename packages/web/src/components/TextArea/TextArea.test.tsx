import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextArea } from './TextArea';

describe('TextArea Component', () => {
  test('renders with label and placeholder', () => {
    render(<TextArea label="Test Label" placeholder="Test placeholder" id="test-textarea" />);

    // Check that the label is rendered
    expect(screen.getByText('Test Label')).toBeInTheDocument();

    // Check that the textarea has the correct placeholder
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Test placeholder');
    expect(textarea).toHaveAttribute('id', 'test-textarea');
  });

  test('handles value and onChange', () => {
    const handleChange = jest.fn();

    render(<TextArea value="Initial value" onChange={handleChange} />);

    // Check that the textarea has the initial value
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveValue('Initial value');

    // Simulate typing in the textarea
    fireEvent.change(textarea, { target: { value: 'New value' } });

    // Check that onChange was called
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('displays error state correctly', () => {
    render(<TextArea error={true} helperText="Error message" />);

    // Check that the error message is displayed
    expect(screen.getByText('Error message')).toBeInTheDocument();

    // Check that the textarea has the error class
    const textarea = screen.getByTestId('textarea');
    expect(textarea.className).toContain('textarea-error');
  });

  test('applies disabled state', () => {
    render(<TextArea disabled={true} />);

    // Check that the textarea is disabled
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeDisabled();
    expect(textarea.className).toContain('textarea-disabled');
  });

  test('forwards ref to textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>();

    render(<TextArea ref={ref} />);

    // Check that the ref is attached to the textarea
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('TEXTAREA');
  });

  test('applies custom className', () => {
    render(<TextArea className="custom-class" />);

    // Check that the custom class is applied
    const textarea = screen.getByTestId('textarea');
    expect(textarea.className).toContain('custom-class');
  });
});
