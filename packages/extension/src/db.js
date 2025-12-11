// Minimal IndexedDB helpers for the extension
// Schema aligned with @voice-memos/common IndexedDBService
// dbName: 'voice-memos-db', storeName: 'memos', version: 1

(function () {
  const DB_NAME = 'voice-memos-db';
  const DB_VERSION = 1;
  const STORE_NAME = 'memos';

  /** @type {Promise<IDBDatabase> | null} */
  let dbPromise = null;

  function openDb() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });

    return dbPromise;
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  async function createMemo(text) {
    const db = await openDb();
    const now = new Date();
    const memo = { id: generateId(), text, createdAt: now, updatedAt: now };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(memo);

      req.onerror = () => reject(new Error('Failed to create memo'));
      req.onsuccess = () => resolve(memo);
    });
  }

  async function getAllMemos() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onerror = () => reject(new Error('Failed to get memos'));
      req.onsuccess = (event) => {
        const memos = event.target.result || [];
        const processed = memos.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        }));
        resolve(processed);
      };
    });
  }

  window.VoiceMemosDB = {
    openDb,
    createMemo,
    getAllMemos,
  };
})();
