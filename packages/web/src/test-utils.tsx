import React, { ReactElement } from 'react';
import { render, RenderOptions, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IndexedDBService, Memo } from '@voice-memos/common';
import MemoProvider from './contexts/MemoProvider';

const createMockStorageService = () => {
  const mockService = {
    initDatabase: jest.fn().mockResolvedValue(undefined),
    getAllMemos: jest.fn().mockResolvedValue([
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
    ]),
    getMemoById: jest.fn().mockImplementation((id: string): Promise<Memo | null> => {
      if (id === 'test-id-1') {
        return Promise.resolve({
          id: 'test-id-1',
          text: 'Test memo 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }),
    createMemo: jest.fn().mockImplementation((text: string): Promise<Memo> => {
      return Promise.resolve({
        id: 'new-id',
        text,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),
    updateMemo: jest.fn().mockImplementation((id: string, text: string): Promise<Memo | null> => {
      if (id === 'test-id-1') {
        return Promise.resolve({
          id,
          text,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }),
    deleteMemo: jest.fn().mockImplementation((id: string): Promise<boolean> => {
      if (id === 'test-id-1') {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    }),
    closeDatabase: jest.fn(),
  };

  return mockService as unknown as IndexedDBService;
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  storageService?: IndexedDBService;
  withMemoProvider?: boolean;
}

/**
 * Custom render function that includes common providers
 * @param ui The React component to render
 * @param options Additional render options
 * @returns The render result plus userEvent
 */
async function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { withMemoProvider = true, storageService, ...restOptions } = options;

  // If withMemoProvider is true, wrap the component in MemoProvider
  if (withMemoProvider) {
    const localStorageMock = storageService ?? createMockStorageService();
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      return <MemoProvider storageService={localStorageMock}>{children}</MemoProvider>;
    };

    // Wrap render in an act to handle async state updates
    let renderResult: ReturnType<typeof render>;
    await act(async () => {
      renderResult = render(ui, { wrapper: Wrapper, ...restOptions });
    });

    // Return render result with userEvent
    return {
      user: userEvent,
      ...renderResult!,
    };
  } else {
    // Render without MemoProvider
    return {
      user: userEvent,
      ...render(ui, restOptions),
    };
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
