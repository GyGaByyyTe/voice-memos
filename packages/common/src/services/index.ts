// Define and export service interfaces here
import { Memo } from '@/src';

export interface StorageService {
  getAllMemos(): Promise<Memo[]>;
  getMemoById(id: string): Promise<Memo | null>;
  createMemo(text: string): Promise<Memo>;
  updateMemo(id: string, text: string): Promise<Memo | null>;
  deleteMemo(id: string): Promise<boolean>;
}
