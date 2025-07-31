import React from 'react';
import App from './App';
import { render, screen, fireEvent } from './test-utils';

describe('App Component', () => {
  test('renders learn react link', async () => {
    await render(<App />, { withMemoProvider: false });

    // Check that the link is in the document
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();

    // Check that the link has the correct href
    expect(linkElement).toHaveAttribute('href', 'https://reactjs.org');

    // Check that the link opens in a new tab
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');

    // Test user interaction - click the link
    // Note: This won't actually navigate in tests, but we can verify the click handler works
    fireEvent.click(linkElement);

    // Check that the app header has the correct class
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('App-header');
  });
});
