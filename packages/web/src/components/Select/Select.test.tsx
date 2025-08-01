import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select, SelectOption } from './Select';

describe('Select Component', () => {
  const mockOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  test('renders with label and options', () => {
    render(<Select label="Test Label" options={mockOptions} id="test-select" />);

    // Check that the label is rendered
    expect(screen.getByText('Test Label')).toBeInTheDocument();

    // Check that the select has the correct options
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('id', 'test-select');

    // Check that all options are rendered
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  test('handles value and onChange', () => {
    const handleChange = jest.fn();

    render(<Select options={mockOptions} value="option1" onChange={handleChange} />);

    // Check that the select has the initial value
    const select = screen.getByTestId('select') as HTMLSelectElement;
    expect(select.value).toBe('option1');

    // Simulate selecting a different option
    fireEvent.change(select, { target: { value: 'option2' } });

    // Check that onChange was called
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('displays error state correctly', () => {
    render(<Select options={mockOptions} error={true} helperText="Error message" />);

    // Check that the error message is displayed
    expect(screen.getByText('Error message')).toBeInTheDocument();

    // Check that the select has the error class
    const select = screen.getByTestId('select');
    expect(select.className).toContain('select-error');
  });

  test('applies different sizes', () => {
    const { rerender } = render(<Select options={mockOptions} size="small" />);

    // Check small size
    let select = screen.getByTestId('select');
    expect(select.className).toContain('select-small');

    // Check medium size (default)
    rerender(<Select options={mockOptions} />);
    select = screen.getByTestId('select');
    expect(select.className).toContain('select-medium');

    // Check large size
    rerender(<Select options={mockOptions} size="large" />);
    select = screen.getByTestId('select');
    expect(select.className).toContain('select-large');
  });

  test('applies disabled state', () => {
    render(<Select options={mockOptions} disabled={true} />);

    // Check that the select is disabled
    const select = screen.getByTestId('select');
    expect(select).toBeDisabled();
    expect(select.className).toContain('select-disabled');
  });

  test('forwards ref to select element', () => {
    const ref = React.createRef<HTMLSelectElement>();

    render(<Select options={mockOptions} ref={ref} />);

    // Check that the ref is attached to the select
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('SELECT');
  });

  test('applies custom className', () => {
    render(<Select options={mockOptions} className="custom-class" />);

    // Check that the custom class is applied
    const select = screen.getByTestId('select');
    expect(select.className).toContain('custom-class');
  });

  test('renders children instead of options when provided', () => {
    render(
      <Select>
        <option value="child1">Child Option 1</option>
        <option value="child2">Child Option 2</option>
      </Select>
    );

    // Check that the children options are rendered
    expect(screen.getByText('Child Option 1')).toBeInTheDocument();
    expect(screen.getByText('Child Option 2')).toBeInTheDocument();
  });
});
