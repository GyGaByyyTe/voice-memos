import { StorageService } from './index';
import { Memo } from '@/models';
import { generateId } from '@/utils';

/**
 * Implementation of StorageService using IndexedDB
 */
export class IndexedDBService implements StorageService {
  private readonly dbName: string;
  private readonly dbVersion: number;
  private readonly storeName: string;
  private db: IDBDatabase | null = null;

  /**
   * Creates a new IndexedDBService
   * @param dbName The name of the IndexedDB database
   * @param dbVersion The version of the IndexedDB database
   * @param storeName The name of the object store for memos
   */
  constructor(
    dbName: string = 'voice-memos-db',
    dbVersion: number = 1,
    storeName: string = 'memos'
  ) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeName = storeName;
  }

  /**
   * Initializes the database connection
   * @returns A promise that resolves when the database is ready
   */
  public async initDatabase(): Promise<void> {
    if (this.db) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        reject(new Error(`Failed to open database: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for memos if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });

          // Create indexes for faster queries
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  /**
   * Gets all memos from the database
   * @returns A promise that resolves with an array of all memos
   */
  public async getAllMemos(): Promise<Memo[]> {
    await this.initDatabase();

    return new Promise<Memo[]>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = (event) => {
        reject(new Error(`Failed to get memos: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = (event) => {
        const memos = (event.target as IDBRequest).result as Memo[];

        // Convert date strings back to Date objects
        const processedMemos = memos.map((memo) => ({
          ...memo,
          createdAt: new Date(memo.createdAt),
          updatedAt: new Date(memo.updatedAt),
        }));

        resolve(processedMemos);
      };
    });
  }

  /**
   * Gets a memo by its ID
   * @param id The ID of the memo to get
   * @returns A promise that resolves with the memo or null if not found
   */
  public async getMemoById(id: string): Promise<Memo | null> {
    await this.initDatabase();

    return new Promise<Memo | null>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onerror = (event) => {
        reject(new Error(`Failed to get memo: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = (event) => {
        const memo = (event.target as IDBRequest).result as Memo | undefined;

        if (!memo) {
          resolve(null);
          return;
        }

        // Convert date strings back to Date objects
        resolve({
          ...memo,
          createdAt: new Date(memo.createdAt),
          updatedAt: new Date(memo.updatedAt),
        });
      };
    });
  }

  /**
   * Creates a new memo
   * @param text The text content of the memo
   * @returns A promise that resolves with the created memo
   */
  public async createMemo(text: string): Promise<Memo> {
    await this.initDatabase();

    const now = new Date();
    const memo: Memo = {
      id: generateId(),
      text,
      createdAt: now,
      updatedAt: now,
    };

    return new Promise<Memo>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(memo);

      request.onerror = (event) => {
        reject(new Error(`Failed to create memo: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve(memo);
      };
    });
  }

  /**
   * Updates an existing memo
   * @param id The ID of the memo to update
   * @param text The new text content
   * @returns A promise that resolves with the updated memo or null if not found
   */
  public async updateMemo(id: string, text: string): Promise<Memo | null> {
    await this.initDatabase();

    // First, get the existing memo
    const existingMemo = await this.getMemoById(id);

    if (!existingMemo) {
      return null;
    }

    // Update the memo
    const updatedMemo: Memo = {
      ...existingMemo,
      text,
      updatedAt: new Date(),
    };

    return new Promise<Memo>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(updatedMemo);

      request.onerror = (event) => {
        reject(new Error(`Failed to update memo: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve(updatedMemo);
      };
    });
  }

  /**
   * Deletes a memo
   * @param id The ID of the memo to delete
   * @returns A promise that resolves with true if successful, false if not found
   */
  public async deleteMemo(id: string): Promise<boolean> {
    await this.initDatabase();

    // Check if the memo exists
    const existingMemo = await this.getMemoById(id);

    if (!existingMemo) {
      return false;
    }

    return new Promise<boolean>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onerror = (event) => {
        reject(new Error(`Failed to delete memo: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve(true);
      };
    });
  }

  /**
   * Closes the database connection
   */
  public closeDatabase(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
