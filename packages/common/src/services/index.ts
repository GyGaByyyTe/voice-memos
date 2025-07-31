// Define and export service interfaces and implementations
import { Memo } from '@/models';

export interface StorageService {
  getAllMemos(): Promise<Memo[]>;
  getMemoById(id: string): Promise<Memo | null>;
  createMemo(text: string): Promise<Memo>;
  updateMemo(id: string, text: string): Promise<Memo | null>;
  deleteMemo(id: string): Promise<boolean>;
}

// Export the IndexedDB implementation
export { IndexedDBService } from './IndexedDBService';
