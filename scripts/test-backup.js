import { backupManager } from '../src/js/modules/backup-manager.js';

// Mock crypto module
jest.mock('crypto', () => ({
  getRandomValues: jest.fn(() => new Uint8Array(32)),
  subtle: {
    encrypt: jest.fn(() => Promise.resolve({
      iv: new Uint8Array(12),
      data: new Uint8Array([1, 2, 3])
    })),
    decrypt: jest.fn(() => Promise.resolve(new TextEncoder().encode(JSON.stringify({ 
      users: [
        {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        }
      ]
    })))),
    importKey: jest.fn(() => Promise.resolve({}))
  }
}));

// Mock fetch globally
beforeAll(() => {

  global.fetch = jest.fn((url) => {
    // Mock responses for different endpoints
    if (url.includes('/api/backups')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'test-backup-id',
          data: 'encrypted-data',
          timestamp: new Date().toISOString()
        })
      });
    }
    if (url.includes('/api/users')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: 'user',
            lastLogin: new Date().toISOString()
          }
        ])
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Backup Manager', () => {
  test('should create backup successfully', async () => {
    const result = await backupManager.createBackup();
    expect(result).toBeDefined();
    expect(fetch).toHaveBeenCalledWith(
      '/api/backups',
      expect.objectContaining({
        method: 'POST'
      })
    );
  });

  test('should restore backup successfully', async () => {
    const backupId = 'test-backup-id';
    await expect(backupManager.restoreBackup(backupId)).resolves.toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(
      `/api/backups/${backupId}`,
      expect.anything()
    );
  });

  test('should encrypt and decrypt data correctly', async () => {
    const testData = { message: 'test' };
    const encrypted = await backupManager.encryptData(testData);
    const decrypted = await backupManager.decryptData(encrypted);
    expect(decrypted).toEqual(testData);
  });

  test('should validate backup data correctly', () => {
    const validData = {
      users: [
        {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        }
      ]
    };
    const invalidData = {
      users: [
        {
          id: 1,
          username: 'testuser'
        }
      ]
    };

    expect(backupManager.validateBackupData(validData)).toBeTruthy();
    expect(backupManager.validateBackupData(invalidData)).toBeFalsy();
  });

  test('should handle user data in different formats', async () => {
    // Test array format
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, username: 'user1' },
          { id: 2, username: 'user2' }
        ])
      })
    );
    const arrayUsers = await backupManager.getUsers();
    expect(Array.isArray(arrayUsers)).toBeTruthy();

    // Test object format
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          user1: { id: 1, username: 'user1' },
          user2: { id: 2, username: 'user2' }
        })
      })
    );
    const objectUsers = await backupManager.getUsers();
    expect(Array.isArray(objectUsers)).toBeTruthy();
  });
});
