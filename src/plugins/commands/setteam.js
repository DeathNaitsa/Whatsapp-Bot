const handler = async (m, { user, database, config, args, permissionManager, chatId, sender, isGroup, messageData, prefix }) => {
  const mentions = Array.isArray(messageData?.mentions) 
    ? messageData.mentions
    : (messageData?.mentions ? [messageData.mentions] : []);
  
  console.log('🔍 SetTeam Debug:', {
    args,
    mentions,
    mentionsRaw: messageData?.mentions,
    messageText: messageData?.text
  });
  
  if (!isGroup && mentions.length === 0) {
    return `❌ Verwende diesen Command in einer Gruppe oder erwähne einen User.

📝 Verwendung:
${prefix}setteam @user <rang>

Verfügbare Ränge:
${Object.keys(config.team.roles).join(', ')}`;
  }
  
  if (mentions.length === 0) {
    return `❌ Bitte erwähne einen User!

📝 Richtig:
${prefix}setteam @user ersteller

❌ Falsch:
${prefix}setteam ersteller

Verfügbare Ränge: ${Object.keys(config.team.roles).join(', ')}`;
  }
  
  if (args.length === 0) {
    return `⚙️ *Team-Rang setzen*

📝 Verwendung:
${prefix}setteam @user <rang>

📋 Verfügbare Ränge:
${Object.keys(config.team.roles).map(r => `• ${r} (Level ${config.team.roles[r].level})`).join('\n')}

ℹ️ Nur Owner können Ränge vergeben.`;
  }
  
  const targetUser = mentions[0];
  
  const newRank = args[0]?.toLowerCase();
  
  if (!newRank) {
    return '❌ Bitte gib einen Rang an: .setteam @user <rang>';
  }
  
  if (!permissionManager.roleExists(newRank)) {
    return `❌ Ungültiger Rang: ${newRank}

Verfügbare Ränge:
${Object.keys(config.team.roles).join(', ')}`;
  }
  
  let targetUserData = database.getUser(targetUser);
  let targetUserId = targetUser;
  
  if (!targetUserData) {
    const allUsers = database.getAllUsers();
    for (const [userId, userData] of Object.entries(allUsers)) {
      if (userData.platformIds && userData.platformIds.includes(targetUser)) {
        targetUserData = userData;
        targetUserId = userId;
        break;
      }
    }
  }
  
  if (!targetUserData) {
    return '❌ User nicht gefunden. User muss zuerst registriert sein.';
  }
  
  const isCreator = user.teamm && user.teamm.toLowerCase() === 'ersteller';
  
  if (!isCreator) {
    if (targetUserData.teamm && targetUserData.teamm.toLowerCase() === 'ersteller') {
      return '❌ Der Ersteller-Rang kann nicht geändert werden!\n\n🔒 Nur ein Ersteller kann andere Ersteller verwalten.';
    }
    
    const senderLevel = permissionManager.getRoleLevel(user.teamm || '');
    const targetLevel = permissionManager.getRoleLevel(newRank);
    const currentTargetLevel = permissionManager.getRoleLevel(targetUserData.teamm || '');
    
    if (targetLevel >= senderLevel) {
      return '❌ Du kannst keinen Rang vergeben, der gleich oder höher als deiner ist.';
    }
    
    if (currentTargetLevel >= senderLevel) {
      return '❌ Du kannst den Rang dieser Person nicht ändern.\n\n⚠️ Diese Person hat einen höheren oder gleichen Rang.';
    }
  }
  
  await database.setUser(targetUserId, {
    teamm: newRank,
    label: `${config.bot.name} Team`
  });
  
  const rolePermissions = config.team.roles[newRank]?.permissions || [];
  const permissionsText = rolePermissions.includes('*') 
    ? '✨ Alle Berechtigungen (Admin)' 
    : rolePermissions.length > 0 
      ? rolePermissions.join(', ') 
      : 'Keine Berechtigungen';
  
  return `✅ *Rang gesetzt*

👤 User: ${targetUserData?.name || 'Unbekannt'}
🎖️ Neuer Rang: ${newRank}

Berechtigungen:
${permissionsText}`;
};

handler.help = ['setteam'];
handler.tags = ['owner'];
handler.command = ['setteam', 'teamrang', 'setrank'];
handler.team = true;

export default handler;
