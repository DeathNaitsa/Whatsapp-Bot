const handler = async (m, { user, database, permissionManager, chatId, args, isGroup, isAdmin }) => {
  if (!isGroup) {
    return 'Nur in Gruppen verfügbar.';
  }
  
  if (!isAdmin && !permissionManager.isOwner(user)) {
    return 'Admin- oder Owner-Berechtigung erforderlich.';
  }
  
  const allowedPrefixes = ['.', '!', '/', '#', ':', '@', '$', '&', '%', '?', '='];
  
  if (!args[0]) {
    const group = database.getGroup(chatId) || {};
    const current = group.prefix || '.';
    
    let response = `Aktueller Präfix: ${current}\n\n`;
    response += `Erlaubte Präfixe:\n`;
    response += allowedPrefixes.join(' ') + '\n\n';
    response += `.setprefix <präfix>`;
    return response;
  }
  
  const newPrefix = args[0];
  
  if (!allowedPrefixes.includes(newPrefix)) {
    return `❌ Ungültiger Präfix.\n\nErlaubt: ${allowedPrefixes.join(' ')}`;
  }
  
  const group = database.getGroup(chatId) || {};
  group.prefix = newPrefix;
  await database.setGroup(chatId, group);
  
  return `✅ Präfix geändert: ${newPrefix}\n\nBeispiel: ${newPrefix}menu`;
};

handler.help = ['setprefix'];
handler.tags = ['group'];
handler.command = ['setprefix', 'prefix'];
handler.group = true;

export default handler;
