const handler = async (m, { user, dsgvoManager, chatId, config, prefix }) => {
  
  const text = `📋 *Vollständige Datenschutzerklärung*

🔍 *1. Datenerfassung*
Wir speichern:
• WhatsApp-Nummer (verschlüsselt)
• Dein Name aus WhatsApp
• Bot-Commands & Nutzungsstatistiken
• Freiwillige Profil-Daten

🔒 *2. Datensicherheit*
• AES-256-GCM Verschlüsselung
• Passwortgeschützte Datenbank
• Automatische verschlüsselte Backups
• Kein Zugriff ohne Master-Passwort

⚖️ *3. Deine Rechte (DSGVO Art. 15-21)*
• Auskunft über deine Daten (.profil)
• Datenexport in JSON (.exportdata)
• Vollständige Löschung (.deletedata)
• Widerspruch zur Verarbeitung

❌ *4. Datenweitergabe*
• Keine Weitergabe an Dritte
• Keine Werbung
• Keine Verkäufe
• Nur für Bot-Funktionen

📧 *5. Kontakt*
Bei Fragen: Kontaktiere den Bot-Owner
Siehe Team-Liste: .team

⏳ *6. Speicherdauer*
• Bis zur Löschung durch User
• Oder bei Inaktivität (konfigurierbar)
• Backups: ${config?.database?.backupRetentionDays || 30} Tage

✅ Zustimmen: ${prefix}acceptdsgvo`;

  return text;
};

handler.help = ['dsgvo', 'datenschutz'];
handler.tags = ['info'];
handler.command = ['dsgvo', 'datenschutz', 'privacy'];

export default handler;
