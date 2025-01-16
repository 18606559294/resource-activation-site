const crypto = require('crypto');

class BackupManager {
  constructor() {
    this.backupInterval = 24 * 60 * 60 * 1000; // 24小时
    this.encryptionKey = null;
    this.algorithm = 'aes-256-cbc';
    this.lastBackupId = null;
    this.init();
  }

  async init() {
    await this.generateEncryptionKey();
    this.scheduleBackups();
  }

  // 定时备份
  scheduleBackups() {
    setInterval(async () => {
      try {
        await this.createBackup();
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    }, this.backupInterval);
  }

  // 创建备份
  async createBackup() {
    const users = await this.getUsers();
    const encryptedData = await this.encryptData({ users });
    const response = await fetch('/api/backups', {
      method: 'POST',
      body: JSON.stringify(encryptedData)
    });
    if (!response.ok) {
      throw new Error('Failed to create backup');
    }
    const result = await response.json();
    this.lastBackupId = result.id;
    return result;
  }

  // 恢复备份
  async restoreBackup(backupId) {
    const response = await fetch(`/api/backups/${backupId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch backup');
    }
    const encryptedData = await response.json();
    return this.decryptData(encryptedData);
  }

  // 验证备份数据
  validateBackupData(data) {
    return data && 
      typeof data === 'object' &&
      Array.isArray(data.users) &&
      data.users.every(user => 
        user.id && 
        user.username && 
        user.email && 
        user.role
      );
  }

  // 生成加密密钥
  async generateEncryptionKey() {
    try {
      // 生成32字节的随机密钥
      this.encryptionKey = crypto.randomBytes(32);
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
      throw new Error('Failed to generate encryption key', { cause: error });
    }
  }

  // 加密数据
  async encryptData(data) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return {
        iv: iv.toString('hex'),
        data: encrypted
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed', { cause: error });
    }
  }

  // 解密数据
  async decryptData(encryptedData) {
    try {
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption failed', { cause: error });
    }
  }

  // 获取用户数据
  async getUsers() {
    try {
      const response = await fetch('/api/users.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      
      const users = await response.json();
      
      // 处理不同格式的用户数据
      if (Array.isArray(users)) {
        return users.map(user => ({
          id: user.id || Date.now(),
          username: user.username || 'unknown',
          email: user.email || '',
          role: user.role || 'user',
          lastLogin: user.lastLogin || new Date().toISOString()
        }));
      }

      // 处理对象格式的用户数据
      if (typeof users === 'object' && users !== null) {
        return Object.values(users).map(user => ({
          id: user.id || Date.now(),
          username: user.username || 'unknown',
          email: user.email || '',
          role: user.role || 'user',
          lastLogin: user.lastLogin || new Date().toISOString()
        }));
      }

      throw new Error('Invalid users data format');
    } catch (error) {
      console.error('Failed to get users:', error);
      throw new Error('Failed to get users', { cause: error });
    }
  }

  // 其他方法保持不变...
}

export const backupManager = new BackupManager();
export default backupManager;
