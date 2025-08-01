import React from 'react';
import { Memo } from '@voice-memos/common';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { MemoList } from './MemoList';
import { MemoContext } from '@/contexts/MemoContext';

// Mock memos for testing
const mockMemos: Memo[] = [
  {
    id: 'memo-1',
    text: 'First test memo',
    createdAt: new Date('2023-01-01T10:00:00Z'),
    updatedAt: new Date('2023-01-01T10:00:00Z'),
  },
  {
    id: 'memo-2',
    text: 'Second test memo with different content',
    createdAt: new Date('2023-01-02T10:00:00Z'),
    updatedAt: new Date('2023-01-03T15:00:00Z'),
  },
  {
    id: 'memo-3',
    text: 'Third memo for testing',
    createdAt: new Date('2023-01-03T10:00:00Z'),
    updatedAt: new Date('2023-01-03T10:00:00Z'),
  },
];

// Mock the MemoContext
const mockGetAllMemos = jest.fn();

const renderWithMockContext = async (ui: React.ReactElement, contextValue = {}) => {
  const defaultContextValue = {
    state: {
      memos: mockMemos,
      loading: false,
      error: null,
    },
    getAllMemos: mockGetAllMemos,
    getMemoById: jest.fn(),
    createMemo: jest.fn(),
    updateMemo: jest.fn(),
    deleteMemo: jest.fn(),
  };

  return render(
    <MemoContext.Provider value={{ ...defaultContextValue, ...contextValue }}>
      {ui}
    </MemoContext.Provider>
  );
};

describe('MemoList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', async () => {
    await renderWithMockContext(<MemoList />, {
      state: { memos: [], loading: true, error: null },
    });

    expect(screen.getByText('Loading memos...')).toBeInTheDocument();
  });

  test('renders error state', async () => {
    const errorMessage = 'Failed to fetch memos';
    await renderWithMockContext(<MemoList />, {
      state: { memos: [], loading: false, error: errorMessage },
    });

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  test('renders empty state when no memos', async () => {
    await renderWithMockContext(<MemoList />, {
      state: { memos: [], loading: false, error: null },
    });

    expect(screen.getByText('No memos found. Create your first memo!')).toBeInTheDocument();
  });

  test('renders memos correctly', async () => {
    await renderWithMockContext(<MemoList />);

    // Check that all memos are rendered
    expect(screen.getByText('First test memo')).toBeInTheDocument();
    expect(screen.getByText('Second test memo with different content')).toBeInTheDocument();
    expect(screen.getByText('Third memo for testing')).toBeInTheDocument();
  });

  test('fetches memos on mount', async () => {
    await renderWithMockContext(<MemoList />);

    expect(mockGetAllMemos).toHaveBeenCalledTimes(1);
  });

  test('sorts memos by created date in descending order by default', async () => {
    await renderWithMockContext(<MemoList />);

    const memoTexts = screen
      .getAllByTestId('memo-card')
      .map((card) => card.querySelector('.memo-card-text')?.textContent);

    // Default sort is by createdAt in descending order (newest first)
    expect(memoTexts[0]).toBe('Third memo for testing');
    expect(memoTexts[1]).toBe('Second test memo with different content');
    expect(memoTexts[2]).toBe('First test memo');
  });

  test('changes sort order when sort option is changed', async () => {
    await renderWithMockContext(<MemoList />);

    // Change sort to text
    const sortSelect = screen.getByTestId('select');
    fireEvent.change(sortSelect, { target: { value: 'text' } });

    const memoTexts = screen
      .getAllByTestId('memo-card')
      .map((card) => card.querySelector('.memo-card-text')?.textContent);

    // Should be sorted by text in descending order
    expect(memoTexts[0]).toBe('Third memo for testing');
    expect(memoTexts[1]).toBe('Second test memo with different content');
    expect(memoTexts[2]).toBe('First test memo');
  });

  test('toggles sort direction when direction button is clicked', async () => {
    await renderWithMockContext(<MemoList />);

    // Click the sort direction button to change to ascending
    const sortDirectionButton = screen.getByText('↓ Descending');
    fireEvent.click(sortDirectionButton);

    // Now the button should show ascending
    expect(screen.getByText('↑ Ascending')).toBeInTheDocument();

    const memoTexts = screen
      .getAllByTestId('memo-card')
      .map((card) => card.querySelector('.memo-card-text')?.textContent);

    // Should be sorted by createdAt in ascending order (oldest first)
    expect(memoTexts[0]).toBe('First test memo');
    expect(memoTexts[1]).toBe('Second test memo with different content');
    expect(memoTexts[2]).toBe('Third memo for testing');
  });

  test('filters memos based on search text', async () => {
    await renderWithMockContext(<MemoList />);

    // Enter search text
    const searchInput = screen.getByPlaceholderText('Search memos...');
    fireEvent.change(searchInput, { target: { value: 'Second' } });

    // Should only show the second memo
    expect(screen.queryByText('First test memo')).not.toBeInTheDocument();
    expect(screen.getByText('Second test memo with different content')).toBeInTheDocument();
    expect(screen.queryByText('Third memo for testing')).not.toBeInTheDocument();
  });

  test('shows no results message when search has no matches', async () => {
    await renderWithMockContext(<MemoList />);

    // Enter search text that won't match any memos
    const searchInput = screen.getByPlaceholderText('Search memos...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // Should show no results message
    expect(screen.getByText('No memos match your search criteria.')).toBeInTheDocument();
  });

  test('clears search when clear button is clicked', async () => {
    await renderWithMockContext(<MemoList />);

    // Enter search text
    const searchInput = screen.getByPlaceholderText('Search memos...');
    fireEvent.change(searchInput, { target: { value: 'Second' } });

    // Click the clear button
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    // Search input should be empty
    expect(searchInput).toHaveValue('');

    // All memos should be visible again
    expect(screen.getByText('First test memo')).toBeInTheDocument();
    expect(screen.getByText('Second test memo with different content')).toBeInTheDocument();
    expect(screen.getByText('Third memo for testing')).toBeInTheDocument();
  });

  test('calls onMemoSelect when a memo card is clicked', async () => {
    const handleMemoSelect = jest.fn();

    await renderWithMockContext(<MemoList onMemoSelect={handleMemoSelect} />);

    // Get all memo cards
    const memoCards = screen.getAllByTestId('memo-card');

    // Click the first memo card
    fireEvent.click(memoCards[0]);

    // Check that onMemoSelect was called with the correct memo
    expect(handleMemoSelect).toHaveBeenCalledTimes(1);
    expect(handleMemoSelect).toHaveBeenCalledWith(mockMemos[2]); // Index 0 is the third memo due to sorting
  });
});
