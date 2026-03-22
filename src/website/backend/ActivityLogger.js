class ActivityLogger {
  constructor(database) {
    this.db = database;
    this.maxLogs = 1000;
  }

  async log(userId, action, details = {}) {
    try {
      if (!this.db.data.activityLog) {
        this.db.data.activityLog = [];
      }

      const logEntry = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        details,
        timestamp: new Date().toISOString(),
        ip: details.ip || 'unknown'
      };

      this.db.data.activityLog.unshift(logEntry);

      if (this.db.data.activityLog.length > this.maxLogs) {
        this.db.data.activityLog = this.db.data.activityLog.slice(0, this.maxLogs);
      }

      await this.db.save();
      return logEntry;
    } catch (error) {
      console.error('Activity Log Error:', error);
    }
  }

  getUserLogs(userId, limit = 50) {
    if (!this.db.data.activityLog) return [];
    
    return this.db.data.activityLog
      .filter(log => log.userId === userId)
      .slice(0, limit);
  }

  getAllLogs(limit = 100) {
    if (!this.db.data.activityLog) return [];
    return this.db.data.activityLog.slice(0, limit);
  }

  async cleanOldLogs(daysToKeep = 30) {
    if (!this.db.data.activityLog) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.db.data.activityLog = this.db.data.activityLog.filter(log => {
      return new Date(log.timestamp) > cutoffDate;
    });

    await this.db.save();
  }
}

export default ActivityLogger;
