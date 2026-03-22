class DsgvoManager {
  constructor(database, config) {
    this.db = database;
    this.config = config;
  }

  hasUserConsent(userId) {
    const user = this.db.getUser(userId);
    return user && user.dsgvoAccepted === true;
  }

  hasGroupConsent(groupId) {
    const group = this.db.getGroup(groupId);
    return group && group.dsgvoAccepted === true;
  }

  async userAcceptDsgvo(userId) {
    await this.db.setUser(userId, {
      dsgvoAccepted: true,
      dsgvoAcceptedAt: new Date().toISOString()
    });
  }

  async groupAcceptDsgvo(groupId, adminId) {
    await this.db.setGroup(groupId, {
      dsgvoAccepted: true,
      dsgvoAcceptedAt: new Date().toISOString(),
      dsgvoAcceptedBy: adminId
    });
  }

  getShortDsgvoText() {
    return `� *Datenschutz-Zustimmung erforderlich*

📋 *Gespeicherte Daten:*
• Nummer & Name
• Commands & Statistiken

⚖️ *Deine Rechte:*
• Auskunft (.profil)
• Löschen (.deletedata)
• Export (.exportdata)

✅ Zustimmen: .acceptdsgvo
📄 Details: .dsgvo`;
  }

  getGroupDsgvoText() {
    return `📋 *Gruppen-Datenschutz*

Ein Admin muss für die Gruppe zustimmen.

📋 *Gespeicherte Daten:*
• Gruppenname & Teilnehmer
• Aktivitäten & Statistiken

✅ Als Admin zustimmen: .acceptdsgvo
📄 Details: .dsgvo`;
  }

  getMigrationDsgvoText() {
    return `🔄 *Account migriert*

Dein Account wurde migriert. Wir haben unsere Datenschutz-Richtlinien aktualisiert.

⚠️ Bitte akzeptiere die neue Datenschutzerklärung, um den Bot weiter zu nutzen.

📄 Lesen: .dsgvo
✅ Akzeptieren: .acceptdsgvo

💡 *Neu:*
• Verschlüsselte Datenbank
• Multi-Platform Support (JID & LID)
• Web-Interface (optional)
• Erweiterte Datenschutz-Rechte`;
  }

  canUseCommandInGroup(groupId, command) {
    if (!this.config.dsgvo.groupAdminConsent) {
      return true;
    }

    const allowedCommands = [
      'dsgvo',
      'datenschutz',
      'acceptdsgvo',
      'akzeptieren',
      'accept',
      'privacy',
      'help',
      'start',
      'menu',
      'register',
      'registrieren',
      'reg',
      'migrate',
      'migrieren',
      'import'
    ];

    if (allowedCommands.includes(command.toLowerCase())) {
      return true;
    }

    if (!this.hasGroupConsent(groupId)) {
      return false;
    }

    return true;
  }

  canUseCommand(userId, command) {
    if (!this.config.dsgvo.requireConsent) {
      return true;
    }

    const allowedCommands = [
      'dsgvo',
      'datenschutz',
      'acceptdsgvo',
      'akzeptieren',
      'accept',
      'privacy',
      'help',
      'start',
      'menu',
      'register',
      'registrieren',
      'reg',
      'migrate',
      'migrieren',
      'import'
    ];

    if (allowedCommands.includes(command.toLowerCase())) {
      return true;
    }

    return this.hasUserConsent(userId);
  }

  async exportUserData(userId) {
    const user = this.db.getUser(userId);
    
    if (!user) {
      return null;
    }

    const exportData = { ...user };
    delete exportData.webPassword;
    delete exportData.apiToken;

    return {
      exportDate: new Date().toISOString(),
      userId: userId,
      data: exportData,
      format: 'json',
      dsgvoCompliant: true
    };
  }

  async deleteUserData(userId) {
    const user = this.db.getUser(userId);
    
    if (!user) {
      return { success: false, message: 'User nicht gefunden' };
    }

    await this.db.deleteUser(userId);

    return {
      success: true,
      message: 'Daten erfolgreich gelöscht',
      timestamp: new Date().toISOString()
    };
  }

  getConsentStatus(userId) {
    const user = this.db.getUser(userId);
    
    if (!user) {
      return {
        hasConsent: false,
        acceptedAt: null,
        migratedUser: false
      };
    }

    return {
      hasConsent: user.dsgvoAccepted === true,
      acceptedAt: user.dsgvoAcceptedAt || null,
      migratedUser: !!user.migratedAt
    };
  }
}

export default DsgvoManager;
