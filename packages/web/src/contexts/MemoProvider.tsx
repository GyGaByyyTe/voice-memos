import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { Memo, IndexedDBService } from '@voice-memos/common';
import { MemoContext, MemoState, initialMemoState } from './MemoContext';

interface MemoProviderProps {
  children: ReactNode;
  storageService?: IndexedDBService;
}

const MemoProvider: React.FC<MemoProviderProps> = ({
  children,
  storageService = new IndexedDBService(),
}) => {
  const [state, setState] = useState<MemoState>(initialMemoState);

  useEffect(() => {
    const initDb = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        await storageService.initDatabase();
        const memos = await storageService.getAllMemos();
        setState((prev) => ({ ...prev, memos, loading: false }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize database',
        }));
      }
    };

    initDb();

    return () => {
      storageService.closeDatabase();
    };
  }, [storageService]);

  const getAllMemos = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const memos = await storageService.getAllMemos();
      setState((prev) => ({ ...prev, memos, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch memos',
      }));
    }
  }, [storageService]);

  const getMemoById = useCallback(
    async (id: string): Promise<Memo | null> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const memo = await storageService.getMemoById(id);
        setState((prev) => ({ ...prev, loading: false }));
        return memo;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : `Failed to fetch memo with ID: ${id}`,
        }));
        return null;
      }
    },
    [storageService]
  );

  const createMemo = useCallback(
    async (text: string): Promise<Memo> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const newMemo = await storageService.createMemo(text);
        setState((prev) => ({
          ...prev,
          memos: [...prev.memos, newMemo],
          loading: false,
        }));
        return newMemo;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to create memo',
        }));
        throw error;
      }
    },
    [storageService]
  );

  const updateMemo = useCallback(
    async (id: string, text: string): Promise<Memo | null> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const updatedMemo = await storageService.updateMemo(id, text);

        if (updatedMemo) {
          setState((prev) => ({
            ...prev,
            memos: prev.memos.map((memo) => (memo.id === id ? updatedMemo : memo)),
            loading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, loading: false }));
        }

        return updatedMemo;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : `Failed to update memo with ID: ${id}`,
        }));
        return null;
      }
    },
    [storageService]
  );

  const deleteMemo = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const success = await storageService.deleteMemo(id);

        if (success) {
          setState((prev) => ({
            ...prev,
            memos: prev.memos.filter((memo) => memo.id !== id),
            loading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, loading: false }));
        }

        return success;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : `Failed to delete memo with ID: ${id}`,
        }));
        return false;
      }
    },
    [storageService]
  );

  const contextValue = {
    state,
    getAllMemos,
    getMemoById,
    createMemo,
    updateMemo,
    deleteMemo,
  };

  return <MemoContext.Provider value={contextValue}>{children}</MemoContext.Provider>;
};

export default MemoProvider;
