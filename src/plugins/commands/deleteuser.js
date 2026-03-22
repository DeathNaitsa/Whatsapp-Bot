const handler = async (m, { database, config, args, messageData, prefix }) => {
  
  if (args.length === 0) {
    return `🗑️ *User löschen*

📝 Verwendung:
${prefix}deleteuser <index>
${prefix}deleteuser @mention

💡 Verwende ${prefix}listusers um alle User mit Index zu sehen`;
  }
  
  let targetUserId = null;
  let targetUserData = null;
  
  const mentions = messageData?.mentions || [];
  
  if (mentions.length > 0) {
    const mentionId = mentions[0];
    targetUserData = database.getUser(mentionId);
    targetUserId = mentionId;
    
    if (!targetUserData) {
      const allUsers = database.getAllUsers();
      for (const [userId, userData] of Object.entries(allUsers)) {
        if (userData.platformIds && userData.platformIds.includes(mentionId)) {
          targetUserData = userData;
          targetUserId = userId;
          break;
        }
      }
    }
    
    if (!targetUserData) {
      return '❌ User nicht gefunden.';
    }
    
  } else {
    const index = parseInt(args[0]) - 1;
    
    if (isNaN(index) || index < 0) {
      return '❌ Ungültiger Index. Verwende eine Zahl größer als 0.';
    }
    
    const allUsers = database.getAllUsers();
    const users = Object.entries(allUsers).filter(([_, userData]) => !userData._temporary);
    
    if (index >= users.length) {
      return `❌ Index zu groß. Es gibt nur ${users.length} User.`;
    }
    
    [targetUserId, targetUserData] = users[index];
  }
  
  if (targetUserId === config.bot.owner) {
    return '❌ Der Bot-Owner kann nicht gelöscht werden.';
  }
  
  const userName = targetUserData.name || 'Unbekannt';
  const userLevel = targetUserData.level || 0;
  const userPrestige = targetUserData.prestige || 0;
  
  await database.deleteUser(targetUserId);
  
  return `✅ *User gelöscht*

👤 Name: ${userName}
📱 ID: ${targetUserId}
⭐ Level: ${userLevel} (P${userPrestige})
🎖️ Team: ${targetUserData.teamm || 'Kein Team'}

Der User wurde aus der Datenbank entfernt.`;
};

handler.help = ['deleteuser'];
handler.tags = ['owner'];
handler.command = ['deleteuser', 'deluser', 'removeuser'];
handler.team = true;

export default handler;
