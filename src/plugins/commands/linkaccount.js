const handler = async (m, { user, database, config, args, messageData, sender, prefix }) => {
  if (!user.registered) {
    return `❌ Du musst registriert sein um Accounts zu verknüpfen!\n\n📝 Registriere dich: ${prefix}register <username>`;
  }
  
  const mentions = messageData?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  
  if (mentions.length === 0) {
    return `📱 *Account Verknüpfung*

🔗 Verbinde 2 Nummern zu einem Account!

📋 *Verwendung:*
.linkaccount @person

📌 *Beispiel:*
Tagge deine zweite Nummer im Chat

⚠️ *Wichtig:*
• Beide Nummern müssen registriert sein
• Nur für deine eigenen Nummern!
• Code läuft nach 5 Min ab

💡 *Warum?*
Wenn du 2 Handys hast, kannst du beide Nummern mit einem Account nutzen!`;
  }
  
  const targetNumber = mentions[0];
  
  if (targetNumber === sender || user.platformIds?.includes(targetNumber)) {
    return '❌ Diese Nummer gehört bereits zu deinem Account!';
  }
  
  const targetUser = database.getUser(targetNumber);
  if (!targetUser || !targetUser.registered) {
    return '❌ Diese Nummer ist nicht registriert!\n\n💡 Die Person muss sich zuerst registrieren.';
  }
  
  if (targetUser.platformIds && targetUser.platformIds.length > 1) {
    return '❌ Diese Nummer ist bereits mit einem anderen Account verknüpft!';
  }
  
  const linkCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  if (!global.linkRequests) global.linkRequests = {};
  
  global.linkRequests[linkCode] = {
    fromNumber: sender,
    toNumber: targetNumber,
    fromUser: user,
    toUser: targetUser,
    timestamp: Date.now(),
    expiresAt: Date.now() + (5 * 60 * 1000)
  };
  
  let response = `🔗 *Link-Anfrage gesendet!*\n\n`;
  response += `📱 Von: ${user.displayName || user.name}\n`;
  response += `📱 An: ${targetUser.displayName || targetUser.name}\n\n`;
  response += `🔑 Code: \`${linkCode}\`\n\n`;
  response += `⏱️ Gültig für: 5 Minuten\n\n`;
  response += `✅ *Nächster Schritt:*\n`;
  response += `Die zweite Nummer muss bestätigen:\n`;
  response += `.confirmlink ${linkCode}\n\n`;
  response += `⚠️ Nach Bestätigung:\n`;
  response += `• Beide Nummern = ein Account\n`;
  response += `• Accounts werden zusammengeführt\n`;
  response += `• Höherer Level gewinnt\n`;
  response += `• Coins & Items werden addiert`;
  
  return response;
};

handler.help = ['linkaccount'];
handler.tags = ['user'];
handler.command = ['linkaccount', 'verknüpfen'];

export default handler;
