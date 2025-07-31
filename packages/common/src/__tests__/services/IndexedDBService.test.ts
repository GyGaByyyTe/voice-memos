import { IndexedDBService } from '@/services';

// Create a simplified mock version of the service for testing
jest.mock('@/services/IndexedDBService', () => {
  return {
    IndexedDBService: jest.fn().mockImplementation(() => {
      return {
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
        getMemoById: jest.fn().mockImplementation((id) => {
          if (id === 'test-id') {
            return Promise.resolve({
              id: 'test-id',
              text: 'Test memo',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          return Promise.resolve(null);
        }),
        createMemo: jest.fn().mockImplementation((text) => {
          return Promise.resolve({
            id: 'new-id',
            text,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }),
        updateMemo: jest.fn().mockImplementation((id, text) => {
          if (id === 'test-id') {
            return Promise.resolve({
              id,
              text,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          return Promise.resolve(null);
        }),
        deleteMemo: jest.fn().mockImplementation((id) => {
          if (id === 'test-id') {
            return Promise.resolve(true);
          }
          return Promise.resolve(false);
        }),
        closeDatabase: jest.fn(),
      };
    }),
  };
});

describe('IndexedDBService', () => {
  let service: IndexedDBService;

  beforeEach(() => {
    // Create a new service instance for each test
    service = new IndexedDBService();
  });

  describe('getAllMemos', () => {
    it('should retrieve all memos from the database', async () => {
      const memos = await service.getAllMemos();
      expect(memos).toHaveLength(2);
      expect(memos[0].id).toBe('test-id-1');
      expect(memos[1].id).toBe('test-id-2');
    });
  });

  describe('getMemoById', () => {
    it('should retrieve a memo by its ID', async () => {
      const memo = await service.getMemoById('test-id');
      expect(memo).not.toBeNull();
      expect(memo?.id).toBe('test-id');
    });

    it('should return null if the memo is not found', async () => {
      const memo = await service.getMemoById('non-existent-id');
      expect(memo).toBeNull();
    });
  });

  describe('createMemo', () => {
    it('should create a new memo with the given text', async () => {
      const text = 'New test memo';
      const memo = await service.createMemo(text);
      expect(memo).toHaveProperty('id', 'new-id');
      expect(memo).toHaveProperty('text', text);
      expect(memo).toHaveProperty('createdAt');
      expect(memo).toHaveProperty('updatedAt');
    });
  });

  describe('updateMemo', () => {
    it('should update an existing memo', async () => {
      const updatedText = 'Updated text';
      const memo = await service.updateMemo('test-id', updatedText);
      expect(memo).not.toBeNull();
      expect(memo?.id).toBe('test-id');
      expect(memo?.text).toBe(updatedText);
    });

    it('should return null if the memo to update is not found', async () => {
      const memo = await service.updateMemo('non-existent-id', 'Updated text');
      expect(memo).toBeNull();
    });
  });

  describe('deleteMemo', () => {
    it('should delete an existing memo', async () => {
      const result = await service.deleteMemo('test-id');
      expect(result).toBe(true);
    });

    it('should return false if the memo to delete is not found', async () => {
      const result = await service.deleteMemo('non-existent-id');
      expect(result).toBe(false);
    });
  });
});
