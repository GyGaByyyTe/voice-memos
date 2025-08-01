import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import App from './App';

// Mock the components to avoid memory issues
jest.mock('@/components', () => ({
  MemoList: () => <div data-testid="memo-list">Memo List Component</div>,
  MemoView: () => <div data-testid="memo-view">Memo View Component</div>,
  MemoForm: () => <div data-testid="memo-form">Memo Form Component</div>,
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

// Custom render function that doesn't use the test-utils with real IndexedDBService
const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
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
    fireEvent.click(createButton);

    // Check that the form is rendered
    const memoForm = screen.getByTestId('memo-form');
    expect(memoForm).toBeInTheDocument();

    // Check that the list is no longer rendered
    expect(screen.queryByTestId('memo-list')).not.toBeInTheDocument();
  });
});
