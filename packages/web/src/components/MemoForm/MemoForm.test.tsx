import React from 'react';
import { Memo, IndexedDBService } from '@voice-memos/common';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { MemoForm } from './MemoForm';

// Mock memo for testing
const mockMemo: Memo = {
  id: 'test-memo-id',
  text: 'This is a test memo content',
  createdAt: new Date('2023-01-01T10:00:00Z'),
  updatedAt: new Date('2023-01-01T10:00:00Z'),
};

// Mock the IndexedDBService
jest.mock('@voice-memos/common', () => {
  const originalModule = jest.requireActual('@voice-memos/common');

  // Mock implementation of IndexedDBService
  class MockIndexedDBService {
    initDatabase = jest.fn().mockResolvedValue(undefined);
    getAllMemos = jest.fn().mockResolvedValue([mockMemo]);
    getMemoById = jest.fn().mockImplementation((id: string) => {
      return Promise.resolve(id === mockMemo.id ? mockMemo : null);
    });
    createMemo = jest.fn().mockImplementation((text: string) => {
      return Promise.resolve({
        id: 'new-memo-id',
        text,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    updateMemo = jest.fn().mockImplementation((id: string, text: string) => {
      return Promise.resolve(
        id === mockMemo.id
          ? {
              ...mockMemo,
              text,
              updatedAt: new Date(),
            }
          : null
      );
    });
    deleteMemo = jest.fn().mockResolvedValue(true);
    closeDatabase = jest.fn();
  }

  return {
    ...originalModule,
    IndexedDBService: MockIndexedDBService,
  };
});

describe('MemoForm Component', () => {
  let mockStorageService: IndexedDBService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService = new IndexedDBService();
  });

  test('renders create form by default', async () => {
    await render(<MemoForm />, { storageService: mockStorageService });

    // Check that the form title is correct
    expect(screen.getByText('Create New Memo')).toBeInTheDocument();

    // Check that the textarea is empty
    const textarea = screen.getByTestId('memo-text-input');
    expect(textarea).toHaveValue('');

    // Check that the submit button has the correct text
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Create Memo');
  });

  test('renders edit form when memo prop is provided', async () => {
    await render(<MemoForm memo={mockMemo} />, { storageService: mockStorageService });

    // Check that the form title is correct
    expect(screen.getByText('Edit Memo')).toBeInTheDocument();

    // Check that the textarea has the memo text
    const textarea = screen.getByTestId('memo-text-input');
    expect(textarea).toHaveValue(mockMemo.text);

    // Check that the submit button has the correct text
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Save Changes');
  });

  test('shows validation error when submitting empty form', async () => {
    await render(<MemoForm />, { storageService: mockStorageService });

    // Submit the form without entering text
    fireEvent.submit(screen.getByTestId('memo-form-element'));

    // Check that a validation error is shown
    expect(screen.getByText('Memo text is required')).toBeInTheDocument();

    // Check that createMemo was not called
    expect(mockStorageService.createMemo).not.toHaveBeenCalled();
  });

  test('shows validation error when text is cleared', async () => {
    await render(<MemoForm memo={mockMemo} />, { storageService: mockStorageService });

    // Clear the textarea
    const textarea = screen.getByTestId('memo-text-input');
    fireEvent.change(textarea, { target: { value: '' } });

    // Check that a validation error is shown
    expect(screen.getByText('Memo text is required')).toBeInTheDocument();
  });

  test('disables submit button when text is empty', async () => {
    await render(<MemoForm />, { storageService: mockStorageService });

    // Enter text and then clear it
    const textarea = screen.getByTestId('memo-text-input');
    fireEvent.change(textarea, { target: { value: 'Some text' } });
    fireEvent.change(textarea, { target: { value: '' } });

    // Check that the submit button is disabled
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  test('creates new memo when form is submitted', async () => {
    const handleSubmit = jest.fn();

    await render(<MemoForm onSubmit={handleSubmit} />, { storageService: mockStorageService });

    // Enter text in the textarea
    const textarea = screen.getByTestId('memo-text-input');
    fireEvent.change(textarea, { target: { value: 'New memo text' } });

    // Submit the form
    fireEvent.submit(screen.getByTestId('memo-form-element'));

    // Check that createMemo was called with the correct text
    expect(mockStorageService.createMemo).toHaveBeenCalledWith('New memo text');

    // Wait for the submission to complete
    await waitFor(() => {
      // Check that onSubmit was called with the created memo
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-memo-id',
          text: 'New memo text',
        })
      );
    });

    // Check that the textarea is cleared after submission
    expect(textarea).toHaveValue('');
  });

  test('updates existing memo when form is submitted in edit mode', async () => {
    const handleSubmit = jest.fn();

    await render(<MemoForm memo={mockMemo} onSubmit={handleSubmit} />, {
      storageService: mockStorageService,
    });

    // Change the text in the textarea
    const textarea = screen.getByTestId('memo-text-input');
    fireEvent.change(textarea, { target: { value: 'Updated memo text' } });

    // Submit the form
    fireEvent.submit(screen.getByTestId('memo-form-element'));

    // Check that updateMemo was called with the correct id and text
    expect(mockStorageService.updateMemo).toHaveBeenCalledWith('test-memo-id', 'Updated memo text');

    // Wait for the submission to complete
    await waitFor(() => {
      // Check that onSubmit was called with the updated memo
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-memo-id',
          text: 'Updated memo text',
        })
      );
    });

    // Check that the textarea still has the updated text (not cleared in edit mode)
    expect(textarea).toHaveValue('Updated memo text');
  });

  test('shows error when memo creation fails', async () => {
    // Mock createMemo to reject with an error
    mockStorageService.createMemo = jest.fn().mockRejectedValue(new Error('Failed to create memo'));

    await render(<MemoForm />, { storageService: mockStorageService });

    // Enter text in the textarea
    const textarea = screen.getByTestId('memo-text-input');
    fireEvent.change(textarea, { target: { value: 'New memo text' } });

    // Submit the form
    fireEvent.submit(screen.getByTestId('memo-form-element'));

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to create memo')).toBeInTheDocument();
    });
  });

  test('shows error when memo update fails', async () => {
    // Mock updateMemo to return null (indicating failure)
    mockStorageService.updateMemo = jest.fn().mockResolvedValue(null);

    await render(<MemoForm memo={mockMemo} />, { storageService: mockStorageService });

    // Change the text in the textarea
    const textarea = screen.getByTestId('memo-text-input');
    fireEvent.change(textarea, { target: { value: 'Updated memo text' } });

    // Submit the form
    fireEvent.submit(screen.getByTestId('memo-form-element'));

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to save memo')).toBeInTheDocument();
    });
  });

  test('calls onCancel when cancel button is clicked', async () => {
    const handleCancel = jest.fn();

    await render(<MemoForm onCancel={handleCancel} />, { storageService: mockStorageService });

    // Click the cancel button in the header
    fireEvent.click(screen.getByTestId('cancel-button'));

    // Check that onCancel was called
    expect(handleCancel).toHaveBeenCalledTimes(1);

    // Click the cancel button in the footer
    fireEvent.click(screen.getByTestId('cancel-button-footer'));

    // Check that onCancel was called again
    expect(handleCancel).toHaveBeenCalledTimes(2);
  });

  test('applies custom className', async () => {
    await render(<MemoForm className="custom-class" />, { storageService: mockStorageService });

    // Check that custom class is applied
    const memoForm = screen.getByTestId('memo-form');
    expect(memoForm).toHaveClass('memo-form');
    expect(memoForm).toHaveClass('custom-class');
  });
});
