const handler = async (m, { user, database, dsgvoManager, chatId, sender, send }) => {
  
  try {
    const exportData = await dsgvoManager.exportUserData(sender);
    
    if (!exportData) {
      await send.text(chatId, '❌ Fehler beim Exportieren der Daten.');
      return;
    }
    
    const jsonData = JSON.stringify(exportData, null, 2);
    
    let text = `📄 *Datenexport*\n\n`;
    text += `Export-Datum: ${new Date(exportData.exportDate).toLocaleString('de-DE')}\n`;
    text += `User-ID: ${exportData.userId}\n\n`;
    text += `📊 *Zusammenfassung:*\n`;
    text += `├ Level: ${exportData.data.level || 0}\n`;
    text += `├ XP: ${exportData.data.exp || 0}\n`;
    text += `├ Geld: ${(exportData.data.money || 0).toLocaleString('de-DE')} 💵\n`;
    text += `├ Registriert: ${exportData.data.registered ? 'Ja' : 'Nein'}\n`;
    text += `└ Platform-IDs: ${exportData.data.platformIds?.length || 0}\n\n`;
    text += `✅ Vollständiger Export wird gesendet...`;
    
    await send.text(chatId, text);
    
    await send.text(chatId, `\`\`\`json\n${jsonData.substring(0, 4000)}\`\`\``);
    
    if (jsonData.length > 4000) {
      const remaining = jsonData.substring(4000);
      const chunks = remaining.match(/.{1,4000}/g) || [];
      
      for (const chunk of chunks) {
        await send.text(chatId, `\`\`\`json\n${chunk}\`\`\``);
      }
    }
    
  } catch (error) {
    console.error('Export-Fehler:', error);
    await send.text(chatId, '❌ Fehler beim Exportieren der Daten. Bitte versuche es später erneut.');
  }
};

handler.help = ['exportdata'];
handler.tags = ['user'];
handler.command = ['exportdata', 'datenexport', 'exportieren'];
handler.description = 'Exportiert deine gespeicherten Daten als JSON-Datei (DSGVO)';
handler.usage = 'exportdata';
handler.example = 'exportdata';

export default handler;
