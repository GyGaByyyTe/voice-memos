import { createContext, useContext } from 'react';
import { Memo } from '@voice-memos/common';

// State interface for the context
export interface MemoState {
  memos: Memo[];
  loading: boolean;
  error: string | null;
}

// Context interface with state and methods
export interface MemoContextType {
  state: MemoState;
  getAllMemos: () => Promise<void>;
  getMemoById: (id: string) => Promise<Memo | null>;
  createMemo: (text: string) => Promise<Memo>;
  updateMemo: (id: string, text: string) => Promise<Memo | null>;
  deleteMemo: (id: string) => Promise<boolean>;
}

export const initialMemoState: MemoState = {
  memos: [],
  loading: false,
  error: null,
};

// Context with a default value
export const MemoContext = createContext<MemoContextType>({
  state: initialMemoState,
  getAllMemos: async () => {},
  getMemoById: async () => null,
  createMemo: async () => ({ id: '', text: '', createdAt: new Date(), updatedAt: new Date() }),
  updateMemo: async () => null,
  deleteMemo: async () => false,
});

// Hook for using the memo context
export const useMemoContext = () => useContext(MemoContext);
