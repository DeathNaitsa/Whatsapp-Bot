const handler = async (m, { user, database, dsgvoManager, chatId, sender, args, prefix }) => {
  if (!args[0] || args[0].toLowerCase() !== 'confirm') {
    return `⚠️ *Daten löschen*

**ACHTUNG:** Diese Aktion kann nicht rückgängig gemacht werden!

Alle deine Daten werden unwiderruflich gelöscht:
• Profil & Statistiken
• Inventar & Währungen
• Level & XP
• Alle gespeicherten Informationen

✅ Zum Bestätigen schreibe:
${prefix}deletedata confirm

❌ Zum Abbrechen einfach nichts tun.`;
  }
  
  try {
    const result = await dsgvoManager.deleteUserData(sender);
    
    if (!result.success) {
      return `❌ ${result.message}`;
    }
    
    return `✅ *Daten gelöscht*

Alle deine persönlichen Daten wurden erfolgreich gelöscht.

ℹ️ Was wurde gelöscht:
• Alle persönlichen Informationen
• Profildaten & Einstellungen
• Verknüpfte Accounts
• Login-Daten

📊 Anonymisierte Statistiken bleiben für die Integrität des Systems erhalten.

👋 Du kannst dich jederzeit neu registrieren mit: ${prefix}register

Vielen Dank, dass du unseren Bot genutzt hast!`;
    
  } catch (error) {
    console.error('Lösch-Fehler:', error);
    return '❌ Fehler beim Löschen der Daten. Bitte kontaktiere den Support.';
  }
};

handler.help = ['deletedata'];
handler.tags = ['user'];
handler.command = ['deletedata', 'datenlöschen', 'deleteme'];

export default handler;
