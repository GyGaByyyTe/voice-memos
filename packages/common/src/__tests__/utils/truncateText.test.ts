import { truncateText } from '../../utils';

describe('truncateText', () => {
  it('should return the original text if it is shorter than maxLength', () => {
    const text = 'Hello, world!';
    const maxLength = 20;
    expect(truncateText(text, maxLength)).toBe(text);
  });

  it('should truncate the text and add ellipsis if it is longer than maxLength', () => {
    const text = 'This is a very long text that needs to be truncated';
    const maxLength = 10;
    expect(truncateText(text, maxLength)).toBe('This is a ...');
  });

  it('should handle empty string', () => {
    const text = '';
    const maxLength = 10;
    expect(truncateText(text, maxLength)).toBe('');
  });

  it('should handle maxLength of 0', () => {
    const text = 'Hello, world!';
    const maxLength = 0;
    expect(truncateText(text, maxLength)).toBe('...');
  });
});
