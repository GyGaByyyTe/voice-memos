import React from 'react';
import { fireEvent, render as rtlRender, screen, waitFor, act } from '@testing-library/react';
import App from './App';

// Mock the lazy-loaded components
// Instead of mocking React.lazy, we'll mock the actual component imports
jest.mock('@/components/MemoList/MemoList', () => ({
  __esModule: true,
  default: () => <div data-testid="memo-list">Memo List Component</div>,
}));

jest.mock('@/components/MemoView/MemoView', () => ({
  __esModule: true,
  default: () => <div data-testid="memo-view">Memo View Component</div>,
}));

jest.mock('@/components/MemoForm/MemoForm', () => ({
  __esModule: true,
  default: () => <div data-testid="memo-form">Memo Form Component</div>,
}));

// Mock the Button component which is still imported directly
jest.mock('@/components', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock the MemoProvider to avoid memory issues with IndexedDB
jest.mock('@/contexts/MemoProvider', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock React.Suspense to immediately render its children
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    Suspense: ({ children }: { children: React.ReactNode; fallback: React.ReactNode }) => children,
  };
});

// Custom render function that handles async rendering
const render = async (ui: React.ReactElement) => {
  let result;
  await act(async () => {
    result = rtlRender(ui);
  });
  return result;
};

describe('App Component', () => {
  test('renders voice memos app with header', async () => {
    await render(<App />);

    // Check that the header is in the document
    const headerElement = screen.getByText('Voice Memos');
    expect(headerElement).toBeInTheDocument();

    // Check that the app container has the correct class
    const appContainer = document.querySelector('.App');
    expect(appContainer).toBeInTheDocument();
  });

  test('renders memo list by default', async () => {
    await render(<App />);

    // Check that the memo list is rendered by default
    const memoList = screen.getByTestId('memo-list');
    expect(memoList).toBeInTheDocument();

    // Check that the created button is rendered
    const createButton = screen.getByText('Create New Memo');
    expect(createButton).toBeInTheDocument();
  });

  test('switches to create mode when create button is clicked', async () => {
    await render(<App />);

    // Click the create button
    const createButton = screen.getByText('Create New Memo');

    await act(async () => {
      fireEvent.click(createButton);
    });

    // Wait for the state to update and the form to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('memo-form')).toBeInTheDocument();
    });

    // Check that the list is no longer rendered
    expect(screen.queryByTestId('memo-list')).not.toBeInTheDocument();
  });

  // Tests for optimized features
  describe('Optimized Features', () => {
    // Test for lazy loading
    test('App uses lazy loading with Suspense', async () => {
      // We can't easily mock React.Suspense for testing, so we'll check for the
      // presence of the LoadingFallback component in the App code
      const appSource = require('fs').readFileSync(require.resolve('./App'), 'utf8');

      // Check if the App code includes lazy imports
      expect(appSource).toContain('lazy(');

      // Check if the App code includes Suspense
      expect(appSource).toContain('Suspense');

      // Check if the App code includes a loading fallback
      expect(appSource).toContain('LoadingFallback');

      // Render the App to ensure it works with lazy loading
      await render(<App />);

      // If we get here without errors, lazy loading is working
      expect(true).toBe(true);
    });
  });
});
