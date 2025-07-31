import React from 'react';
import { Memo, IndexedDBService } from '@voice-memos/common';
import { render, screen, waitFor, act } from '../../test-utils';
import { useMemoContext } from '../MemoContext';

// Create a mock component that uses the context
const TestComponent: React.FC = () => {
  const { state, getAllMemos, createMemo, updateMemo, deleteMemo } = useMemoContext();

  return (
    <div>
      <div data-testid="loading">{state.loading.toString()}</div>
      <div data-testid="error">{state.error || 'no error'}</div>
      <div data-testid="memos-count">{state.memos.length}</div>
      <button data-testid="get-all" onClick={() => getAllMemos()}>
        Get All
      </button>
      <button data-testid="create" onClick={() => createMemo('New memo')}>
        Create
      </button>
      {state.memos.length > 0 && (
        <>
          <button
            data-testid="update"
            onClick={() => updateMemo(state.memos[0].id, 'Updated memo')}
          >
            Update
          </button>
          <button data-testid="delete" onClick={() => deleteMemo(state.memos[0].id)}>
            Delete
          </button>
        </>
      )}
    </div>
  );
};

// Mock the IndexedDBService
jest.mock('@voice-memos/common', () => {
  const originalModule = jest.requireActual('@voice-memos/common');

  // Create mock memos
  const mockMemos: Memo[] = [
    {
      id: 'test-id-1',
      text: 'Test memo 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'test-id-2',
      text: 'Test memo 2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Mock implementation of IndexedDBService
  class MockIndexedDBService {
    initDatabase = jest.fn().mockResolvedValue(undefined);
    getAllMemos = jest.fn().mockResolvedValue(mockMemos);
    getMemoById = jest.fn().mockImplementation((id: string) => {
      const memo = mockMemos.find((m) => m.id === id);
      return Promise.resolve(memo || null);
    });
    createMemo = jest.fn().mockImplementation((text: string) => {
      const newMemo: Memo = {
        id: 'new-id',
        text,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return Promise.resolve(newMemo);
    });
    updateMemo = jest.fn().mockImplementation((id: string, text: string) => {
      const memoIndex = mockMemos.findIndex((m) => m.id === id);
      if (memoIndex === -1) return Promise.resolve(null);

      const updatedMemo: Memo = {
        ...mockMemos[memoIndex],
        text,
        updatedAt: new Date(),
      };
      return Promise.resolve(updatedMemo);
    });
    deleteMemo = jest.fn().mockImplementation((id: string) => {
      const memoExists = mockMemos.some((m) => m.id === id);
      return Promise.resolve(memoExists);
    });
    closeDatabase = jest.fn();
  }

  return {
    ...originalModule,
    IndexedDBService: MockIndexedDBService,
  };
});

describe('MemoContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', async () => {
    await render(<TestComponent />);

    // Initial state might be loading or already completed
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // After initialization, memos should be loaded
    expect(screen.getByTestId('memos-count').textContent).toBe('2');
    expect(screen.getByTestId('error').textContent).toBe('no error');
  });

  it('should get all memos when requested', async () => {
    await render(<TestComponent />);

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click the get all button and wait for the loading state to change
    await act(async () => {
      screen.getByTestId('get-all').click();
    });

    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Should have memos
    expect(screen.getByTestId('memos-count').textContent).toBe('2');
  });

  it('should create a new memo', async () => {
    await render(<TestComponent />);

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Initial count
    expect(screen.getByTestId('memos-count').textContent).toBe('2');

    // Click the creation button
    await act(async () => {
      screen.getByTestId('create').click();
    });

    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Should have one more memo
    expect(screen.getByTestId('memos-count').textContent).toBe('3');
  });

  it('should update an existing memo', async () => {
    const mockStorageService = new IndexedDBService();
    await render(<TestComponent />, { storageService: mockStorageService });

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click the update button
    await act(async () => {
      screen.getByTestId('update').click();
    });

    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Should have called updateMemo with correct parameters
    expect(mockStorageService.updateMemo).toHaveBeenCalledWith('test-id-1', 'Updated memo');
  });

  it('should delete an existing memo', async () => {
    const mockStorageService = new IndexedDBService();
    await render(<TestComponent />, { storageService: mockStorageService });

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Initial count
    expect(screen.getByTestId('memos-count').textContent).toBe('2');

    // Click the delete button
    await act(async () => {
      screen.getByTestId('delete').click();
    });

    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Should have called deleteMemo with correct parameters
    expect(mockStorageService.deleteMemo).toHaveBeenCalledWith('test-id-1');

    // Should have one less memo
    expect(screen.getByTestId('memos-count').textContent).toBe('1');
  });

  it('should handle errors gracefully', async () => {
    const mockStorageService = new IndexedDBService();

    // Mock an error when getting all memos
    mockStorageService.getAllMemos = jest.fn().mockRejectedValue(new Error('Test error'));

    await render(<TestComponent />, { storageService: mockStorageService });

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Should show the error
    expect(screen.getByTestId('error').textContent).toBe('Test error');
  });
});
