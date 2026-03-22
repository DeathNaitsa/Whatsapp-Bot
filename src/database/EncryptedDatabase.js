import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

class EncryptedDatabase {
  constructor(filePath, password) {
    this.filePath = filePath;
    this.password = password;
    this.data = {};
    this.algorithm = 'aes-256-gcm';
    this.keyDerivationIterations = 100000;
  }

  deriveKey(salt) {
    return crypto.pbkdf2Sync(
      this.password,
      salt,
      this.keyDerivationIterations,
      32,
      'sha512'
    );
  }

  encrypt(data) {
    const salt = crypto.randomBytes(32);
    const key = this.deriveKey(salt);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted
    };
  }

  decrypt(encryptedData) {
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const key = this.deriveKey(salt);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  async load() {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf8');
      const encryptedData = JSON.parse(fileContent);
      this.data = this.decrypt(encryptedData);
      console.log('✅ Datenbank erfolgreich geladen und entschlüsselt');
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('ℹ️ Neue Datenbank wird erstellt');
        this.data = { users: {}, groups: {}, tickets: {}, settings: {} };
        await this.save();
        return true;
      } else if (error.message.includes('Unsupported state or unable to authenticate data')) {
        throw new Error('❌ Falsches Passwort!');
      }
      throw error;
    }
  }

  async save() {
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      
      const encrypted = this.encrypt(this.data);
      await fs.writeFile(this.filePath, JSON.stringify(encrypted, null, 2), 'utf8');
      
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Speichern:', error);
      throw error;
    }
  }

  async backup(backupPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupPath, `backup-${timestamp}.enc`);
    
    await fs.mkdir(backupPath, { recursive: true });
    await fs.copyFile(this.filePath, backupFile);
    
    console.log(`✅ Backup erstellt: ${backupFile}`);
    return backupFile;
  }

  getUser(userId) {
    return this.data.users?.[userId] || null;
  }

  async setUser(userId, userData) {
    if (!this.data.users) this.data.users = {};
    this.data.users[userId] = {
      ...this.data.users[userId],
      ...userData,
      lastUpdate: new Date().toISOString()
    };
    await this.save();
  }

  getAllUsers() {
    return this.data.users || {};
  }

  async deleteUser(userId) {
    if (!this.data.users || !this.data.users[userId]) {
      return false;
    }
    delete this.data.users[userId];
    await this.save();
    return true;
  }

  getGroup(groupId) {
    return this.data.groups?.[groupId] || null;
  }

  async setGroup(groupId, groupData) {
    if (!this.data.groups) this.data.groups = {};
    this.data.groups[groupId] = {
      ...this.data.groups[groupId],
      ...groupData,
      lastUpdate: new Date().toISOString()
    };
    await this.save();
  }

  findUserByHash(hash) {
    const users = this.getAllUsers();
    for (const [userId, userData] of Object.entries(users)) {
      if (userData.oldHash === hash) {
        return { userId, userData };
      }
    }
    return null;
  }

  createHash(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  findUserByPlatformId(platformId) {
    const users = this.getAllUsers();
    for (const [userId, userData] of Object.entries(users)) {
      if (userData.platformIds?.includes(platformId)) {
        return { userId, userData };
      }
      if (userId === platformId) {
        return { userId, userData };
      }
    }
    return null;
  }
}

export default EncryptedDatabase;
